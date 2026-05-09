import { NextResponse } from 'next/server';
import { db } from '../../../lib/db-drizzle.js';
import { reservation_slots } from '../../../lib/schema.js';
import { authenticateToken } from '../../../lib/auth.js';
import { desc } from 'drizzle-orm';
import { attachTakenCounts } from '../../../lib/slot-utils.js';

export async function GET(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const slots = await db
      .select()
      .from(reservation_slots)
      .orderBy(desc(reservation_slots.date));

    const slotsWithCapacity = await attachTakenCounts(slots);
    return NextResponse.json(slotsWithCapacity);
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
