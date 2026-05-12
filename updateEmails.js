const db = require('./database');

// Update admin email
db.run(
  "UPDATE users SET email = ? WHERE role = 'admin'",
  ["admin@admin.com"],
  function(err) {
    if (err) return console.error("Error updating admin:", err.message);
    console.log(`Admin email updated (${this.changes} row(s) affected)`);
  }
);

// Update Mrs. Carter email
db.run(
  "UPDATE users SET email = ? WHERE role = 'teacher' AND name = 'Mrs. Carter'",
  ["mrs.carter@teacher.com"],
  function(err) {
    if (err) return console.error("Error updating teacher:", err.message);
    console.log(`Mrs. Carter email updated (${this.changes} row(s) affected)`);
  }
);

// Close database after a short delay to ensure queries finish
setTimeout(() => db.close(), 500);
