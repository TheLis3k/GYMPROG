import { useState, useEffect } from 'react'
import './Statistics.css'

const Statistics = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/statistics')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading statistics...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!stats) return <div>No statistics available</div>

  return (
    <div className="statistics">
      <h3>Training Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Workouts</h4>
          <p className="stat-value">{stats.totalWorkouts}</p>
        </div>
        
        <div className="stat-card">
          <h4>Total Exercises</h4>
          <p className="stat-value">{stats.totalExercises}</p>
        </div>
        
        <div className="stat-card">
          <h4>Total Weight Lifted</h4>
          <p className="stat-value">{stats.totalWeightLifted} kg</p>
        </div>
        
        <div className="stat-card">
          <h4>Average Workouts per Week</h4>
          <p className="stat-value">{stats.avgWorkoutsPerWeek}</p>
        </div>
      </div>

      <div className="progress-section">
        <h4>Progress Overview</h4>
        <div className="progress-bars">
          {stats.mostImprovedExercises.map((exercise, index) => (
            <div key={index} className="progress-item">
              <span className="exercise-name">{exercise.name}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${exercise.improvement}%` }}
                ></div>
              </div>
              <span className="improvement">{exercise.improvement}% improvement</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Statistics