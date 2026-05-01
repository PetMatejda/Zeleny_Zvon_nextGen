import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db.js';

// GET /api/products/by-slug/[slug]
export async function GET(request, { params }) {
  const db = getDb();
  const { slug } = await params;

  return new Promise((resolve) => {
    db.get('SELECT * FROM products WHERE slug = ?', [slug], (err, row) => {
      if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      if (!row) return resolve(NextResponse.json({ error: 'Produkt nenalezen' }, { status: 404 }));
      resolve(NextResponse.json(row));
    });
  });
}
