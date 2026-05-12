const db = require('./database');
const bcrypt = require('bcrypt');

const adminName = "Admin";
const adminEmail = "admin@example.com";
const adminPassword = "admin123"; // default password

bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
  if (err) throw err;

  db.run(
    "INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [adminName, adminEmail, hashedPassword, "admin"],
    function(err) {
      if (err) {
        console.error(err);
      } else {
        console.log("Admin account has been added.");
      }
      process.exit();
    }
  );
});
