import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { format, parseISO, eachDayOfInterval, isToday } from 'date-fns'
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
import MatrixView from './MatrixView'
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
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [completionOverview, setCompletionOverview] = useState(null)
  const [streaks, setStreaks] = useState(null)
  const [history, setHistory] = useState([])
  const [timeRange, setTimeRange] = useState(30)
  const [completionTimeRange, setCompletionTimeRange] = useState(30)
  const [missingDates, setMissingDates] = useState([])
  const [showMissingDatesModal, setShowMissingDatesModal] = useState(false)

  useEffect(() => {
    // Always refetch when dependencies change
    setLoading(true)
    fetchDashboardData()
  }, [timeRange, completionTimeRange, location.pathname])

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, completionOverviewRes, streaksRes, historyRes] = await Promise.all([
        axios.get(`/api/analytics/overview?days=${timeRange}`),
        axios.get(`/api/analytics/overview?days=${completionTimeRange}`),
        axios.get('/api/analytics/streaks'),
        axios.get(`/api/tracking/history?days=${timeRange}`)
      ])

      setOverview(overviewRes.data)
      setCompletionOverview(completionOverviewRes.data)
      setStreaks(streaksRes.data)
      setHistory(historyRes.data)

      // Check for missing dates
      checkMissingDates(historyRes.data)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const checkMissingDates = (historyData) => {
    if (!historyData || historyData.length === 0) return

    // Get all dates from first entry to yesterday (don't include today since user might not have filled it yet)
    const normalizedDates = historyData.map(entry => {
      const dateStr = typeof entry.entry_date === 'string'
        ? entry.entry_date.split('T')[0]
        : format(new Date(entry.entry_date), 'yyyy-MM-dd')
      return dateStr
    }).sort()

    const firstDate = parseISO(normalizedDates[0])
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Get all dates from first entry to yesterday
    const allDates = eachDayOfInterval({ start: firstDate, end: yesterday })
      .map(date => format(date, 'yyyy-MM-dd'))

    // Create a Set of existing dates for fast lookup
    const existingDates = new Set(normalizedDates)

    // Find missing dates
    const missing = allDates.filter(date => !existingDates.has(date))

    setMissingDates(missing)

    // Show modal if there are missing dates
    if (missing.length > 0) {
      setShowMissingDatesModal(true)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  if (!overview || !streaks || !completionOverview) {
    return <div className="loading">No data available yet. Start tracking!</div>
  }

  // Prepare data for completion rates chart with color coding
  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return { bg: 'rgba(76, 175, 80, 0.6)', border: 'rgba(76, 175, 80, 1)' } // Green
    if (percentage >= 50) return { bg: 'rgba(255, 193, 7, 0.6)', border: 'rgba(255, 193, 7, 1)' } // Yellow
    return { bg: 'rgba(244, 67, 54, 0.6)', border: 'rgba(244, 67, 54, 1)' } // Red
  }

  const completionActivities = [
    { label: 'Bed <11pm', ...completionOverview.sleep_goals?.bed_before_11pm },
    { label: '8hrs sleep', ...completionOverview.sleep_goals?.eight_hours_sleep },
    { label: 'Wake 7:30', ...completionOverview.sleep_goals?.wake_by_730am },
    { label: 'Workout', ...completionOverview.activities?.workout },
    { label: '10k steps', ...completionOverview.activities?.ten_k_steps },
    { label: 'Investing', ...completionOverview.activities?.read_investing },
    { label: 'Finance', ...completionOverview.activities?.read_finance },
    { label: 'Crypto', ...completionOverview.activities?.read_crypto },
    { label: 'AI', ...completionOverview.activities?.play_with_ai },
    { label: 'Books', ...completionOverview.activities?.reading_books },
    { label: 'Twitter', ...completionOverview.activities?.posted_twitter },
    { label: 'LinkedIn', ...completionOverview.activities?.posted_linkedin },
    { label: 'Reach out', ...completionOverview.activities?.person_reached_out }
  ]

  const completionData = {
    labels: completionActivities.map(a => a.label),
    datasets: [
      {
        label: 'Completion %',
        data: completionActivities.map(a => a.percentage || 0),
        backgroundColor: completionActivities.map(a => getCompletionColor(a.percentage || 0).bg),
        borderColor: completionActivities.map(a => getCompletionColor(a.percentage || 0).border),
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

  // Category breakdown with new 6-category structure
  const categoryData = {
    labels: ['Sleep Goals', 'Daily Health', 'Daily Learning', 'General Reading', 'Social Media', 'Stretch Goal'],
    datasets: [
      {
        data: [
          (overview.sleep_goals?.bed_before_11pm?.count || 0) +
          (overview.sleep_goals?.eight_hours_sleep?.count || 0) +
          (overview.sleep_goals?.wake_by_730am?.count || 0),
          (overview.activities?.workout?.count || 0) +
          (overview.activities?.ten_k_steps?.count || 0),
          (overview.activities?.play_with_ai?.count || 0) +
          (overview.activities?.read_investing?.count || 0) +
          (overview.activities?.read_finance?.count || 0) +
          (overview.activities?.read_crypto?.count || 0),
          (overview.activities?.reading_books?.count || 0),
          (overview.activities?.posted_twitter?.count || 0) +
          (overview.activities?.posted_linkedin?.count || 0),
          (overview.activities?.person_reached_out?.count || 0)
        ],
        backgroundColor: [
          'rgba(100, 181, 246, 0.6)',
          'rgba(76, 175, 80, 0.6)',
          'rgba(171, 71, 188, 0.6)',
          'rgba(255, 152, 0, 0.6)',
          'rgba(255, 202, 40, 0.6)',
          'rgba(233, 30, 99, 0.6)'
        ],
        borderColor: [
          'rgba(100, 181, 246, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(171, 71, 188, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(255, 202, 40, 1)',
          'rgba(233, 30, 99, 1)'
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
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const activity = completionActivities[context.dataIndex]
            const count = activity?.count || 0
            const total = completionOverview.total_entries || 1
            const percentage = activity?.percentage || 0
            return `${count}/${total} days (${percentage}%)`
          }
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

  // Horizontal bar chart for current streaks
  const streaksChartData = {
    labels: [
      'Bed <11pm',
      '8hrs sleep',
      'Wake 7:30',
      'Workout',
      '10k steps',
      'AI',
      'Twitter',
      'LinkedIn'
    ],
    datasets: [
      {
        label: 'Days',
        data: [
          streaks.bed_before_11pm || 0,
          streaks.eight_hours_sleep || 0,
          streaks.wake_by_730am || 0,
          streaks.workout || 0,
          streaks.ten_k_steps || 0,
          streaks.play_with_ai || 0,
          streaks.posted_twitter || 0,
          streaks.posted_linkedin || 0
        ],
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 2
      }
    ]
  }

  const horizontalBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: { color: '#a8b2d1' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#a8b2d1' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
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
          <div className="chart-header">
            <h3>Completion Rates by Activity</h3>
            <div className="time-range-selector completion-toggle">
              <button
                className={completionTimeRange === 7 ? 'active' : ''}
                onClick={() => setCompletionTimeRange(7)}
              >
                7d
              </button>
              <button
                className={completionTimeRange === 30 ? 'active' : ''}
                onClick={() => setCompletionTimeRange(30)}
              >
                30d
              </button>
              <button
                className={completionTimeRange === 90 ? 'active' : ''}
                onClick={() => setCompletionTimeRange(90)}
              >
                90d
              </button>
              <button
                className={completionTimeRange === 365 ? 'active' : ''}
                onClick={() => setCompletionTimeRange(365)}
              >
                1y
              </button>
            </div>
          </div>
          <div className="chart-wrapper">
            <Bar data={completionData} options={chartOptions} />
          </div>
        </div>

        <div className="card chart-container">
          <h3>Activity Category Breakdown</h3>
          <div className="chart-wrapper">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>

        <div className="card chart-container">
          <h3>Current Streaks</h3>
          <div className="chart-wrapper">
            <Bar data={streaksChartData} options={horizontalBarOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Goals vs Dates Matrix</h3>
        <MatrixView history={history} days={timeRange} />
      </div>

      <div className="card">
        <h3>Year Heat Map</h3>
        <HeatMap />
      </div>

      {/* Missing Dates Modal */}
      {showMissingDatesModal && missingDates.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowMissingDatesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Missing Entries</h3>
              <button className="modal-close" onClick={() => setShowMissingDatesModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>You have {missingDates.length} day{missingDates.length > 1 ? 's' : ''} without entries:</p>
              <div className="missing-dates-list">
                {missingDates.slice(0, 10).map(date => (
                  <div key={date} className="missing-date-item">
                    {format(parseISO(date), 'MMMM d, yyyy')}
                  </div>
                ))}
                {missingDates.length > 10 && (
                  <div className="missing-date-item">
                    ... and {missingDates.length - 10} more
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="primary-btn"
                onClick={() => {
                  setShowMissingDatesModal(false)
                  navigate('/history')
                }}
              >
                Fill Missing Entries
              </button>
              <button
                className="secondary-btn"
                onClick={() => setShowMissingDatesModal(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
