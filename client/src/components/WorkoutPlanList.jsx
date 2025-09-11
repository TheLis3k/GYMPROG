import { useState, useEffect } from 'react'
import './WorkoutPlanList.css'

const WorkoutPlanList = ({ onSelectPlan, refreshTrigger }) => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingPlan, setEditingPlan] = useState(null)
  const [editFormData, setEditFormData] = useState({ name: '', days_count: 3 })

  useEffect(() => {
    fetchWorkoutPlans()
  }, [refreshTrigger])

  const fetchWorkoutPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/workout-plans')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setPlans(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching workout plans:', error)
      setError(error.message)
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async (planId, planName) => {
    if (!window.confirm(`Are you sure you want to delete "${planName}"? This will delete all associated days and exercises.`)) {
      return
    }

    try {
      const response = await fetch(`/api/workout-plans/${planId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      // Refresh the list
      fetchWorkoutPlans()
    } catch (error) {
      console.error('Error deleting workout plan:', error)
      setError(error.message)
    }
  }

  const handleEditPlan = (plan) => {
    setEditingPlan(plan.id)
    setEditFormData({ name: plan.name, days_count: plan.days_count })
  }

  const handleUpdatePlan = async (planId) => {
    try {
      const response = await fetch(`/api/workout-plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const updatedPlan = await response.json()
      setPlans(plans.map(plan => plan.id === planId ? { ...plan, ...updatedPlan } : plan))
      setEditingPlan(null)
    } catch (error) {
      console.error('Error updating workout plan:', error)
      setError(error.message)
    }
  }

  const handleCancelEdit = () => {
    setEditingPlan(null)
  }

  if (loading) return <div className="loading">Loading workout plans...</div>
  if (error) return (
    <div className="error">
      <h3>Error loading workout plans</h3>
      <p>{error}</p>
      <button onClick={fetchWorkoutPlans}>Try Again</button>
    </div>
  )

  return (
    <div className="plan-list">
      <h2>Your Workout Plans</h2>
      {plans.length === 0 ? (
        <p>No workout plans yet. Create your first one!</p>
      ) : (
        <div className="plans-grid">
          {plans.map(plan => (
            <div key={plan.id} className="plan-card">
              {editingPlan === plan.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  />
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={editFormData.days_count}
                    onChange={(e) => setEditFormData({...editFormData, days_count: parseInt(e.target.value)})}
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleUpdatePlan(plan.id)}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{plan.name}</h3>
                  <p>{plan.days_count} training days</p>
                  <div className="plan-actions">
                    <button onClick={() => onSelectPlan(plan)} className="action-btn view">
                      View
                    </button>
                    <button onClick={() => handleEditPlan(plan)} className="action-btn edit">
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id, plan.name)} 
                      className="action-btn delete"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkoutPlanList