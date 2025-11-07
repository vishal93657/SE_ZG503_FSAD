import { useState } from 'react'
import { useEquipment } from '../context/EquipmentContext'
import EquipmentForm from '../components/EquipmentForm'
import './EquipmentManage.css'

const EquipmentManage = () => {
  const { equipment, deleteEquipment } = useEquipment()
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      deleteEquipment(id)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  return (
    <div className="container">
      <div className="manage-header">
        <h1>Manage Equipment</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingItem(null)
            setShowForm(true)
          }}
        >
          + Add New Equipment
        </button>
      </div>

      {showForm && (
        <EquipmentForm
          equipment={editingItem}
          onClose={handleFormClose}
        />
      )}

      <div className="equipment-table-container card">
        <h2>All Equipment</h2>
        {equipment.length === 0 ? (
          <p className="empty-state">No equipment added yet. Click "Add New Equipment" to get started.</p>
        ) : (
          <div className="table-responsive">
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Quantity</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      {item.description && (
                        <div className="table-description">{item.description}</div>
                      )}
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <span className={`badge badge-${item.condition === 'Excellent' ? 'success' : item.condition === 'Good' ? 'info' : 'warning'}`}>
                        {item.condition}
                      </span>
                    </td>
                    <td>{item.quantity}</td>
                    <td>
                      <span className={item.available > 0 ? 'text-success' : 'text-danger'}>
                        {item.available}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default EquipmentManage


