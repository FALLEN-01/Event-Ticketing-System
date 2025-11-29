import { Ticket, Search, Filter, Download, XCircle, Send } from 'lucide-react'
import { useState } from 'react'

function TicketsManagement() {
  const [filterType, setFilterType] = useState('all')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Tickets Management</h2>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
          <Download size={16} />
          Export Tickets
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="text" 
              placeholder="Search by ticket ID, name, or email..." 
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            >
              <option value="all">All Tickets</option>
              <option value="individual">Individual</option>
              <option value="bulk">Bulk Groups</option>
              <option value="active">Active</option>
              <option value="invalid">Invalid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/70 font-medium">Ticket ID</th>
                <th className="text-left p-4 text-white/70 font-medium">Name</th>
                <th className="text-left p-4 text-white/70 font-medium">Email</th>
                <th className="text-left p-4 text-white/70 font-medium">Type</th>
                <th className="text-left p-4 text-white/70 font-medium">Status</th>
                <th className="text-left p-4 text-white/70 font-medium">QR Code</th>
                <th className="text-left p-4 text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10">
                <td colSpan="7" className="p-8 text-center text-white/60">
                  No tickets issued yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Group Actions */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Bulk Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 rounded-lg text-white text-sm flex items-center gap-2">
            <Send size={16} />
            Resend Selected
          </button>
          <button className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-white text-sm flex items-center gap-2">
            <XCircle size={16} />
            Mark as Invalid
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketsManagement
