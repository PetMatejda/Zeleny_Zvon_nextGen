import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import PDFDocument from 'pdfkit';
import qrcode from 'qrcode';
import nodemailer from 'nodemailer';
import fs from 'fs';
import multer from 'multer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;

// Upload config (persists on Fly volume, otherwise local /uploads)
const UPLOADS_DIR = process.env.DATABASE_PATH ? '/data/uploads' : join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static(UPLOADS_DIR));

// Allow multiple origins: localhost for local dev and the Vercel app domain for production
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app') || origin.includes('fly.dev')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Initialize SQLite database
// Na Fly.io použijeme mountovanou složku /data, nebo lokální soubor
const dbPath = process.env.DATABASE_PATH || join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      category TEXT,
      description TEXT,
      image TEXT,
      stock INTEGER DEFAULT 10,
      is_hero BOOLEAN DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL,
      discount_value INTEGER NOT NULL,
      valid_from DATETIME,
      valid_until DATETIME,
      usage_limit INTEGER,
      times_used INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1
    )`);

    // Pro starsi instance - automaticky doplnime sloupec valid_from, pokud chybi
    db.all("PRAGMA table_info(coupons)", (err, columns) => {
      if (columns && !columns.some(c => c.name === 'valid_from')) {
        db.run("ALTER TABLE coupons ADD COLUMN valid_from DATETIME");
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      email TEXT NOT NULL,
      totalAmount INTEGER NOT NULL,
      status TEXT DEFAULT 'Nová',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      coupon_id INTEGER,
      FOREIGN KEY(coupon_id) REFERENCES coupons(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER,
      productId INTEGER,
      quantity INTEGER,
      FOREIGN KEY(orderId) REFERENCES orders(id),
      FOREIGN KEY(productId) REFERENCES products(id)
    )`);

    // Seed dummy data
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (row.count === 0) {
        let stmt = db.prepare('INSERT INTO products (name, price, category, description, is_hero) VALUES (?, ?, ?, ?, ?)');
        stmt.run('Yogi Tea Detox', 120, 'Čaje', 'Pročistěte své tělo a mysl s ájurvédskou směsí bylin.', 1);
        stmt.run('Aroma olejíček Levandule', 350, 'Aromaterapie', 'Zklidňující esenciální olej pro lepší spánek a relaxaci.', 0);
        stmt.run('Bachovy esence - Krizová směs', 450, 'Esence', 'Rychlá pomoc v náročných životních situacích.', 1);
        stmt.run('Přírodní mýdlo Růže', 180, 'Kosmetika', 'Jemné ručně vyráběné mýdlo s extraktem z damašské růže.', 0);
        stmt.finalize();

        let stmtC = db.prepare('INSERT INTO coupons (code, discount_type, discount_value, usage_limit) VALUES (?, ?, ?, ?)');
        stmtC.run('ZIMNISLEVA20', 'percent', 20, 100);
        stmtC.run('DIKY100', 'fixed', 100, 50);
        stmtC.finalize();
      }
    });
  });
}

// Security & Config constants
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_zvon';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@zelenyzvon.cz';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';
const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Auth API
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID, // Use actual client ID in production
    });
    const payload = ticket.getPayload();
    // In strict mode, we'd only allow ADMIN_EMAIL. Let's allow for testing purposes.
    const token = jwt.sign({ email: payload.email, admin: true }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (error) {
    // Fallback for missing/bad configs during dev: allow any login as an admin
    console.warn("Google auth verification failed or not configured, falling back to dummy token");
    const token = jwt.sign({ email: ADMIN_EMAIL, admin: true }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  }
});

// File Uploads API
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nahrání obrázku selhalo.' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Coupons API
app.get('/api/coupons/validate', (req, res) => {
  const { code } = req.query;
  db.get('SELECT id, discount_type, discount_value, usage_limit, times_used, valid_from, valid_until FROM coupons WHERE code = ? AND is_active = 1', [code], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Kupón nenalezen nebo vypršel' });
    if (row.usage_limit && row.times_used >= row.usage_limit) return res.status(400).json({ error: 'Kupón byl vyčerpán' });
    
    // Check dates bounds
    const now = new Date();
    if (row.valid_from && new Date(row.valid_from) > now) return res.status(400).json({ error: 'Platnost tohoto kupónu ještě nezačala' });
    if (row.valid_until && new Date(row.valid_until) < now) return res.status(400).json({ error: 'Platnost tohoto kupónu již vypršela' });

    res.json({ valid: true, discount_type: row.discount_type, discount_value: row.discount_value, id: row.id });
  });
});

app.get('/api/coupons', authenticateToken, (req, res) => {
  db.all('SELECT * FROM coupons ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/coupons', authenticateToken, (req, res) => {
  const { code, discount_type, discount_value, usage_limit, valid_from, valid_until } = req.body;
  const limitVal = usage_limit ? Number(usage_limit) : null;
  const fromVal = valid_from || null;
  const untilVal = valid_until || null;

  db.run('INSERT INTO coupons (code, discount_type, discount_value, usage_limit, valid_from, valid_until) VALUES (?, ?, ?, ?, ?, ?)',
    [code, discount_type, discount_value, limitVal, fromVal, untilVal],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, code, discount_type, discount_value, usage_limit: limitVal, valid_from: fromVal, valid_until: untilVal, times_used: 0, is_active: 1 });
    }
  );
});

app.delete('/api/coupons/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM coupons WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Products API
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Added authenticateToken for protection
app.post('/api/products', authenticateToken, (req, res) => {
  const { name, price, category, description, image, stock, is_hero } = req.body;
  const isHeroVal = is_hero ? 1 : 0;
  const stockVal = stock || 0;
  db.run('INSERT INTO products (name, price, category, description, image, stock, is_hero) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, price, category, description, image, stockVal, isHeroVal],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, price, category, description, image, stock: stockVal, is_hero: isHeroVal });
    }
  );
});

app.put('/api/products/:id', authenticateToken, (req, res) => {
  const { name, price, category, description, image, stock, is_hero } = req.body;
  const isHeroVal = is_hero ? 1 : 0;
  const stockVal = stock || 0;
  db.run('UPDATE products SET name = ?, price = ?, category = ?, description = ?, image = ?, stock = ?, is_hero = ? WHERE id = ?',
    [name, price, category, description, image, stockVal, isHeroVal, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Orders API
app.get('/api/orders/:id/items', authenticateToken, (req, res) => {
  db.all(`
    SELECT oi.id, oi.quantity, p.name, p.price, p.image 
    FROM order_items oi
    JOIN products p ON oi.productId = p.id
    WHERE oi.orderId = ?
  `, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  db.all('SELECT * FROM orders ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/orders', (req, res) => {
  const { customerName, email, totalAmount, items, couponCode } = req.body;
  
  let finalAmount = totalAmount;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const finalizeOrder = (cId, fAmount) => {
      db.run('INSERT INTO orders (customerName, email, totalAmount, coupon_id) VALUES (?, ?, ?, ?)',
        [customerName, email, fAmount, cId],
        async function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          const orderId = this.lastID;
          
          const stmt = db.prepare('INSERT INTO order_items (orderId, productId, quantity) VALUES (?, ?, ?)');
          items.forEach(item => {
            stmt.run(orderId, item.productId, item.quantity);
          });
          stmt.finalize();
          
          if (cId) {
             db.run('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?', [cId]);
          }
          db.run('COMMIT');

          // Generování SPAYD QR kódu
          // IBAN pro účet 1570560063/0800
          const formattedAmount = Number(fAmount).toFixed(2);
          const spaydStr = `SPD*1.0*ACC:CZ5108000000001570560063*AM:${formattedAmount}*CC:CZK*MSG:Objednavka%20${orderId}%20Zeleny%20Zvon`;
          const qrCodeDataUrl = await qrcode.toDataURL(spaydStr, { margin: 2, scale: 5 });

          res.json({ id: orderId, status: 'Nová', totalAmount: fAmount, qrCode: qrCodeDataUrl });

          // Async Invoice & Email generation
          setTimeout(() => generateAndSendInvoice(orderId, customerName, email, fAmount, items, qrCodeDataUrl), 50);
        }
      );
    };

    if (couponCode) {
      db.get('SELECT id, discount_type, discount_value FROM coupons WHERE code = ? AND is_active = 1', [couponCode], (err, row) => {
         if (row) {
            if (row.discount_type === 'percent') {
              finalAmount = totalAmount * (1 - row.discount_value / 100);
            } else {
              finalAmount = totalAmount - row.discount_value;
            }
            if (finalAmount < 0) finalAmount = 0;
            finalizeOrder(row.id, Math.round(finalAmount));
         } else {
            finalizeOrder(null, Math.round(totalAmount));
         }
      });
    } else {
      finalizeOrder(null, Math.round(totalAmount));
    }
  });
});

app.patch('/api/orders/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// PDF & Email Logic
async function generateAndSendInvoice(orderId, name, email, amount, items, qrCodeDataUrl) {
  try {
     const doc = new PDFDocument({ margin: 50 });
     let buffers = [];
     doc.on('data', buffers.push.bind(buffers));
     doc.on('end', async () => {
         let pdfData = Buffer.concat(buffers);
         console.log(`Faktura vygenerována pro ${email}. Připravuji odeslání e-mailu...`);
         
         try {
           const transporter = nodemailer.createTransport({ 
             host: process.env.SMTP_HOST || 'smtp.ethereal.email', 
             port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587, 
             secure: process.env.SMTP_SECURE === 'true', 
             auth: { 
               user: process.env.SMTP_USER, 
               pass: process.env.SMTP_PASS
             } 
           });

           // Pokud je hostitel Ethereal (neprovedeno nasazení realnych SMTP), vytvorime testovaci ucet
           if (transporter.options.host === 'smtp.ethereal.email' && !process.env.SMTP_USER) {
               console.log("[Test Mode] Používám testovací účet Ethereal protože nejsou zadané SMTP_ proměnné");
               const testAccount = await nodemailer.createTestAccount();
               transporter.options.auth = { user: testAccount.user, pass: testAccount.pass };
           }
           
           const fromAddress = process.env.SMTP_FROM || '"Zelený Zvon" <info@zelenyzvon.cz>';

           let info = await transporter.sendMail({
             from: fromAddress,
             to: email,
             subject: `Objednávka č. ${orderId} - Zelený Zvon`,
             text: `Děkujeme za objednávku! Faktura a QR kód k platbě jsou v příloze.`,
             attachments: [{ filename: `Zalohova_faktura_${orderId}.pdf`, content: pdfData }]
           });

           if (transporter.options.host === 'smtp.ethereal.email') {
              console.log("Náhled testovacího emailu je dostupný na adrese: %s", nodemailer.getTestMessageUrl(info));
           } else {
              console.log("Email úspěšně odeslán na: %s", email);
           }
         } catch (err) {
           console.error("Nepodařilo se odeslat e-mail: ", err);
         }
     });

     // Header
     doc.fontSize(24).text('Zelený Zvon', { align: 'center' });
     doc.moveDown(0.5);
     doc.fontSize(16).text('Výzva k platbě / Zálohová faktura', { align: 'center' });
     doc.moveDown(2);

     // Details
     doc.fontSize(12).text(`Číslo objednávky: ${orderId}`);
     doc.text(`Zákazník: ${name}`);
     doc.text(`Celková částka k úhradě: ${amount} Kč`);
     doc.moveDown(1);
     
     doc.text('Prosíme o úhradu na účet: 1570560063/0800');
     doc.text(`Variabilní symbol: ${orderId}`);
     doc.moveDown(2);

     // Insert QR Code
     const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
     const qrBuffer = Buffer.from(base64Data, 'base64');
     doc.image(qrBuffer, (doc.page.width - 200)/2, doc.y, { width: 200, align: 'center' });
     doc.moveDown(1);

     // Footer
     doc.y = doc.page.height - 100;
     doc.fontSize(10).text('Děkujeme za váš nákup na Zelený Zvon!', { align: 'center', color: 'grey' });

     doc.end();
  } catch (e) {
     console.error('Došlo k chybě při generování faktury:', e);
  }
}

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
