import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db-drizzle.js';
import { order_items, products } from '../../../../../lib/schema.js';
import { authenticateToken } from '../../../../../lib/auth.js';
import { eq } from 'drizzle-orm';

// GET /api/orders/[id]/items
export async function GET(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;

    const rows = await db.select({
      id: order_items.id,
      quantity: order_items.quantity,
      name: products.name,
      price: products.price,
      image: products.image
    })
    .from(order_items)
    .innerJoin(products, eq(order_items.productId, products.id))
    .where(eq(order_items.orderId, id));

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
