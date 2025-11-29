import { useState, useEffect } from 'react'
import { ClipboardCheck, Download, Calendar as CalendarIcon, RefreshCw } from 'lucide-react'
import axiosInstance from '../config'

function AttendanceTracking() {
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState({ expected: 0, checkedIn: 0, notCheckedIn: 0 })
  const [loading, setLoading] = useState(true)

  const exportToCSV = () => {
    if (attendance.length === 0) {
      alert('No attendance data to export')
      return
    }

    const headers = ['Ticket ID', 'Name', 'Email', 'Check-in Time']
    const rows = attendance.map(record => [
      record.ticketId,
      record.name,
      record.email,
      new Date(record.checkInTime).toLocaleString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `attendance_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/admin/registrations')
      const registrations = response.data.registrations || []
      
      // Calculate stats
      const approved = registrations.filter(r => r.payment?.status === 'approved')
      const checkedInCount = approved.filter(r => 
        r.tickets?.some(t => t.attendance?.checked_in)
      ).length

      setStats({
        expected: approved.length,
        checkedIn: checkedInCount,
        notCheckedIn: approved.length - checkedInCount
      })

      // Get attendance records
      const attendanceData = []
      approved.forEach(reg => {
        reg.tickets?.forEach(ticket => {
          if (ticket.attendance?.checked_in) {
            attendanceData.push({
              ticketId: ticket.serial_code,
              name: ticket.member_name,
              checkInTime: ticket.attendance.check_in_time,
              email: reg.email
            })
          }
        })
      })
      
      setAttendance(attendanceData.sort((a, b) => 
        new Date(b.checkInTime) - new Date(a.checkInTime)
      ))
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Attendance Tracking</h2>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button 
            onClick={fetchAttendance}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div>
            <p className="text-white/70 text-sm">Expected Attendees</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.expected}</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div>
            <p className="text-white/70 text-sm">Checked In</p>
            <p className="text-3xl font-bold text-green-300 mt-2">{stats.checkedIn}</p>
            <p className="text-xs text-white/50 mt-1">
              {stats.expected > 0 ? Math.round((stats.checkedIn / stats.expected) * 100) : 0}% attendance
            </p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div>
            <p className="text-white/70 text-sm">Not Checked In</p>
            <p className="text-3xl font-bold text-red-300 mt-2">{stats.notCheckedIn}</p>
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
              {loading ? (
                <tr className="border-t border-white/10">
                  <td colSpan="5" className="p-8 text-center text-white/60">
                    <RefreshCw size={20} className="animate-spin inline mr-2" />
                    Loading attendance...
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td colSpan="5" className="p-8 text-center text-white/60">
                    No check-ins yet
                  </td>
                </tr>
              ) : (
                attendance.map((record, index) => (
                  <tr key={index} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-4 text-white font-mono">{record.ticketId}</td>
                    <td className="p-4 text-white">{record.name}</td>
                    <td className="p-4 text-white">
                      {new Date(record.checkInTime).toLocaleString()}
                    </td>
                    <td className="p-4 text-white/50">-</td>
                    <td className="p-4 text-white/70 text-sm">Scanner App</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AttendanceTracking
