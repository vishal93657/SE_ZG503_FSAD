import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEquipment } from '../context/EquipmentContext'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material'
import { Close as CloseIcon, Inventory as InventoryIcon } from '@mui/icons-material'
import { IconButton } from '@mui/material'

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
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Request Equipment
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Request submitted successfully!
          </Alert>
        ) : (
          <>
            <Box 
              mb={3} 
              p={2} 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {equipment.name}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                <Chip
                  icon={<InventoryIcon />}
                  label={equipment.category}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Available: ${equipment.available} / ${equipment.quantity}`}
                  size="small"
                  color={equipment.available > 0 ? 'success' : 'error'}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                inputProps={{ min: 1, max: equipment.available }}
                required
                sx={{ mb: 2 }}
                helperText={`Available: ${equipment.available} item(s)`}
              />

              <TextField
                fullWidth
                label="Return Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
                required
                sx={{ mb: 2 }}
              />

              <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogActions>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default RequestModal
