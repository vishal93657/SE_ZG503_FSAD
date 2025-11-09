import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEquipment } from '../context/EquipmentContext'
import RequestModal from '../components/RequestModal'
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  Alert,
} from '@mui/material'
import { Search as SearchIcon, Inventory as InventoryIcon } from '@mui/icons-material'

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Equipment Catalog
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and request available equipment
        </Typography>
      </Box>

      <Box mb={4} display="flex" gap={2} flexWrap="wrap">
        <TextField
          placeholder="Search equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredEquipment.length === 0 ? (
        <Alert severity="info">No equipment found matching your criteria.</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredEquipment.map(item => (
            <Grid item xs={12} sm={6} md={6} key={item.id}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: 320}}>
                <CardContent sx={{ flexGrow: 1}}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h3" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Chip
                      label={item.available > 0 ? 'Available' : 'Unavailable'}
                      color={item.available > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Chip
                      icon={<InventoryIcon />}
                      label={item.category}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    {item.description && (
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {item.description}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Condition:</strong> {item.condition}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Available:</strong> {item.available} / {item.quantity}
                    </Typography>
                  </Box>
                </CardContent>

                {(user.role === 'student' || user.role === 'teacher') && (
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleRequest(item)}
                      disabled={item.available === 0}
                    >
                      {item.available > 0 ? 'Request Equipment' : 'Not Available'}
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {showModal && selectedEquipment && (
        <RequestModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowModal(false)
            setSelectedEquipment(null)
          }}
        />
      )}
    </Container>
  )
}

export default EquipmentList
