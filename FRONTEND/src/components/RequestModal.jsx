import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEquipment } from '../context/EquipmentContext'
import './Modal.css'

const RequestModal = ({ equipment, onClose }) => {
  const { user } = useAuth()
  const { createRequest, checkAvailability } = useEquipment()
  const [formData, setFormData] = useState({
    endDate: '',
    quantity: 1
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.endDate) {
      setError('Please select a return date')
      return
    }

    if (new Date(formData.endDate) < new Date()) {
      setError('Return date must be in the future')
      return
    }

    const quantity = parseInt(formData.quantity, 10)
    if (!quantity || quantity < 1) {
      setError('Quantity must be at least 1')
      return
    }

    if (quantity > equipment.available) {
      setError(`Only ${equipment.available} item(s) available. Please request a smaller quantity.`)
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const isAvailable = checkAvailability(
      equipment.id,
      today,
      formData.endDate
    )

    if (!isAvailable) {
      setError('This equipment is not available for the selected dates. Please choose different dates.')
      return
    }

    try {
      setLoading(true)
      const request = {
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        userId: user.id,
        userName: user.username || user.name,
        startDate: today,
        endDate: formData.endDate,
        return_date: formData.endDate,
        quantity: quantity
      }

      await createRequest(request)
      setSuccess(true)
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  max={equipment.available}
                  required
                />
                <small className="form-help-text">
                  Available: {equipment.available} item(s)
                </small>
              </div>

              <div className="form-group">
                <label>Return Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
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

