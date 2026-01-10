import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { format, parseISO, eachDayOfInterval } from 'date-fns'
import './History.css'

function History() {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [editingEntry, setEditingEntry] = useState(null)
  const [message, setMessage] = useState(null)
  const [searchParams] = useSearchParams()
  const entryRefs = useRef({})

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    // Auto-edit if date parameter is present in URL
    const dateParam = searchParams.get('date')
    if (dateParam && history.length > 0) {
      const entry = history.find(h => {
        const entryDate = typeof h.entry_date === 'string'
          ? h.entry_date.split('T')[0]
          : format(new Date(h.entry_date), 'yyyy-MM-dd')
        return entryDate === dateParam
      })
      if (entry) {
        handleEdit(entry)
        // Scroll to the entry
        setTimeout(() => {
          const ref = entryRefs.current[dateParam]
          if (ref) {
            ref.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      }
    }
  }, [searchParams, history])

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/tracking/history?days=365')
      const existingEntries = response.data

      // If we have entries, fill in missing dates
      if (existingEntries.length > 0) {
        // Get all dates from first entry to today
        const normalizedDates = existingEntries.map(entry => {
          const dateStr = typeof entry.entry_date === 'string'
            ? entry.entry_date.split('T')[0]
            : format(new Date(entry.entry_date), 'yyyy-MM-dd')
          return dateStr
        }).sort()

        const firstDate = parseISO(normalizedDates[0])
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Normalize to start of day

        // Create a map of existing entries
        const entryMap = {}
        existingEntries.forEach(entry => {
          const dateStr = typeof entry.entry_date === 'string'
            ? entry.entry_date.split('T')[0]
            : format(new Date(entry.entry_date), 'yyyy-MM-dd')
          entryMap[dateStr] = entry
        })

        // Generate all dates from first entry to today
        const allDates = eachDayOfInterval({ start: firstDate, end: today })
          .map(date => format(date, 'yyyy-MM-dd'))

        // Create complete history with empty entries for missing dates
        const todayStr = format(today, 'yyyy-MM-dd')
        const completeHistory = allDates.map(date => {
          if (entryMap[date]) {
            return entryMap[date]
          } else {
            // Create empty entry for missing date (but don't mark today as placeholder if it doesn't exist)
            const isToday = date === todayStr
            return {
              entry_date: date,
              bed_before_11pm: false,
              eight_hours_sleep: false,
              wake_by_730am: false,
              workout: false,
              ten_k_steps: false,
              read_investing: false,
              read_finance: false,
              read_crypto: false,
              play_with_ai: false,
              reading_books: false,
              posted_twitter: false,
              posted_linkedin: false,
              person_reached_out: '',
              is_placeholder: !isToday // Don't mark today as missing if it doesn't exist yet
            }
          }
        }).reverse() // Show most recent first

        setHistory(completeHistory)
      } else {
        setHistory(existingEntries)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching history:', error)
      setLoading(false)
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry({ ...entry })
  }

  const handleCancel = () => {
    setEditingEntry(null)
    setMessage(null)
  }

  const handleChange = (field, value) => {
    setEditingEntry(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      const response = await axios.post('/api/tracking/submit', editingEntry)

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Entry updated successfully!'
        })

        // Refetch history to get the updated data
        await fetchHistory()
        setEditingEntry(null)

        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error updating entry:', error)
      setMessage({
        type: 'error',
        text: 'Failed to update entry. Please try again.'
      })
    }
  }

  if (loading) {
    return <div className="loading">Loading history...</div>
  }

  return (
    <div className="history">
      <div className="history-header">
        <h2>Edit Historical Data</h2>
        <p className="subtitle">View and edit your past entries</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="history-list">
        {history.map(entry => {
          const entryDate = typeof entry.entry_date === 'string'
            ? entry.entry_date.split('T')[0]
            : format(new Date(entry.entry_date), 'yyyy-MM-dd')

          return (
            <div
              key={entry.entry_date}
              ref={(el) => (entryRefs.current[entryDate] = el)}
              className={`history-card ${entry.is_placeholder ? 'missing-entry' : ''}`}
            >
              <div className="history-card-header">
                <div className="header-title">
                  <h3>{format(new Date(entry.entry_date), 'MMMM d, yyyy')}</h3>
                  {entry.is_placeholder && <span className="missing-badge">Missing Entry</span>}
                </div>
              {editingEntry?.entry_date === entry.entry_date ? (
                <div className="button-group">
                  <button className="save-btn" onClick={handleSave}>
                    Save
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="edit-btn" onClick={() => handleEdit(entry)}>
                  {entry.is_placeholder ? 'Fill Entry' : 'Edit'}
                </button>
              )}
            </div>

            {editingEntry?.entry_date === entry.entry_date ? (
              <div className="editing-form">
                <section>
                  <h4>Sleep Goals</h4>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.bed_before_11pm}
                      onChange={(e) => handleChange('bed_before_11pm', e.target.checked)}
                    />
                    <span>Bed before 11 PM</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.eight_hours_sleep}
                      onChange={(e) => handleChange('eight_hours_sleep', e.target.checked)}
                    />
                    <span>8 hours in bed</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.wake_by_730am}
                      onChange={(e) => handleChange('wake_by_730am', e.target.checked)}
                    />
                    <span>Wake by 7:30 AM</span>
                  </label>
                </section>

                <section>
                  <h4>Daily Health Goals</h4>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.workout}
                      onChange={(e) => handleChange('workout', e.target.checked)}
                    />
                    <span>Workout</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.ten_k_steps}
                      onChange={(e) => handleChange('ten_k_steps', e.target.checked)}
                    />
                    <span>10,000 steps</span>
                  </label>
                </section>

                <section>
                  <h4>Daily Learning Items</h4>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.read_investing}
                      onChange={(e) => handleChange('read_investing', e.target.checked)}
                    />
                    <span>Read about investing</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.read_finance}
                      onChange={(e) => handleChange('read_finance', e.target.checked)}
                    />
                    <span>Read about finance</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.read_crypto}
                      onChange={(e) => handleChange('read_crypto', e.target.checked)}
                    />
                    <span>Read about crypto</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.play_with_ai}
                      onChange={(e) => handleChange('play_with_ai', e.target.checked)}
                    />
                    <span>Play with AI</span>
                  </label>
                </section>

                <section>
                  <h4>General Reading</h4>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.reading_books}
                      onChange={(e) => handleChange('reading_books', e.target.checked)}
                    />
                    <span>Reading/books</span>
                  </label>
                </section>

                <section>
                  <h4>Social Media</h4>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.posted_twitter}
                      onChange={(e) => handleChange('posted_twitter', e.target.checked)}
                    />
                    <span>Posted on Twitter</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingEntry.posted_linkedin}
                      onChange={(e) => handleChange('posted_linkedin', e.target.checked)}
                    />
                    <span>Posted on LinkedIn</span>
                  </label>
                </section>

                <section>
                  <h4>Stretch Goal</h4>
                  <label className="text-label">
                    <span>Person reached out to:</span>
                    <input
                      type="text"
                      value={editingEntry.person_reached_out || ''}
                      onChange={(e) => handleChange('person_reached_out', e.target.value)}
                      placeholder="Enter name..."
                    />
                  </label>
                </section>
              </div>
            ) : (
              <div className="entry-summary">
                <div className="summary-section">
                  <h4>Sleep Goals</h4>
                  <div className="summary-items">
                    {entry.bed_before_11pm && <span className="completed-item">Bed before 11 PM</span>}
                    {entry.eight_hours_sleep && <span className="completed-item">8 hours in bed</span>}
                    {entry.wake_by_730am && <span className="completed-item">Wake by 7:30 AM</span>}
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Daily Health Goals</h4>
                  <div className="summary-items">
                    {entry.workout && <span className="completed-item">Workout</span>}
                    {entry.ten_k_steps && <span className="completed-item">10,000 steps</span>}
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Daily Learning</h4>
                  <div className="summary-items">
                    {entry.read_investing && <span className="completed-item">Investing</span>}
                    {entry.read_finance && <span className="completed-item">Finance</span>}
                    {entry.read_crypto && <span className="completed-item">Crypto</span>}
                    {entry.play_with_ai && <span className="completed-item">AI</span>}
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Other Activities</h4>
                  <div className="summary-items">
                    {entry.reading_books && <span className="completed-item">Books</span>}
                    {entry.posted_twitter && <span className="completed-item">Twitter</span>}
                    {entry.posted_linkedin && <span className="completed-item">LinkedIn</span>}
                    {entry.person_reached_out && (
                      <span className="completed-item">Reached out to: {entry.person_reached_out}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          )
        })}

        {history.length === 0 && (
          <div className="empty-state">
            <p>No history available yet. Start tracking today!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default History
