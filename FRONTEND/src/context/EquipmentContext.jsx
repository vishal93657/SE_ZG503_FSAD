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

  const fetchRequests = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    try {
      setError(null)
      const response = await api.get('/loan_requests')

      const requestsData = Array.isArray(response.data) ? response.data : []
      const mappedRequests = requestsData.map(item => ({
        id: item.id,
        equipmentId: item.equipment_id,
        userId: item.user_id,
        quantity: item.quantity,
        startDate: item.borrow_date,
        endDate: item.return_date,
        return_date: item.return_date,
        // Map 'accepted' from API to 'approved' for frontend consistency
        status: item.status === 'accepted' ? 'approved' : item.status,
        borrow_date: item.borrow_date,
        createdAt: item.borrow_date || new Date().toISOString()
      }))
      
      setRequests(mappedRequests)
      localStorage.setItem('requests', JSON.stringify(mappedRequests))
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch requests')
      const storedRequests = localStorage.getItem('requests')
      if (storedRequests) {
        setRequests(JSON.parse(storedRequests))
      }
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchEquipment()
      fetchRequests()
    } else {
      setLoading(false)
    }
  }, [fetchEquipment, fetchRequests])

  useEffect(() => {
    const handleTokenSet = () => {
      fetchEquipment()
      fetchRequests()
    }

    window.addEventListener('tokenSet', handleTokenSet)
    
    return () => {
      window.removeEventListener('tokenSet', handleTokenSet)
    }
  }, [fetchEquipment, fetchRequests])

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

  const updateEquipment = async (id, updates) => {
    try {
      const payload = {
        name: updates.name,
        category: updates.category,
        condition: updates.condition,
        quantity: updates.quantity
      }

      const response = await api.patch(`/equipment/${id}`, payload)
      
      const updatedItem = response.data.data || response.data
      const mappedItem = {
        ...updatedItem,
        available: updatedItem.available_quantity !== undefined 
          ? updatedItem.available_quantity 
          : updatedItem.available !== undefined
          ? updatedItem.available
          : updates.available !== undefined
          ? updates.available
          : updatedItem.quantity || 0
      }
      
      // Update local state
      setEquipment(prev => prev.map(item => 
        item.id === id ? mappedItem : item
      ))
      
      // Refresh equipment list to get latest data from server
      await fetchEquipment()
      
      return mappedItem
    } catch (err) {
      console.error('Error updating equipment:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.response?.data?.detail ||
                          err.message || 
                          'Failed to update equipment'
      throw new Error(errorMessage)
    }
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
        return_date: request.endDate || request.return_date,
        quantity: request.quantity || 1
      }

      const response = await api.post(`/borrow/${request.equipmentId}`, payload)
      
      // Refresh requests and equipment list to get updated data
      await fetchRequests()
      await fetchEquipment()
      
      // Return the created request data from response or fetch the latest
      const newRequest = response.data ? {
        id: response.data.id,
        equipmentId: response.data.equipment_id || request.equipmentId,
        userId: response.data.user_id || request.userId,
        quantity: response.data.quantity || request.quantity,
        startDate: response.data.borrow_date || new Date().toISOString(),
        endDate: response.data.return_date || request.endDate,
        return_date: response.data.return_date || request.endDate,
        status: response.data.status || 'pending',
        borrow_date: response.data.borrow_date,
        createdAt: response.data.borrow_date || new Date().toISOString()
      } : null
      
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

  const updateRequest = async (id, updates) => {
    try {
      // Map 'approved' to 'accepted' for API, but keep 'approved' in frontend
      const apiStatus = updates.status === 'approved' ? 'accepted' : updates.status
      
      const payload = {
        status: apiStatus
      }

      const response = await api.patch(`/loan_requests/${id}`, payload)
      
      // Map 'accepted' from API response to 'approved' for frontend consistency
      const responseStatus = response.data?.status === 'accepted' ? 'approved' : response.data?.status
      
      // Update local state with the response data
      setRequests(prevRequests => {
        const updated = prevRequests.map(req => {
          if (req.id === id) {
            const updatedReq = { 
              ...req, 
              ...updates,
              status: responseStatus || updates.status
            }

            if (updates.status === 'approved' && req.status === 'pending') {
              setEquipment(prevEquipment => {
                const equipmentItem = prevEquipment.find(eq => eq.id === req.equipmentId)
                if (equipmentItem && equipmentItem.available > 0) {
                  const updated = prevEquipment.map(item =>
                    item.id === req.equipmentId
                      ? { ...item, available: item.available - (req.quantity || 1) }
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
      
      // If marking as returned, also update the equipment
      if (updates.status === 'returned') {
        const request = requests.find(req => req.id === id)
        if (request && request.status === 'approved') {
          const equipmentItem = equipment.find(eq => eq.id === request.equipmentId)
          if (equipmentItem) {
            try {
              // Update equipment when marking as returned
              const equipmentPayload = {
                name: equipmentItem.name,
                category: equipmentItem.category,
                condition: equipmentItem.condition,
                quantity: equipmentItem.quantity
              }
              
              await api.patch(`/equipment/${request.equipmentId}`, equipmentPayload)
            } catch (err) {
              console.error('Error updating equipment on return:', err)
              // Don't throw here, as the request update was successful
            }
          }
        }
      }
      
      // Refresh requests and equipment to get latest data from server
      await fetchRequests()
      await fetchEquipment()
      
    } catch (err) {
      console.error('Error updating request:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.response?.data?.detail ||
                          err.message || 
                          'Failed to update request'
      throw new Error(errorMessage)
    }
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
    refetchRequests: fetchRequests,
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

