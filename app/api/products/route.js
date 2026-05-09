import { NextResponse } from 'next/server';
import { db } from '../../../lib/db-drizzle.js';
import { products } from '../../../lib/schema.js';
import { authenticateToken } from '../../../lib/auth.js';
import { slugify } from '../../../lib/utils.js';

// GET /api/products — list all
export async function GET() {
  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/products — create product (auth required)
export async function POST(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { name, price, category, description, image, stock, is_hero, slug } = await request.json();
    const isHeroVal = is_hero ? true : false;
    const stockVal = stock || 0;
    const slugVal = slug || slugify(name);

    const result = await db.insert(products).values({
      name,
      price,
      category,
      description,
      image,
      stock: stockVal,
      is_hero: isHeroVal,
      slug: slugVal
    }).returning();

    return NextResponse.json(result[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
