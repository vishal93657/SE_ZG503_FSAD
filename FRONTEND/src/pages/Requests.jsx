import { useEquipment } from '../context/EquipmentContext'
import './Requests.css'

const Requests = () => {
  const { requests, updateRequest, equipment } = useEquipment()

  const handleApprove = (requestId) => {
    updateRequest(requestId, { status: 'approved' })
  }

  const handleReject = (requestId) => {
    updateRequest(requestId, { status: 'rejected' })
  }

  const handleReturn = (requestId) => {
    updateRequest(requestId, { status: 'returned' })
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
    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )

  const pendingRequests = sortedRequests.filter(req => req.status === 'pending')
  const otherRequests = sortedRequests.filter(req => req.status !== 'pending')

  return (
    <div className="container">
      <div className="requests-header">
        <h1>Borrowing Requests</h1>
        <p>Review and manage equipment borrowing requests</p>
      </div>

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
                          <p className="request-user">Requested by: {request.userName}</p>
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
                          <span className="detail-label">Borrow Date:</span>
                          <span className="detail-value">
                            {new Date(request.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Return Date:</span>
                          <span className="detail-value">
                            {new Date(request.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Purpose:</span>
                          <span className="detail-value">{request.purpose || 'N/A'}</span>
                        </div>
                        {request.createdAt && (
                          <div className="detail-row">
                            <span className="detail-label">Requested:</span>
                            <span className="detail-value">
                              {new Date(request.createdAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="request-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
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
                          <p className="request-user">Requested by: {request.userName}</p>
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
                          <span className="detail-label">Borrow Date:</span>
                          <span className="detail-value">
                            {new Date(request.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Return Date:</span>
                          <span className="detail-value">
                            {new Date(request.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Purpose:</span>
                          <span className="detail-value">{request.purpose || 'N/A'}</span>
                        </div>
                      </div>

                      {request.status === 'approved' && (
                        <div className="request-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleReturn(request.id)}
                          >
                            Mark as Returned
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


