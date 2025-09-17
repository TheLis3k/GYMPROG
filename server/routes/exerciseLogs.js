const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'gymprogress.db');

// Log exercise performance
router.post('/', (req, res) => {
  const { exercise_id, reps, weight, duration, difficulty_emoji } = req.body;
  const db = new sqlite3.Database(dbPath);

  const sql = `INSERT INTO exercise_logs 
               (exercise_id, reps, weight, duration, difficulty_emoji) 
               VALUES (?, ?, ?, ?, ?)`;
  
  db.run(sql, [exercise_id, reps, weight, duration, difficulty_emoji], function(err) {
    db.close();

    if (err) {
      console.error('Error logging exercise:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      id: this.lastID, 
      exercise_id, 
      reps, 
      weight, 
      duration, 
      difficulty_emoji,
      created_at: new Date().toISOString()
    });
  });
});

// Get exercise history
router.get('/exercise/:exerciseId', (req, res) => {
  const exerciseId = req.params.exerciseId;
  const db = new sqlite3.Database(dbPath);

  db.all('SELECT * FROM exercise_logs WHERE exercise_id = ? ORDER BY created_at DESC', [exerciseId], (err, rows) => {
    db.close();

    if (err) {
      console.error('Error fetching exercise history:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// Get latest log for each exercise in a day
router.get('/day/:dayId/latest', (req, res) => {
  const dayId = req.params.dayId;
  const db = new sqlite3.Database(dbPath);

  const sql = `
    SELECT el.*, e.name as exercise_name 
    FROM exercise_logs el
    JOIN exercises e ON el.exercise_id = e.id
    WHERE e.day_id = ?
    AND el.created_at = (
      SELECT MAX(created_at) 
      FROM exercise_logs 
      WHERE exercise_id = e.id
    )
    ORDER BY e.name
  `;

  db.all(sql, [dayId], (err, rows) => {
    db.close();

    if (err) {
      console.error('Error fetching latest logs:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// Delete an exercise log
router.delete('/:id', (req, res) => {
  const logId = req.params.id;
  const db = new sqlite3.Database(dbPath);

  db.run('DELETE FROM exercise_logs WHERE id = ?', [logId], function(err) {
    db.close();

    if (err) {
      console.error('Error deleting exercise log:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Exercise log deleted successfully' });
  });
});

// Update an exercise log
router.put('/:id', (req, res) => {
  const logId = req.params.id;
  const { reps, weight, duration, difficulty_emoji } = req.body;
  const db = new sqlite3.Database(dbPath);

  const sql = `UPDATE exercise_logs 
               SET reps = ?, weight = ?, duration = ?, difficulty_emoji = ?
               WHERE id = ?`;
  
  db.run(sql, [reps, weight, duration, difficulty_emoji, logId], function(err) {
    db.close();

    if (err) {
      console.error('Error updating exercise log:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      id: logId, 
      reps, 
      weight, 
      duration, 
      difficulty_emoji 
    });
  });
});

module.exports = router;

