const db = require('./database');
const bcrypt = require('bcrypt');

const name = "Mrs. Carter";
const email = "mrs.carter@example.com";
const password = "password123"; // default password

// Hash the password
bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) throw err;

  db.run(
    "INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, "teacher"],
    function(err) {
      if (err) {
        console.error(err);
      } else {
        console.log("Mrs. Carter has been added as the first teacher.");
      }
      process.exit();
    }
  );
});
