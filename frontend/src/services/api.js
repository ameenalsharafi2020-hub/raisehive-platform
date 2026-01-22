import axios from 'axios'
import useAuthStore from '@/store/useAuthStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('🌐 API URL:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Adding token to request')
    }
    console.log('📤 Request:', config.method.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.response?.data)
    
    if (error.response?.status === 401) {
      console.log('🚪 Unauthorized - logging out')
      useAuthStore.getState().logout()
      window.location.href = '/'
    }
    
    return Promise.reject(error)
  }
)

export default api