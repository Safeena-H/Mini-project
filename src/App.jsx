import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProfileSetup from './pages/ProfileSetup'
import Dashboard from './pages/Dashboard'
import AddNote from './pages/AddNote'
import NotesList from './pages/NotesList'
import NoteDetail from './pages/NoteDetail'
import Quiz from './pages/Quiz'
import { getProfile } from './utils/localStorage'

// ProtectedRoute runs every time a protected URL is visited
// so getProfile() is always fresh — not stuck with the old value
const ProtectedRoute = () => {
  const profile = getProfile()
  // if profile exists → show the page (inside Layout which has Navbar)
  // if no profile → send to profile setup
  return profile ? <Layout /> : <Navigate to="/profile" replace />
}

// GuestRoute runs every time /profile is visited
const GuestRoute = () => {
  const profile = getProfile()
  // if profile already exists → skip setup, go to dashboard
  // if no profile → show the setup form
  return profile ? <Navigate to="/dashboard" replace /> : <ProfileSetup />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* root always tries dashboard — ProtectedRoute handles the profile check */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* /profile uses GuestRoute so it checks localStorage every time */}
        <Route path="/profile" element={<GuestRoute />} />

        {/* all protected pages go inside ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-note" element={<AddNote />} />
          <Route path="/notes" element={<NotesList />} />
          {/* :id is a URL parameter — matches any note id like /notes/1718123456789 */}
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/quiz" element={<Quiz />} />
        </Route>

        {/* any unknown URL → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
