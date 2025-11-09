import { useState, useEffect } from 'react'
import { useEquipment } from '../context/EquipmentContext'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Box,
  IconButton,
} from '@mui/material'
import { Close as CloseIcon, Height } from '@mui/icons-material'

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
    'Musical Instruments',
    'Study Materials',
    'Other'
  ]

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {equipment ? 'Edit Equipment' : 'Add New Equipment'}
          <IconButton onClick={onClose} size="small"> 
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit} id="equipment-form">
          {error && (
            <Alert severity="error" sx={{ mb: 2}}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Equipment Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Football"
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
              required
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Condition</InputLabel>
            <Select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              label="Condition"
              required
            >
              <MenuItem value="Excellent">Excellent</MenuItem>
              <MenuItem value="Good">Good</MenuItem>
              <MenuItem value="Fair">Fair</MenuItem>
              <MenuItem value="Poor">Poor</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Total Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            required
            sx={{ mb: 2 }}
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="equipment-form"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : equipment ? 'Update' : 'Add'} Equipment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EquipmentForm
