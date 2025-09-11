const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'gymprogress.db');

// GET all workout plans
router.get('/', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  db.all('SELECT * FROM workout_plans', (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json(rows || []);
  });
});

// POST create new workout plan
router.post('/', (req, res) => {
  const { name, days_count } = req.body;
  const db = new sqlite3.Database(dbPath);
  
  const sql = 'INSERT INTO workout_plans (name, days_count) VALUES (?, ?)';
  db.run(sql, [name, days_count], function(err) {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, days_count });
  });
});

// GET specific workout plan
router.get('/:id', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const planId = req.params.id;
  
  db.get('SELECT * FROM workout_plans WHERE id = ?', [planId], (err, plan) => {
    if (err) {
      db.close();
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!plan) {
      db.close();
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    
    db.all('SELECT * FROM workout_days WHERE plan_id = ?', [planId], (err, days) => {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({ ...plan, days: days || [] });
    });
  });
});

// PUT update workout plan
router.put('/:id', (req, res) => {
  const planId = req.params.id;
  const { name, days_count } = req.body;
  const db = new sqlite3.Database(dbPath);

  const sql = 'UPDATE workout_plans SET name = ?, days_count = ? WHERE id = ?';
  db.run(sql, [name, days_count, planId], function(err) {
    db.close();

    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    
    res.json({ id: planId, name, days_count });
  });
});

// DELETE workout plan
router.delete('/:id', (req, res) => {
  const planId = req.params.id;
  const db = new sqlite3.Database(dbPath);

  // First delete related workout days
  const deleteDaysSql = 'DELETE FROM workout_days WHERE plan_id = ?';
  db.run(deleteDaysSql, [planId], function(err) {
    if (err) {
      db.close();
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    // Then delete the plan
    const deletePlanSql = 'DELETE FROM workout_plans WHERE id = ?';
    db.run(deletePlanSql, [planId], function(err) {
      db.close();

      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Plan not found' });
        return;
      }
      
      res.json({ message: 'Workout plan deleted successfully' });
    });
  });
});

module.exports = router;