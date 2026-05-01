import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const UPLOADS_DIR = process.env.DATABASE_PATH
  ? '/data/uploads'
  : join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || join(__dirname, '..', 'database.sqlite');

// Singleton — one DB connection for the lifetime of the process
let db;

function getDb() {
  if (db) return db;

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Connected to SQLite database at', dbPath);
      initDb();
    }
  });

  return db;
}

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
      is_hero BOOLEAN DEFAULT 0,
      slug TEXT
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

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER,
      productId INTEGER,
      quantity INTEGER,
      FOREIGN KEY(orderId) REFERENCES orders(id),
      FOREIGN KEY(productId) REFERENCES products(id)
    )`);

    // Migrations for older DB instances
    db.all('PRAGMA table_info(coupons)', (err, columns) => {
      if (columns && !columns.some(c => c.name === 'valid_from')) {
        db.run('ALTER TABLE coupons ADD COLUMN valid_from DATETIME');
      }
    });
    db.all('PRAGMA table_info(products)', (err, columns) => {
      if (columns && !columns.some(c => c.name === 'slug')) {
        db.run('ALTER TABLE products ADD COLUMN slug TEXT');
      }
    });
    db.all('PRAGMA table_info(orders)', (err, columns) => {
      if (columns && !columns.some(c => c.name === 'address')) {
        db.run('ALTER TABLE orders ADD COLUMN address TEXT');
      }
    });

    // Seed dummy data only if empty
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (row && row.count === 0) {
        const stmt = db.prepare('INSERT INTO products (name, price, category, description, is_hero) VALUES (?, ?, ?, ?, ?)');
        stmt.run('Yogi Tea Detox', 120, 'Čaje', 'Pročistěte své tělo a mysl s ájurvédskou směsí bylin.', 1);
        stmt.run('Aroma olejíček Levandule', 350, 'Aromaterapie', 'Zklidňující esenciální olej pro lepší spánek a relaxaci.', 0);
        stmt.run('Bachovy esence - Krizová směs', 450, 'Esence', 'Rychlá pomoc v náročných životních situacích.', 1);
        stmt.run('Přírodní mýdlo Růže', 180, 'Kosmetika', 'Jemné ručně vyráběné mýdlo s extraktem z damašské růže.', 0);
        stmt.finalize();

        const stmtC = db.prepare('INSERT INTO coupons (code, discount_type, discount_value, usage_limit) VALUES (?, ?, ?, ?)');
        stmtC.run('ZIMNISLEVA20', 'percent', 20, 100);
        stmtC.run('DIKY100', 'fixed', 100, 50);
        stmtC.finalize();
      }
    });
  });
}

export { getDb, UPLOADS_DIR };
