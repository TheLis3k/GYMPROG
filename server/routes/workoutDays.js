const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'gymprogress.db');

// Add a day to a workout plan
router.post('/', (req, res) => {
  const { plan_id, day_number, name } = req.body;
  const db = new sqlite3.Database(dbPath);
  
  const sql = 'INSERT INTO workout_days (plan_id, day_number, name) VALUES (?, ?, ?)';
  db.run(sql, [plan_id, day_number, name], function(err) {
    db.close();
    
    if (err) {
      console.error('Error adding workout day:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      id: this.lastID, 
      plan_id, 
      day_number, 
      name 
    });
  });
});

// Get days for a specific workout plan
router.get('/plan/:planId', (req, res) => {
  const planId = req.params.planId;
  const db = new sqlite3.Database(dbPath);
  
  db.all('SELECT * FROM workout_days WHERE plan_id = ? ORDER BY day_number', [planId], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Error fetching workout days:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// Delete a workout day
router.delete('/:id', (req, res) => {
  const dayId = req.params.id;
  const db = new sqlite3.Database(dbPath);
  
  db.run('DELETE FROM workout_days WHERE id = ?', [dayId], function(err) {
    db.close();
    
    if (err) {
      console.error('Error deleting workout day:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Workout day deleted successfully' });
  });
});

// Update a workout day
router.put('/:id', (req, res) => {
  const dayId = req.params.id;
  const { day_number, name } = req.body;
  const db = new sqlite3.Database(dbPath);

  const sql = 'UPDATE workout_days SET day_number = ?, name = ? WHERE id = ?';
  db.run(sql, [day_number, name, dayId], function(err) {
    db.close();

    if (err) {
      console.error('Error updating workout day:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: dayId, day_number, name });
  });
});

module.exports = router;