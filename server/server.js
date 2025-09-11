const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const workoutPlansRoutes = require('./routes/workoutPlans');
const workoutDaysRoutes = require('./routes/workoutDays');
const exercisesRoutes = require('./routes/exercises');
const exerciseLogsRoutes = require('./routes/exerciseLogs');
const exportImportRoutes = require('./routes/exportImport'); // Dodaj tę linię

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Zwiększ limit dla dużych importów

// Routes
app.use('/api/workout-plans', workoutPlansRoutes);
app.use('/api/workout-days', workoutDaysRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/exercise-logs', exerciseLogsRoutes);
app.use('/api/export-import', exportImportRoutes); // Dodaj tę linię

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to GYMPROGress API!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});