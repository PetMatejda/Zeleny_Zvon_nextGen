import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db-drizzle.js';
import { products } from '../../../../lib/schema.js';
import { authenticateToken } from '../../../../lib/auth.js';
import { eq } from 'drizzle-orm';

function slugify(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

// PUT /api/products/[id] — update product
export async function PUT(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;
    const { name, price, category, description, image, stock, is_hero, slug } = await request.json();
    const isHeroVal = is_hero ? true : false;
    const stockVal = stock || 0;
    const slugVal = slug || slugify(name);

    await db.update(products).set({
      name,
      price,
      category,
      description,
      image,
      stock: stockVal,
      is_hero: isHeroVal,
      slug: slugVal
    }).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products/[id] — delete product
export async function DELETE(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
