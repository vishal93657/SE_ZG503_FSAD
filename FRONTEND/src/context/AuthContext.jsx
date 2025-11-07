import { createContext, useContext, useState, useEffect } from 'react'
import api from '../config/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await api.post('/login', {
        username,
        password
      })
      
      const token = response.data.access_token
      
      if (!token) {
        return { success: false, error: 'No token received from server' }
      }
      
      localStorage.setItem('token', token)
      window.dispatchEvent(new Event('tokenSet'))
      let userData = response.data.user || response.data.data
      if (!userData && token) {
        try {
          const base64Url = token.split('.')[1]
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            )
            const decoded = JSON.parse(jsonPayload)
            userData = {
              id: decoded.sub || decoded.id || decoded.user_id,
              username: decoded.username || decoded.preferred_username || username,
              email: decoded.email,
              role: decoded.role || decoded.user_role
            }
          }
        } catch (e) {
          userData = {
            id: Date.now(),
            username: username,
            role: 'student'
          }
        }
      }

      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        return { success: true, user: userData }
      } else {
        return { success: false, error: 'Unable to retrieve user information' }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Login failed. Please check your credentials.'
      return { success: false, error: errorMessage }
    }
  }

  const signup = async (username, email, role, password) => {
    try {
      const response = await api.post('/signup', {
        username,
        email,
        role: role || 'student',
        password
      })
      
      const userData = response.data.user || response.data.data || response.data

      const authHeader = response.headers.authorization || response.headers.Authorization
      const token = response.data.token || 
                   response.data.accessToken || 
                   response.data.access_token ||
                   (authHeader ? authHeader.replace('Bearer ', '') : null)
      
      if (userData) {
        if (token) {
          localStorage.setItem('token', token)
        }
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        return { success: true, user: userData }
      } else {
        return { success: false, error: 'Invalid response from server' }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Signup failed. Please try again.'
      return { success: false, error: errorMessage }
    }
  }

  const fetchUserProfile = async (username) => {
    try {
      const response = await api.get(`/profile/${username}`)
      const profileData = response.data

      if (profileData && user) {
        const updatedUser = {
          ...user,
          ...profileData,
          role: profileData.role || user.role
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return { success: true, profile: profileData }
      }
      
      return { success: false, error: 'Unable to fetch profile' }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Failed to fetch user profile'
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    fetchUserProfile,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

