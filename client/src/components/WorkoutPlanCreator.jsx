import { useState } from 'react'
import './WorkoutPlanCreator.css'

const WorkoutPlanCreator = ({ onPlanCreated }) => {
  const [daysCount, setDaysCount] = useState(3)
  const [planName, setPlanName] = useState('My Workout Plan')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState(null)

  const handleCreatePlan = async () => {
    setIsCreating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/workout-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: planName,
          days_count: daysCount
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newPlan = await response.json()
      console.log('Plan created successfully:', newPlan)
      
      // Wywołaj funkcję zwrotną, aby powiadomić rodzica o utworzeniu planu
      if (onPlanCreated) {
        onPlanCreated(newPlan)
      }
    } catch (error) {
      console.error('Error creating plan:', error)
      setError(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="plan-creator">
      <h2>Create Your Workout Plan</h2>
      
      {error && <div className="error-message">Error: {error}</div>}
      
      <div className="form-group">
        <label htmlFor="plan-name">Plan Name:</label>
        <input
          id="plan-name"
          type="text"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="days-count">Number of Training Days:</label>
        <input
          id="days-count"
          type="number"
          min="1"
          max="7"
          value={daysCount}
          onChange={(e) => setDaysCount(parseInt(e.target.value))}
        />
      </div>
      
      <button 
        onClick={handleCreatePlan} 
        className="create-button"
        disabled={isCreating}
      >
        {isCreating ? 'Creating...' : 'Create Plan'}
      </button>
    </div>
  )
}

export default WorkoutPlanCreator