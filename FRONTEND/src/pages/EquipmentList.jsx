import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEquipment } from '../context/EquipmentContext'
import RequestModal from '../components/RequestModal'
import './EquipmentList.css'

const EquipmentList = () => {
  const { user } = useAuth()
  const { equipment } = useEquipment()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const categories = ['all', ...new Set(equipment.map(eq => eq.category))]

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || eq.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleRequest = (item) => {
    if (user.role === 'admin' || user.role === 'lab_assistant') {
      alert('Admins and lab assistants cannot request equipment')
      return
    }
    setSelectedEquipment(item)
    setShowModal(true)
  }

  return (
    <div className="container">
      <div className="equipment-header">
        <h1>Equipment Catalog</h1>
        <p>Browse and request available equipment</p>
      </div>

      <div className="filters card">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-input"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="equipment-grid grid grid-3">
        {filteredEquipment.length === 0 ? (
          <div className="card empty-state">
            <p>No equipment found matching your criteria.</p>
          </div>
        ) : (
          filteredEquipment.map(item => (
            <div key={item.id} className="equipment-card">
              <div className="equipment-header-card">
                <h3>{item.name}</h3>
                <span className={`badge badge-${item.available > 0 ? 'success' : 'danger'}`}>
                  {item.available > 0 ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="equipment-info">
                <p className="equipment-category">📁 {item.category}</p>
                <p className="equipment-description">{item.description}</p>
                <div className="equipment-details">
                  <div className="detail-item">
                    <span className="detail-label">Condition:</span>
                    <span className="detail-value">{item.condition}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Available:</span>
                    <span className="detail-value">{item.available} / {item.quantity}</span>
                  </div>
                </div>
              </div>
              {(user.role === 'student' || user.role === 'staff') && (
                <button
                  onClick={() => handleRequest(item)}
                  disabled={item.available === 0}
                  className={`btn btn-primary btn-block ${item.available === 0 ? 'btn-disabled' : ''}`}
                >
                  {item.available > 0 ? 'Request Equipment' : 'Not Available'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && selectedEquipment && (
        <RequestModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowModal(false)
            setSelectedEquipment(null)
          }}
        />
      )}
    </div>
  )
}

export default EquipmentList


