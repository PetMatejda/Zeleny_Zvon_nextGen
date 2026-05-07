import { NextResponse } from 'next/server';
import { db } from '../../../lib/db-drizzle.js';
import { reservation_slots, reservations } from '../../../lib/schema.js';
import { authenticateToken } from '../../../lib/auth.js';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  // AUTO-MIGRATION for container environments
  try {
    await db.run(sql`SELECT 1 FROM reservation_slots LIMIT 1`).catch(async () => {
      console.log('Automigrace: Vytvářím tabulky pro rezervace...');
      await db.run(sql`CREATE TABLE IF NOT EXISTS reservation_slots (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, date TEXT NOT NULL, timeSlot TEXT NOT NULL, capacity INTEGER NOT NULL DEFAULT 1, createdAt TEXT DEFAULT (CURRENT_TIMESTAMP))`);
      await db.run(sql`ALTER TABLE reservations ADD COLUMN slotId INTEGER REFERENCES reservation_slots(id)`).catch(() => {});
      console.log('Automigrace dokončena.');
    });
  } catch (e) {
    console.error('Chyba automigrace:', e);
  }

  try {
    const slots = await db.select().from(reservation_slots);
    
    // attach taken capacity
    const slotsWithCapacity = [];
    for (const slot of slots) {
        const activeReservations = await db.select().from(reservations).where(
            and(
              eq(reservations.slotId, slot.id),
              sql`${reservations.status} IN ('pending', 'confirmed')`
            )
        );
        slotsWithCapacity.push({
            ...slot,
            taken: activeReservations.length
        });
    }
    // Sort descending by date
    const sorted = slotsWithCapacity.sort((a,b) => new Date(b.date) - new Date(a.date));
    return NextResponse.json(sorted);
  } catch(e) {
      return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const data = await request.json();
    const { title, date, timeSlot, capacity, repeatCount = 1, repeatFrequency = 'none' } = data;
    
    let currentDate = new Date(date);
    const count = parseInt(repeatCount) || 1;
    const valuesToInsert = [];

    for (let i = 0; i < count; i++) {
        const formattedDate = currentDate.toISOString().split('T')[0];
        valuesToInsert.push({
            title, date: formattedDate, timeSlot, capacity: parseInt(capacity)
        });

        if (repeatFrequency === 'weekly') {
            currentDate.setUTCDate(currentDate.getUTCDate() + 7);
        } else if (repeatFrequency === 'biweekly') {
            currentDate.setUTCDate(currentDate.getUTCDate() + 14);
        } else if (repeatFrequency === 'daily') {
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        } else if (repeatFrequency === 'monthly') {
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
        } else {
            break;
        }
    }

    await db.insert(reservation_slots).values(valuesToInsert);

    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: 'Nepodařilo se vytvořit termín.' }, { status: 500 });
  }
}
