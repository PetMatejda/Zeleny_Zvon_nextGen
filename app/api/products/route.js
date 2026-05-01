import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db.js';
import { authenticateToken } from '../../../lib/auth.js';

function slugify(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

// GET /api/products — list all
export async function GET() {
  const db = getDb();
  return new Promise((resolve) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
      if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      resolve(NextResponse.json(rows));
    });
  });
}

// POST /api/products — create product (auth required)
export async function POST(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  const db = getDb();
  const { name, price, category, description, image, stock, is_hero, slug } = await request.json();
  const isHeroVal = is_hero ? 1 : 0;
  const stockVal = stock || 0;
  const slugVal = slug || slugify(name);

  return new Promise((resolve) => {
    db.run(
      'INSERT INTO products (name, price, category, description, image, stock, is_hero, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, category, description, image, stockVal, isHeroVal, slugVal],
      function (err) {
        if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        resolve(NextResponse.json({ id: this.lastID, name, price, category, description, image, stock: stockVal, is_hero: isHeroVal, slug: slugVal }));
      }
    );
  });
}
