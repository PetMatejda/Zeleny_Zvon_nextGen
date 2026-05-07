'use server';

import { db } from '../../lib/db-drizzle.js';
import { reservations, reservation_slots } from '../../lib/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { google } from 'googleapis';
import { sendEmail } from '../../lib/email.js';

// Google Calendar setup
function getCalendarClient() {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!credentials.client_email || !credentials.private_key) {
    console.warn('Google Calendar Service Account is not fully configured.');
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'],
  });

  return google.calendar({ version: 'v3', auth });
}

export async function getAvailableSlots(dateStr) {
  try {
    // Fetch all slots for this date
    const slots = await db.select().from(reservation_slots).where(eq(reservation_slots.date, dateStr));
    
    // For each slot, count active reservations
    const availableSlots = [];
    for (const slot of slots) {
      const activeReservations = await db.select().from(reservations).where(
        and(
          eq(reservations.slotId, slot.id),
          sql`${reservations.status} IN ('pending', 'confirmed')`
        )
      );
      
      const takenCount = activeReservations.length;
      if (takenCount < slot.capacity) {
        availableSlots.push({
          ...slot,
          availableSpots: slot.capacity - takenCount
        });
      }
    }

    return availableSlots;
  } catch (err) {
    console.error('Error fetching available slots:', err);
    return []; 
  }
}

export async function getFutureAvailableSlots() {
  try {
    const nowStr = new Date().toISOString().split('T')[0];
    
    const slots = await db.select().from(reservation_slots).where(sql`${reservation_slots.date} >= ${nowStr}`);
    
    const availableSlots = [];
    for (const slot of slots) {
      const activeReservations = await db.select().from(reservations).where(
        and(
          eq(reservations.slotId, slot.id),
          sql`${reservations.status} IN ('pending', 'confirmed')`
        )
      );
      
      const takenCount = activeReservations.length;
      if (takenCount < slot.capacity) {
        availableSlots.push({
          ...slot,
          availableSpots: slot.capacity - takenCount
        });
      }
    }

    return availableSlots.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.timeSlot}`);
      const dateB = new Date(`${b.date}T${b.timeSlot}`);
      return dateA - dateB;
    });
  } catch (err) {
    console.error('Error fetching future available slots:', err);
    return []; 
  }
}

export async function requestBooking(data) {
  try {
    const { name, email, slotId } = data;
    
    if (!name || !email || !slotId) {
      return { success: false, error: 'Chybí povinná data.' };
    }

    // Check if slot exists and has capacity
    const [slot] = await db.select().from(reservation_slots).where(eq(reservation_slots.id, slotId));
    if (!slot) {
      return { success: false, error: 'Termín nebyl nalezen.' };
    }

    const activeReservations = await db.select().from(reservations).where(
        and(
          eq(reservations.slotId, slotId),
          sql`${reservations.status} IN ('pending', 'confirmed')`
        )
    );

    if (activeReservations.length >= slot.capacity) {
      return { success: false, error: 'Tento termín už bohužel není volný.' };
    }

    // Insert into local DB as 'pending'
    await db.insert(reservations).values({
      name,
      email,
      date: slot.date, // keep for legacy compatibility
      timeSlot: slot.timeSlot, // keep for legacy compatibility
      slotId: slot.id,
      status: 'pending'
    });

    // Notify Admin
    const adminEmail = process.env.SMTP_USER || 'admin@zelenyzvon.cz';
    const textMsg = `Nová rezervace od ${name} (${email}) na termín ${slot.title} (${slot.date} v ${slot.timeSlot}). Prosím, schvalte ji v administraci.`;
    await sendEmail({
      to: adminEmail,
      subject: `Nová žádost o rezervaci - ${name}`,
      htmlContent: `<p>${textMsg.replace(/\n/g, '<br/>')}</p>`,
    }).catch(console.error);

    return { success: true };
  } catch (error) {
    console.error('Error requesting booking:', error);
    return { success: false, error: 'Nepodařilo se vytvořit rezervaci.' };
  }
}

export async function approveBooking(id) {
  try {
    // Fetch reservation
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    if (!reservation) {
      return { success: false, error: 'Rezervace nenalezena.' };
    }

    if (reservation.status === 'confirmed') {
      return { success: false, error: 'Rezervace již byla schválena.' };
    }

    const [slot] = await db.select().from(reservation_slots).where(eq(reservation_slots.id, reservation.slotId));

    // Update DB
    await db.update(reservations).set({ status: 'confirmed' }).where(eq(reservations.id, id));

    // Create Event in Google Calendar
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    if (calendar && calendarId && slot) {
      const eventStart = new Date(`${slot.date}T${slot.timeSlot}:00+02:00`);
      const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1 hour duration

      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `Rezervace (${slot.title}): ${reservation.name}`,
          description: `Email: ${reservation.email}`,
          start: {
            dateTime: eventStart.toISOString(),
            timeZone: 'Europe/Prague',
          },
          end: {
            dateTime: eventEnd.toISOString(),
            timeZone: 'Europe/Prague',
          },
        },
      });
    }

    // Send confirmation email to user
    const textMsg = `Dobrý den ${reservation.name},\n\nVaše rezervace na událost "${slot ? slot.title : 'Rezervace'}" dne ${reservation.date} v ${reservation.timeSlot} byla úspěšně potvrzena.\n\nTěšíme se na Vás!`;
    await sendEmail({
      to: reservation.email,
      subject: `Potvrzení rezervace - Zelený Zvon`,
      htmlContent: `<p>${textMsg.replace(/\n/g, '<br/>')}</p>`,
    }).catch(console.error);

    return { success: true };
  } catch (error) {
    console.error('Error approving booking:', error);
    return { success: false, error: 'Nepodařilo se schválit rezervaci.' };
  }
}

export async function rejectBooking(id, sendEmailFlag = true, customMessage = null, reason = null) {
  try {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    if (!reservation) return { success: false, error: 'Rezervace nenalezena.' };

    const wasConfirmed = reservation.status === 'confirmed';

    await db.update(reservations).set({ status: 'cancelled' }).where(eq(reservations.id, id));

    if (wasConfirmed) {
      const calendar = getCalendarClient();
      const calendarId = process.env.GOOGLE_CALENDAR_ID;
      if (calendar && calendarId) {
        try {
          const [slot] = await db.select().from(reservation_slots).where(eq(reservation_slots.id, reservation.slotId));
          const dateStr = slot ? slot.date : reservation.date;
          
          const events = await calendar.events.list({
            calendarId,
            q: reservation.email,
            timeMin: new Date(new Date(dateStr).getTime() - 24 * 3600 * 1000).toISOString(),
            timeMax: new Date(new Date(dateStr).getTime() + 2 * 24 * 3600 * 1000).toISOString(),
          });

          if (events.data.items) {
            for (const ev of events.data.items) {
               if (ev.start && ev.start.dateTime && ev.start.dateTime.startsWith(dateStr)) {
                  await calendar.events.delete({
                      calendarId,
                      eventId: ev.id,
                  });
               }
            }
          }
        } catch (calErr) {
          console.error('Nepodařilo se smazat událost z kalendáře:', calErr);
        }
      }
    }

    if (sendEmailFlag && reservation.email) {
      let message = customMessage || `Dobrý den ${reservation.name},\n\nVaše rezervace ze dne ${reservation.date} v ${reservation.timeSlot} byla bohužel zrušena.\n\nOmlouváme se za případné komplikace a děkujeme za pochopení.`;
      
      if (reason && !customMessage) {
        message = `Dobrý den ${reservation.name},\n\nVaše rezervace ze dne ${reservation.date} v ${reservation.timeSlot} byla bohužel zrušena.\n\nDůvod zrušení: ${reason}\n\nOmlouváme se za případné komplikace a děkujeme za pochopení.`;
      }
      
      await sendEmail({
        to: reservation.email,
        subject: `Zrušení rezervace - Zelený Zvon`,
        htmlContent: `<p>${message.replace(/\n/g, '<br/>')}</p>`,
      }).catch(console.error);
    }

    return { success: true };
  } catch(error) {
    return { success: false, error: 'Chyba při rušení.'};
  }
}

// ADMIN ACTIONS
export async function getAdminSlots() {
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
    return slotsWithCapacity.sort((a,b) => new Date(b.date) - new Date(a.date));
  } catch(e) { return []; }
}

export async function createReservationSlot(data) {
  try {
    const { title, date, timeSlot, capacity } = data;
    await db.insert(reservation_slots).values({
      title, date, timeSlot, capacity: parseInt(capacity)
    });
    return { success: true };
  } catch(e) {
    return { success: false, error: 'Nepodařilo se vytvořit termín.' };
  }
}

export async function deleteReservationSlot(id) {
  try {
    // delete slot
    await db.delete(reservation_slots).where(eq(reservation_slots.id, id));
    return { success: true };
  } catch(e) {
    return { success: false, error: 'Nelze smazat termín.'};
  }
}

export async function getAdminReservations() {
    try {
        const res = await db.select({
            id: reservations.id,
            name: reservations.name,
            email: reservations.email,
            date: reservations.date,
            timeSlot: reservations.timeSlot,
            status: reservations.status,
            createdAt: reservations.createdAt,
            slotTitle: reservation_slots.title
        })
        .from(reservations)
        .leftJoin(reservation_slots, eq(reservations.slotId, reservation_slots.id));

        return res.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch(e) {
        return [];
    }
}
