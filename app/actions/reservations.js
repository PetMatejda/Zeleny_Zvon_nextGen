'use server';

import { db } from '../../lib/db-drizzle.js';
import { reservations } from '../../lib/schema.js';
import { eq, and } from 'drizzle-orm';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 1025,
  secure: false, // true for 465, false for other ports
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

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
  // Available slots for a day
  const allSlots = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
  ];

  try {
    // 1. Fetch from SQLite
    const localReservations = await db.select().from(reservations).where(eq(reservations.date, dateStr));
    const takenLocalSlots = localReservations
      .filter(r => r.status === 'confirmed' || r.status === 'pending')
      .map(r => r.timeSlot);

    // 2. Fetch from Google Calendar
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    let takenGoogleSlots = [];
    if (calendar && calendarId) {
      const startOfDay = new Date(`${dateStr}T00:00:00+02:00`);
      const endOfDay = new Date(`${dateStr}T23:59:59+02:00`);

      const res = await calendar.events.list({
        calendarId,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = res.data.items || [];
      
      takenGoogleSlots = events.map(event => {
        if (!event.start.dateTime) return null;
        const eventDate = new Date(event.start.dateTime);
        const hours = eventDate.getHours().toString().padStart(2, '0');
        const mins = eventDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${mins}`;
      }).filter(Boolean);
    }

    const allTaken = new Set([...takenLocalSlots, ...takenGoogleSlots]);

    return allSlots.filter(slot => !allTaken.has(slot));

  } catch (err) {
    console.error('Error fetching available slots:', err);
    return []; // Return no slots if error
  }
}

export async function requestBooking(data) {
  try {
    const { name, email, date, timeSlot } = data;
    
    if (!name || !email || !date || !timeSlot) {
      return { success: false, error: 'Chybí povinná data.' };
    }

    // Check if slot is still available
    const available = await getAvailableSlots(date);
    if (!available.includes(timeSlot)) {
      return { success: false, error: 'Tento termín už bohužel není volný.' };
    }

    // Insert into local DB as 'pending'
    await db.insert(reservations).values({
      name,
      email,
      date,
      timeSlot,
      status: 'pending'
    });

    // Notify Admin
    const adminEmail = process.env.SMTP_USER || 'admin@zelenyzvon.cz'; 
    await transporter.sendMail({
      from: `"Zelený Zvon Rezervace" <${adminEmail}>`,
      to: adminEmail,
      subject: `Nová žádost o rezervaci - ${name}`,
      text: `Nová rezervace od ${name} (${email}) na datum ${date} v ${timeSlot}. Prosím, schvalte ji v administraci.`,
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

    // Update DB
    await db.update(reservations).set({ status: 'confirmed' }).where(eq(reservations.id, id));

    // Create Event in Google Calendar
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    if (calendar && calendarId) {
      const eventStart = new Date(`${reservation.date}T${reservation.timeSlot}:00+02:00`);
      const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1 hour duration

      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `Rezervace: ${reservation.name}`,
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
    const adminEmail = process.env.SMTP_USER || 'admin@zelenyzvon.cz';
    await transporter.sendMail({
      from: `"Zelený Zvon" <${adminEmail}>`,
      to: reservation.email,
      subject: `Potvrzení rezervace - Zelený Zvon`,
      text: `Dobrý den ${reservation.name},\n\nVaše rezervace na datum ${reservation.date} v ${reservation.timeSlot} byla úspěšně potvrzena.\n\nTěšíme se na Vás!`,
    }).catch(console.error);

    return { success: true };
  } catch (error) {
    console.error('Error approving booking:', error);
    return { success: false, error: 'Nepodařilo se schválit rezervaci.' };
  }
}
