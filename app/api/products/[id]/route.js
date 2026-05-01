import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db.js';
import { authenticateToken } from '../../../../lib/auth.js';

function slugify(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

// PUT /api/products/[id] — update product
export async function PUT(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  const db = getDb();
  const { id } = await params;
  const { name, price, category, description, image, stock, is_hero, slug } = await request.json();
  const isHeroVal = is_hero ? 1 : 0;
  const stockVal = stock || 0;
  const slugVal = slug || slugify(name);

  return new Promise((resolve) => {
    db.run(
      'UPDATE products SET name = ?, price = ?, category = ?, description = ?, image = ?, stock = ?, is_hero = ?, slug = ? WHERE id = ?',
      [name, price, category, description, image, stockVal, isHeroVal, slugVal, id],
      function (err) {
        if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        resolve(NextResponse.json({ success: true }));
      }
    );
  });
}

// DELETE /api/products/[id] — delete product
export async function DELETE(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  const db = getDb();
  const { id } = await params;

  return new Promise((resolve) => {
    db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
      if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      resolve(NextResponse.json({ success: true }));
    });
  });
}
