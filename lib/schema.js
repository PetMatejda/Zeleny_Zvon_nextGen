import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const reservations = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  timeSlot: text('timeSlot').notNull(), // HH:MM
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] }).default('pending'),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`),
});
