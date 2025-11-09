import axios from 'axios'

const API_BASE_URL = import.meta.env.DEV 
  ? '/api'
  : 'http://localhost:8000'

if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL)
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
})
api.interceptors.request.use(
  (config) => {
    if (config.url && config.url.endsWith('/') && config.url.length > 1) {
      config.url = config.url.slice(0, -1)
    }
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api

