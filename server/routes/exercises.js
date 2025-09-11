const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'gymprogress.db');

// Add exercise to a workout day
router.post('/', (req, res) => {
  const { day_id, name, description, sets } = req.body;
  const db = new sqlite3.Database(dbPath);

  const sql = `INSERT INTO exercises (day_id, name, description, sets) 
               VALUES (?, ?, ?, ?)`;
  db.run(sql, [day_id, name, description, sets || 1], function(err) {
    db.close();

    if (err) {
      console.error('Error adding exercise:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      id: this.lastID, 
      day_id, 
      name, 
      description, 
      sets: sets || 1 
    });
  });
});

// Get exercises for a workout day
router.get('/day/:dayId', (req, res) => {
  const dayId = req.params.dayId;
  const db = new sqlite3.Database(dbPath);

  db.all('SELECT * FROM exercises WHERE day_id = ?', [dayId], (err, rows) => {
    db.close();

    if (err) {
      console.error('Error fetching exercises:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// Update an exercise
router.put('/:id', (req, res) => {
  const exerciseId = req.params.id;
  const { name, description, sets } = req.body;
  const db = new sqlite3.Database(dbPath);

  const sql = 'UPDATE exercises SET name = ?, description = ?, sets = ? WHERE id = ?';
  db.run(sql, [name, description, sets, exerciseId], function(err) {
    db.close();

    if (err) {
      console.error('Error updating exercise:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: exerciseId, name, description, sets });
  });
});

// Delete an exercise
router.delete('/:id', (req, res) => {
  const exerciseId = req.params.id;
  const db = new sqlite3.Database(dbPath);

  // Najpierw usuwamy powiązane logi ćwiczeń
  const deleteLogsSql = 'DELETE FROM exercise_logs WHERE exercise_id = ?';
  db.run(deleteLogsSql, [exerciseId], function(err) {
    if (err) {
      db.close();
      console.error('Error deleting exercise logs:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    // Teraz usuwamy ćwiczenie
    const deleteExerciseSql = 'DELETE FROM exercises WHERE id = ?';
    db.run(deleteExerciseSql, [exerciseId], function(err) {
      db.close();

      if (err) {
        console.error('Error deleting exercise:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Exercise deleted successfully' });
    });
  });
});

module.exports = router;