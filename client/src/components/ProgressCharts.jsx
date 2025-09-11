import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const ProgressCharts = ({ exerciseId }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (exerciseId) {
      fetchExerciseHistory(exerciseId)
    }
  }, [exerciseId])

  const fetchExerciseHistory = async (exerciseId) => {
    try {
      const response = await fetch(`/api/exercise-logs/exercise/${exerciseId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error('Error fetching exercise history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading charts...</div>
  if (history.length === 0) return <div>No data available for charts</div>

  // Przygotuj dane dla wykresu
  const chartData = {
    labels: history.map(log => new Date(log.created_at).toLocaleDateString()).reverse(),
    datasets: [
      {
        label: 'Reps',
        data: history.map(log => log.reps).reverse(),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Weight (kg)',
        data: history.map(log => log.weight).reverse(),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Exercise Progress',
      },
    },
  }

  return (
    <div className="progress-charts">
      <h4>Progress Charts</h4>
      <Line options={options} data={chartData} />
    </div>
  )
}

export default ProgressCharts