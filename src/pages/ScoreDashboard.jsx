import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Shimmer from '../components/Shimmer'
import { getScores } from '../utils/localStorage'
import './ScoreDashboard.css'

const ScoreDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState([])

  // load scores with a short delay so shimmer is visible
  useEffect(() => {
    const timer = setTimeout(() => {
      setScores(getScores())
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // ── Derived stats ──────────────────────────────────────────────────────────

  // scores are stored newest-first (unshift in saveScore), so index 0 is the latest
  const latestScore = scores.length > 0 ? scores[0].score : null

  // Math.max with spread finds the highest value in the array
  const bestScore = scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : null

  // average = sum of all scores divided by count, rounded to nearest whole number
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
      : null

  // format ISO date string to readable format like "16 Jun 2024, 10:30 AM"
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  // returns a color class based on score percentage
  const scoreColor = (score) => {
    if (score >= 80) return 'green'
    if (score >= 50) return 'orange'
    return 'red'
  }

  // stat cards data — same pattern as Dashboard to keep the codebase consistent
  const stats = [
    {
      icon: 'bi-patch-question-fill',
      label: 'Total Quizzes',
      value: scores.length,
      color: 'purple',
    },
    {
      icon: 'bi-star-fill',
      label: 'Best Score',
      value: bestScore !== null ? `${bestScore}%` : '—',
      color: 'orange',
    },
    {
      icon: 'bi-graph-up',
      label: 'Average Score',
      value: avgScore !== null ? `${avgScore}%` : '—',
      color: 'blue',
    },
    {
      icon: 'bi-trophy-fill',
      label: 'Latest Score',
      value: latestScore !== null ? `${latestScore}%` : '—',
      color: 'green',
    },
  ]

  return (
    <div className="scores-page">
      <div className="container py-4">

        {/* ── Page Header ── */}
        <div className="scores-header mb-4">
          <div>
            <h2 className="scores-title">Quiz Scores</h2>
            <p className="scores-subtitle">
              {loading
                ? 'Loading your scores...'
                : scores.length > 0
                ? `${scores.length} ${scores.length === 1 ? 'quiz' : 'quizzes'} completed`
                : 'No quizzes taken yet'}
            </p>
          </div>
          <Link to="/quiz" className="btn sb-btn-primary">
            <i className="bi bi-patch-question me-2"></i>Take a Quiz
          </Link>
        </div>

        {/* ── Stat Cards ── */}
        <div className="row g-3 mb-4">
          {stats.map((stat, i) => (
            <div key={i} className="col-6 col-lg-3">
              {loading ? (
                // shimmer shaped like a stat card
                <div className="score-stat-shimmer">
                  <Shimmer height="48px" width="48px" borderRadius="12px" className="mb-3" />
                  <Shimmer height="12px" width="70px" className="mb-2" borderRadius="4px" />
                  <Shimmer height="26px" width="55px" borderRadius="6px" />
                </div>
              ) : (
                // real stat card
                <div className={`score-stat-card score-stat-card--${stat.color}`}>
                  <div className="score-stat-card__icon">
                    <i className={`bi ${stat.icon}`}></i>
                  </div>
                  <p className="score-stat-card__label">{stat.label}</p>
                  <p className="score-stat-card__value">{stat.value}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Score History ── */}
        <div className="scores-card">
          <h5 className="scores-card__title">
            <i className="bi bi-clock-history me-2 text-purple"></i>Quiz History
          </h5>

          {loading ? (
            // shimmer rows for history list
            <div className="d-flex flex-column gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="score-item-shimmer">
                  <Shimmer height="40px" width="40px" borderRadius="50%" />
                  <div className="flex-grow-1">
                    <Shimmer height="15px" width="60%" className="mb-2" borderRadius="4px" />
                    <Shimmer height="12px" width="40%" borderRadius="4px" />
                  </div>
                  <Shimmer height="30px" width="60px" borderRadius="20px" />
                </div>
              ))}
            </div>

          ) : scores.length === 0 ? (
            // empty state — no quizzes taken yet
            <div className="scores-empty">
              <div className="scores-empty__icon">
                <i className="bi bi-patch-question"></i>
              </div>
              <h5>No quizzes yet</h5>
              <p>Take your first quiz to see your scores here</p>
              <Link to="/quiz" className="btn sb-btn-primary">
                <i className="bi bi-patch-question me-2"></i>Take a Quiz
              </Link>
            </div>

          ) : (
            // list of all quiz attempts — newest first (because saveScore uses unshift)
            <div className="d-flex flex-column gap-3">
              {scores.map((s, i) => (
                <div key={s.id || i} className="score-item">

                  {/* score circle on the left */}
                  <div className={`score-item__circle score-item__circle--${scoreColor(s.score)}`}>
                    {s.score}%
                  </div>

                  {/* note title and subject in the middle */}
                  <div className="score-item__info">
                    <p className="score-item__note">{s.noteTitle || 'Quiz'}</p>
                    <div className="score-item__meta">
                      {s.subject && (
                        <span className="score-item__subject">{s.subject}</span>
                      )}
                      <span className="score-item__date">{formatDate(s.date)}</span>
                    </div>
                  </div>

                  {/* correct/total badge on the right */}
                  <div className={`score-item__badge score-item__badge--${scoreColor(s.score)}`}>
                    {s.correct}/{s.total} correct
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ScoreDashboard
