import { useState, useEffect } from 'react'
import Header from './components/Header'
import WorkoutPlanCreator from './components/WorkoutPlanCreator'
import WorkoutPlanList from './components/WorkoutPlanList'
import WorkoutPlanDetail from './components/WorkoutPlanDetail'
import ExportImport from './components/ExportImport'
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
            <button onClick={handleCreatePlan} className="create-button">
              + Create New Plan
            </button>
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
      </main>
    </div>
  )
}

export default App