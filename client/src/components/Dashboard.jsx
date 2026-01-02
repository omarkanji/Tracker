import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import HeatMap from './HeatMap'
import './Dashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [streaks, setStreaks] = useState(null)
  const [history, setHistory] = useState([])
  const [timeRange, setTimeRange] = useState(30)

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, streaksRes, historyRes] = await Promise.all([
        axios.get(`/api/analytics/overview?days=${timeRange}`),
        axios.get('/api/analytics/streaks'),
        axios.get(`/api/tracking/history?days=${timeRange}`)
      ])

      setOverview(overviewRes.data)
      setStreaks(streaksRes.data)
      setHistory(historyRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  if (!overview || !streaks) {
    return <div className="loading">No data available yet. Start tracking!</div>
  }

  // Prepare data for completion percentage chart
  const completionData = {
    labels: [
      'Bed before 11pm',
      '8hrs sleep',
      'Wake 7:30am',
      'Workout',
      'AI',
      'Investing',
      'Finance',
      'Crypto',
      'Twitter',
      'LinkedIn',
      'Reading'
    ],
    datasets: [
      {
        label: 'Completion %',
        data: [
          overview.sleep_goals.bed_before_11pm.percentage,
          overview.sleep_goals.eight_hours_sleep.percentage,
          overview.sleep_goals.wake_by_730am.percentage,
          overview.activities.workout.percentage,
          overview.activities.play_with_ai.percentage,
          overview.activities.read_investing.percentage,
          overview.activities.read_finance.percentage,
          overview.activities.read_crypto.percentage,
          overview.activities.posted_twitter.percentage,
          overview.activities.posted_linkedin.percentage,
          overview.activities.reading_books.percentage
        ],
        backgroundColor: 'rgba(100, 181, 246, 0.6)',
        borderColor: 'rgba(100, 181, 246, 1)',
        borderWidth: 2
      }
    ]
  }

  // Prepare data for trends over time
  const trendData = {
    labels: history.map(h => new Date(h.entry_date).toLocaleDateString()).reverse(),
    datasets: [
      {
        label: 'Daily Completion Count',
        data: history.map(h =>
          (h.bed_before_11pm ? 1 : 0) +
          (h.eight_hours_sleep ? 1 : 0) +
          (h.wake_by_730am ? 1 : 0) +
          (h.workout ? 1 : 0) +
          (h.play_with_ai ? 1 : 0) +
          (h.read_investing ? 1 : 0) +
          (h.read_finance ? 1 : 0) +
          (h.read_crypto ? 1 : 0) +
          (h.posted_twitter ? 1 : 0) +
          (h.posted_linkedin ? 1 : 0) +
          (h.reading_books ? 1 : 0)
        ).reverse(),
        borderColor: 'rgba(171, 71, 188, 1)',
        backgroundColor: 'rgba(171, 71, 188, 0.1)',
        tension: 0.4
      }
    ]
  }

  // Category breakdown (Sleep vs Learning vs Social)
  const categoryData = {
    labels: ['Sleep Goals', 'Learning (4 Daily)', 'Social Media', 'Other'],
    datasets: [
      {
        data: [
          overview.sleep_goals.bed_before_11pm.count +
          overview.sleep_goals.eight_hours_sleep.count +
          overview.sleep_goals.wake_by_730am.count,
          overview.activities.play_with_ai.count +
          overview.activities.read_investing.count +
          overview.activities.read_finance.count +
          overview.activities.read_crypto.count,
          overview.activities.posted_twitter.count +
          overview.activities.posted_linkedin.count,
          overview.activities.workout.count +
          overview.activities.reading_books.count
        ],
        backgroundColor: [
          'rgba(100, 181, 246, 0.6)',
          'rgba(171, 71, 188, 0.6)',
          'rgba(255, 202, 40, 0.6)',
          'rgba(76, 175, 80, 0.6)'
        ],
        borderColor: [
          'rgba(100, 181, 246, 1)',
          'rgba(171, 71, 188, 1)',
          'rgba(255, 202, 40, 1)',
          'rgba(76, 175, 80, 1)'
        ],
        borderWidth: 2
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#a8b2d1'
        }
      }
    },
    scales: {
      y: {
        ticks: { color: '#a8b2d1' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#a8b2d1' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#a8b2d1'
        }
      }
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Your Progress Dashboard</h2>
        <div className="time-range-selector">
          <button
            className={timeRange === 7 ? 'active' : ''}
            onClick={() => setTimeRange(7)}
          >
            7 Days
          </button>
          <button
            className={timeRange === 30 ? 'active' : ''}
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </button>
          <button
            className={timeRange === 90 ? 'active' : ''}
            onClick={() => setTimeRange(90)}
          >
            90 Days
          </button>
          <button
            className={timeRange === 365 ? 'active' : ''}
            onClick={() => setTimeRange(365)}
          >
            1 Year
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{streaks.perfect_day}</h3>
          <p>Perfect Day Streak</p>
        </div>
        <div className="stat-card">
          <h3>{streaks.workout}</h3>
          <p>Workout Streak</p>
        </div>
        <div className="stat-card">
          <h3>{streaks.bed_before_11pm}</h3>
          <p>Sleep Streak</p>
        </div>
        <div className="stat-card">
          <h3>{overview.four_daily_complete.count}</h3>
          <p>4 Daily Complete ({overview.four_daily_complete.percentage}%)</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-container">
          <h3>Completion Rates by Activity</h3>
          <div className="chart-wrapper">
            <Bar data={completionData} options={chartOptions} />
          </div>
        </div>

        <div className="card chart-container">
          <h3>Daily Progress Trend</h3>
          <div className="chart-wrapper">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>

        <div className="card chart-container">
          <h3>Activity Category Breakdown</h3>
          <div className="chart-wrapper">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>

        <div className="card">
          <h3>Current Streaks</h3>
          <div className="streaks-list">
            <div className="streak-item">
              <span>Bed before 11pm:</span>
              <strong>{streaks.bed_before_11pm} days</strong>
            </div>
            <div className="streak-item">
              <span>8 hours sleep:</span>
              <strong>{streaks.eight_hours_sleep} days</strong>
            </div>
            <div className="streak-item">
              <span>Wake by 7:30am:</span>
              <strong>{streaks.wake_by_730am} days</strong>
            </div>
            <div className="streak-item">
              <span>Workout:</span>
              <strong>{streaks.workout} days</strong>
            </div>
            <div className="streak-item">
              <span>Play with AI:</span>
              <strong>{streaks.play_with_ai} days</strong>
            </div>
            <div className="streak-item">
              <span>Twitter:</span>
              <strong>{streaks.posted_twitter} days</strong>
            </div>
            <div className="streak-item">
              <span>LinkedIn:</span>
              <strong>{streaks.posted_linkedin} days</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Year Heat Map</h3>
        <HeatMap />
      </div>
    </div>
  )
}

export default Dashboard
