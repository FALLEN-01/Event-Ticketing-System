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
        <div className="absolute inset-0 bg-linear-to-br from-white/80 via-purple-100/60 to-pink-100/60"></div>
      </div>

      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-lg backdrop-blur-md transform transition-all duration-300 animate-slide-in-right ${
              notification.type === 'success' 
                ? 'bg-white/90 text-green-900' 
                : notification.type === 'error'
                ? 'bg-white/90 text-red-900'
                : notification.type === 'warning'
                ? 'bg-white/90 text-orange-900'
                : 'bg-white/90 text-gray-900'
            }`}
          >
            <p className="text-sm font-medium pr-4">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="shrink-0 text-gray-600 hover:text-gray-800"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          {/* Title */}
          <h1 className="text-3xl font-normal text-center mb-8 text-gray-900" style={{ fontFamily: 'serif' }}>
            Welcome Back!
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login as Role Selector */}
            <div>
              <label className="block text-sm font-medium mb-2.5" style={{ color: '#374151' }}>
                Login as
              </label>
              <div className="grid grid-cols-3 gap-1 p-1.5 rounded-xl" style={{ backgroundColor: '#f3f4f6' }}>
                <button
                  type="button"
                  onClick={() => setRole('author')}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all`}
                  style={{
                    backgroundColor: role === 'author' ? '#ffffff' : 'transparent',
                    color: role === 'author' ? '#111827' : '#6b7280',
                    boxShadow: role === 'author' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  Author
                </button>
                <button
                  type="button"
                  onClick={() => setRole('reviewer')}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all`}
                  style={{
                    backgroundColor: role === 'reviewer' ? '#ffffff' : 'transparent',
                    color: role === 'reviewer' ? '#111827' : '#6b7280',
                    boxShadow: role === 'reviewer' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  Reviewer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all`}
                  style={{
                    backgroundColor: role === 'organizer' ? '#ffffff' : 'transparent',
                    color: role === 'organizer' ? '#111827' : '#6b7280',
                    boxShadow: role === 'organizer' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  Organizer
                </button>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 rounded-xl bg-white transition-all"
                style={{
                  border: '1px solid #d1d5db',
                  color: '#111827'
                }}
                placeholder="Enter Email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
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
                  className="block w-full px-4 py-3 pr-12 rounded-xl bg-white transition-all"
                  style={{
                    border: '1px solid #d1d5db',
                    color: '#111827'
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                  style={{ color: '#9ca3af' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 mt-2 text-base font-medium rounded-xl text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
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
