import { useState, useEffect } from 'react'
import RestTimer from './RestTimer'
import { compareValues, getProgressColor, compareDifficulty, getProgressEmoji } from '../utils/progressColors'
import './ExerciseManager.css'
import ProgressCharts from './ProgressCharts'


const ExerciseManager = ({ day, onExerciseChange }) => {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    sets: 1
  })
  const [showLogForm, setShowLogForm] = useState(null)
  const [exerciseLogs, setExerciseLogs] = useState({})
  const [exerciseHistory, setExerciseHistory] = useState({})
  const [showCharts, setShowCharts] = useState(null)
  const [editingExercise, setEditingExercise] = useState(null)
  const [editExerciseData, setEditExerciseData] = useState({
    name: '',
    description: '',
    sets: 1
  })

    const fetchExerciseHistory = async (exerciseId) => {
    try {
      const response = await fetch(`/api/exercise-logs/exercise/${exerciseId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const history = await response.json()
      setExerciseHistory(prev => ({ ...prev, [exerciseId]: history }))
    } catch (error) {
      console.error('Error fetching exercise history:', error)
    }
  }

  useEffect(() => {
    if (showLogForm) {
      fetchExerciseHistory(showLogForm)
    }
  }, [showLogForm])

  useEffect(() => {
    if (day && day.id) {
      fetchExercises(day.id)
    }
  }, [day])

  const fetchExercises = async (dayId) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/exercises/day/${dayId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setExercises(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching exercises:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExercise = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day_id: day.id,
          ...newExercise
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const addedExercise = await response.json()
      setExercises([...exercises, addedExercise])
      setNewExercise({ name: '', description: '', sets: 1 })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding exercise:', error)
      setError(error.message)
    }
  }

   const handleDeleteExercise = async (exerciseId, exerciseName) => {
    if (!window.confirm(`Are you sure you want to delete "${exerciseName}"? This will delete all associated logs.`)) {
      return
    }

    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Odśwież listę ćwiczeń
      setExercises(exercises.filter(exercise => exercise.id !== exerciseId))
      
      // Powiadom komponent nadrzędny o zmianie
      if (onExerciseChange) {
        onExerciseChange()
      }
    } catch (error) {
      console.error('Error deleting exercise:', error)
      setError(error.message)
    }
  }

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise.id)
    setEditExerciseData({
      name: exercise.name,
      description: exercise.description || '',
      sets: exercise.sets
    })
  }

  const handleUpdateExercise = async (exerciseId) => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editExerciseData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedExercise = await response.json()
      setExercises(exercises.map(exercise => 
        exercise.id === exerciseId ? { ...exercise, ...updatedExercise } : exercise
      ))
      setEditingExercise(null)
      
      // Powiadom komponent nadrzędny o zmianie
      if (onExerciseChange) {
        onExerciseChange()
      }
    } catch (error) {
      console.error('Error updating exercise:', error)
      setError(error.message)
    }
  }

  const handleCancelEditExercise = () => {
    setEditingExercise(null)
  }


  const ProgressComparison = ({ exerciseId, field, value }) => {
    const history = exerciseHistory[exerciseId] || []
    const previousLog = history[0]
    
    if (!previousLog || !value) return null
    
    const comparison = compareValues(value, previousLog[field], field)
    const color = getProgressColor(comparison)
    const emoji = getProgressEmoji(comparison)
    
    return (
      <span className="progress-comparison" style={{ color }}>
        {emoji} {comparison === 'positive' ? '+' : comparison === 'negative' ? '-' : '='}
      </span>
    )
  }

  const ExerciseHistory = ({ exerciseId }) => {
    const history = exerciseHistory[exerciseId] || []
    
    if (history.length === 0) return null
    
    return (
      <div className="exercise-history">
        <h5>Recent History:</h5>
        {history.slice(0, 3).map((log, index) => (
          <div key={index} className="history-item">
            <span>{new Date(log.created_at).toLocaleDateString()}</span>
            <span>Reps: {log.reps}</span>
            <span>Weight: {log.weight}kg</span>
            {log.duration && <span>Time: {log.duration}s</span>}
            {log.difficulty_emoji && <span>Difficulty: {log.difficulty_emoji}</span>}
          </div>
        ))}
      </div>
    )
  }

  const handleLogExercise = async (exerciseId, logData) => {
    try {
      const response = await fetch('/api/exercise-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercise_id: exerciseId,
          ...logData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Exercise logged successfully:', result)
      setShowLogForm(null)
      // Możesz dodać tutaj odświeżenie danych lub powiadomienie o sukcesie
    } catch (error) {
      console.error('Error logging exercise:', error)
      setError(error.message)
    }
  }

  const getProgressColor = (current, previous) => {
    if (!previous) return 'neutral'
    if (current > previous) return 'positive'
    if (current < previous) return 'negative'
    return 'neutral'
  }

  if (!day) return <div>Select a day to manage exercises</div>

  return (
    <div className="exercise-manager">
      <h3>Exercises for {day.name || `Day ${day.day_number}`}</h3>

      <RestTimer />
      
      {loading && <div>Loading exercises...</div>}
      {error && <div className="error">Error: {error}</div>}

      <button 
        onClick={() => setShowAddForm(!showAddForm)}
        className="toggle-form-btn"
      >
        {showAddForm ? 'Cancel' : 'Add Exercise'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddExercise} className="add-exercise-form">
          <input
            type="text"
            placeholder="Exercise name"
            value={newExercise.name}
            onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={newExercise.description}
            onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
          />
          <input
            type="number"
            placeholder="Sets"
            value={newExercise.sets}
            onChange={(e) => setNewExercise({...newExercise, sets: parseInt(e.target.value) || 1})}
            min="1"
          />
          <button type="submit">Add Exercise</button>
        </form>
      )}

      <div className="exercises-list">
        {exercises.map(exercise => (
          <div key={exercise.id} className="exercise-card">
            {editingExercise === exercise.id ? (
              <div className="edit-exercise-form">
                <input
                  type="text"
                  value={editExerciseData.name}
                  onChange={(e) => setEditExerciseData({...editExerciseData, name: e.target.value})}
                  placeholder="Exercise name"
                />
                <textarea
                  value={editExerciseData.description}
                  onChange={(e) => setEditExerciseData({...editExerciseData, description: e.target.value})}
                  placeholder="Description"
                />
                <input
                  type="number"
                  value={editExerciseData.sets}
                  onChange={(e) => setEditExerciseData({...editExerciseData, sets: parseInt(e.target.value) || 1})}
                  min="1"
                  placeholder="Sets"
                />
                <div className="edit-actions">
                  <button onClick={() => handleUpdateExercise(exercise.id)}>Save</button>
                  <button onClick={handleCancelEditExercise}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="exercise-header">
                  <h4>{exercise.name}</h4>
                  <div className="exercise-actions">
                    <button 
                      onClick={() => setShowLogForm(showLogForm === exercise.id ? null : exercise.id)}
                      className="log-button"
                    >
                      {showLogForm === exercise.id ? 'Cancel' : 'Log'}
                    </button>
                    <button 
                      onClick={() => setShowCharts(showCharts === exercise.id ? null : exercise.id)}
                      className="charts-button"
                    >
                      {showCharts === exercise.id ? 'Hide Charts' : 'Show Charts'}
                    </button>
                    <button 
                      onClick={() => handleEditExercise(exercise)}
                      className="action-btn edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteExercise(exercise.id, exercise.name)}
                      className="action-btn delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {exercise.description && <p>{exercise.description}</p>}
                <p>Sets: {exercise.sets}</p>


            <ExerciseHistory exerciseId={exercise.id} />

            {showLogForm === exercise.id && (
              <ExerciseLogForm 
                exercise={exercise}
                onSubmit={(logData) => handleLogExercise(exercise.id, logData)}
                history={exerciseHistory[exercise.id] || []}
              />
            )}

            {showCharts === exercise.id && (
              <ProgressCharts exerciseId={exercise.id} />
            )}
              </>
            )}
            
          </div>
        ))}
      </div>
    </div>
  )
}

const ExerciseLogForm = ({ exercise, onSubmit, history }) => {
  const [logData, setLogData] = useState({
    reps: '',
    weight: '',
    duration: '',
    difficulty_emoji: ''
  })

  const lastLog = history && history.length > 0 ? history[0] : null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(logData)
  }

  const renderComparison = (field, value) => {
    if (!lastLog || !value) return null
    
    const comparison = compareValues(value, lastLog[field], field)
    const color = getProgressColor(comparison)
    const emoji = getProgressEmoji(comparison)
    
    return (
      <span className="comparison-badge" style={{ backgroundColor: color }}>
        {emoji} {comparison === 'positive' ? 'Better' : comparison === 'negative' ? 'Worse' : 'Same'}
      </span>
    )
  }

  const renderDifficultyComparison = (value) => {
    if (!lastLog || !value) return null
    
    const comparison = compareDifficulty(value, lastLog.difficulty_emoji)
    const color = getProgressColor(comparison)
    
    let message = ''
    if (comparison === 'positive') message = 'Easier'
    else if (comparison === 'negative') message = 'Harder'
    else message = 'Same difficulty'
    
    return (
      <span className="comparison-badge" style={{ backgroundColor: color }}>
        {message}
      </span>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="log-form">
      <div className="form-row">
        <div className="form-group">
          <label>Reps: {renderComparison('reps', logData.reps)}</label>
          <input
            type="number"
            value={logData.reps}
            onChange={(e) => setLogData({...logData, reps: e.target.value})}
            placeholder="Number of reps"
          />
        </div>
        
        <div className="form-group">
          <label>Weight (kg): {renderComparison('weight', logData.weight)}</label>
          <input
            type="number"
            step="0.1"
            value={logData.weight}
            onChange={(e) => setLogData({...logData, weight: e.target.value})}
            placeholder="Weight used"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Duration (seconds): {renderComparison('duration', logData.duration)}</label>
          <input
            type="number"
            value={logData.duration}
            onChange={(e) => setLogData({...logData, duration: e.target.value})}
            placeholder="Time taken"
          />
        </div>
        
        <div className="form-group">
          <label>Difficulty: {renderDifficultyComparison(logData.difficulty_emoji)}</label>
          <select
            value={logData.difficulty_emoji}
            onChange={(e) => setLogData({...logData, difficulty_emoji: e.target.value})}
          >
            <option value="">Select difficulty</option>
            <option value="😩">😩 Hard</option>
            <option value="😐">😐 Medium</option>
            <option value="😊">😊 Easy</option>
          </select>
        </div>
      </div>
      
      <button type="submit" className="submit-log-btn">Save Log</button>
    </form>
  )
}

export default ExerciseManager