const db = require('./database');

db.serialize(() => {
  // 1️⃣ Create the table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      must_change_password INTEGER NOT NULL DEFAULT 1
    )
  `);

  // 2️⃣ Check if must_change_password column exists
  db.all(`PRAGMA table_info(users)`, (err, rows) => {
    if (err) {
      console.error(err);
      db.close();
      return;
    }

    const hasColumn = rows.some(r => r.name === 'must_change_password');
    if (!hasColumn) {
      db.run(
        `ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 1`,
        (err) => {
          if (err) console.error(err);
          else console.log("Added must_change_password column");

          db.close(); // ✅ Close only after ALTER TABLE finishes
        }
      );
    } else {
      console.log("must_change_password column already exists");
      db.close(); // ✅ Close here if no ALTER TABLE needed
    }
  });
});
