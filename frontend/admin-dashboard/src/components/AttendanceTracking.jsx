import { ClipboardCheck, Download, Calendar as CalendarIcon } from 'lucide-react'

function AttendanceTracking() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Attendance Tracking</h2>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
          <Download size={16} />
          Export Attendance
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div>
            <p className="text-white/70 text-sm">Expected</p>
            <p className="text-3xl font-bold text-white mt-2">0</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div>
            <p className="text-white/70 text-sm">Checked In</p>
            <p className="text-3xl font-bold text-green-300 mt-2">0</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div>
            <p className="text-white/70 text-sm">Checked Out</p>
            <p className="text-3xl font-bold text-blue-300 mt-2">0</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div>
            <p className="text-white/70 text-sm">No-Shows</p>
            <p className="text-3xl font-bold text-red-300 mt-2">0</p>
          </div>
        </div>
      </div>

      {/* Check-in Log */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Recent Check-ins</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/70 font-medium">Ticket ID</th>
                <th className="text-left p-4 text-white/70 font-medium">Name</th>
                <th className="text-left p-4 text-white/70 font-medium">Check-in Time</th>
                <th className="text-left p-4 text-white/70 font-medium">Check-out Time</th>
                <th className="text-left p-4 text-white/70 font-medium">Device</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10">
                <td colSpan="5" className="p-8 text-center text-white/60">
                  No check-ins yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AttendanceTracking
