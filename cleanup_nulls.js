const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to your gradebook.db
const dbPath = path.join(__dirname, 'gradebook.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log("Cleaning up NULL entries...");

  // 1️⃣ Delete students with NULL name or email
  db.run(
    `DELETE FROM users WHERE role='student' AND (name IS NULL OR email IS NULL)`,
    function(err) {
      if (err) console.error("Error deleting NULL students:", err.message);
      else console.log(`Deleted ${this.changes} student(s) with NULL name or email.`);
    }
  );

  // 2️⃣ Delete teachers with NULL name or email (optional, if needed)
  db.run(
    `DELETE FROM users WHERE role='teacher' AND (name IS NULL OR email IS NULL)`,
    function(err) {
      if (err) console.error("Error deleting NULL teachers:", err.message);
      else console.log(`Deleted ${this.changes} teacher(s) with NULL name or email.`);
    }
  );

  // 3️⃣ Delete classes with NULL name or NULL teacher_id
  db.run(
    `DELETE FROM classes WHERE name IS NULL OR teacher_id IS NULL`,
    function(err) {
      if (err) console.error("Error deleting NULL classes:", err.message);
      else console.log(`Deleted ${this.changes} class(es) with NULL name or teacher_id.`);
    }
  );

  // 4️⃣ Optional: reclaim database space
  db.run(`VACUUM`, () => {
    console.log("Database cleanup complete.");
    db.close();
  });
});
