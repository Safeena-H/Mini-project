import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// Layout wraps all pages that need a Navbar
// Outlet is a placeholder — React Router fills it with the current page component
const Layout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}

export default Layout
