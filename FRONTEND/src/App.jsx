import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { EquipmentProvider } from './context/EquipmentContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import EquipmentList from './pages/EquipmentList'
import EquipmentManage from './pages/EquipmentManage'
import Requests from './pages/Requests'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <EquipmentProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/equipment"
                element={
                  <PrivateRoute>
                    <EquipmentList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/equipment/manage"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <EquipmentManage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/requests"
                element={
                  <PrivateRoute allowedRoles={['admin', 'lab_assistant']}>
                    <Requests />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </EquipmentProvider>
    </AuthProvider>
  )
}

export default App

