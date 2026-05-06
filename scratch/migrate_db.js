import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Create reservation_slots table
  db.run(`
    CREATE TABLE IF NOT EXISTS reservation_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      timeSlot TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error("Error creating reservation_slots:", err);
    else console.log("reservation_slots table ready.");
  });

  // Add slotId to reservations
  db.run(`
    ALTER TABLE reservations ADD COLUMN slotId INTEGER REFERENCES reservation_slots(id)
  `, (err) => {
    if (err && err.message.includes('duplicate column name')) {
      console.log("slotId already exists in reservations.");
    } else if (err) {
      console.error("Error adding slotId to reservations:", err);
    } else {
      console.log("slotId added to reservations.");
    }
  });
});

db.close();
