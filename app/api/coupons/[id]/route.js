import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db-drizzle.js';
import { coupons } from '../../../../lib/schema.js';
import { authenticateToken } from '../../../../lib/auth.js';
import { eq } from 'drizzle-orm';

// DELETE /api/coupons/[id]
export async function DELETE(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;
    await db.delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
