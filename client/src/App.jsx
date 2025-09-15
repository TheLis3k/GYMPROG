import { useState, useEffect } from 'react'
import Header from './components/Header'
import WorkoutPlanCreator from './components/WorkoutPlanCreator'
import WorkoutPlanList from './components/WorkoutPlanList'
import WorkoutPlanDetail from './components/WorkoutPlanDetail'
import ExportImport from './components/ExportImport'
import Statistics from './components/Statistics'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('plan-list')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('#import=')) {
      console.log('Import link detected');
    }
  }, [])

  const handleCreatePlan = () => {
    setCurrentView('plan-creator')
  }

  const handlePlanCreated = () => {
    setCurrentView('plan-list')
    setRefreshTrigger(prev => prev + 1)
  }

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    setCurrentView('plan-detail')
  }

  const handleBackToList = () => {
    setSelectedPlan(null)
    setCurrentView('plan-list')
    setRefreshTrigger(prev => prev + 1)
  }

  const handlePlanDeleted = () => {
    setSelectedPlan(null)
    setCurrentView('plan-list')
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="navigation">
          {currentView !== 'plan-list' && (
            <button onClick={handleBackToList} className="back-button">
              ← Back to Plans
            </button>
          )}
          {currentView === 'plan-list' && (
            <div className="main-actions">
              <button onClick={handleCreatePlan} className="create-button">
                + Create New Plan
              </button>
              <button 
                onClick={() => setCurrentView('statistics')}
                className="stats-button"
              >
                View Statistics
              </button>
            </div>
          )}
        </div>

        {currentView === 'plan-list' && (
          <>
            <WorkoutPlanList 
              onSelectPlan={handleSelectPlan} 
              refreshTrigger={refreshTrigger}
            />
            <ExportImport />
          </>
        )}
        {currentView === 'plan-creator' && (
          <WorkoutPlanCreator onPlanCreated={handlePlanCreated} />
        )}
        {currentView === 'plan-detail' && selectedPlan && (
          <WorkoutPlanDetail 
            plan={selectedPlan} 
            onPlanDeleted={handlePlanDeleted}
          />
        )}
        {currentView === 'statistics' && (
          <>
            <Statistics />
            <button 
              onClick={() => setCurrentView('plan-list')}
              className="back-button"
            >
              ← Back to Plans
            </button>
          </>
        )}
      </main>
    </div>
  )
}

export default App