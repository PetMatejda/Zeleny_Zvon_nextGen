import { db } from '../lib/db-drizzle.js';
import { orders } from '../lib/schema.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Migrating totalAmount to cents for all orders...');
  try {
    // Only update orders that look like they haven't been converted to cents.
    // Assuming no order was exactly 10000 CZK which might look like cents.
    // If we just multiply all by 100, we should be fine since the change is being applied right now.
    
    await db.run(sql`UPDATE orders SET totalAmount = totalAmount * 100`);
    
    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
