import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEquipment } from '../context/EquipmentContext'
import './Modal.css'

const RequestModal = ({ equipment, onClose }) => {
  const { user } = useAuth()
  const { createRequest, checkAvailability } = useEquipment()
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    purpose: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.startDate || !formData.endDate) {
      setError('Please select both start and end dates')
      return
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date')
      return
    }

    if (!formData.purpose.trim()) {
      setError('Please provide a purpose for borrowing')
      return
    }
    const isAvailable = checkAvailability(
      equipment.id,
      formData.startDate,
      formData.endDate
    )

    if (!isAvailable) {
      setError('This equipment is not available for the selected dates. Please choose different dates.')
      return
    }

    const request = {
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      userId: user.id,
      userName: user.username || user.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      purpose: formData.purpose
    }

    createRequest(request)
    setSuccess(true)
    
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Equipment</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="equipment-summary">
            <h3>{equipment.name}</h3>
            <p className="equipment-category">Category: {equipment.category}</p>
            <p className="equipment-available">
              Available: {equipment.available} / {equipment.quantity}
            </p>
          </div>

          {success ? (
            <div className="alert alert-success">
              Request submitted successfully! You will be notified once it's reviewed.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || today}
                  required
                />
              </div>

              <div className="form-group">
                <label>Purpose</label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the purpose for borrowing this equipment..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default RequestModal

