import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEquipment } from '../context/EquipmentContext'
import { Link } from 'react-router-dom'
import './Dashboard.css'

const Dashboard = () => {
  const { user, fetchUserProfile } = useAuth()
  const { equipment, requests } = useEquipment()
  const [userRole, setUserRole] = useState(user?.role || '')
  const [loadingRole, setLoadingRole] = useState(true)

  useEffect(() => {
    const loadUserRole = async () => {
      if (user?.username) {
        setLoadingRole(true)
        const result = await fetchUserProfile(user.username)
        if (result.success && result.profile?.role) {
          setUserRole(result.profile.role)
        }
        setLoadingRole(false)
      } else {
        setLoadingRole(false)
      }
    }

    if (user?.username) {
      loadUserRole()
    }
  }, [user?.username])

  const userRequests = requests.filter(req => req.userId === user?.id)
  const pendingRequests = userRequests.filter(req => req.status === 'pending')
  const approvedRequests = userRequests.filter(req => req.status === 'approved')
  const availableEquipment = equipment.filter(eq => eq.available > 0).length

  const displayRole = userRole || user?.role || 'N/A'
  const formattedRole = displayRole.replace('_', ' ').toUpperCase()

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username || user?.name}!</h1>
        <p className="dashboard-subtitle">
          Role: {loadingRole ? 'Loading...' : formattedRole}
        </p>
      </div>

      <div className="dashboard-stats grid grid-4">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{equipment.length}</div>
          <div className="stat-label">Total Equipment</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{availableEquipment}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{pendingRequests.length}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-value">{approvedRequests.length}</div>
          <div className="stat-label">Active Borrows</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/equipment" className="action-btn">
              <span className="action-icon">🔍</span>
              <span>Browse Equipment</span>
            </Link>
            {(userRole === 'admin' || user?.role === 'admin') && (
              <Link to="/equipment/manage" className="action-btn">
                <span className="action-icon">⚙️</span>
                <span>Manage Equipment</span>
              </Link>
            )}
            {(userRole === 'admin' || userRole === 'lab_assistant' || 
              user?.role === 'admin' || user?.role === 'lab_assistant') && (
              <Link to="/requests" className="action-btn">
                <span className="action-icon">📋</span>
                <span>Review Requests</span>
              </Link>
            )}
          </div>
        </div>

        <div className="card">
          <h2>My Recent Requests</h2>
          {userRequests.length === 0 ? (
            <p className="empty-state">No requests yet. Start by browsing equipment!</p>
          ) : (
            <div className="request-list">
              {userRequests.slice(0, 5).map(request => {
                const equipmentItem = equipment.find(eq => eq.id === request.equipmentId)
                return (
                  <div key={request.id} className="request-item">
                    <div className="request-info">
                      <strong>{equipmentItem?.name || 'Unknown'}</strong>
                      <span className={`badge badge-${request.status === 'approved' ? 'success' : request.status === 'pending' ? 'warning' : 'danger'}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="request-dates">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

