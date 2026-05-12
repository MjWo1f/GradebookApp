// login.js
const db = require('./database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

/**
 * Login function
 * @param {string} email
 * @param {string} password
 * @param {function} callback
 */
function login(email, password, callback) {

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (err) return callback(err);
      if (!user) return callback(null, false);

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) return callback(err);

        if (!result) return callback(null, false);

        // ✅ SAVE SESSION WITH PASSWORD FLAG
        const sessionUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          must_change_password: user.must_change_password // 🔧 ADDED
        };

        fs.writeFileSync(
          path.join(__dirname, 'currentUser.json'),
          JSON.stringify(sessionUser, null, 2)
        );

        callback(null, sessionUser);
      });
    }
  );
}

module.exports = { login };
