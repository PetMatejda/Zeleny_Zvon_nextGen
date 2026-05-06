import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const reservation_slots = sqliteTable('reservation_slots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  timeSlot: text('timeSlot').notNull(), // HH:MM
  capacity: integer('capacity').notNull().default(1),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`),
});

export const reservations = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD (legacy, kept for fallback)
  timeSlot: text('timeSlot').notNull(), // HH:MM (legacy, kept for fallback)
  slotId: integer('slotId').references(() => reservation_slots.id),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] }).default('pending'),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`),
});
