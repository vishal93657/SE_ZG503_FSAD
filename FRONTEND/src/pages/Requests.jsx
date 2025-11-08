import { useState } from 'react'
import { useEquipment } from '../context/EquipmentContext'
import './Requests.css'

const Requests = () => {
  const { requests, updateRequest, equipment } = useEquipment()
  const [error, setError] = useState('')
  const [loadingRequestId, setLoadingRequestId] = useState(null)

  const handleApprove = async (requestId) => {
    try {
      setError('')
      setLoadingRequestId(requestId)
      await updateRequest(requestId, { status: 'approved' })
    } catch (err) {
      setError(err.message || 'Failed to approve request')
      console.error('Error approving request:', err)
    } finally {
      setLoadingRequestId(null)
    }
  }

  const handleReject = async (requestId) => {
    try {
      setError('')
      setLoadingRequestId(requestId)
      await updateRequest(requestId, { status: 'rejected' })
    } catch (err) {
      setError(err.message || 'Failed to reject request')
      console.error('Error rejecting request:', err)
    } finally {
      setLoadingRequestId(null)
    }
  }

  const handleReturn = async (requestId) => {
    try {
      setError('')
      setLoadingRequestId(requestId)
      await updateRequest(requestId, { status: 'returned' })
    } catch (err) {
      setError(err.message || 'Failed to mark as returned')
      console.error('Error marking as returned:', err)
    } finally {
      setLoadingRequestId(null)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      returned: 'badge-info'
    }
    return badges[status] || 'badge-info'
  }

  const sortedRequests = [...requests].sort((a, b) => 
    new Date(b.createdAt || b.borrow_date || 0) - new Date(a.createdAt || a.borrow_date || 0)
  )

  const pendingRequests = sortedRequests.filter(req => req.status === 'pending')
  const otherRequests = sortedRequests.filter(req => req.status !== 'pending')

  return (
    <div className="container">
      <div className="requests-header">
        <h1>Borrowing Requests</h1>
        <p>Review and manage equipment borrowing requests</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="card empty-state">
          <p>No requests found.</p>
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <div className="requests-section">
              <h2>Pending Requests ({pendingRequests.length})</h2>
              <div className="requests-grid">
                {pendingRequests.map(request => {
                  const equipmentItem = equipment.find(eq => eq.id === request.equipmentId)
                  return (
                    <div key={request.id} className="request-card card">
                      <div className="request-card-header">
                        <div>
                          <h3>{equipmentItem?.name || request.equipmentName || 'Unknown Equipment'}</h3>
                          <p className="request-user">Requested by: {request.userName || `User ID: ${request.userId}`}</p>
                        </div>
                        <span className={`badge ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="request-details">
                        <div className="detail-row">
                          <span className="detail-label">Category:</span>
                          <span className="detail-value">{equipmentItem?.category || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{request.quantity || 1}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Borrow Date:</span>
                          <span className="detail-value">
                            {request.startDate || request.borrow_date 
                              ? new Date(request.startDate || request.borrow_date).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Return Date:</span>
                          <span className="detail-value">
                            {request.endDate || request.return_date
                              ? new Date(request.endDate || request.return_date).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                        {request.purpose && (
                          <div className="detail-row">
                            <span className="detail-label">Purpose:</span>
                            <span className="detail-value">{request.purpose}</span>
                          </div>
                        )}
                        {(request.createdAt || request.borrow_date) && (
                          <div className="detail-row">
                            <span className="detail-label">Requested:</span>
                            <span className="detail-value">
                              {new Date(request.createdAt || request.borrow_date).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="request-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(request.id)}
                          disabled={loadingRequestId === request.id}
                        >
                          {loadingRequestId === request.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(request.id)}
                          disabled={loadingRequestId === request.id}
                        >
                          {loadingRequestId === request.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {otherRequests.length > 0 && (
            <div className="requests-section">
              <h2>All Requests ({otherRequests.length})</h2>
              <div className="requests-grid">
                {otherRequests.map(request => {
                  const equipmentItem = equipment.find(eq => eq.id === request.equipmentId)
                  return (
                    <div key={request.id} className="request-card card">
                      <div className="request-card-header">
                        <div>
                          <h3>{equipmentItem?.name || request.equipmentName || 'Unknown Equipment'}</h3>
                          <p className="request-user">Requested by: {request.userName || `User ID: ${request.userId}`}</p>
                        </div>
                        <span className={`badge ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="request-details">
                        <div className="detail-row">
                          <span className="detail-label">Category:</span>
                          <span className="detail-value">{equipmentItem?.category || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{request.quantity || 1}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Borrow Date:</span>
                          <span className="detail-value">
                            {request.startDate || request.borrow_date 
                              ? new Date(request.startDate || request.borrow_date).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Return Date:</span>
                          <span className="detail-value">
                            {request.endDate || request.return_date
                              ? new Date(request.endDate || request.return_date).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                        {request.purpose && (
                          <div className="detail-row">
                            <span className="detail-label">Purpose:</span>
                            <span className="detail-value">{request.purpose}</span>
                          </div>
                        )}
                      </div>

                      {request.status === 'approved' && (
                        <div className="request-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleReturn(request.id)}
                            disabled={loadingRequestId === request.id}
                          >
                            {loadingRequestId === request.id ? 'Processing...' : 'Mark as Returned'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Requests


