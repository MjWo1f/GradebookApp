const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('gradebook.db');
const bcrypt = require('bcrypt');

db.serialize(() => {

  // USERS
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  // CLASSES
  db.run(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      teacher_id INTEGER,
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    )
  `);

  // STUDENT ↔ CLASS (NO DUPLICATES)
  db.run(`
    CREATE TABLE IF NOT EXISTS student_classes (
      student_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      UNIQUE(student_id, class_id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (class_id) REFERENCES classes(id)
    )
  `);

  // ASSIGNMENTS
  db.run(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      due_date TEXT,
      total_points INTEGER DEFAULT 100,
      type TEXT,
      FOREIGN KEY (class_id) REFERENCES classes(id)
    )
  `);

  // GRADES (NO DUPLICATES PER STUDENT + ASSIGNMENT)
  db.run(`
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      assignment_id INTEGER NOT NULL,
      earned_points INTEGER,
      percentage REAL,
      UNIQUE(student_id, assignment_id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (assignment_id) REFERENCES assignments(id)
    )
  `);

});

module.exports = db;
