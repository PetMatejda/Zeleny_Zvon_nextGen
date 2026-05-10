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

    // 2. Add slotId column to reservations if it doesn't exist, or create table
    const tableCheck = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='reservations'`);
    if (tableCheck.rows.length === 0) {
      await db.run(sql`
        CREATE TABLE reservations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          date TEXT NOT NULL,
          timeSlot TEXT NOT NULL,
          slotId INTEGER REFERENCES reservation_slots(id),
          status TEXT DEFAULT 'pending',
          createdAt TEXT DEFAULT (CURRENT_TIMESTAMP)
        )
      `);
      console.log('Tabulka reservations vytvořena.');
    } else {
      const tableInfo = await db.run(sql`PRAGMA table_info(reservations)`);
      const hasSlotId = tableInfo.rows.some(col => col.name === 'slotId');
      
      if (!hasSlotId) {
        await db.run(sql`ALTER TABLE reservations ADD COLUMN slotId INTEGER REFERENCES reservation_slots(id)`);
        console.log('Sloupec slotId přidán do tabulky reservations.');
      } else {
        console.log('Sloupec slotId již v tabulce reservations existuje.');
      }
    }

    // 3. Create settings table and seed default email template
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP)
      )
    `);
    console.log('Tabulka settings vytvořena nebo již existuje.');

    // 4. Check if updatedAt column exists in settings
    const settingsTableInfo = await db.run(sql`PRAGMA table_info(settings)`);
    const hasUpdatedAt = settingsTableInfo.rows.some(col => col.name === 'updatedAt');
    
    if (!hasUpdatedAt) {
      await db.run(sql`ALTER TABLE settings ADD COLUMN updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP)`);
      console.log('Sloupec updatedAt přidán do tabulky settings.');
    } else {
      console.log('Sloupec updatedAt již v tabulce settings existuje.');
    }

    const defaultTemplate = `
<div style="font-family: Arial, sans-serif; color: #1b1c19; max-width: 600px; margin: 0 auto; border: 1px solid #765a17; border-radius: 10px; overflow: hidden;">
  <div style="background-color: #765a17; color: #fff; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-style: italic;">Zelený Zvon</h1>
  </div>
  <div style="padding: 30px;">
    {{{CONTENT}}}
  </div>
  <div style="background-color: #f6f5f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
    Zelený Zvon | Zpět k přírodě<br/>Pokud máte jakékoliv dotazy, jednoduše odpovězte na tento e-mail.
  </div>
</div>
    `.trim();

    await db.run(sql`
      INSERT INTO settings (key, value)
      SELECT 'email_base_template', ${defaultTemplate}
      WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'email_base_template')
    `);
    console.log('Výchozí šablona e-mailu zkontrolována/vytvořena.');

    // 4b. Výchozí ceny dopravy
    await db.run(sql`
      INSERT INTO settings (key, value)
      SELECT 'price_packeta_zbox', '95'
      WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'price_packeta_zbox')
    `);

    await db.run(sql`
      INSERT INTO settings (key, value)
      SELECT 'price_packeta_home', '140'
      WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'price_packeta_home')
    `);
    console.log('Výchozí ceny dopravy zkontrolovány/vytvořeny.');

    // 5. Přidání sloupců pro dopravu a Zásilkovnu do tabulky orders
    const ordersTableInfo = await db.run(sql`PRAGMA table_info(orders)`);
    const ordersColumns = ordersTableInfo.rows.map(col => col.name);

    const newOrdersColumns = [
      { name: 'shippingMethod', definition: `TEXT DEFAULT 'pickup'` },
      { name: 'packetaPointId', definition: 'TEXT' },
      { name: 'packetaPointName', definition: 'TEXT' },
      { name: 'deliveryAddress', definition: 'TEXT' },
      { name: 'packetaBarcode', definition: 'TEXT' },
      { name: 'packetaPacketId', definition: 'TEXT' },
    ];

    for (const col of newOrdersColumns) {
      if (!ordersColumns.includes(col.name)) {
        await db.run(sql.raw(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.definition}`));
        console.log(`Sloupec ${col.name} přidán do tabulky orders.`);
      } else {
        console.log(`Sloupec ${col.name} již v tabulce orders existuje.`);
      }
    }

    console.log('Migrace úspěšně dokončena!');
    process.exit(0);
  } catch (err) {
    console.error('Chyba při migraci:', err);
    process.exit(1);
  }
}

run();
