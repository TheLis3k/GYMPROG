const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'gymprogress.db');

// Pobierz statystyki treningowe
router.get('/', (req, res) => {
  const db = new sqlite3.Database(dbPath);

  // Pobierz wszystkie dane potrzebne do statystyk
  const stats = {};

  // Liczba treningów (planów)
  db.get('SELECT COUNT(*) as count FROM workout_plans', (err, result) => {
    if (err) {
      db.close();
      console.error('Error fetching workout count:', err);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    stats.totalWorkouts = result.count;

    // Liczba ćwiczeń
    db.get('SELECT COUNT(*) as count FROM exercises', (err, result) => {
      if (err) {
        db.close();
        console.error('Error fetching exercise count:', err);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }

      stats.totalExercises = result.count;

      // Całkowity podniesiony ciężar
      db.get(`
        SELECT SUM(el.reps * el.weight) as total 
        FROM exercise_logs el 
        WHERE el.weight IS NOT NULL AND el.reps IS NOT NULL
      `, (err, result) => {
        if (err) {
          db.close();
          console.error('Error fetching total weight:', err);
          return res.status(500).json({ error: 'Failed to fetch statistics' });
        }

        stats.totalWeightLifted = result.total || 0;

        // Średnia liczba treningów tygodniowo
        db.get(`
          SELECT COUNT(*) / (MAX(JULIANDAY('now')) - MIN(JULIANDAY(created_at)) + 1) * 7 as avg 
          FROM workout_plans
        `, (err, result) => {
          if (err) {
            db.close();
            console.error('Error fetching weekly average:', err);
            return res.status(500).json({ error: 'Failed to fetch statistics' });
          }

          stats.avgWorkoutsPerWeek = result.avg ? result.avg.toFixed(1) : 0;

          // Najbardziej poprawione ćwiczenia
          db.all(`
            SELECT e.name, 
                   (MAX(el.weight) - MIN(el.weight)) / MIN(el.weight) * 100 as improvement
            FROM exercise_logs el
            JOIN exercises e ON el.exercise_id = e.id
            WHERE el.weight IS NOT NULL AND el.weight > 0
            GROUP BY el.exercise_id
            HAVING COUNT(*) > 1
            ORDER BY improvement DESC
            LIMIT 5
          `, (err, results) => {
            db.close();

            if (err) {
              console.error('Error fetching improved exercises:', err);
              return res.status(500).json({ error: 'Failed to fetch statistics' });
            }

            stats.mostImprovedExercises = results.map(item => ({
              name: item.name,
              improvement: item.improvement ? Math.round(item.improvement) : 0
            }));

            res.json(stats);
          });
        });
      });
    });
  });
});

module.exports = router;