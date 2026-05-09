import { db } from '../lib/db-drizzle.js';
import { orders } from '../lib/schema.js';

async function seedTestOrders() {
  console.log('Vkládám testovací objednávky pro MOCK test Fio banky...');
  try {
    await db.insert(orders).values([
      {
        id: 999991, // Explicit ID for VS match
        customerName: 'Jan Novák (Test 1)',
        email: 'jan.novak@example.com',
        totalAmount: 15000, // 150 Kč
        status: 'Nová'
      },
      {
        id: 999992, // Explicit ID for VS match
        customerName: 'Karel Zmatený (Test 2)',
        email: 'karel.zmateny@example.com',
        totalAmount: 15000, // 150 Kč (but bank will send 200 Kč)
        status: 'Nová'
      }
    ]);
    console.log('Testovací objednávky s ID 999991 a 999992 byly úspěšně vytvořeny.');
  } catch (err) {
    console.error('Chyba při vkládání:', err.message);
  }
}

seedTestOrders();
