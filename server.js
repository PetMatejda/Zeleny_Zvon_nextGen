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
      address TEXT,
      totalAmount INTEGER NOT NULL,
      status TEXT DEFAULT 'Nová',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      coupon_id INTEGER,
      FOREIGN KEY(coupon_id) REFERENCES coupons(id)
    )`);

    db.all("PRAGMA table_info(orders)", (err, columns) => {
      if (columns && !columns.some(c => c.name === 'address')) {
        db.run("ALTER TABLE orders ADD COLUMN address TEXT");
      }
    });

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
  
  const ALLOWED_ADMINS = ['petmatejda@gmail.com', 'peta.matejickova@gmail.com'];

  try {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!ALLOWED_ADMINS.includes(payload.email.toLowerCase())) {
       console.warn(`Neoprávněný pokus o přihlášení: ${payload.email}`);
       return res.status(403).json({ error: 'Přihlášení zamítnuto: Nemáte oprávnění k administraci.' });
    }

    const token = jwt.sign({ email: payload.email, admin: true }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (error) {
    console.error("Google verify error:", error.message);
    res.status(401).json({ error: 'Neplatný přihlašovací token.' });
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

app.patch('/api/orders/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, status });
  });
});

app.post('/api/orders', (req, res) => {
  const { customerName, email, address, totalAmount, items, couponCode } = req.body;
  
  let finalAmount = totalAmount;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const finalizeOrder = (cId, fAmount) => {
      db.run('INSERT INTO orders (customerName, email, address, totalAmount, coupon_id) VALUES (?, ?, ?, ?, ?)',
        [customerName, email, address || '', fAmount, cId],
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
          const spaydStr = `SPD*1.0*ACC:CZ5108000000001570560063*AM:${formattedAmount}*CC:CZK*X-VS:${orderId}*MSG:Objednavka%20${orderId}%20Zeleny%20Zvon`;
          const qrCodeDataUrl = await qrcode.toDataURL(spaydStr, { margin: 2, scale: 5 });

          res.json({ id: orderId, status: 'Nová', totalAmount: fAmount, qrCode: qrCodeDataUrl });

          // Async Invoice & Email generation
          setTimeout(() => generateAndSendInvoice(orderId, customerName, email, address, fAmount, items, qrCodeDataUrl), 50);
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
async function generateAndSendInvoice(orderId, name, email, address, amount, items, qrCodeDataUrl) {
  try {
     const itemDetails = await new Promise((resolve, reject) => {
        const productIds = items.map(i => i.productId).join(',');
        if (!productIds) return resolve([]);
        db.all(`SELECT id, name, price FROM products WHERE id IN (${productIds})`, (err, rows) => {
           if (err) reject(err);
           else {
               const enrichedItems = items.map(item => {
                  const product = rows.find(r => r.id === item.productId);
                  return { ...item, name: product ? product.name : 'Neznámý produkt', price: product ? product.price : 0 };
               });
               resolve(enrichedItems);
           }
        });
     });

     const doc = new PDFDocument({ margin: 50 });
     doc.registerFont('Roboto', './fonts/Roboto-Regular.ttf');
     doc.registerFont('Roboto-Bold', './fonts/Roboto-Bold.ttf');
     
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

           if (transporter.options.host === 'smtp.ethereal.email' && !process.env.SMTP_USER) {
               const testAccount = await nodemailer.createTestAccount();
               transporter.options.auth = { user: testAccount.user, pass: testAccount.pass };
           }
           
           const fromAddress = process.env.SMTP_FROM || '"Zelený Zvon" <zelenyzvon@gmail.com>';

           const qrBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
           const qrBufferEmail = Buffer.from(qrBase64, 'base64');

           const htmlTemplate = `
             <div style="font-family: Arial, sans-serif; color: #1b1c19; max-width: 600px; margin: 0 auto; border: 1px solid #765a17; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #765a17; color: #fff; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-style: italic;">Zelený Zvon</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="margin-top: 0; color: #1b1c19;">Děkujeme za vaši objednávku!</h2>
                    <p>Vážený/á zákazníku,</p>
                    <p>vaše objednávka číslo <strong>${orderId}</strong> byla úspěšně zpracována. V příloze tohoto e-mailu najdete zálohovou fakturu k proplacení ve formátu PDF.</p>
                    <br/>
                    <div style="background-color: #f6f5f1; border-radius: 8px; padding: 20px;">
                      <h3 style="color: #765a17; border-bottom: 2px solid #765a17; padding-bottom: 8px; margin-top: 0;">Výzva k úhradě</h3>
                      <p>Prosíme o laskavou úhradu částky: <strong style="font-size: 18px;">${amount} Kč</strong></p>
                      <ul style="list-style-type: none; padding-left: 0; line-height: 1.8;">
                        <li>Číslo účtu: <strong>1570560063/0800</strong></li>
                        <li>Variabilní symbol: <strong>${orderId}</strong></li>
                      </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Pro rychlou a snadnou platbu přes mobilní bankovnictví naskenujte tento QR kód:</p>
                        <img src="cid:qrcode_image" alt="QR Platba" style="width: 200px; height: 200px; display: inline-block; border: 2px solid #765a17; border-radius: 10px; padding: 10px;" />
                    </div>
                </div>
                <div style="background-color: #f6f5f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                    Zelený Zvon | Zpět k přírodě<br/>
                    Pokud máte jakékoliv dotazy, jednoduše odpovězte na tento e-mail.
                </div>
             </div>
           `;

           let info = await transporter.sendMail({
             from: fromAddress,
             to: email,
             subject: `Zálohová faktura - objednávka č. ${orderId} - Zelený Zvon`,
             html: htmlTemplate,
             attachments: [
                 { filename: `Zalohova_faktura_${orderId}.pdf`, content: pdfData },
                 { filename: 'qrcode.png', content: qrBufferEmail, cid: 'qrcode_image' }
             ]
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

     // Header PDF
     doc.font('Roboto-Bold').fontSize(26).fillColor('#765a17').text('Zelený Zvon', { align: 'center' });
     doc.moveDown(0.5);
     doc.font('Roboto').fontSize(16).fillColor('#1b1c19').text('Zálohová faktura / Výzva k platbě', { align: 'center' });
     doc.moveDown(2);

     const topY = doc.y;
     
     // Dodavatel
     doc.font('Roboto-Bold').fontSize(12).text('Dodavatel:');
     doc.font('Roboto').text('Zelený Zvon\nE-mail: info@zelenyzvon.cz');
     
     doc.y = topY;
     doc.x = 300;
     // Odběratel
     doc.font('Roboto-Bold').fontSize(12).text('Odběratel:');
     doc.font('Roboto').text(name || 'Neznámý zákazník');
     if (address) {
         doc.text(address, { width: 200 });
     } else {
         doc.text(email);
     }
     
     doc.x = 50;
     doc.moveDown(3);

     // Order Info
     doc.font('Roboto-Bold').fontSize(14).fillColor('#765a17').text(`Číslo objednávky: ${orderId}`);
     doc.moveDown(1);

     // Table Header
     doc.rect(50, doc.y, 500, 20).fill('#f6f5f1');
     doc.fillColor('#1b1c19').font('Roboto-Bold').fontSize(10);
     doc.text('Položka', 60, doc.y + 5);
     doc.text('Množství', 350, doc.y - 12);
     doc.text('Cena celkem', 450, doc.y - 12);
     doc.moveDown(1.5);

     // Table items
     let currentY = doc.y;
     doc.font('Roboto').fontSize(10);
     itemDetails.forEach((item, i) => {
        doc.text(item.name, 60, currentY);
        doc.text(`${item.quantity} ks`, 350, currentY);
        doc.text(`${item.quantity * item.price} Kč`, 450, currentY);
        currentY += 20;
        doc.moveTo(50, currentY - 5).lineTo(550, currentY - 5).lineWidth(0.5).strokeOpacity(0.2).stroke();
     });
     
     doc.y = currentY + 20;

     // Total
     doc.font('Roboto-Bold').fontSize(14).fillColor('#765a17').text(`Celková částka: ${amount} Kč`, { align: 'right' });
     doc.moveDown(3);

     // Payment Details & QR box
     const boxY = doc.y;
     doc.rect(50, boxY, 500, 150).lineWidth(1).strokeOpacity(1).strokeColor('#765a17').stroke();
     
     doc.x = 70;
     doc.y = boxY + 20;
     doc.font('Roboto-Bold').fontSize(12).fillColor('#1b1c19').text('Platební údaje:');
     doc.moveDown(0.5);
     doc.font('Roboto').text('Prosíme o úhradu převodem.\n\n' +
        `Číslo účtu: 1570560063/0800\n` +
        `Variabilní symbol: ${orderId}\n` +
        `Částka k úhradě: ${amount} Kč`
     );

     // Insert QR Code
     const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
     const qrBuffer = Buffer.from(base64Data, 'base64');
     doc.image(qrBuffer, 380, boxY + 15, { width: 120 });
     
     doc.x = 50;

     // Footer
     doc.y = doc.page.height - 70;
     doc.fontSize(10).fillColor('grey').text('Děkujeme za váš nákup u Zelený Zvon!', { align: 'center' });

     doc.end();
  } catch (e) {
     console.error('Došlo k chybě při generování faktury:', e);
  }
}


app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
