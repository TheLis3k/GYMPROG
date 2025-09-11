const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'gymprogress.db');

// Eksport wszystkich danych jako JSON
router.get('/export', (req, res) => {
  const db = new sqlite3.Database(dbPath);

  // Pobierz wszystkie dane
  const exportData = {};

  // Pobierz plany treningowe
  db.all('SELECT * FROM workout_plans', (err, plans) => {
    if (err) {
      db.close();
      console.error('Error exporting plans:', err);
      return res.status(500).json({ error: 'Failed to export workout plans' });
    }

    exportData.plans = plans;

    // Pobierz dni treningowe
    db.all('SELECT * FROM workout_days', (err, days) => {
      if (err) {
        db.close();
        console.error('Error exporting days:', err);
        return res.status(500).json({ error: 'Failed to export workout days' });
      }

      exportData.days = days;

      // Pobierz ćwiczenia
      db.all('SELECT * FROM exercises', (err, exercises) => {
        if (err) {
          db.close();
          console.error('Error exporting exercises:', err);
          return res.status(500).json({ error: 'Failed to export exercises' });
        }

        exportData.exercises = exercises;

        // Pobierz logi ćwiczeń
        db.all('SELECT * FROM exercise_logs', (err, logs) => {
          db.close();

          if (err) {
            console.error('Error exporting logs:', err);
            return res.status(500).json({ error: 'Failed to export exercise logs' });
          }

          exportData.logs = logs;
          
          // Ustaw nagłówki dla pobierania pliku
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', 'attachment; filename=gymprogress-backup.json');
          
          // Wyślij dane jako plik JSON
          res.send(JSON.stringify(exportData, null, 2));
        });
      });
    });
  });
});

// Import danych z pliku JSON
router.post('/import', (req, res) => {
  const importData = req.body;

  if (!importData) {
    return res.status(400).json({ error: 'No data provided' });
  }

  const db = new sqlite3.Database(dbPath);

  // Rozpocznij transakcję
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Importuj plany treningowe
    if (importData.plans && Array.isArray(importData.plans)) {
      const stmt = db.prepare('INSERT OR REPLACE INTO workout_plans (id, name, days_count, created_at) VALUES (?, ?, ?, ?)');
      importData.plans.forEach(plan => {
        stmt.run([plan.id, plan.name, plan.days_count, plan.created_at]);
      });
      stmt.finalize();
    }

    // Importuj dni treningowe
    if (importData.days && Array.isArray(importData.days)) {
      const stmt = db.prepare('INSERT OR REPLACE INTO workout_days (id, plan_id, day_number, name) VALUES (?, ?, ?, ?)');
      importData.days.forEach(day => {
        stmt.run([day.id, day.plan_id, day.day_number, day.name]);
      });
      stmt.finalize();
    }

    // Importuj ćwiczenia
    if (importData.exercises && Array.isArray(importData.exercises)) {
      const stmt = db.prepare('INSERT OR REPLACE INTO exercises (id, day_id, name, description, sets) VALUES (?, ?, ?, ?, ?)');
      importData.exercises.forEach(exercise => {
        stmt.run([exercise.id, exercise.day_id, exercise.name, exercise.description, exercise.sets]);
      });
      stmt.finalize();
    }

    // Importuj logi ćwiczeń
    if (importData.logs && Array.isArray(importData.logs)) {
      const stmt = db.prepare('INSERT OR REPLACE INTO exercise_logs (id, exercise_id, reps, weight, duration, difficulty_emoji, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
      importData.logs.forEach(log => {
        stmt.run([log.id, log.exercise_id, log.reps, log.weight, log.duration, log.difficulty_emoji, log.created_at]);
      });
      stmt.finalize();
    }

    db.run('COMMIT', (err) => {
      db.close();
      if (err) {
        console.error('Error committing transaction:', err);
        return res.status(500).json({ error: 'Failed to import data' });
      }
      res.json({ message: 'Data imported successfully' });
    });
  });
});

module.exports = router;