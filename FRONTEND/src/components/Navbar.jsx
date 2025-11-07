import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          🏫 School Equipment Lending Portal
        </Link>
        {user && (
          <div className="navbar-menu">
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <Link to="/equipment" className="navbar-link">Equipment</Link>
            {user.role === 'admin' && (
              <Link to="/equipment/manage" className="navbar-link">Manage Equipment</Link>
            )}
            {(user.role === 'admin' || user.role === 'lab_assistant') && (
              <Link to="/requests" className="navbar-link">Requests</Link>
            )}
            <div className="navbar-user">
              <span className="navbar-user-name">{user.username || user.name}</span>
              <span className="navbar-user-role">({user.role})</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

