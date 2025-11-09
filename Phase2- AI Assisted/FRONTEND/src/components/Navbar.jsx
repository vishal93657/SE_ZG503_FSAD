import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
  School as SchoolIcon,
  NotificationImportant,
} from '@mui/icons-material'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleLogout = () => {
    handleMenuClose()
    logout()
    navigate('/login')
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <SchoolIcon sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component={Link}
          to="/dashboard"
          sx={{
            flexGrow: 0,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
          }}
        >
          SCHOOL EQUIPMENT LENDING PORTAL
        </Typography>
        
        {user && (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, ml: 3 }}>
              <Button
                color="inherit"
                component={Link}
                to="/dashboard"
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/equipment"
                startIcon={<InventoryIcon />}
              >
                Equipment
              </Button>
              {user.role === 'admin' && (
                <Button
                  color="inherit"
                  component={Link}
                  to="/equipment/manage"
                  startIcon={<SettingsIcon />}
                >
                  Manage
                </Button>
              )}
              {(user.role === 'admin' || user.role === 'lab_assistant') && (
                <Button
                  color="inherit"
                  component={Link}
                  to="/requests"
                  startIcon={<NotificationImportant />}
                >
                  Requests
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={user.username?.replace('_', ' ').toUpperCase() || 'USER'}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
              />
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                aria-label="account menu"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    {user.username || user.name}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
