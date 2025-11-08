import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEquipment } from '../context/EquipmentContext'
import { Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material'
import {
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ListAlt as ListAltIcon,
} from '@mui/icons-material'

const Dashboard = () => {
  const { user, fetchUserProfile } = useAuth()
  const { equipment, requests } = useEquipment()
  const [userRole, setUserRole] = useState(user?.role || '')
  const [loadingRole, setLoadingRole] = useState(true)

  useEffect(() => {
    const loadUserRole = async () => {
      if (user?.username) {
        setLoadingRole(true)
        const result = await fetchUserProfile(user.username)
        if (result.success && result.profile?.role) {
          setUserRole(result.profile.role)
        }
        setLoadingRole(false)
      } else {
        setLoadingRole(false)
      }
    }

    if (user?.username) {
      loadUserRole()
    }
  }, [user?.username])

  const availableEquipment = equipment.filter(eq => eq.available > 0).length

  const displayRole = userRole || user?.role || 'N/A'
  const formattedRole = displayRole.replace('_', ' ').toUpperCase()
  
  const isAdminOrLabAssistant = displayRole === 'admin' || displayRole === 'lab_assistant' || 
                                 user?.role === 'admin' || user?.role === 'lab_assistant'
  
  const userRequests = isAdminOrLabAssistant 
    ? requests 
    : requests.filter(req => req.userId === user?.id)
  const pendingRequests = userRequests.filter(req => req.status === 'pending')
  const approvedRequests = userRequests.filter(req => req.status === 'approved')

  const StatCard = ({ icon: Icon, value, label, color = 'primary' }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {label}
            </Typography>
          </Box>
          <Icon sx={{ fontSize: 48, color: `${color}.main`, opacity: 0.3 }} />
        </Box>
      </CardContent>
    </Card>
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  return (
    <Container maxWidth="lg" sx={{py:4}}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome, {user?.username || user?.name}!
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1" color="text.secondary" fontWeight="bold">
            Role:
          </Typography>
          {loadingRole ? (
            <CircularProgress size={16} />
          ) : (
            <Chip label={formattedRole} size="small" color="primary" variant="outlined" />
          )}
        </Box>
      </Box>

      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} sm={6} md={6} sx={{minWidth:220}}>
          <StatCard
            icon={InventoryIcon}
            value={equipment.length}
            label="Total Equipment"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6} sx={{minWidth:220}}>
          <StatCard
            icon={CheckCircleIcon}
            value={availableEquipment}
            label="Available"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6} sx={{minWidth:220}}>
          <StatCard
            icon={PendingIcon}
            value={pendingRequests.length}
            label={isAdminOrLabAssistant ? 'Pending Requests' : 'My Pending Requests'}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6} sx={{minWidth:220}}>
          <StatCard
            icon={AssignmentIcon}
            value={approvedRequests.length}
            label={isAdminOrLabAssistant ? 'Active Borrows' : 'My Active Borrows'}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} sx={{minWidth:320}}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/equipment"
                  startIcon={<SearchIcon />}
                  size="large"
                >
                  Browse Equipment
                </Button>
                {(userRole === 'admin' || user?.role === 'admin') && (
                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to="/equipment/manage"
                    startIcon={<SettingsIcon />}
                    size="large"
                  >
                    Manage Equipment
                  </Button>
                )}
                {(userRole === 'admin' || userRole === 'lab_assistant' || 
                  user?.role === 'admin' || user?.role === 'lab_assistant') && (
                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to="/requests"
                    startIcon={<ListAltIcon />}
                    size="large"
                  >
                    Review Requests
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} sx={{minWidth:520}}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                My Recent Requests
              </Typography>
              <Divider sx={{ my: 2 }} />
              {userRequests.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                  No requests yet. Start by browsing equipment!
                </Typography>
              ) : (
                <Box>
                  {userRequests.slice(0, 5).map((request, index) => {
                    const equipmentItem = equipment.find(eq => eq.id === request.equipmentId)
                    return (
                      <Box key={request.id}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5}>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {equipmentItem?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(request.startDate || request.borrow_date).toLocaleDateString()} - {new Date(request.endDate || request.return_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip
                            label={request.status}
                            size="small"
                            color={getStatusColor(request.status)}
                          />
                        </Box>
                        {index < userRequests.slice(0, 5).length - 1 && <Divider />}
                      </Box>
                    )
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard
