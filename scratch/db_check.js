import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('database.sqlite');

const tables = ['products', 'reservations', 'orders', 'coupons', 'order_items'];

console.log('--- Database Stats ---');
for (const table of tables) {
    db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
        if (err) {
            if (err.message.includes('no such table')) {
                console.log(`${table}: Table does not exist`);
            } else {
                console.error(`${table}: Error - ${err.message}`);
            }
        } else {
            console.log(`${table}: ${row.count} records`);
        }
    });
}
