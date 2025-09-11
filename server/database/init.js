const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'gymprogress.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `);

    db.run(`
  CREATE TABLE IF NOT EXISTS workout_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    days_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`);

  db.run(`
  CREATE TABLE IF NOT EXISTS workout_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER,
    day_number INTEGER,
    name TEXT,
    FOREIGN KEY (plan_id) REFERENCES workout_plans (id)
  )
`);

  db.run(`
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id INTEGER,
    name TEXT,
    description TEXT,
    sets INTEGER,
    FOREIGN KEY (day_id) REFERENCES workout_days (id)
  )
`);

  db.run(`
  CREATE TABLE IF NOT EXISTS exercise_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER,
    reps INTEGER,
    weight REAL,
    duration INTEGER,
    difficulty_emoji TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises (id)
  )
`);

});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Database initialized successfully!');
});