import { db } from './lib/db-drizzle.js';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('Spouštím migraci databáze...');
  try {
    // 1. Create reservation_slots table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS reservation_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        timeSlot TEXT NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP)
      )
    `);
    console.log('Tabulka reservation_slots vytvořena nebo již existuje.');

    // 2. Add slotId column to reservations if it doesn't exist
    const tableInfo = await db.run(sql`PRAGMA table_info(reservations)`);
    const hasSlotId = tableInfo.rows.some(col => col.name === 'slotId');
    
    if (!hasSlotId) {
      await db.run(sql`ALTER TABLE reservations ADD COLUMN slotId INTEGER REFERENCES reservation_slots(id)`);
      console.log('Sloupec slotId přidán do tabulky reservations.');
    } else {
      console.log('Sloupec slotId již v tabulce reservations existuje.');
    }

    console.log('Migrace úspěšně dokončena!');
    process.exit(0);
  } catch (err) {
    console.error('Chyba při migraci:', err);
    process.exit(1);
  }
}

run();
