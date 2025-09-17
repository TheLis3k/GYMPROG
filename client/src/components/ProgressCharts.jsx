import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const ProgressCharts = ({ exerciseId }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState('line')
  const [selectedMetric, setSelectedMetric] = useState('weight')

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

  // Funkcja do przetwarzania danych dla wykresu
  const processChartData = (metric) => {
    const filteredData = history.filter(log => log[metric] !== null && log[metric] !== undefined)
    
    return {
      labels: filteredData.map(log => new Date(log.created_at).toLocaleDateString()).reverse(),
      datasets: [
        {
          label: metric.charAt(0).toUpperCase() + metric.slice(1),
          data: filteredData.map(log => log[metric]).reverse(),
          borderColor: getColorForMetric(metric),
          backgroundColor: getColorForMetric(metric, 0.2),
          fill: chartType === 'line',
          tension: 0.1
        }
      ],
    }
  }

  // Funkcja do przetwarzania danych dla wykresu kołowego (trudność)
  const processDifficultyData = () => {
    const difficultyCount = {
      '😩': 0,
      '😐': 0,
      '😊': 0
    }

    history.forEach(log => {
      if (log.difficulty_emoji && difficultyCount.hasOwnProperty(log.difficulty_emoji)) {
        difficultyCount[log.difficulty_emoji]++
      }
    })

    return {
      labels: ['Hard (😩)', 'Medium (😐)', 'Easy (😊)'],
      datasets: [
        {
          data: [difficultyCount['😩'], difficultyCount['😐'], difficultyCount['😊']],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }
      ]
    }
  }

  // Funkcja zwracająca kolor dla metryki
  const getColorForMetric = (metric, opacity = 1) => {
    const colors = {
      reps: `rgba(255, 99, 132, ${opacity})`,
      weight: `rgba(53, 162, 235, ${opacity})`,
      duration: `rgba(75, 192, 192, ${opacity})`
    }
    return colors[metric] || `rgba(153, 102, 255, ${opacity})`
  }

  // Opcje wykresu
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Progress`,
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  // Opcje wykresu kołowego
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Difficulty Distribution',
      },
    }
  }

  if (loading) return <div>Loading charts...</div>
  if (history.length === 0) return <div>No data available for charts</div>

  return (
    <div className="progress-charts">
      <h4>Advanced Progress Charts</h4>
      
      {/* Kontrolki wyboru typu wykresu i metryki */}
      <div className="chart-controls">
        <select 
          value={chartType} 
          onChange={(e) => setChartType(e.target.value)}
          className="chart-select"
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="doughnut">Difficulty Chart</option>
        </select>
        
        {chartType !== 'doughnut' && (
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="metric-select"
          >
            <option value="weight">Weight</option>
            <option value="reps">Reps</option>
            <option value="duration">Duration</option>
          </select>
        )}
      </div>

      {/* Renderowanie odpowiedniego wykresu */}
      {chartType === 'line' && (
        <Line options={chartOptions} data={processChartData(selectedMetric)} />
      )}
      
      {chartType === 'bar' && (
        <Bar options={chartOptions} data={processChartData(selectedMetric)} />
      )}
      
      {chartType === 'doughnut' && (
        <Doughnut options={doughnutOptions} data={processDifficultyData()} />
      )}

      {/* Dodatkowe informacje statystyczne */}
      <div className="chart-stats">
        <h5>Statistics for {selectedMetric}:</h5>
        {chartType !== 'doughnut' && (
          <>
            <p>Max: {Math.max(...processChartData(selectedMetric).datasets[0].data)}</p>
            <p>Min: {Math.min(...processChartData(selectedMetric).datasets[0].data)}</p>
            <p>Average: {(
              processChartData(selectedMetric).datasets[0].data.reduce((a, b) => a + b, 0) / 
              processChartData(selectedMetric).datasets[0].data.length
            ).toFixed(2)}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default ProgressCharts