import { format, parseISO, differenceInDays } from 'date-fns'
import './MatrixView.css'

function MatrixView({ history, days = 30 }) {
  if (!history || history.length === 0) {
    return (
      <div className="matrix-view">
        <p className="empty-message">No data available yet. Start tracking today!</p>
      </div>
    )
  }

  // Map history by date - normalize the date format
  const historyMap = {}
  history.forEach(entry => {
    // Normalize date to YYYY-MM-DD format
    const dateStr = typeof entry.entry_date === 'string'
      ? entry.entry_date.split('T')[0]
      : format(new Date(entry.entry_date), 'yyyy-MM-dd')
    historyMap[dateStr] = entry
  })

  // Find the earliest entry date - normalize dates first
  const allDates = history.map(entry => {
    const dateStr = typeof entry.entry_date === 'string'
      ? entry.entry_date.split('T')[0]
      : format(new Date(entry.entry_date), 'yyyy-MM-dd')
    return dateStr
  }).sort()
  const firstEntryDate = parseISO(allDates[0])
  const today = new Date()

  // Calculate days between first entry and today
  const daysSinceFirst = differenceInDays(today, firstEntryDate) + 1

  // Use the smaller of daysSinceFirst or requested days
  const daysToShow = Math.min(daysSinceFirst, days)

  // Create array of dates from first entry to today (or up to days limit)
  const dates = []
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(format(date, 'yyyy-MM-dd'))
  }

  const goals = [
    { key: 'bed_before_11pm', label: 'Bed <11pm' },
    { key: 'eight_hours_sleep', label: '8hrs sleep' },
    { key: 'wake_by_730am', label: 'Wake 7:30' },
    { key: 'workout', label: 'Workout' },
    { key: 'ten_k_steps', label: '10k steps' },
    { key: 'read_investing', label: 'Investing' },
    { key: 'read_finance', label: 'Finance' },
    { key: 'read_crypto', label: 'Crypto' },
    { key: 'play_with_ai', label: 'AI' },
    { key: 'reading_books', label: 'Books' },
    { key: 'posted_twitter', label: 'Twitter' },
    { key: 'posted_linkedin', label: 'LinkedIn' },
    { key: 'person_reached_out', label: 'Reach out' }
  ]

  return (
    <div className="matrix-view">
      <div className="matrix-scroll">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="goal-header">Goal</th>
              {dates.map(date => (
                <th key={date} className="date-header">
                  {format(new Date(date), 'M/d')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {goals.map(goal => (
              <tr key={goal.key}>
                <td className="goal-cell">{goal.label}</td>
                {dates.map(date => {
                  const entry = historyMap[date]
                  const isCompleted = entry && (
                    goal.key === 'person_reached_out'
                      ? entry[goal.key] && entry[goal.key].trim() !== ''
                      : entry[goal.key]
                  )
                  return (
                    <td key={date} className="matrix-cell">
                      <div className={`cell-indicator ${isCompleted ? 'completed' : 'incomplete'}`} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="matrix-legend">
        <div className="legend-item">
          <div className="cell-indicator completed" />
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div className="cell-indicator incomplete" />
          <span>Not done</span>
        </div>
      </div>
    </div>
  )
}

export default MatrixView
