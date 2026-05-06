import { NextResponse } from 'next/server';
import { db } from '../../../lib/db-drizzle.js';
import { reservations, reservation_slots } from '../../../lib/schema.js';
import { authenticateToken } from '../../../lib/auth.js';
import { eq } from 'drizzle-orm';

export async function GET(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const res = await db.select({
        id: reservations.id,
        name: reservations.name,
        email: reservations.email,
        date: reservations.date,
        timeSlot: reservations.timeSlot,
        status: reservations.status,
        createdAt: reservations.createdAt,
        slotTitle: reservation_slots.title,
        slotId: reservations.slotId
    })
    .from(reservations)
    .leftJoin(reservation_slots, eq(reservations.slotId, reservation_slots.id));

    const sorted = res.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(sorted);
  } catch(e) {
      return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
