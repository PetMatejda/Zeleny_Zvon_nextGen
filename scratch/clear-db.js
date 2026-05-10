import { db } from '../lib/db-drizzle.js';
import { order_items, orders, reservations, reservation_slots } from '../lib/schema.js';

async function clearDb() {
  console.log('Starting to clear database tables...');

  try {
    // order_items references orders and products
    // orders references coupons
    // reservations references reservation_slots

    console.log('Clearing order_items...');
    await db.delete(order_items);
    
    console.log('Clearing orders...');
    await db.delete(orders);
    
    console.log('Clearing reservations...');
    await db.delete(reservations);
    
    console.log('Clearing reservation_slots...');
    await db.delete(reservation_slots);

    console.log('✅ Database clearing completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearDb();
