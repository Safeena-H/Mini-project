import { Link, useLocation } from 'react-router-dom'
import { getProfile } from '../utils/localStorage'
import './Navbar.css'

const Navbar = () => {
  // read profile to show the student's initial in the avatar circle
  const profile = getProfile()

  // useLocation gives us the current URL path like '/dashboard' or '/add-note'
  const location = useLocation()

  // returns true if the current page matches the given path
  // used to highlight the active nav link
  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar navbar-expand-lg sb-navbar">
      <div className="container">

        {/* brand logo — clicking it goes to dashboard */}
        <Link className="navbar-brand sb-brand" to="/dashboard">
          <i className="bi bi-book-half me-2"></i>
          StudyBuddy
        </Link>

        {/* hamburger button — only visible on mobile, collapses/expands nav links */}
        <button
          className="navbar-toggler sb-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sbNavbar"
          aria-controls="sbNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list"></i>
        </button>

        {/* nav links — hidden on mobile until hamburger is clicked */}
        <div className="collapse navbar-collapse" id="sbNavbar">
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            <li className="nav-item">
              {/* 'active' class is added only when we are on the dashboard page */}
              <Link
                className={`nav-link sb-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                to="/dashboard"
              >
                <i className="bi bi-grid me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link sb-nav-link ${isActive('/notes') ? 'active' : ''}`}
                to="/notes"
              >
                <i className="bi bi-journal-text me-1"></i> My Notes
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link sb-nav-link ${isActive('/add-note') ? 'active' : ''}`}
                to="/add-note"
              >
                <i className="bi bi-journal-plus me-1"></i> Add Note
              </Link>
            </li>

            {/* avatar circle — shows first letter of student's name */}
            {profile && (
              <li className="nav-item ms-2">
                <div className="sb-avatar" title={profile.name}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
