import { format, subDays } from 'date-fns'
import './MatrixView.css'

function MatrixView({ history, days = 30 }) {
  // Get the last N days of history
  const recentHistory = history.slice(0, days)

  // Create array of dates for the last N days
  const dates = Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), i)
    return format(date, 'yyyy-MM-dd')
  }).reverse()

  // Map history by date
  const historyMap = {}
  recentHistory.forEach(entry => {
    historyMap[entry.entry_date] = entry
  })

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
