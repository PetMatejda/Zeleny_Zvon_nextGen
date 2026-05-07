import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db-drizzle.js';
import { reservation_slots, reservations } from '../../../../lib/schema.js';
import { authenticateToken } from '../../../../lib/auth.js';
import { eq, and, ne } from 'drizzle-orm';
import { rejectBooking } from '../../../actions/reservations.js';

export async function DELETE(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;
    
    // Získáme detail termínu pro email
    const [slot] = await db.select().from(reservation_slots).where(eq(reservation_slots.id, id));
    
    if (slot) {
      // Najdeme všechny aktivní (nezrušené) rezervace k tomuto termínu
      const activeReservations = await db.select().from(reservations).where(
        and(
          eq(reservations.slotId, id),
          ne(reservations.status, 'cancelled')
        )
      );

      // Zrušíme je a odešleme informativní email
      for (const res of activeReservations) {
        const customMessage = `Dobrý den ${res.name},\n\nmoc se omlouváme, ale událost "${slot.title}" dne ${slot.date} v ${slot.timeSlot} byla zrušena.\n\nVaše rezervace proto byla automaticky stornována. Těšíme se na Vás snad u jiného termínu.\n\nS pozdravem,\nZelený Zvon`;
        await rejectBooking(res.id, true, customMessage);
      }
    }
    
    // Unlink any existing reservations from this slot to preserve history without FK constraint errors
    await db.update(reservations).set({ slotId: null }).where(eq(reservations.slotId, id));
    
    await db.delete(reservation_slots).where(eq(reservation_slots.id, id));
    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: 'Nelze smazat termín. Detaily: ' + e.message }, { status: 500 });
  }
}
