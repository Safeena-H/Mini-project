import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProfileSetup from './pages/ProfileSetup'
import Dashboard from './pages/Dashboard'
import AddNote from './pages/AddNote'
import NotesList from './pages/NotesList'
import { getProfile } from './utils/localStorage'

const App = () => {
  // check if student has already set up their profile
  const profile = getProfile()

  return (
    <BrowserRouter>
      <Routes>
        {/* when app opens, send to dashboard if profile exists, else profile setup */}
        <Route
          path="/"
          element={<Navigate to={profile ? '/dashboard' : '/profile'} replace />}
        />

        {/* profile setup page has no Navbar — only shown to new students */}
        <Route
          path="/profile"
          element={profile ? <Navigate to="/dashboard" replace /> : <ProfileSetup />}
        />

        {/* all pages inside here share the Layout (which has the Navbar) */}
        {/* if no profile, redirect to setup instead of showing the page */}
        <Route element={profile ? <Layout /> : <Navigate to="/profile" replace />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-note" element={<AddNote />} />
          <Route path="/notes" element={<NotesList />} />
        </Route>

        {/* catch any unknown URL and send to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
