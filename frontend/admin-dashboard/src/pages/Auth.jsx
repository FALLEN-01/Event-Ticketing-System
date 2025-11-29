import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, X } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Configure axios to use credentials (cookies)
axios.defaults.withCredentials = true

function Auth() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [role, setRole] = useState('author')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })



  // Notification system
  const showNotification = (message, type = 'info') => {
    const existingNotification = notifications.find(n => n.message === message)
    if (existingNotification) {
      return
    }
    
    const id = Date.now()
    const notification = {
      id,
      message,
      type,
      timestamp: Date.now()
    }
    
    setNotifications(prev => [...prev, notification])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 4000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isLoading) return

    setIsLoading(true)

    try {
      const { email, password } = formData
      
      // Validation
      if (!email || !password) {
        showNotification('Please enter both email and password.', 'warning')
        setIsLoading(false)
        return
      }

      // Login API call
      try {
        const response = await axios.post(`${API_URL}/api/admin/login`, {
          email: email.trim(),
          password: password,
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const data = response.data
        
        // Token is stored in HTTP-only cookie by backend
        // No need to store in localStorage
        
        showNotification('Login successful!', 'success')
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard')
        }, 500)
        
      } catch (error) {
        let errorMessage = 'Login failed. Please check your credentials.'
        
        if (error.response?.status === 401) {
          errorMessage = 'Invalid email or password.'
        } else if (error.response?.status === 403) {
          errorMessage = 'Account not verified or access denied.'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (!error.response) {
          errorMessage = 'Network error. Please check your connection.'
        }
        
        showNotification(errorMessage, 'error')
      }
      
    } catch (error) {
      console.error('Submission error:', error)
      showNotification('An unexpected error occurred', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070" 
          alt="Mountain landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-purple-100/60 to-pink-100/60"></div>
      </div>

      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-lg backdrop-blur-md transform transition-all duration-300 animate-slide-in-right ${
              notification.type === 'success' 
                ? 'bg-white/90 text-purple-900' 
                : notification.type === 'error'
                ? 'bg-white/90 text-pink-900'
                : notification.type === 'warning'
                ? 'bg-white/90 text-purple-800'
                : 'bg-white/90 text-purple-900'
            }`}
          >
            <p className="text-sm font-medium pr-4">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className={`flex-shrink-0 transition-colors ${
                notification.type === 'success'
                  ? 'text-purple-600 hover:text-purple-800'
                  : notification.type === 'error'
                  ? 'text-pink-600 hover:text-pink-800'
                  : notification.type === 'warning'
                  ? 'text-purple-500 hover:text-purple-700'
                  : 'text-purple-600 hover:text-purple-800'
              }`}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-10" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
          {/* Title */}
          <h1 className="text-2xl font-light text-center mb-8 text-gray-900" style={{ fontFamily: 'serif' }}>
            Welcome Back!
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium mb-2 text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                placeholder="Enter Email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium mb-2 text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default Auth
