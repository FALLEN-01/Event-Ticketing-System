import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests (HTTP-only cookies)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    // Token is automatically sent via HTTP-only cookie
    // But we can also add it to header if stored in localStorage as backup
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export { API_BASE_URL, axiosInstance }
export default axiosInstance
