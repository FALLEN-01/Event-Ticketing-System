import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {Eye, EyeOff, X, Upload, FileText } from 'lucide-react'



function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [isResetEmailSending, setIsResetEmailSending] = useState(false)
  

  // ORCID profile completion states
  const [showCompleteProfile, setShowCompleteProfile] = useState(false)
  const [orcidUserData, setOrcidUserData] = useState(null)
  const [completingProfile, setCompletingProfile] = useState(false)
  
  const recaptchaRef = useRef(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'researcher',
    role: 'author', // Default role
    cvFile: null, // CV/Resume file
  })

  // Handle redirect from email verification (e.g., email already registered)
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email
      }))
    }
    
    if (location.state?.switchToLogin) {
      setIsLogin(true)
      showNotification('Please login with your account.', 'info')
    }
  }, [location.state?.email, location.state?.switchToLogin])

  
  useEffect(() => {
    const oauthProcessed = sessionStorage.getItem('oauth_processed')
    
    console.log('Auth useEffect running', { 
      processed: oauthProcessed, 
      search: location.search,
      searchLength: location.search?.length,
      pathname: location.pathname,
      fullUrl: window.location.href
    })
    
    // Debug: Log all URL parameters
    const allParams = Array.from(urlParams.entries())
    console.log('All URL params:', allParams)
    console.log('OAuth params:', { 
      hasToken: !!token,
      tokenLength: token?.length || 0,
      token: token ? `${token.substring(0, 30)}...` : 'none', 
      provider, 
      oauthSuccess, 
      error,
      accountDeleted,
      requires2FAParam,
      oauthEmail,
      completeProfile,
      hasUserData: !!userDataParam
    })

  // Notification system
  const showNotification = (message, type = 'info') => {
    // Check if a notification with the same message already exists
    const existingNotification = notifications.find(n => n.message === message)
    if (existingNotification) {
      console.log('Duplicate notification prevented:', message)
      return // Don't add duplicate notification
    }
    
    const id = Date.now()
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: Date.now()
    }
    
    setNotifications(prev => [...prev, notification])
    
    // Auto-remove after 4 seconds
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

  // Handle CV/Resume file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error')
        return
      }
      // Check file type
      const allowedTypes = ['.pdf', '.doc', '.docx']
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      if (!allowedTypes.includes(fileExtension)) {
        showNotification('Only PDF, DOC, and DOCX files are allowed', 'error')
        return
      }
      setFormData(prev => ({
        ...prev,
        cvFile: file
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isLoading) {
      return
    }

    // If user is on OAuth 2FA verification, handle it separately
    if (requires2FA && pending2FAEmail && !formData.password) {
      await handleOAuth2FAVerification()
      return
    }
    
    setIsLoading(true)

    try {
      // Execute reCAPTCHA verification with different logic for login vs registration
      let captchaToken = ''
      let captchaVersion = 'v3'
      
      if (isLogin) {
        // LOGIN: Use only v3 - if score is bad, block the login
        try {
          captchaToken = await executeRecaptchaV3('login')
          captchaVersion = 'v3'
        } catch (error) {
          console.warn('reCAPTCHA v3 failed for login:', error)
          // In production, allow login without reCAPTCHA if it fails
          if (process.env.NODE_ENV === 'production') {
            console.warn('Production: Proceeding without reCAPTCHA for login')
            captchaToken = ''
            captchaVersion = 'none'
          } else {
            showNotification('Security verification failed. Please try again.', 'error')
            return
          }
        }
      } else {
        // REGISTRATION: Use v3 first, if it fails/gives bad score, fall back to v2
        try {
          captchaToken = await executeRecaptchaV3('register')
          captchaVersion = 'v3'
        } catch (error) {
          console.warn('reCAPTCHA v3 failed for registration, falling back to v2:', error)
          setRecaptchaVersion('v2')
          setShowRecaptchaV2(true)
          showNotification('Please complete the security verification below.', 'warning')
          return
        }
      }

      const { first_name, last_name, email, password, confirmPassword } = formData
      
      // Signup flow
      if (!isLogin) {
        // Validation
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.confirmPassword) {
          showNotification('Please fill in all fields', 'warning')
          return
        }
        
        // Name validation
        if (formData.first_name.trim().length < 2) {
          showNotification('First name must be at least 2 characters long', 'warning')
          return
        }
        
        if (formData.last_name.trim().length < 2) {
          showNotification('Last name must be at least 2 characters long', 'warning')
          return
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          showNotification('Please enter a valid email address', 'warning')
          return
        }
        
        if (password !== confirmPassword) {
          showNotification('Passwords do not match', 'warning')
          return
        }
        
        if (password.length < 8) {
          showNotification('Password must be at least 8 characters long', 'warning')
          return
        }
        
        // CV/Resume validation
        if (formData.role === 'reviewer' && !formData.cvFile) {
          showNotification('CV/Resume is required for reviewer registration', 'warning')
          return
        }
        
        // Basic password strength check
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumbers = /\d/.test(password)
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
          showNotification('Password must contain at least one uppercase letter, one lowercase letter, and one number', 'warning')
          return
        }
        
        try {
          
          const registrationData = {
            email: email.trim(),
            password: password,
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            role: formData.role
          }

          // Include reCAPTCHA if available
          if (captchaToken && captchaVersion !== 'none') {
            registrationData.recaptcha_token = captchaToken
            registrationData.recaptcha_version = captchaVersion
          } else {
            console.warn('No reCAPTCHA token available for registration')
          }

          const response = await api.post('/auth/register', registrationData)
          
          console.log('✅ Registration successful:', response.data)
          showNotification('Verification email sent! Please check your inbox. The verification link expires in 5 minutes.', 'success')
          
          // Then redirect to email verification page
          navigate('/email-verification', { 
            state: { 
              email: email,
              first_name: first_name,
              last_name: last_name,
              password: password,
              role: formData.role,
              alreadyRegistered: true // Flag to prevent duplicate registration
            } 
          })
          
        } catch (error) {
          console.error('❌ Registration failed:', error)
          console.error('❌ Error response:', error.response?.data)
          console.error('❌ Error status:', error.response?.status)
          
          let errorMessage = 'Registration failed. Please try again.'
          
          if (error.response?.status === 422) {
            // Validation error
            const detail = error.response?.data?.detail
            if (Array.isArray(detail)) {
              errorMessage = detail.map(err => err.msg || err.message).join(', ')
            } else {
              errorMessage = 'Please check your input data and try again.'
            }
          } else if (error.response?.status === 400) {
            // Business logic error (e.g., email already registered, reCAPTCHA failed)
            errorMessage = error.response?.data?.detail || 'Registration failed. Email may already be registered or reCAPTCHA verification failed.'
          } else if (error.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.'
          } else if (!error.response) {
            errorMessage = 'Network error. Please check your connection and try again.'
          }
          
          showNotification(errorMessage, 'error')
          return
        }
        
        return
      }
      
      // Login flow
      // Regular user login through backend
      // Validate email and password are not empty
      if (!email || !password) {
        showNotification('Please enter both email and password.', 'error')
        return
      }

      const loginData = {
        email: email,
        password: password,
        role: formData.role
      }

      // Only include reCAPTCHA if we have a valid token
      if (captchaToken && captchaVersion !== 'none') {
        loginData.recaptcha_token = captchaToken
        loginData.recaptcha_version = captchaVersion
      }

      // Include 2FA token if user is retrying with 2FA
      if (requires2FA && twoFactorCode) {
        loginData.two_fa_token = twoFactorCode
      }

      const response = await api.post('/auth/login', loginData)
      const data = response.data
      
      // Check if 2FA is required
      if (data.requires_2fa) {
        setRequires2FA(true)
        setPending2FAEmail(email)
        showNotification('Please enter your 6-digit authentication code', 'info')
        return
      }
      
      // Store tokens and user info
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('userEmail', email)
      localStorage.setItem('isLoggedIn', 'true')
      
      // Reset 2FA state after successful login
      setRequires2FA(false)
      setTwoFactorCode('')
      setPending2FAEmail('')
      
      showNotification('Login successful!', 'success')
      
      // Navigate based on user role (auth.jsx users never go to admin)
      if (data.role === 'organizer') {
        navigate('/organizer')
      } else {
        navigate('/dashboard') // Default for author and reviewer roles
      }
      // Reset reCAPTCHA after successful submission
      resetRecaptcha()
    } catch (error) {
      console.error('Authentication error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      
      let errorMessage = 'Authentication failed. Please try again.'
      
      if (isLogin) {
        // Handle login-specific errors
        if (error.response?.status === 401) {
          const detail = error.response?.data?.detail || error.response?.data?.message || ''
          
          if (detail === 'You are not registered as a member') {
            errorMessage = 'Email address not registered. Please check your email or sign up for an account.'
          } else if (detail === 'Invalid email or password') {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.'
          } else if (typeof detail === 'string' && (detail.toLowerCase().includes('not verified') || detail.toLowerCase().includes('verify'))) {
            errorMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.'
          } else if (typeof detail === 'string' && (detail.toLowerCase().includes('suspended') || detail.toLowerCase().includes('disabled'))) {
            errorMessage = 'Your account has been suspended. Please contact support.'
          } else {
            errorMessage = 'Login failed. Please check your credentials and try again.'
          }
        } else if (error.response?.status === 403) {
          // Handle role permission errors
          const detail = error.response?.data?.detail || error.response?.data?.message || ''
          
          if (typeof detail === 'string' && detail.includes("don't have")) {
            errorMessage = detail // Use the exact message from backend
          } else if (typeof detail === 'string' && detail.includes('No roles assigned')) {
            errorMessage = 'No roles assigned to your account. Please contact administrator.'
          } else {
            errorMessage = 'Access denied. Please check your role selection.'
          }
        } else if (error.response?.status === 400) {
          const detail = error.response?.data?.detail || error.response?.data?.message || ''
          
          if (typeof detail === 'string' && detail.toLowerCase().includes('recaptcha')) {
            errorMessage = 'Security verification failed. Please try again.'
          } else if (typeof detail === 'string' && detail.toLowerCase().includes('too many')) {
            errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.'
          } else {
            errorMessage = 'Login failed. Please check your credentials and try again.'
          }
        } else if (error.response?.status === 422) {
          // Validation errors
          const detail = error.response?.data?.detail
          if (Array.isArray(detail)) {
            const validationErrors = detail.map(err => err.msg || err.message).join(', ')
            errorMessage = `Please check your input: ${validationErrors}`
          } else {
            errorMessage = 'Please check your email and password format.'
          }
        } else if (error.response?.status === 429) {
          errorMessage = 'Too many login attempts. Please wait before trying again.'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.'
        } else if (!error.response) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      } else {
        // Handle registration-specific errors (keep existing logic)
        if (error.response?.status === 422) {
          const detail = error.response?.data?.detail
          if (Array.isArray(detail)) {
            errorMessage = detail.map(err => err.msg || err.message).join(', ')
          } else {
            errorMessage = 'Please check your input data and try again.'
          }
        } else if (error.response?.status === 400) {
          errorMessage = error.response?.data?.detail || 'Registration failed. Email may already be registered or reCAPTCHA verification failed.'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (!error.response) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      }
      
      showNotification(errorMessage, 'error')
      // Reset reCAPTCHA on error
      resetRecaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setIsResetEmailSending(true)

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(forgotPasswordEmail)) {
        showNotification('Please enter a valid email address', 'warning')
        return
      }

      const response = await api.post('/auth/forgot-password', {
        email: forgotPasswordEmail
      })

      showNotification('Password reset email sent! Check your inbox.', 'success')
      setShowForgotPasswordModal(false)
      setForgotPasswordEmail('')
    } catch (error) {
      console.error('Forgot password error:', error)
      
      if (error.response) {
        // Backend returned an error response
        const errorMessage = error.response.data?.detail || error.response.data?.message || 'Password reset failed'
        
        // Handle specific error cases
        if (error.response.status === 404 || 
            (typeof errorMessage === 'string' && (errorMessage.toLowerCase().includes('not found') ||
            errorMessage.toLowerCase().includes('not registered') ||
            errorMessage.toLowerCase().includes('does not exist')))) {
          showNotification('Email address not found. Please check your email or register first.', 'error')
        } else {
          showNotification(errorMessage, 'error')
        }
        
        // Keep modal open for user to correct email or try again
      } else if (error.request) {
        // Network error
        showNotification('Network error. Please check your connection.', 'error')
      } else {
        // Other errors
        showNotification('An unexpected error occurred. Please try again.', 'error')
      }
    } finally {
      setIsResetEmailSending(false)
    }
  }

  const handleOAuthLogin = async (provider) => {
    setIsLoading(true)
    
    try {
      // Comprehensive OAuth debugging
      console.log('🔐 OAUTH LOGIN DEBUG:')
      console.log('- Provider:', provider)
      console.log('- Form Data Role:', formData.role)
      console.log('- Is Login Mode:', isLogin)
      console.log('- Is Signup Mode:', !isLogin)
      console.log('- Full Form Data:', formData)
      console.log('- Timestamp:', new Date().toISOString())
      
      // Store the selected role for OAuth flow
      localStorage.setItem('oauth_selected_role', formData.role)
      console.log('- Stored in localStorage:', localStorage.getItem('oauth_selected_role'))
      
      if (provider === 'ORCID') {
        // ORCID OAuth flow - include role and signup flag in state parameter
        const state = encodeURIComponent(JSON.stringify({ 
          role: formData.role, 
          is_signup: !isLogin 
        }))
        const orcidUrl = `https://orcid.org/oauth/authorize?client_id=${import.meta.env.VITE_ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback/orcid')}&state=${state}`
        window.location.href = orcidUrl
        return
      }
      
      // For other providers, call backend OAuth endpoint with role
      const requestData = {
        provider: provider.toLowerCase(),
        redirect_url: window.location.origin + '/auth/callback/' + provider.toLowerCase(),
        role: formData.role,
        is_signup: !isLogin // Tell backend if this is signup or login
      }
      
      console.log('📤 SENDING TO BACKEND:', requestData)
      
      const response = await api.post(`/oauth/${provider.toLowerCase()}`, requestData)
      
      console.log('📥 BACKEND RESPONSE:', response.data)
      console.log('🔗 AUTH URL:', response.data.auth_url)
      
      window.location.href = response.data.auth_url
      
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      showNotification(`${provider} login failed. Please try again.`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const OAuthButton = ({ provider, icon: Icon, bgColor, hoverColor }) => (
    <button
      type="button"
      onClick={() => handleOAuthLogin(provider)}
      disabled={isLoading}
      className={`relative w-full flex items-center justify-center px-4 py-3 border border-white/30 text-sm font-medium rounded-full text-white ${bgColor} ${hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105`}
    >
      <Icon className="w-5 h-5 mr-3" />
      Continue with {provider}
      {isLoading && (
        <div className="absolute right-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      )}
    </button>
  )



  return (
    <div className="auth-page min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070" 
          alt="Mountain landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-purple-100/60 to-pink-100/60"></div>
      </div>
      
      {/* Header Navigation - Matching Landing Page */}
      <header className="relative z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg transform rotate-12" />
              <span className="text-2xl font-semibold text-gray-900">TechIndica Research Hub</span>
            </div>
            
            {/* Navigation Links & Auth Buttons */}
            <div className="flex items-center space-x-8">
              {/* Language Dropdown */}
              <select className="text-gray-700 text-sm uppercase tracking-wider border-none bg-transparent outline-none cursor-pointer">
                <option>English</option>
              </select>
              
              {/* Auth Toggle Buttons */}
              <button 
                onClick={() => {
                  setIsLogin(true)
                  setRequires2FA(false)
                  setTwoFactorCode('')
                  setPending2FAEmail('')
                }}
                className={`text-sm uppercase tracking-wider transition-colors ${
                  isLogin ? 'text-gray-900 font-semibold' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  setIsLogin(false)
                  setRequires2FA(false)
                  setTwoFactorCode('')
                  setPending2FAEmail('')
                }}
                className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-2.5 hover:bg-gray-800 transition-colors text-sm uppercase tracking-wider"
              >
                <span>Register</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Container - Fixed Position */}
      <div className="fixed top-24 right-4 z-50 space-y-2 max-w-md">
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

      {/* Main Content - Centered Card */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl p-8" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
            
            {/* Auth Form */}
            <div className="flex flex-col justify-center">
              {showCompleteProfile ? (
                // ORCID Profile Completion Form
                <>
                  <div className="mb-6 text-center">
                    <h3 className="text-2xl font-light text-gray-900 mb-2" style={{ fontFamily: 'serif' }}>
                      Complete Your ORCID Profile
                    </h3>
                    <p className="text-sm text-gray-600">
                      We need a few more details to set up your account
                    </p>
                  </div>

                  <form onSubmit={handleCompleteORCIDProfile} className="space-y-4">
                    {/* First Name */}
                    <div>
                      <label htmlFor="first_name" className="block text-xs font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        placeholder="John"
                        disabled={completingProfile}
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="last_name" className="block text-xs font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        placeholder="Doe"
                        disabled={completingProfile}
                      />
                    </div>

                    {/* ORCID ID Display */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        ORCID iD
                      </label>
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                        {orcidUserData?.orcid || 'N/A'}
                      </div>
                    </div>

                    {/* Email Display */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                        {orcidUserData?.email || 'N/A'}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={completingProfile}
                      className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
                    >
                      {completingProfile ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Completing...
                        </>
                      ) : (
                        'Complete Profile'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                // Normal Login/Signup Form
                <>
                  <div className="mb-6 text-center">
                    <h3 className="text-2xl font-light text-gray-900" style={{ fontFamily: 'serif' }}>
                      {isLogin ? 'Welcome Back!' : 'Create Account'}
                    </h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Signup fields */}
                  {!isLogin && (
                    <div>
                      <label htmlFor="first_name" className="block text-xs font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required={!isLogin}
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        placeholder="John"
                      />
                    </div>
                  )}

                  {!isLogin && (
                    <div>
                      <label htmlFor="last_name" className="block text-xs font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required={!isLogin}
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        placeholder="Doe"
                      />
                    </div>
                  )}

                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <div className="relative bg-gray-100 rounded-lg p-1">
                        {/* Sliding background indicator */}
                        <div 
                          className="absolute bg-white rounded-lg transition-all duration-300 ease-in-out shadow-sm"
                          style={{
                            width: 'calc(50% - 4px)',
                            height: 'calc(100% - 8px)',
                            top: '4px',
                            left: formData.role === 'author' ? '4px' : 'calc(50%)'
                          }}
                        />
                        
                        {/* Role options */}
                        <div className="relative flex">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'author' }))}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-all duration-300 relative z-10 rounded-lg ${
                              formData.role === 'author' 
                                ? 'text-gray-900' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Author
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'reviewer' }))}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-all duration-300 relative z-10 rounded-lg ${
                              formData.role === 'reviewer' 
                                ? 'text-gray-900' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Reviewer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login as
                      </label>
                      <div className="relative bg-gray-100 rounded-lg p-1">
                        {/* Sliding background indicator */}
                        <div 
                          className="absolute bg-white rounded-lg transition-all duration-300 ease-in-out shadow-sm"
                          style={{
                            width: 'calc(33.333% - 3px)',
                            height: 'calc(100% - 8px)',
                            top: '4px',
                            left: formData.role === 'author' ? '4px' : 
                                  formData.role === 'reviewer' ? 'calc(33.333%)' : 'calc(66.666% - 4px)'
                          }}
                        />
                        
                        {/* Role options */}
                        <div className="relative flex">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'author' }))}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-all duration-300 relative z-10 rounded-lg ${
                              formData.role === 'author' 
                                ? 'text-gray-900' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Author
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'reviewer' }))}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-all duration-300 relative z-10 rounded-lg ${
                              formData.role === 'reviewer' 
                                ? 'text-gray-900' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Reviewer
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'organizer' }))}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-all duration-300 relative z-10 rounded-lg ${
                              formData.role === 'organizer' 
                                ? 'text-gray-900' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Organizer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
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

                  {/* Password field - optional for OAuth 2FA */}
                  {!(isLogin && requires2FA && pending2FAEmail && !formData.password) && (
                    <div>
                      <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required={!requires2FA}
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
                      {isLogin && (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => setShowForgotPasswordModal(true)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Recover Password
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2FA Code Input - Show when 2FA is required during login */}
                  {isLogin && requires2FA && (
                    <div className="animate-fade-in">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <div className="bg-gray-900 rounded-lg p-2 mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Two-Factor Authentication
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Verification required
                            </p>
                          </div>
                        </div>
                      </div>

                      <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Authentication Code
                      </label>
                      <input
                        id="twoFactorCode"
                        name="twoFactorCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={12}
                        required={requires2FA}
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                        className="block w-full px-4 py-3 text-center text-xl font-mono tracking-[0.5em] border-2 border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                        placeholder="000000"
                        autoComplete="off"
                        autoFocus
                      />
                      
                      {/* Helper text */}
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Enter code from authenticator app or backup code
                      </p>

                      {/* Cancel button for OAuth 2FA */}
                      {pending2FAEmail && !formData.password && (
                        <button
                          type="button"
                          onClick={() => {
                            setRequires2FA(false)
                            setTwoFactorCode('')
                            setPending2FAEmail('')
                            setFormData({ ...formData, email: '' })
                            showNotification('2FA verification cancelled', 'info')
                          }}
                          className="w-full mt-3 text-xs text-gray-600 hover:text-gray-900 underline"
                        >
                          Cancel and return to login
                        </button>
                      )}
                    </div>
                  )}

                  {!isLogin && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required={!isLogin}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </div>
                  )}

                  {/* CV/Resume Upload - Mandatory for Reviewer, Optional for Author */}
                  {!isLogin && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        CV/Resume {formData.role === 'reviewer' && <span className="text-red-500">*</span>}
                        {formData.role === 'author' && <span className="text-gray-500 text-xs font-normal">(Optional)</span>}
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          id="cv-upload"
                          required={formData.role === 'reviewer'}
                        />
                        <label
                          htmlFor="cv-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          {formData.cvFile ? (
                            <>
                              <FileText size={24} className="text-green-600 mb-2" />
                              <span className="text-xs text-gray-900 font-medium">
                                {formData.cvFile.name}
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                Click to change file
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload size={24} className="text-gray-400 mb-2" />
                              <span className="text-xs text-gray-600">
                                Click to upload (PDF, DOC, DOCX - max 10MB)
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                      {formData.role === 'reviewer' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Required for reviewer registration to verify qualifications
                        </p>
                      )}
                    </div>
                  )}

                  {/* reCAPTCHA v2 Widget */}
                  {showRecaptchaV2 && recaptchaVersion === 'v2' && recaptchaLoaded && (
                    <div className="flex justify-center">
                      <div
                        className="g-recaptcha"
                        data-sitekey={import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY}
                        data-callback="onRecaptchaV2Verify"
                        data-expired-callback="onRecaptchaExpired"
                        ref={recaptchaRef}
                      ></div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isLoading || (requires2FA && twoFactorCode.length < 6)}
                      className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                          {requires2FA ? 'Verifying Code...' : 'Processing...'}
                        </>
                      ) : requires2FA ? (
                        <>
                          <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verify & Sign In
                        </>
                      ) : (
                        isLogin ? 'Sign In' : 'Create Account'
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider with "or" text - Hide during 2FA verification */}
                {!requires2FA && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    {/* OAuth Buttons - Icon Grid */}
                    <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    className="p-2 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <FaGoogle className="h-4 w-4 text-red-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('facebook')}
                    className="p-2 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <FaFacebook className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('orcid')}
                    className="p-2 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <SiOrcid className="h-4 w-4 text-green-600" />
                  </button>
                </div>
                  </>
                )}

                {/* Sign Up / Sign In Toggle - Hide during 2FA verification */}
                {!requires2FA && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-600">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-semibold text-gray-900 hover:text-gray-700 underline"
                      >
                        {isLogin ? 'Create Account!' : 'Sign In!'}
                      </button>
                    </p>
                  </div>
                )}
                </>
              )}
            </div>
            </div>
          </div>
        </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false)
                  setForgotPasswordEmail('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email address and we'll send you a link to reset your password.
                </label>
                <input
                  id="resetEmail"
                  type="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordModal(false)
                    setForgotPasswordEmail('')
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetEmailSending}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResetEmailSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer - Matching Landing Page */}
      <footer className="relative z-20 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white transform rotate-45"></div>
                </div>
                <span className="text-xl font-semibold">TechIndica Research Hub</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                Empowering research excellence through efficient review processes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>              
              <div className="space-y-2">
                <button onClick={() => navigate('/')} className="block text-gray-400 hover:text-white transition-colors text-sm text-left">Home</button>
                <button className="block text-gray-400 hover:text-white transition-colors text-sm text-left">About</button>
                <button className="block text-gray-400 hover:text-white transition-colors text-sm text-left">Contact</button>
                <button onClick={() => navigate('/organizer-application')} className="block text-gray-400 hover:text-white transition-colors text-sm text-left">Become an Organizer</button>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              Made with care for the research community
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
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
        
        .animate-slide-in-left {
          animation: slideInLeft 0.5s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default Auth
