import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(join(__dirname, 'database.sqlite'), (err) => {
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
      image TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      email TEXT NOT NULL,
      totalAmount INTEGER NOT NULL,
      status TEXT DEFAULT 'Nová',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER,
      productId INTEGER,
      quantity INTEGER,
      FOREIGN KEY(orderId) REFERENCES orders(id),
      FOREIGN KEY(productId) REFERENCES products(id)
    )`);

    // Seed dummy products if empty
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare('INSERT INTO products (name, price, category) VALUES (?, ?, ?)');
        stmt.run('Yogi Tea Detox', 120, 'Čaje');
        stmt.run('Aroma olejíček Levandule', 350, 'Aromaterapie');
        stmt.run('Bachovy esence - Krizová směs', 450, 'Esence');
        stmt.run('Přírodní mýdlo Růže', 180, 'Kosmetika');
        stmt.finalize();
      }
    });
  });
}

// Products API
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/products', (req, res) => {
  const { name, price, category, description, image } = req.body;
  db.run('INSERT INTO products (name, price, category, description, image) VALUES (?, ?, ?, ?, ?)',
    [name, price, category, description, image],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, price, category, description, image });
    }
  );
});

// Orders API
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/orders', (req, res) => {
  const { customerName, email, totalAmount, items } = req.body;
  
  db.run('INSERT INTO orders (customerName, email, totalAmount) VALUES (?, ?, ?)',
    [customerName, email, totalAmount],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const orderId = this.lastID;
      
      const stmt = db.prepare('INSERT INTO order_items (orderId, productId, quantity) VALUES (?, ?, ?)');
      items.forEach(item => {
        stmt.run(orderId, item.productId, item.quantity);
      });
      stmt.finalize();
      
      res.json({ id: orderId, status: 'Nová', totalAmount });
    }
  );
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
