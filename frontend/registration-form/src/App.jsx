import { useState } from 'react'
import './App.css'
import { API_ENDPOINTS } from './config'

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [paymentType, setPaymentType] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    team_name: '',
    members: ''
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
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please upload a valid image file (JPG, PNG, or WebP)' })
        e.target.value = ''
        return
      }
      // Validate file size (max 2MB as per spec)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 2MB' })
        e.target.value = ''
        return
      }
      setPaymentScreenshot(file)
      setMessage({ type: '', text: '' })
    }
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.phone || !paymentType) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return false
    }
    if (paymentType === 'bulk' && (!formData.team_name || !formData.members)) {
      setMessage({ type: 'error', text: 'Please provide team name and all member names' })
      return false
    }
    if (paymentType === 'bulk') {
      const memberList = formData.members.split(',').map(m => m.trim()).filter(m => m)
      if (memberList.length !== 4) {
        setMessage({ type: 'error', text: 'Please provide exactly 4 team members (comma-separated)' })
        return false
      }
    }
    return true
  }

  const validateStep2 = () => {
    if (!paymentScreenshot) {
      setMessage({ type: 'error', text: 'Please upload a payment screenshot' })
      return false
    }
    return true
  }

  const nextStep = () => {
    setMessage({ type: '', text: '' })
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const prevStep = () => {
    setMessage({ type: '', text: '' })
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
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
        submitData.append('members', formData.members)
      }

      // Submit to backend
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: submitData
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Registration submitted successfully! Your payment is under review. Tickets will be emailed soon.'
        })
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

  const resetForm = () => {
    setCurrentStep(1)
    setPaymentType('')
    setFormData({
      name: '',
      email: '',
      phone: '',
      team_name: '',
      members: ''
    })
    setPaymentScreenshot(null)
    setMessage({ type: '', text: '' })
  }

  const renderStepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
      {[
        { num: 1, label: 'Basic Details' },
        { num: 2, label: 'Contact Details' },
        { num: 3, label: 'Verification' }
      ].map((step, index) => (
        <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={`step-indicator ${currentStep >= step.num ? 'step-active' : 'step-inactive'}`}>
              {step.num}
            </div>
            <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#4b5563', fontWeight: '500', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {step.label}
            </span>
          </div>
          {index < 2 && (
            <div className={`step-line ${currentStep > step.num ? 'step-line-active' : 'step-line-inactive'}`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Registration Type - Moved to Top */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
          Registration Type <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => setPaymentType('individual')}
            className={`registration-card ${paymentType === 'individual' ? 'registration-card-active' : ''}`}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem' }}>Individual</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>1 Person</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPaymentType('bulk')}
            className={`registration-card ${paymentType === 'bulk' ? 'registration-card-active' : ''}`}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem' }}>Bulk</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Multiple</div>
            </div>
          </button>
        </div>
      </div>

      {/* Photo Upload */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            id="photo_upload"
          />
          <label htmlFor="photo_upload" className="photo-upload-circle">
            <div style={{ fontSize: '2rem' }}>📷</div>
            <span style={{ fontSize: '0.75rem', color: '#c4b5fd', fontWeight: '600', marginTop: '0.25rem' }}>Add Photo</span>
          </label>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="orange-input"
          placeholder="Enter Full Name"
        />
      </div>

      {/* Email */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
          Email Address <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="orange-input"
          placeholder="your.email@example.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
          Phone Number <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="orange-input"
          placeholder="+91 9876543210"
        />
      </div>

      {/* Constituency */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
          Constituency
        </label>
        <input
          type="text"
          name="constituency"
          value={formData.constituency || ''}
          onChange={handleInputChange}
          className="orange-input"
          placeholder="Enter Constituency"
        />
      </div>

      {/* Team Details - Only show for bulk */}
      {paymentType === 'bulk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '2px solid #f3f4f6', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>Team Details</h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Team Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="team_name"
              value={formData.team_name}
              onChange={handleInputChange}
              className="orange-input"
              placeholder="Enter your team name"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Team Members <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              name="members"
              value={formData.members}
              onChange={handleInputChange}
              rows="4"
              className="orange-input"
              style={{ resize: 'none' }}
              placeholder="Enter 4 team member names (comma-separated)"
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>Payment Proof</h2>
        <p style={{ color: '#4b5563' }}>Upload your UPI payment screenshot</p>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
          Payment Screenshot <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div className="payment-upload-box">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="payment_screenshot"
          />
          <label htmlFor="payment_screenshot" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem', color: '#c4b5fd' }}>📸</div>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Click to upload payment screenshot</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>JPG, PNG, or WebP (Max 2MB)</p>
          </label>
        </div>

        {paymentScreenshot && (
          <div className="file-selected-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534' }}>
              <span style={{ fontSize: '1.25rem' }}>✅</span>
              <span style={{ fontWeight: '600' }}>File selected: {paymentScreenshot.name}</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#16a34a', marginTop: '0.25rem' }}>
              Size: {(paymentScreenshot.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>Confirmation</h2>
        <p style={{ color: '#4b5563' }}>Please review your information before submitting</p>
      </div>

      <div className="confirmation-grid">
        <div className="confirmation-item">
          <span className="confirmation-label">Name:</span>
          <p className="confirmation-value">{formData.name}</p>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">Email:</span>
          <p className="confirmation-value">{formData.email}</p>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">Phone:</span>
          <p className="confirmation-value">{formData.phone}</p>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">Type:</span>
          <p className="confirmation-value">{paymentType === 'individual' ? 'Individual' : 'Team (Bulk)'}</p>
        </div>
        {paymentType === 'bulk' && (
          <>
            <div className="confirmation-item" style={{ gridColumn: '1 / -1' }}>
              <span className="confirmation-label">Team Name:</span>
              <p className="confirmation-value">{formData.team_name}</p>
            </div>
            <div className="confirmation-item" style={{ gridColumn: '1 / -1' }}>
              <span className="confirmation-label">Team Members:</span>
              <p className="confirmation-value">{formData.members}</p>
            </div>
          </>
        )}
        <div className="confirmation-item" style={{ gridColumn: '1 / -1' }}>
          <span className="confirmation-label">Payment Screenshot:</span>
          <p className="confirmation-value">{paymentScreenshot?.name}</p>
        </div>
      </div>

      <div className="info-box">
        <span className="info-box-icon">ℹ️</span>
        <div className="info-box-content">
          <p className="info-box-title">Important Notice</p>
          <p className="info-box-text">
            Your registration will be reviewed after submission. You will receive a confirmation email once payment is verified.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {/* Decorative circles */}
      <div className="decorative-circle-1"></div>
      <div className="decorative-circle-2"></div>
      
      <div style={{ maxWidth: '42rem', width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Form Card */}
        <div className="form-container">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>Sign up</h1>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              Already a Member?{' '}
              <span style={{ color: '#c4b5fd', fontWeight: '600', cursor: 'pointer' }}>
                Sign in
              </span>
            </p>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Alert Messages */}
          {message.text && (
            <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>
              <span style={{ fontSize: '1.25rem' }}>
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              <span style={{ fontWeight: '500' }}>{message.text}</span>
            </div>
          )}

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                style={{ padding: '0.75rem 1.5rem', background: '#f3f4f6', color: '#374151', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Back
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="orange-button"
                style={{ marginLeft: 'auto' }}
              >
                Save & Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="orange-button"
                style={{ marginLeft: 'auto' }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="spinner"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Registration'
                )}
              </button>
            )}
          </div>

          {currentStep === 3 && message.type === 'success' && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={resetForm}
                style={{ padding: '0.75rem 1.5rem', background: '#e5e7eb', color: '#374151', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer' }}
              >
                Register Another Person
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
