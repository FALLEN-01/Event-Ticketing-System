import { Settings as SettingsIcon, Upload, Save, Calendar, MapPin, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'
import axiosInstance from '../config'

function SettingsPage() {
  const [settings, setSettings] = useState({
    // Event Details
    event_name: 'Event',
    event_type: 'Conference',
    event_date: '2025-09-20',
    event_time: '09:00',
    event_venue: 'Offline',
    event_location: 'BWA JHDR, Kattangal, Kerala 673601, India',
    
    // Pricing
    individual_price: 500,
    bulk_price: 2000,
    bulk_team_size: 4,
    currency: 'INR',
    
    // Payment
    upi_id: 'yourupiid@bank',
    
    // Organization
    organization_name: 'Event Ticketing System',
    support_email: 'support@eventticketing.com',
    
    // Email
    approval_email_subject: '🎉 Registration Confirmed!',
    rejection_email_subject: '❌ Payment Verification Issue',
    
    // QR Codes
    individual_qr_code: null,
    bulk_qr_code: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingQR, setUploadingQR] = useState(false)
  const [qrPreviews, setQrPreviews] = useState({
    individual: null,
    bulk: null
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get('/admin/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleQRUpload = async (qrType, file) => {
    if (!file) return
    
    try {
      setUploadingQR(true)
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axiosInstance.post(`/admin/settings/upload-qr/${qrType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Update preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setQrPreviews(prev => ({
          ...prev,
          [qrType]: reader.result
        }))
      }
      reader.readAsDataURL(file)
      
      // Update settings with QR URL
      setSettings(prev => ({
        ...prev,
        [`${qrType}_qr_code`]: response.data.url
      }))
      
      alert(`${qrType === 'individual' ? 'Individual' : 'Bulk'} QR code uploaded successfully!`)
      
      // Refresh settings to get updated data
      fetchSettings()
    } catch (error) {
      console.error('Failed to upload QR code:', error)
      alert('Failed to upload QR code: ' + (error.response?.data?.detail || error.message))
    } finally {
      setUploadingQR(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await axiosInstance.put('/admin/settings', settings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings: ' + (error.response?.data?.detail || error.message))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Event Settings</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-purple-500/30 hover:bg-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium flex items-center gap-2"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Event Information */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Event Information
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Event Name</label>
            <input 
              type="text" 
              value={settings.event_name}
              onChange={(e) => handleChange('event_name', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Event Type</label>
            <input 
              type="text" 
              value={settings.event_type}
              onChange={(e) => handleChange('event_type', e.target.value)}
              placeholder="e.g., Conference, Workshop, Hackathon, Seminar"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
            <p className="text-white/50 text-xs mt-1">Type any event category that fits your event</p>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Event Date</label>
            <input 
              type="date" 
              value={settings.event_date}
              onChange={(e) => handleChange('event_date', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Event Time</label>
            <input 
              type="time" 
              value={settings.event_time}
              onChange={(e) => handleChange('event_time', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Venue Type</label>
            <select 
              value={settings.event_venue}
              onChange={(e) => handleChange('event_venue', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            >
              <option value="Offline">Offline</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Location/Venue Address</label>
            <input 
              type="text" 
              value={settings.event_location}
              onChange={(e) => handleChange('event_location', e.target.value)}
              placeholder="Full address or online platform link"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Pricing Configuration */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign size={20} />
          Pricing Configuration
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Individual Ticket Price</label>
            <input 
              type="number" 
              value={settings.individual_price}
              onChange={(e) => handleChange('individual_price', parseFloat(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Bulk/Team Ticket Price</label>
            <input 
              type="number" 
              value={settings.bulk_price}
              onChange={(e) => handleChange('bulk_price', parseFloat(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Bulk Team Size</label>
            <input 
              type="number" 
              value={settings.bulk_team_size}
              onChange={(e) => handleChange('bulk_team_size', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Currency</label>
            <select 
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Configuration */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">UPI ID</label>
            <input 
              type="text" 
              value={settings.upi_id}
              onChange={(e) => handleChange('upi_id', e.target.value)}
              placeholder="yourupiid@bank"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
            <p className="text-white/50 text-xs mt-1">This will be used to generate payment QR codes</p>
          </div>

          <div className="col-span-2 border-t border-white/20 pt-4">
            <h4 className="text-white font-semibold mb-3">Payment QR Codes</h4>
            <p className="text-white/60 text-sm mb-4">Upload separate QR codes for individual and bulk registrations</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Individual QR Upload */}
              <div>
                <label className="text-white/70 text-sm mb-2 block">Individual Payment QR</label>
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  {qrPreviews.individual || settings.individual_qr_code ? (
                    <div className="space-y-3">
                      <img 
                        src={qrPreviews.individual || settings.individual_qr_code} 
                        alt="Individual QR Preview"
                        className="w-32 h-32 mx-auto object-contain bg-white rounded"
                      />
                      <p className="text-white/60 text-xs text-center">QR Code Uploaded</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={32} className="text-white/40 mx-auto mb-2" />
                      <p className="text-white/60 text-xs">Click to upload QR code</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="individual-qr-upload"
                    accept="image/*"
                    onChange={(e) => handleQRUpload('individual', e.target.files[0])}
                    className="hidden"
                  />
                  <label
                    htmlFor="individual-qr-upload"
                    className={`block mt-3 px-4 py-2 bg-purple-500/30 hover:bg-purple-500/40 rounded-lg text-white text-sm text-center cursor-pointer transition-colors ${uploadingQR ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingQR ? 'Uploading...' : 'Upload QR Code'}
                  </label>
                </div>
              </div>

              {/* Bulk QR Upload */}
              <div>
                <label className="text-white/70 text-sm mb-2 block">Bulk/Team Payment QR</label>
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  {qrPreviews.bulk || settings.bulk_qr_code ? (
                    <div className="space-y-3">
                      <img 
                        src={qrPreviews.bulk || settings.bulk_qr_code} 
                        alt="Bulk QR Preview"
                        className="w-32 h-32 mx-auto object-contain bg-white rounded"
                      />
                      <p className="text-white/60 text-xs text-center">QR Code Uploaded</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={32} className="text-white/40 mx-auto mb-2" />
                      <p className="text-white/60 text-xs">Click to upload QR code</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="bulk-qr-upload"
                    accept="image/*"
                    onChange={(e) => handleQRUpload('bulk', e.target.files[0])}
                    className="hidden"
                  />
                  <label
                    htmlFor="bulk-qr-upload"
                    className={`block mt-3 px-4 py-2 bg-purple-500/30 hover:bg-purple-500/40 rounded-lg text-white text-sm text-center cursor-pointer transition-colors ${uploadingQR ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingQR ? 'Uploading...' : 'Upload QR Code'}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Details */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Organization Details</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Organization Name</label>
            <input 
              type="text" 
              value={settings.organization_name}
              onChange={(e) => handleChange('organization_name', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Support Email</label>
            <input 
              type="email" 
              value={settings.support_email}
              onChange={(e) => handleChange('support_email', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Email Templates</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Approval Email Subject</label>
            <input 
              type="text" 
              value={settings.approval_email_subject}
              onChange={(e) => handleChange('approval_email_subject', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Rejection Email Subject</label>
            <input 
              type="text" 
              value={settings.rejection_email_subject}
              onChange={(e) => handleChange('rejection_email_subject', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
