import { Settings as SettingsIcon, Upload, Save, Calendar, MapPin, DollarSign } from 'lucide-react'
import { useState } from 'react'

function SettingsPage() {
  const [settings, setSettings] = useState({
    // Event Details
    eventName: 'IEEE YESS\'25',
    eventType: 'Conference',
    eventDate: '2025-09-20',
    eventTime: '09:00',
    eventVenue: 'Offline',
    eventLocation: 'BWA JHDR, Kattangal, Kerala 673601, India',
    
    // Pricing
    individualPrice: 500,
    bulkPrice: 2000,
    bulkTeamSize: 4,
    currency: 'INR',
    
    // Payment
    upiId: 'yourupiid@bank',
    paymentInstructions: '1. Scan the QR code\n2. Complete payment using UPI\n3. Take a screenshot\n4. Upload screenshot in registration form',
    
    // Organization
    organizationName: 'Event Ticketing System',
    supportEmail: 'support@eventticketing.com',
    
    // Email
    approvalEmailSubject: '🎉 Registration Confirmed!',
    rejectionEmailSubject: '❌ Payment Verification Issue'
  })

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      // TODO: API call to save settings
      console.log('Saving settings:', settings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Event Settings</h2>
        <button 
          onClick={handleSave}
          className="px-6 py-3 bg-purple-500/30 hover:bg-purple-500/40 rounded-lg text-white font-medium flex items-center gap-2"
        >
          <Save size={18} />
          Save Settings
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
              value={settings.eventName}
              onChange={(e) => handleChange('eventName', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Event Type</label>
            <select 
              value={settings.eventType}
              onChange={(e) => handleChange('eventType', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            >
              <option value="Conference">Conference</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Concert">Concert</option>
              <option value="Festival">Festival</option>
              <option value="Competition">Competition</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Event Date</label>
            <input 
              type="date" 
              value={settings.eventDate}
              onChange={(e) => handleChange('eventDate', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Event Time</label>
            <input 
              type="time" 
              value={settings.eventTime}
              onChange={(e) => handleChange('eventTime', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Venue Type</label>
            <select 
              value={settings.eventVenue}
              onChange={(e) => handleChange('eventVenue', e.target.value)}
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
              value={settings.eventLocation}
              onChange={(e) => handleChange('eventLocation', e.target.value)}
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
              value={settings.individualPrice}
              onChange={(e) => handleChange('individualPrice', parseFloat(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Bulk/Team Ticket Price</label>
            <input 
              type="number" 
              value={settings.bulkPrice}
              onChange={(e) => handleChange('bulkPrice', parseFloat(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Bulk Team Size</label>
            <input 
              type="number" 
              value={settings.bulkTeamSize}
              onChange={(e) => handleChange('bulkTeamSize', parseInt(e.target.value))}
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
              value={settings.upiId}
              onChange={(e) => handleChange('upiId', e.target.value)}
              placeholder="yourupiid@bank"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
            <p className="text-white/50 text-xs mt-1">This will be used to generate payment QR codes</p>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Payment Instructions</label>
            <textarea 
              rows="4" 
              value={settings.paymentInstructions}
              onChange={(e) => handleChange('paymentInstructions', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            ></textarea>
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
              value={settings.organizationName}
              onChange={(e) => handleChange('organizationName', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Support Email</label>
            <input 
              type="email" 
              value={settings.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
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
              value={settings.approvalEmailSubject}
              onChange={(e) => handleChange('approvalEmailSubject', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Rejection Email Subject</label>
            <input 
              type="text" 
              value={settings.rejectionEmailSubject}
              onChange={(e) => handleChange('rejectionEmailSubject', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
