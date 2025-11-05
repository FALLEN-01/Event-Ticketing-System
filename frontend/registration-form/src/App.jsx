import { useState } from 'react'
import './App.css'

function App() {
  const [paymentType, setPaymentType] = useState('individual')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    team_name: '',
    member1: '',
    member2: '',
    member3: '',
    member4: ''
  })
  const [paymentScreenshot, setPaymentScreenshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)' })
        e.target.value = ''
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' })
        e.target.value = ''
        return
      }
      setPaymentScreenshot(file)
      setMessage({ type: '', text: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Prepare form data
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      submitData.append('phone', formData.phone)
      submitData.append('payment_type', paymentType)
      submitData.append('payment_screenshot', paymentScreenshot)

      if (paymentType === 'bulk') {
        submitData.append('team_name', formData.team_name)
        // Create members array for bulk registration
        const members = [
          formData.name, // Team leader
          formData.member1,
          formData.member2,
          formData.member3
        ].filter(m => m.trim())
        submitData.append('members', JSON.stringify(members))
      }

      // Submit to backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        body: submitData
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Registration submitted successfully! Check your email for confirmation.' 
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          team_name: '',
          member1: '',
          member2: '',
          member3: '',
          member4: ''
        })
        setPaymentScreenshot(null)
        document.getElementById('payment_screenshot').value = ''
      } else {
        setMessage({ 
          type: 'error', 
          text: data.detail || 'Registration failed. Please try again.' 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* FOOD BACKGROUND IMAGE AS MAIN BG - NO MORE SHADES */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center bg-no-repeat"></div>

      {/* Very Light Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Main Content - PERFECTLY CENTERED */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Clean Card Form */}
          <div className="bg-white/95 text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-8 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 rounded-full mb-4 shadow-sm border border-slate-100">
                <span className="text-2xl">🎉</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight">
                Event Registration
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">
                Join us for an unforgettable culinary experience
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
              {/* Alert Messages */}
              {message.text && (
                <div className={message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800 rounded-lg p-3' : 'bg-red-50 border border-red-200 text-red-800 rounded-lg p-3'}>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-semibold">{message.type === 'success' ? 'Success' : 'Error'}:</span>
                    <span className="flex-1">{message.text}</span>
                  </div>
                </div>
              )}

              {/* Registration Type Selection */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-white text-center">
                  Choose Registration Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentType('individual')}
                    className={`border rounded-xl p-4 transition-all duration-150 ${
                      paymentType === 'individual'
                        ? 'bg-slate-100 border-rose-500 shadow-sm'
                        : 'bg-transparent border-slate-200 hover:bg-slate-50'
                    } text-sm font-medium`}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">👤</div>
                      <div className="font-semibold">Individual</div>
                      <div className="text-xs text-slate-500">1 Person</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('bulk')}
                    className={`border rounded-xl p-4 transition-all duration-150 ${
                      paymentType === 'bulk'
                        ? 'bg-slate-100 border-rose-500 shadow-sm'
                        : 'bg-transparent border-slate-200 hover:bg-slate-50'
                    } text-sm font-medium`}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">👥</div>
                      <div className="font-semibold">Team</div>
                      <div className="text-xs text-slate-500">4 People</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white text-center border-b border-white/30 pb-2">
                  {paymentType === 'bulk' ? 'Team Leader Information' : 'Your Information'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white mb-2">
                      {paymentType === 'bulk' ? 'Team Leader Name' : 'Full Name'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Phone <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>

              {/* Bulk Registration - Team Details */}
              {paymentType === 'bulk' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 text-center border-b border-slate-100 pb-2">
                    Team Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Team Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="team_name"
                      value={formData.team_name}
                      onChange={handleInputChange}
                      required={paymentType === 'bulk'}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                      placeholder="Enter team name"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-slate-400">ℹ️</span>
                      <p className="text-sm font-medium text-slate-700">Team Members</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      Team leader is already counted. Please add 3 more members to complete the team of 4.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Member 2 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="member1"
                        value={formData.member1}
                        onChange={handleInputChange}
                        required={paymentType === 'bulk'}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                        placeholder="Member name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Member 3 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="member2"
                        value={formData.member2}
                        onChange={handleInputChange}
                        required={paymentType === 'bulk'}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                        placeholder="Member name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Member 4 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="member3"
                        value={formData.member3}
                        onChange={handleInputChange}
                        required={paymentType === 'bulk'}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                        placeholder="Member name"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Screenshot */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                  Payment Screenshot <span className="text-red-400">*</span>
                </label>
                <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-xl p-6 text-center hover:border-slate-200 transition-all cursor-pointer">
                  <input
                    type="file"
                    id="payment_screenshot"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                  />
                  <label htmlFor="payment_screenshot" className="cursor-pointer">
                    <div className="text-3xl mb-3 text-slate-500">📸</div>
                    <p className="text-slate-700 font-medium mb-1">Click to upload payment screenshot</p>
                    <p className="text-xs text-slate-500">
                      JPG, PNG, GIF or WebP (Max 5MB)
                    </p>
                  </label>
                </div>
                {paymentScreenshot && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-sm text-green-800">
                      <span className="font-medium">✅</span>
                      <span>File selected: {paymentScreenshot.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-150 ${
                  loading
                    ? 'bg-rose-400/60 opacity-80 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-md'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Submit Registration</span>
                  </div>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs text-slate-500">
                  By submitting, you agree to our terms and conditions.
                  <br />
                  You will receive a confirmation email after review.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
