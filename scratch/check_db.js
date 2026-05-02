import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database.sqlite');
db.all('SELECT * FROM products', [], (err, rows) => {
  if (err) {
    console.error('ERROR:', err);
  } else {
    console.log('COUNT:', rows.length);
    console.log('FIRST PRODUCT:', rows[0]);
  }
  db.close();
});
