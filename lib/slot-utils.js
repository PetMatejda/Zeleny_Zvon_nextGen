/**
 * Shared slot capacity utilities.
 * Replaces 4 duplicated N+1 query implementations with a single
 * optimized aggregation query.
 */

import { db } from './db-drizzle.js';
import { reservations, reservation_slots } from './schema.js';
import { eq, sql } from 'drizzle-orm';

/**
 * Returns a Map of slotId → taken count for all slots with active reservations.
 * Uses a single aggregation query instead of N individual queries.
 */
async function getSlotTakenCounts(slotIds = null) {
  let query = db
    .select({
      slotId: reservations.slotId,
      taken: sql`COUNT(*)`.as('taken'),
    })
    .from(reservations)
    .where(sql`${reservations.status} IN ('pending', 'confirmed')`)
    .groupBy(reservations.slotId);

  const rows = await query;
  const map = new Map();
  for (const row of rows) {
    if (row.slotId != null) {
      map.set(row.slotId, Number(row.taken));
    }
  }
  return map;
}

/**
 * Attaches `taken` count to each slot object using a single aggregation query.
 * @param {Array} slots - Array of slot objects from reservation_slots table
 * @returns {Array} slots with `.taken` property added
 */
export async function attachTakenCounts(slots) {
  if (slots.length === 0) return [];
  const takenMap = await getSlotTakenCounts();
  return slots.map(slot => ({
    ...slot,
    taken: takenMap.get(slot.id) || 0,
  }));
}

/**
 * Returns available slots (with remaining capacity) for a given date string.
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {Array} Available slots with `.availableSpots` property
 */
export async function getAvailableSlotsForDate(dateStr) {
  const slots = await db
    .select()
    .from(reservation_slots)
    .where(eq(reservation_slots.date, dateStr));

  const takenMap = await getSlotTakenCounts();

  return slots
    .map(slot => {
      const taken = takenMap.get(slot.id) || 0;
      return { ...slot, availableSpots: slot.capacity - taken };
    })
    .filter(slot => slot.availableSpots > 0);
}

/**
 * Returns future available slots (from today onwards) sorted by date/time.
 * @returns {Array} Available future slots with `.availableSpots` property
 */
export async function getFutureAvailableSlotsList() {
  const nowStr = new Date().toISOString().split('T')[0];

  const slots = await db
    .select()
    .from(reservation_slots)
    .where(sql`${reservation_slots.date} >= ${nowStr}`);

  const takenMap = await getSlotTakenCounts();

  return slots
    .map(slot => {
      const taken = takenMap.get(slot.id) || 0;
      return { ...slot, availableSpots: slot.capacity - taken };
    })
    .filter(slot => slot.availableSpots > 0)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.timeSlot}`);
      const dateB = new Date(`${b.date}T${b.timeSlot}`);
      return dateA - dateB;
    });
}

/**
 * Returns the count of active reservations for a single slot.
 * Used for capacity validation before booking.
 */
export async function getActiveReservationCount(slotId) {
  const takenMap = await getSlotTakenCounts();
  return takenMap.get(slotId) || 0;
}
