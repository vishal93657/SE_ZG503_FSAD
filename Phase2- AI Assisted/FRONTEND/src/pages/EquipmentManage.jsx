import { useState } from 'react'
import { useEquipment } from '../context/EquipmentContext'
import EquipmentForm from '../components/EquipmentForm'
import './EquipmentManage.css'
import { Alert, Box} from '@mui/material'

const EquipmentManage = () => {
  const { equipment, deleteEquipment } = useEquipment()
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState(null)

  const handleEdit = (item) => {
    setError(null)
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = async(id) => {
    setError(null)
    try {
      await deleteEquipment(id)
    } catch (error) {
      console.log('VISHAL', error)
      const errorMessage = error.message || error.detail || String(error)
      setError(`Failed to delete equipment: ${errorMessage}`)
      console.error('Delete error:', error)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
    setError(null)
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
      {error && (
        <Box sx={{ my: 2 }}>
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Box>
      )}

      {showForm && (
        <EquipmentForm
          equipment={editingItem}
          onClose={handleFormClose}
        />
      )}

      <div className="equipment-table-container card">
        <h2>All Equipment</h2>
        {equipment.length === 0 ? (
          <p className="empty-state">No equipment added yet.</p>
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


