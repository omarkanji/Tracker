import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './TrackingForm.css'

function TrackingForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const [formData, setFormData] = useState({
    bed_before_11pm: false,
    eight_hours_sleep: false,
    wake_by_730am: false,
    workout: false,
    ten_k_steps: false,
    play_with_ai: false,
    read_investing: false,
    read_finance: false,
    read_crypto: false,
    posted_twitter: false,
    posted_linkedin: false,
    reading_books: false,
    person_reached_out: ''
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
    const { name, type, checked, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const response = await axios.post('/api/tracking/submit', formData)

      if (response.data.success) {
        // Redirect to dashboard after successful submission
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error submitting entry:', error)
      setMessage({
        type: 'error',
        text: 'Failed to save entry. Please try again.'
      })
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  // Count completed items (12 checkboxes + 1 text field if not empty)
  const checkboxValues = Object.entries(formData)
    .filter(([key]) => key !== 'person_reached_out')
    .map(([, value]) => value)
  const checkboxCount = checkboxValues.filter(Boolean).length
  const textFieldCount = formData.person_reached_out && formData.person_reached_out.trim() !== '' ? 1 : 0
  const completedCount = checkboxCount + textFieldCount
  const totalItems = 13

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
            <h3>Daily Health Goals</h3>
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
                id="ten_k_steps"
                name="ten_k_steps"
                checked={formData.ten_k_steps}
                onChange={handleChange}
              />
              <label htmlFor="ten_k_steps">10,000 steps</label>
            </div>
          </section>

          <section>
            <h3>Daily Learning Items</h3>
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
                id="play_with_ai"
                name="play_with_ai"
                checked={formData.play_with_ai}
                onChange={handleChange}
              />
              <label htmlFor="play_with_ai">Play with AI</label>
            </div>
          </section>

          <section>
            <h3>General Reading</h3>
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

          <section>
            <h3>Social Media</h3>
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
          </section>

          <section>
            <h3>Stretch Goal</h3>
            <div className="text-input-group">
              <label htmlFor="person_reached_out">Person I reached out to today:</label>
              <input
                type="text"
                id="person_reached_out"
                name="person_reached_out"
                value={formData.person_reached_out}
                onChange={handleChange}
                placeholder="Enter name..."
              />
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
