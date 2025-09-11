import { useState, useEffect } from 'react'
import ExerciseManager from './ExerciseManager'
import './WorkoutPlanDetail.css'

const WorkoutPlanDetail = ({ plan, onPlanDeleted }) => {
  const [planDetails, setPlanDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [showAddDayForm, setShowAddDayForm] = useState(false)
  const [newDay, setNewDay] = useState({
    day_number: 1,
    name: ''
  })
  const [editingDay, setEditingDay] = useState(null)
  const [editDayData, setEditDayData] = useState({
    day_number: 1,
    name: ''
  })

  useEffect(() => {
    if (plan) {
      fetchPlanDetails(plan.id)
    }
  }, [plan])

  const fetchPlanDetails = async (planId) => {
    try {
      const response = await fetch(`/api/workout-plans/${planId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setPlanDetails(data)
    } catch (error) {
      console.error('Error fetching plan details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDay = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/workout-days', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.id,
          ...newDay
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const addedDay = await response.json()
      setPlanDetails({
        ...planDetails,
        days: [...(planDetails.days || []), addedDay]
      })
      setNewDay({ day_number: (planDetails.days?.length || 0) + 1, name: '' })
      setShowAddDayForm(false)
    } catch (error) {
      console.error('Error adding workout day:', error)
    }
  }

  const handleDeleteDay = async (dayId, dayName) => {
    if (!window.confirm(`Are you sure you want to delete "${dayName || 'this day'}"? This will delete all associated exercises.`)) {
      return
    }

    try {
      const response = await fetch(`/api/workout-days/${dayId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Odśwież listę dni
      setPlanDetails({
        ...planDetails,
        days: planDetails.days.filter(day => day.id !== dayId)
      })
      if (selectedDay && selectedDay.id === dayId) {
        setSelectedDay(null)
      }
    } catch (error) {
      console.error('Error deleting workout day:', error)
    }
  }

  const handleEditDay = (day) => {
    setEditingDay(day.id)
    setEditDayData({ day_number: day.day_number, name: day.name })
  }

  const handleUpdateDay = async (dayId) => {
    try {
      const response = await fetch(`/api/workout-days/${dayId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editDayData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedDay = await response.json()
      setPlanDetails({
        ...planDetails,
        days: planDetails.days.map(day => day.id === dayId ? { ...day, ...updatedDay } : day)
      })
      setEditingDay(null)
    } catch (error) {
      console.error('Error updating workout day:', error)
    }
  }

  const handleCancelEditDay = () => {
    setEditingDay(null)
  }

  const handleDeletePlan = async () => {
    if (!window.confirm(`Are you sure you want to delete "${planDetails.name}"? This will delete all associated data.`)) {
      return
    }

    try {
      const response = await fetch(`/api/workout-plans/${plan.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Powiadom komponent nadrzędny o usunięciu planu
      if (onPlanDeleted) {
        onPlanDeleted(plan.id)
      }
    } catch (error) {
      console.error('Error deleting workout plan:', error)
    }
  }

  if (loading) return <div>Loading plan details...</div>
  if (!planDetails) return <div>No plan details found</div>

  return (
    <div className="plan-detail">
      <div className="plan-header">
        <h2>{planDetails.name}</h2>
        <button onClick={handleDeletePlan} className="delete-plan-btn">
          Delete Plan
        </button>
      </div>
      <p>{planDetails.days_count} training days</p>
      
      <div className="days-section">
        <div className="section-header">
          <h3>Training Days</h3>
          <button 
            onClick={() => setShowAddDayForm(!showAddDayForm)}
            className="add-button"
          >
            {showAddDayForm ? 'Cancel' : 'Add Day'}
          </button>
        </div>

        {showAddDayForm && (
          <form onSubmit={handleAddDay} className="add-day-form">
            <div className="form-group">
              <label>Day Number:</label>
              <input
                type="number"
                value={newDay.day_number}
                onChange={(e) => setNewDay({...newDay, day_number: parseInt(e.target.value)})}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Day Name (optional):</label>
              <input
                type="text"
                value={newDay.name}
                onChange={(e) => setNewDay({...newDay, name: e.target.value})}
                placeholder="e.g., Chest Day"
              />
            </div>
            <button type="submit">Add Day</button>
          </form>
        )}

        <div className="days-list">
          {planDetails.days && planDetails.days.length > 0 ? (
            planDetails.days.map(day => (
              <div 
                key={day.id} 
                className={`day-card ${selectedDay?.id === day.id ? 'selected' : ''}`}
              >
                {editingDay === day.id ? (
                  <div className="edit-day-form">
                    <input
                      type="number"
                      value={editDayData.day_number}
                      onChange={(e) => setEditDayData({...editDayData, day_number: parseInt(e.target.value)})}
                      min="1"
                    />
                    <input
                      type="text"
                      value={editDayData.name}
                      onChange={(e) => setEditDayData({...editDayData, name: e.target.value})}
                      placeholder="Day name"
                    />
                    <div className="edit-actions">
                      <button onClick={() => handleUpdateDay(day.id)}>Save</button>
                      <button onClick={handleCancelEditDay}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div onClick={() => setSelectedDay(day)} className="day-content">
                      <h4>{day.name || `Day ${day.day_number}`}</h4>
                      <p>Day number: {day.day_number}</p>
                    </div>
                    <div className="day-actions">
                      <button onClick={() => handleEditDay(day)} className="action-btn edit">
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteDay(day.id, day.name || `Day ${day.day_number}`)} 
                        className="action-btn delete"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>No training days added yet.</p>
          )}
        </div>
      </div>

      {selectedDay && (
        <ExerciseManager 
          day={selectedDay} 
          onExerciseChange={() => fetchPlanDetails(plan.id)} // Odśwież dane po zmianach
        />
      )}
    </div>
  )
}

export default WorkoutPlanDetail