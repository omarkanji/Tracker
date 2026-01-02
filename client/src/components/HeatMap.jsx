import { useState, useEffect } from 'react'
import axios from 'axios'
import './HeatMap.css'

function HeatMap() {
  const [heatmapData, setHeatmapData] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchHeatmapData()
  }, [year])

  const fetchHeatmapData = async () => {
    try {
      const response = await axios.get(`/api/analytics/heatmap?year=${year}`)
      setHeatmapData(response.data)
    } catch (error) {
      console.error('Error fetching heatmap data:', error)
    }
  }

  const getColorForLevel = (level) => {
    const colors = [
      'rgba(30, 39, 73, 0.3)',     // level 0 - no activity
      'rgba(100, 181, 246, 0.3)',  // level 1
      'rgba(100, 181, 246, 0.5)',  // level 2
      'rgba(100, 181, 246, 0.7)',  // level 3
      'rgba(100, 181, 246, 1)'     // level 4 - all activities
    ]
    return colors[level] || colors[0]
  }

  // Create a grid for the year
  const generateYearGrid = () => {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    const weeks = []
    let currentWeek = []

    // Start from the first day of the year
    const current = new Date(startDate)

    // Add empty cells for days before the start of the year
    const startDay = startDate.getDay()
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null)
    }

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0]
      const dayData = heatmapData.find(d => d.date === dateStr)

      currentWeek.push({
        date: new Date(current),
        level: dayData ? dayData.level : 0,
        count: dayData ? dayData.count : 0
      })

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      current.setDate(current.getDate() + 1)
    }

    // Add the last week if it's not complete
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push(currentWeek)
    }

    return weeks
  }

  const weeks = generateYearGrid()
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  return (
    <div className="heatmap">
      <div className="heatmap-controls">
        <button onClick={() => setYear(year - 1)}>← {year - 1}</button>
        <span>{year}</span>
        <button onClick={() => setYear(year + 1)}>{year + 1} →</button>
      </div>

      <div className="heatmap-months">
        {months.map((month, idx) => (
          <span key={idx}>{month}</span>
        ))}
      </div>

      <div className="heatmap-grid">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="heatmap-week">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="heatmap-day"
                style={{
                  backgroundColor: day ? getColorForLevel(day.level) : 'transparent'
                }}
                title={day ? `${day.date.toLocaleDateString()}: ${day.count} activities` : ''}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-colors">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="legend-box"
              style={{ backgroundColor: getColorForLevel(level) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default HeatMap
