import { Settings as SettingsIcon, Upload, Save, Calendar, MapPin, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'
import axiosInstance from '../config'

function SettingsPage() {
  const [settings, setSettings] = useState({
    // Event Details
    event_name: 'IEEE YESS\'25',
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
    payment_instructions: '1. Scan the QR code\n2. Complete payment using UPI\n3. Take a screenshot\n4. Upload screenshot in registration form',
    
    // Organization
    organization_name: 'Event Ticketing System',
    support_email: 'support@eventticketing.com',
    
    // Email
    approval_email_subject: '🎉 Registration Confirmed!',
    rejection_email_subject: '❌ Payment Verification Issue'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

          <div>
            <label className="text-white/70 text-sm mb-2 block">Payment Instructions</label>
            <textarea 
              rows="4" 
              value={settings.payment_instructions}
              onChange={(e) => handleChange('payment_instructions', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            ></textarea>
          </div>

          <div className="col-span-2 border-t border-white/20 pt-4">
            <h4 className="text-white font-semibold mb-3">Payment QR Codes</h4>
            <p className="text-white/60 text-sm mb-4">Upload separate QR codes for individual and bulk registrations</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Individual Payment QR</label>
                <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
                  <Upload size={32} className="text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-xs mb-2">Upload to:</p>
                  <code className="text-white/80 text-xs bg-black/20 px-2 py-1 rounded">
                    frontend/registration-form/public/payment-qr/individual-qr.png
                  </code>
                  <p className="text-white/50 text-xs mt-2">Rebuild container after upload</p>
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Bulk/Team Payment QR</label>
                <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
                  <Upload size={32} className="text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-xs mb-2">Upload to:</p>
                  <code className="text-white/80 text-xs bg-black/20 px-2 py-1 rounded">
                    frontend/registration-form/public/payment-qr/bulk-qr.png
                  </code>
                  <p className="text-white/50 text-xs mt-2">Rebuild container after upload</p>
                </div>
              </div>
            </div>
            
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-200 text-xs">
                <strong>Note:</strong> Replace the placeholder SVG files with your actual QR code images (PNG/JPG recommended). 
                After uploading, run: <code className="bg-black/20 px-1 rounded">docker-compose up -d --build registration-form</code>
              </p>
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
