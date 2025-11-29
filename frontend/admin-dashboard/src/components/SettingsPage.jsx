import { Settings as SettingsIcon, Upload, Save } from 'lucide-react'

function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">System Settings</h2>

      {/* Payment Settings */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Payment QR Code</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 bg-white/5 border border-white/20 rounded-lg flex items-center justify-center">
                <Upload size={32} className="text-white/40" />
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm">
                Upload New QR
              </button>
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Payment Instructions</label>
            <textarea 
              rows="4" 
              defaultValue="1. Scan the QR code above&#10;2. Complete payment using UPI&#10;3. Take a screenshot&#10;4. Upload screenshot in registration form"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            ></textarea>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Max Screenshot Size (MB)</label>
            <input type="number" defaultValue="5" className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white" />
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
              defaultValue="🎉 Your Event Ticket is Ready!"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Rejection Email Subject</label>
            <input 
              type="text" 
              defaultValue="❌ Payment Verification Issue"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Branding</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Event Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-white/5 border border-white/20 rounded-lg flex items-center justify-center">
                <Upload size={24} className="text-white/40" />
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm">
                Upload Logo
              </button>
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Organization Name</label>
            <input 
              type="text" 
              defaultValue="Event Ticketing System"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-purple-500/30 hover:bg-purple-500/40 rounded-lg text-white font-medium flex items-center gap-2">
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
