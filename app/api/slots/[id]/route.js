import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db-drizzle.js';
import { reservation_slots } from '../../../../lib/schema.js';
import { authenticateToken } from '../../../../lib/auth.js';
import { eq } from 'drizzle-orm';

export async function DELETE(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;
    await db.delete(reservation_slots).where(eq(reservation_slots.id, id));
    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: 'Nelze smazat termín.' }, { status: 500 });
  }
}
