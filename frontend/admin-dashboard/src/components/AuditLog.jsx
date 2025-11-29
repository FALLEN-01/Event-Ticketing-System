import { FileText, Filter, Download } from 'lucide-react'

function AuditLog() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Audit Log</h2>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
          <Download size={16} />
          Export Log
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Date Range</label>
            <input type="date" className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white" />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Action Type</label>
            <select className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white">
              <option>All Actions</option>
              <option>Registration Created</option>
              <option>Payment Approved</option>
              <option>Payment Rejected</option>
              <option>Ticket Issued</option>
              <option>Check-in</option>
              <option>Settings Changed</option>
            </select>
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Admin User</label>
            <select className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white">
              <option>All Users</option>
              <option>System</option>
              <option>Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/70 font-medium">Timestamp</th>
                <th className="text-left p-4 text-white/70 font-medium">Action</th>
                <th className="text-left p-4 text-white/70 font-medium">User</th>
                <th className="text-left p-4 text-white/70 font-medium">Target</th>
                <th className="text-left p-4 text-white/70 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10 hover:bg-white/5">
                <td className="p-4 text-white/70">2025-11-29 10:30:45</td>
                <td className="p-4 text-white">Admin Login</td>
                <td className="p-4 text-white/70">admin@event.com</td>
                <td className="p-4 text-white/70">-</td>
                <td className="p-4 text-white/70">Successful login from IP: 192.168.1.1</td>
              </tr>
              <tr className="border-t border-white/10 hover:bg-white/5">
                <td className="p-4 text-white/70">2025-11-29 10:25:12</td>
                <td className="p-4 text-white">Settings Changed</td>
                <td className="p-4 text-white/70">admin@event.com</td>
                <td className="p-4 text-white/70">System Settings</td>
                <td className="p-4 text-white/70">Updated payment QR code</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditLog
