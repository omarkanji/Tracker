import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './TrackingForm.css'

function TrackingForm() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const [formData, setFormData] = useState({
    bed_before_11pm: false,
    eight_hours_sleep: false,
    wake_by_730am: false,
    workout: false,
    play_with_ai: false,
    read_investing: false,
    read_finance: false,
    read_crypto: false,
    posted_twitter: false,
    posted_linkedin: false,
    reading_books: false
  })

  useEffect(() => {
    fetchTodayEntry()
  }, [])

  const fetchTodayEntry = async () => {
    try {
      const response = await axios.get('/api/tracking/today')
      setFormData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching today\'s entry:', error)
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const response = await axios.post('/api/tracking/submit', formData)

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Saved! Current streak: ${response.data.streak_days} days`
        })
      }
    } catch (error) {
      console.error('Error submitting entry:', error)
      setMessage({
        type: 'error',
        text: 'Failed to save entry. Please try again.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  const completedCount = Object.values(formData).filter(Boolean).length
  const totalItems = 11

  return (
    <div className="tracking-form">
      <div className="card">
        <div className="form-header">
          <h2>Daily Check-In</h2>
          <div className="progress-indicator">
            <span>{completedCount} / {totalItems} completed</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(completedCount / totalItems) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <section>
            <h3>Sleep Goals</h3>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="bed_before_11pm"
                name="bed_before_11pm"
                checked={formData.bed_before_11pm}
                onChange={handleChange}
              />
              <label htmlFor="bed_before_11pm">Bed before 11 PM</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="eight_hours_sleep"
                name="eight_hours_sleep"
                checked={formData.eight_hours_sleep}
                onChange={handleChange}
              />
              <label htmlFor="eight_hours_sleep">8 hours in bed</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="wake_by_730am"
                name="wake_by_730am"
                checked={formData.wake_by_730am}
                onChange={handleChange}
              />
              <label htmlFor="wake_by_730am">Wake by 7:30 AM</label>
            </div>
          </section>

          <section>
            <h3>Daily Activities</h3>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="workout"
                name="workout"
                checked={formData.workout}
                onChange={handleChange}
              />
              <label htmlFor="workout">Workout</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="play_with_ai"
                name="play_with_ai"
                checked={formData.play_with_ai}
                onChange={handleChange}
              />
              <label htmlFor="play_with_ai">Play with AI</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="read_investing"
                name="read_investing"
                checked={formData.read_investing}
                onChange={handleChange}
              />
              <label htmlFor="read_investing">Read about investing</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="read_finance"
                name="read_finance"
                checked={formData.read_finance}
                onChange={handleChange}
              />
              <label htmlFor="read_finance">Read about finance</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="read_crypto"
                name="read_crypto"
                checked={formData.read_crypto}
                onChange={handleChange}
              />
              <label htmlFor="read_crypto">Read about crypto</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="posted_twitter"
                name="posted_twitter"
                checked={formData.posted_twitter}
                onChange={handleChange}
              />
              <label htmlFor="posted_twitter">Posted on Twitter</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="posted_linkedin"
                name="posted_linkedin"
                checked={formData.posted_linkedin}
                onChange={handleChange}
              />
              <label htmlFor="posted_linkedin">Posted on LinkedIn</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="reading_books"
                name="reading_books"
                checked={formData.reading_books}
                onChange={handleChange}
              />
              <label htmlFor="reading_books">Reading/books</label>
            </div>
          </section>

          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="primary submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Today\'s Progress'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TrackingForm
