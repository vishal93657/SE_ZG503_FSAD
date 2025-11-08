import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../config/api'

const EquipmentContext = createContext()

export const useEquipment = () => {
  const context = useContext(EquipmentContext)
  if (!context) {
    throw new Error('useEquipment must be used within an EquipmentProvider')
  }
  return context
}

export const EquipmentProvider = ({ children }) => {
  const [equipment, setEquipment] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEquipment = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/equipment')

      const equipmentData = Array.isArray(response.data) ? response.data : []
      const mappedEquipment = equipmentData.map(item => ({
        ...item,
        available: item.available_quantity !== undefined ? item.available_quantity : item.available || 0
      }))
      
      setEquipment(mappedEquipment)
    } catch (err) {
      console.error('Error fetching equipment:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch equipment')
      const storedEquipment = localStorage.getItem('equipment')
      if (storedEquipment) {
        setEquipment(JSON.parse(storedEquipment))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEquipment()
    const storedRequests = localStorage.getItem('requests')
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests))
    }
  }, [fetchEquipment])

  useEffect(() => {
    const handleTokenSet = () => {
      fetchEquipment()
    }

    window.addEventListener('tokenSet', handleTokenSet)
    
    return () => {
      window.removeEventListener('tokenSet', handleTokenSet)
    }
  }, [fetchEquipment])

  const addEquipment = async (item) => {
    try {
      const payload = {
        name: item.name,
        category: item.category,
        condition: item.condition,
        quantity: item.quantity
      }

      const response = await api.post('/equipment', payload)
      const newItem = response.data.data || response.data
      const mappedItem = {
        ...newItem,
        available: newItem.available_quantity !== undefined ? newItem.available_quantity : newItem.available || newItem.quantity || 0
      }
      setEquipment(prev => [...prev, mappedItem])
      
      return mappedItem
    } catch (err) {
      console.error('Error adding equipment:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.response?.data?.detail ||
                          err.message || 
                          'Failed to add equipment'
      throw new Error(errorMessage)
    }
  }

  const updateEquipment = (id, updates) => {
    const updated = equipment.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
    setEquipment(updated)
    localStorage.setItem('equipment', JSON.stringify(updated))
  }

  const deleteEquipment = (id) => {
    const updated = equipment.filter(item => item.id !== id)
    setEquipment(updated)
    localStorage.setItem('equipment', JSON.stringify(updated))
  }

  const createRequest = async (request) => {
    try {
      const payload = {
        user_id: request.userId,
        return_date: request.endDate || request.return_date
      }

      const response = await api.post(`/borrow/${request.equipmentId}`, payload)
      
      const newRequest = {
        ...request,
        id: response.data.id || Date.now(),
        status: response.data.status || 'pending',
        createdAt: response.data.created_at || new Date().toISOString()
      }
      
      const updated = [...requests, newRequest]
      setRequests(updated)
      localStorage.setItem('requests', JSON.stringify(updated))
      
      // Refresh equipment list to update availability
      await fetchEquipment()
      
      return newRequest
    } catch (err) {
      console.error('Error creating request:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.response?.data?.detail ||
                          err.message || 
                          'Failed to create request'
      throw new Error(errorMessage)
    }
  }

  const updateRequest = (id, updates) => {
    setRequests(prevRequests => {
      const updated = prevRequests.map(req => {
        if (req.id === id) {
          const updatedReq = { ...req, ...updates }

          if (updates.status === 'approved' && req.status === 'pending') {
            setEquipment(prevEquipment => {
              const equipmentItem = prevEquipment.find(eq => eq.id === req.equipmentId)
              if (equipmentItem && equipmentItem.available > 0) {
                const updated = prevEquipment.map(item =>
                  item.id === req.equipmentId
                    ? { ...item, available: item.available - 1 }
                    : item
                )
                localStorage.setItem('equipment', JSON.stringify(updated))
                return updated
              }
              return prevEquipment
            })
          }
          
          if (updates.status === 'returned' && req.status === 'approved') {
            setEquipment(prevEquipment => {
              const equipmentItem = prevEquipment.find(eq => eq.id === req.equipmentId)
              if (equipmentItem) {
                const updated = prevEquipment.map(item =>
                  item.id === req.equipmentId
                    ? { ...item, available: item.available + 1 }
                    : item
                )
                localStorage.setItem('equipment', JSON.stringify(updated))
                return updated
              }
              return prevEquipment
            })
          }
          
          return updatedReq
        }
        return req
      })
      localStorage.setItem('requests', JSON.stringify(updated))
      return updated
    })
  }

  const checkAvailability = (equipmentId, startDate, endDate) => {
    const overlapping = requests.filter(req => 
      req.equipmentId === equipmentId &&
      req.status === 'approved' &&
      new Date(req.startDate) <= new Date(endDate) &&
      new Date(req.endDate) >= new Date(startDate)
    )
    
    const equipmentItem = equipment.find(eq => eq.id === equipmentId)
    if (!equipmentItem) return false

    return equipmentItem.available > overlapping.length
  }

  const value = {
    equipment,
    requests,
    loading,
    error,
    refetchEquipment: fetchEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    createRequest,
    updateRequest,
    checkAvailability
  }

  return (
    <EquipmentContext.Provider value={value}>
      {children}
    </EquipmentContext.Provider>
  )
}

