const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');
const db = require('./database');

/*
CSV format:
name,email,class,assignment,earned_points,total_points,due_date,type
*/

function importStudentsGrades(filePath, teacherId, callback) {
  const rows = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', row => rows.push(row))
    .on('end', async () => {
      try {
        for (const row of rows) {
          await processRow(row, teacherId);
        }
        callback(null, "CSV import completed successfully");
      } catch (err) {
        console.error(err);
        callback(err.message || err);
      }
    });
}

/* ================================
   PROCESS SINGLE ROW (SEQUENTIAL)
================================ */
async function processRow(row, teacherId) {
  const studentId = await getOrCreateStudent(row);
  const classId = await getOrCreateClass(row, studentId, teacherId);
  const assignmentId = await getOrCreateAssignment(row, classId);
  await upsertGrade(row, studentId, assignmentId);
}

/* ================================
   STUDENT
================================ */
function getOrCreateStudent(row) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM users WHERE email = ?`,
      [row.email],
      async (err, user) => {
        if (err) return reject(err);
        if (user) return resolve(user.id);

        try {
          const hash = await bcrypt.hash('password123', 10);

          db.run(
            `
            INSERT INTO users
            (name, email, password, role, must_change_password)
            VALUES (?, ?, ?, 'student', 1)
            `,
            [row.name, row.email, hash],
            function (err) {
              if (err) return reject(err);
              resolve(this.lastID);
            }
          );
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

/* ================================
   CLASS + ENROLLMENT
================================ */
function getOrCreateClass(row, studentId, teacherId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM classes WHERE name = ? AND teacher_id = ?`,
      [row.class, teacherId],
      (err, cls) => {
        if (err) return reject(err);

        const enroll = classId => {
          db.run(
            `
            INSERT OR IGNORE INTO student_classes
            (student_id, class_id)
            VALUES (?, ?)
            `,
            [studentId, classId],
            err => {
              if (err) return reject(err);
              resolve(classId);
            }
          );
        };

        if (cls) return enroll(cls.id);

        db.run(
          `
          INSERT INTO classes (name, teacher_id)
          VALUES (?, ?)
          `,
          [row.class, teacherId],
          function (err) {
            if (err) return reject(err);
            enroll(this.lastID);
          }
        );
      }
    );
  });
}

/* ================================
   ASSIGNMENT
================================ */
function getOrCreateAssignment(row, classId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT id FROM assignments
      WHERE class_id = ? AND name = ?
      `,
      [classId, row.assignment],
      (err, assn) => {
        if (err) return reject(err);
        if (assn) return resolve(assn.id);

        const total = Number(row.total_points) || 100;

        db.run(
          `
          INSERT INTO assignments
          (class_id, name, due_date, total_points, type)
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            classId,
            row.assignment,
            row.due_date || null,
            total,
            row.type || 'Homework'
          ],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      }
    );
  });
}

/* ================================
   GRADE (UPSERT — NO DUPLICATES)
================================ */
function upsertGrade(row, studentId, assignmentId) {
  return new Promise((resolve, reject) => {
    const earned = Number(row.earned_points) || 0;
    const total = Number(row.total_points) || 100;
    const percentage = Number(((earned / total) * 100).toFixed(2));

    db.run(
      `
      INSERT OR REPLACE INTO grades
      (student_id, assignment_id, earned_points, percentage)
      VALUES (?, ?, ?, ?)
      `,
      [studentId, assignmentId, earned, percentage],
      err => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

module.exports = { importStudentsGrades };
