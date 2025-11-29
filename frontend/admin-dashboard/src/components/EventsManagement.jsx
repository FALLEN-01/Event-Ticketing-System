import { Calendar, MapPin, Users, Settings, Upload, Download } from 'lucide-react'

function EventsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Events Management</h2>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
          <Download size={16} />
          Export Data
        </button>
      </div>

      {/* Event Details Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Event Details</h3>
          <button className="px-3 py-1.5 bg-purple-500/30 hover:bg-purple-500/40 rounded-lg text-white text-sm flex items-center gap-2">
            <Settings size={16} />
            Edit Event
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Event Name</label>
            <input type="text" defaultValue="Tech Conference 2025" className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white" />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Event Date</label>
            <input type="date" className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white" />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Venue</label>
            <input type="text" placeholder="Conference Hall A" className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white" />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Seat Capacity</label>
            <input type="number" defaultValue="500" className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white" />
          </div>
        </div>

        <div className="mt-6">
          <label className="text-white/70 text-sm mb-2 block">Registration Instructions</label>
          <textarea rows="4" placeholder="Pay via QR and upload screenshot..." className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"></textarea>
        </div>

        <div className="mt-6">
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

        <div className="mt-6 flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-white font-medium">Registration Status</p>
            <p className="text-white/60 text-sm">Allow new registrations</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>
    </div>
  )
}

export default EventsManagement
