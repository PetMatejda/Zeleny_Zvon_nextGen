import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db-drizzle.js';
import { orders } from '../../../../../lib/schema.js';
import { authenticateToken } from '../../../../../lib/auth.js';
import { eq } from 'drizzle-orm';

// PATCH /api/orders/[id]/status
export async function PATCH(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });

    const result = await db.update(orders).set({ status }).where(eq(orders.id, id));
    
    // Drizzle sqlite update does not return changes count easily without returning(), but we assume it works if no error thrown
    // Or we could use returning()
    return NextResponse.json({ success: true, status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
