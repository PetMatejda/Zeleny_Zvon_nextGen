import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db-drizzle.js';
import { products } from '../../../../../lib/schema.js';
import { eq } from 'drizzle-orm';

// GET /api/products/by-slug/[slug]
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const [row] = await db.select().from(products).where(eq(products.slug, slug));
    
    if (!row) return NextResponse.json({ error: 'Produkt nenalezen' }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
