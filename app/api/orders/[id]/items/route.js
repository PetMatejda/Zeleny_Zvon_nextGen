import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db.js';
import { authenticateToken } from '../../../../../lib/auth.js';

// GET /api/orders/[id]/items
export async function GET(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  const db = getDb();
  const { id } = await params;

  return new Promise((resolve) => {
    db.all(
      `SELECT oi.id, oi.quantity, p.name, p.price, p.image
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       WHERE oi.orderId = ?`,
      [id],
      (err, rows) => {
        if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        resolve(NextResponse.json(rows));
      }
    );
  });
}
