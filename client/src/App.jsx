import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import TrackingForm from './components/TrackingForm'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Daily Tracker 2026</h1>
          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/track">Track Today</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/track" element={<TrackingForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
