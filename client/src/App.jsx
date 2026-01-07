import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import TrackingForm from './components/TrackingForm'
import Dashboard from './components/Dashboard'
import History from './components/History'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Daily Tracker 2026</h1>
          <nav>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/track">Track Today</Link>
            <Link to="/history">History</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/track" element={<TrackingForm />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
