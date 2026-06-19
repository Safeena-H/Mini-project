import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import NoteCard from '../components/NoteCard'
import Shimmer from '../components/Shimmer'
import { getProfile, getNotes, getScores } from '../utils/localStorage'
import './Dashboard.css'

const Dashboard = () => {
  // profile is read directly — it is needed right away for the welcome banner
  // localStorage is synchronous so this is safe to do outside useEffect
  const profile = getProfile()

  // true by default so shimmers show immediately when page opens
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [scores, setScores] = useState([])

  // useEffect with [] runs only once when the dashboard first appears on screen
  useEffect(() => {
    // 1.3 second delay makes the shimmer animation visible
    const timer = setTimeout(() => {
      setNotes(getNotes())
      setScores(getScores())
      // set loading to false so shimmers are replaced with real content
      setLoading(false)
    }, 1300)

    // cleanup function: if student navigates away before 1.3s, cancel the timer
    return () => clearTimeout(timer)
  }, [])

  // count unique subjects — Set removes duplicates, spread converts back to array
  const totalSubjects = [...new Set(notes.map((n) => n.subject))].length

  // scores are stored newest-first (unshift), so index 0 is the latest
  const latestScore = scores.length > 0 ? scores[0].score : null

  // spread (...) passes array items as individual arguments to Math.max
  const bestScore = scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : null

  // slice(0, 3) gives only the first 3 notes — newest first because of unshift in saveNote
  const recentNotes = notes.slice(0, 3)

  // returns greeting based on current hour of the day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // data for the 4 stat cards — using an array so we can loop instead of repeating code
  const stats = [
    { icon: 'bi-journal-text', label: 'Total Notes', value: notes.length, color: 'purple' },
    { icon: 'bi-collection', label: 'Subjects', value: totalSubjects, color: 'blue' },
    {
      icon: 'bi-trophy',
      label: 'Latest Score',
      // show dash if no quiz taken yet
      value: latestScore !== null ? `${latestScore}%` : '—',
      color: 'green',
    },
    {
      icon: 'bi-star-fill',
      label: 'Best Score',
      value: bestScore !== null ? `${bestScore}%` : '—',
      color: 'orange',
    },
  ]

  // data for the quick action buttons in the sidebar
  const quickActions = [
    { icon: 'bi-journal-plus', label: 'Add New Note', to: '/add-note', color: 'purple' },
    { icon: 'bi-collection', label: 'View All Notes', to: '/notes', color: 'blue' },
    { icon: 'bi-patch-question', label: 'Take a Quiz', to: '/quiz', color: 'green' },
    { icon: 'bi-graph-up', label: 'View Scores', to: '/scores', color: 'orange' },
  ]

  return (
    <div className="dashboard-page">
      <div className="container py-4">

        {/* ── Welcome Banner ── */}
        <div className="welcome-banner mb-4">
          <div className="welcome-banner__content">
            <div>
              {/* profile?.name uses optional chaining — safe even if profile is null */}
              {/* split(' ')[0] gets only the first name */}
              <h1 className="welcome-banner__title">
                {getGreeting()}, {profile?.name.split(' ')[0]}! 👋
              </h1>
              <p className="welcome-banner__subtitle">
                <i className="bi bi-mortarboard me-1"></i>
                {profile?.grade} &nbsp;·&nbsp;
                <i className="bi bi-star me-1"></i>
                {profile?.subject}
              </p>
            </div>
            <div className="welcome-banner__actions">
              <Link to="/add-note" className="btn sb-btn-primary">
                <i className="bi bi-plus-lg me-2"></i>Add Note
              </Link>
              <Link to="/quiz" className="btn sb-btn-outline ms-2">
                <i className="bi bi-patch-question me-2"></i>Take Quiz
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        {/* stats.map loops through the 4 stat objects and renders either shimmer or StatCard */}
        <div className="row g-3 mb-4">
          {stats.map((stat, i) => (
            <div key={i} className="col-6 col-lg-3">
              {loading ? (
                // shimmer shaped like a stat card — icon square + label + value
                <div className="stat-shimmer-card">
                  <Shimmer height="52px" width="52px" borderRadius="12px" className="mb-3" />
                  <Shimmer height="13px" width="70px" className="mb-2" borderRadius="4px" />
                  <Shimmer height="28px" width="55px" borderRadius="6px" />
                </div>
              ) : (
                // {...stat} spreads all properties of the stat object as props
                <StatCard {...stat} />
              )}
            </div>
          ))}
        </div>

        {/* ── Main Content ── */}
        <div className="row g-4">

          {/* Recent Notes — takes 8 of 12 Bootstrap columns on large screens */}
          <div className="col-lg-8">
            <div className="section-card">
              <div className="section-card__header">
                <h4 className="section-card__title">
                  <i className="bi bi-clock-history me-2 text-purple"></i>
                  Recent Notes
                </h4>
                <Link to="/notes" className="section-card__link">
                  View all <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>

              {/* three possible states: loading → shimmers, has notes → NoteCards, no notes → empty state */}
              {loading ? (
                <div className="d-flex flex-column gap-3">
                  {/* [1, 2, 3].map creates 3 shimmer placeholders */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="note-shimmer-item">
                      <div className="d-flex justify-content-between mb-2">
                        <Shimmer height="20px" width="100px" borderRadius="20px" />
                        <Shimmer height="14px" width="60px" borderRadius="4px" />
                      </div>
                      <Shimmer height="18px" width="70%" className="mb-2" borderRadius="5px" />
                      <Shimmer height="13px" width="40%" className="mb-2" borderRadius="4px" />
                      <Shimmer height="13px" width="95%" className="mb-1" borderRadius="4px" />
                      <Shimmer height="13px" width="80%" borderRadius="4px" />
                    </div>
                  ))}
                </div>
              ) : recentNotes.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {recentNotes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              ) : (
                // empty state — shown when student has no notes yet
                <div className="empty-state">
                  <div className="empty-state__icon">
                    <i className="bi bi-journal-plus"></i>
                  </div>
                  <h5>No notes yet</h5>
                  <p>Create your first note and let AI help you revise</p>
                  <Link to="/add-note" className="btn sb-btn-primary">
                    <i className="bi bi-plus-lg me-2"></i>Add Your First Note
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — takes 4 of 12 Bootstrap columns on large screens */}
          <div className="col-lg-4">

            {/* Quick Actions */}
            <div className="section-card mb-4">
              <div className="section-card__header">
                <h4 className="section-card__title">
                  <i className="bi bi-lightning-charge me-2 text-orange"></i>
                  Quick Actions
                </h4>
              </div>
              <div className="d-flex flex-column gap-2">
                {quickActions.map((action, i) => (
                  <Link
                    key={i}
                    to={action.to}
                    className={`quick-action-btn quick-action-btn--${action.color}`}
                  >
                    <i className={`bi ${action.icon}`}></i>
                    <span>{action.label}</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quiz Stats — only shown when loading is done AND there are scores */}
            {!loading && scores.length > 0 && (
              <div className="section-card">
                <div className="section-card__header">
                  <h4 className="section-card__title">
                    <i className="bi bi-bar-chart me-2 text-blue"></i>
                    Quiz Stats
                  </h4>
                </div>
                <div className="quiz-stats">
                  <div className="quiz-stat">
                    <span className="quiz-stat__label">Total Attempts</span>
                    <span className="quiz-stat__value">{scores.length}</span>
                  </div>
                  <div className="quiz-stat">
                    <span className="quiz-stat__label">Latest Score</span>
                    <span className="quiz-stat__value text-success">{latestScore}%</span>
                  </div>
                  <div className="quiz-stat">
                    <span className="quiz-stat__label">Best Score</span>
                    <span className="quiz-stat__value" style={{ color: '#ea580c' }}>
                      {bestScore}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
