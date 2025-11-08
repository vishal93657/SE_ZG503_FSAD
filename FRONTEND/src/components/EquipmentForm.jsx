import { useState, useEffect } from 'react'
import { useEquipment } from '../context/EquipmentContext'
import './Modal.css'

const EquipmentForm = ({ equipment, onClose }) => {
  const { addEquipment, updateEquipment } = useEquipment()
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    condition: 'Good',
    quantity: 1
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        category: equipment.category || '',
        condition: equipment.condition || 'Good',
        quantity: equipment.quantity || 1
      })
    }
  }, [equipment])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'quantity' 
        ? parseInt(e.target.value) || 0
        : e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.name.trim()) {
      setError('Equipment name is required')
      setLoading(false)
      return
    }

    if (!formData.category.trim()) {
      setError('Category is required')
      setLoading(false)
      return
    }

    if (formData.quantity < 1) {
      setError('Quantity must be at least 1')
      setLoading(false)
      return
    }

    try {
      if (equipment) {
        const currentAvailable = equipment.available || 0
        const newAvailable = Math.max(0, Math.min(currentAvailable, formData.quantity))
        await updateEquipment(equipment.id, {
          ...formData,
          available: newAvailable
        })
      } else {
        await addEquipment(formData)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save equipment')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'Sports',
    'Lab Equipment',
    'Electronics',
    'Musical Instruments',
    'Project Materials',
    'Other'
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{equipment ? 'Edit Equipment' : 'Add New Equipment'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Equipment Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Basketball Kit"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Condition *</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Total Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : equipment ? 'Update' : 'Add'} Equipment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EquipmentForm

