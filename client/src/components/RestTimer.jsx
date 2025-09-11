import { useState, useEffect, useRef } from 'react'
import './RestTimer.css'
import notificationSound from '../assets/notification.mp3'

const RestTimer = () => {
  const [timeLeft, setTimeLeft] = useState(90) // Domyślnie 90 sekund
  const [isActive, setIsActive] = useState(false)
  const [customTime, setCustomTime] = useState(90)
  const intervalRef = useRef(null)

    const playNotificationSound = () => {
        const audio = new Audio(notificationSound)
        audio.play()
    }

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current)
      playNotificationSound()
    }
    
    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft])

  const startTimer = () => {
    setIsActive(true)
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(customTime)
  }

  const setTimer = (seconds) => {
    setIsActive(false)
    setTimeLeft(seconds)
    setCustomTime(seconds)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="rest-timer">
      <h3>Rest Timer</h3>
        <div className={`timer-display ${timeLeft === 0 ? 'finished' : ''}`}>
            <div className={`time ${timeLeft === 0 ? 'finished' : ''}`}>
                {formatTime(timeLeft)}
            </div>
            <div className="timer-status">
                {isActive ? 'Running' : timeLeft === 0 ? 'Finished!' : 'Paused'}
            </div>
        </div>
      
      <div className="timer-controls">
        {!isActive ? (
          <button onClick={startTimer} className="timer-btn start">
            Start
          </button>
        ) : (
          <button onClick={pauseTimer} className="timer-btn pause">
            Pause
          </button>
        )}
        <button onClick={resetTimer} className="timer-btn reset">
          Reset
        </button>
      </div>

      <div className="preset-buttons">
        <button onClick={() => setTimer(30)} className="preset-btn">
          30s
        </button>
        <button onClick={() => setTimer(60)} className="preset-btn">
          60s
        </button>
        <button onClick={() => setTimer(90)} className="preset-btn">
          90s
        </button>
        <button onClick={() => setTimer(120)} className="preset-btn">
          120s
        </button>
      </div>

      <div className="custom-time">
        <label htmlFor="custom-time-input">Custom time (seconds):</label>
        <input
          id="custom-time-input"
          type="number"
          min="10"
          max="300"
          value={customTime}
          onChange={(e) => setCustomTime(parseInt(e.target.value) || 90)}
        />
        <button 
          onClick={() => setTimer(customTime)}
          className="set-custom-btn"
        >
          Set
        </button>
      </div>
    </div>
  )
}

export default RestTimer