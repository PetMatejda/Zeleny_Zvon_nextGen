'use server';

import { db } from '../../lib/db-drizzle.js';
import { reservations, reservation_slots } from '../../lib/schema.js';
import { eq, sql } from 'drizzle-orm';
import { google } from 'googleapis';
import { sendEmail } from '../../lib/email.js';
import { textToSafeHtml } from '../../lib/utils.js';
import { getAvailableSlotsForDate, getFutureAvailableSlotsList, getActiveReservationCount } from '../../lib/slot-utils.js';

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
    return await getAvailableSlotsForDate(dateStr);
  } catch (err) {
    console.error('Error fetching available slots:', err);
    return []; 
  }
}

export async function getFutureAvailableSlots() {
  try {
    return await getFutureAvailableSlotsList();
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

    const takenCount = await getActiveReservationCount(slotId);
    if (takenCount >= slot.capacity) {
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
    const safeText = `Nová rezervace od ${textToSafeHtml(name)} (${textToSafeHtml(email)}) na termín ${textToSafeHtml(slot.title)} (${slot.date} v ${slot.timeSlot}). Prosím, schvalte ji v administraci.`;
    await sendEmail({
      to: adminEmail,
      subject: `Nová žádost o rezervaci - ${name}`,
      htmlContent: `<p>${safeText}</p>`,
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
    const slotTitle = slot ? textToSafeHtml(slot.title) : 'Rezervace';
    const safeName = textToSafeHtml(reservation.name);
    const htmlContent = `<p>Dobrý den ${safeName},<br/><br/>Vaše rezervace na událost &quot;${slotTitle}&quot; dne ${reservation.date} v ${reservation.timeSlot} byla úspěšně potvrzena.<br/><br/>Těšíme se na Vás!</p>`;
    await sendEmail({
      to: reservation.email,
      subject: `Potvrzení rezervace - Zelený Zvon`,
      htmlContent,
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
      const safeName = textToSafeHtml(reservation.name);
      let htmlContent;

      if (customMessage) {
        // customMessage is already pre-built HTML-safe content from slot deletion
        htmlContent = `<p>${customMessage.replace(/\n/g, '<br/>')}</p>`;
      } else if (reason) {
        const safeReason = textToSafeHtml(reason);
        htmlContent = `<p>Dobrý den ${safeName},<br/><br/>Vaše rezervace ze dne ${reservation.date} v ${reservation.timeSlot} byla bohužel zrušena.<br/><br/>Důvod zrušení: ${safeReason}<br/><br/>Omlouváme se za případné komplikace a děkujeme za pochopení.</p>`;
      } else {
        htmlContent = `<p>Dobrý den ${safeName},<br/><br/>Vaše rezervace ze dne ${reservation.date} v ${reservation.timeSlot} byla bohužel zrušena.<br/><br/>Omlouváme se za případné komplikace a děkujeme za pochopení.</p>`;
      }

      await sendEmail({
        to: reservation.email,
        subject: `Zrušení rezervace - Zelený Zvon`,
        htmlContent,
      }).catch(console.error);
    }

    return { success: true };
  } catch(error) {
    console.error('Error rejecting booking:', error);
    return { success: false, error: 'Chyba při rušení.'};
  }
}
