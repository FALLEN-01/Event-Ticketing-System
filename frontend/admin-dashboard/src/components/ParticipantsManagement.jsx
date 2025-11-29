import { useState, useEffect } from 'react'
import { Search, Edit, Trash2, Plus, FileText, RefreshCw, Download } from 'lucide-react'
import axiosInstance from '../config'

function ParticipantsManagement() {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const exportToCSV = () => {
    if (filteredParticipants.length === 0) {
      alert('No participants to export')
      return
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Team Name', 'Ticket IDs', 'Payment Status', 'Registration Date']
    const rows = filteredParticipants.map(participant => [
      participant.id,
      participant.full_name,
      participant.email,
      participant.phone,
      participant.team_name || 'Individual',
      participant.tickets?.map(t => t.serial_code).join('; ') || 'N/A',
      participant.payment?.status || 'pending',
      new Date(participant.created_at).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `participants_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    fetchParticipants()
  }, [])

  const fetchParticipants = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/admin/registrations')
      setParticipants(response.data.registrations || [])
    } catch (error) {
      console.error('Error fetching participants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredParticipants = participants.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm) ||
    p.id?.toString().includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Participants ({filteredParticipants.length})</h2>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button 
            onClick={fetchParticipants}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input 
            type="text" 
            placeholder="Search by name, phone, or registration ID..." 
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/70 font-medium">ID</th>
                <th className="text-left p-4 text-white/70 font-medium">Name</th>
                <th className="text-left p-4 text-white/70 font-medium">Email</th>
                <th className="text-left p-4 text-white/70 font-medium">Phone</th>
                <th className="text-left p-4 text-white/70 font-medium">Ticket ID</th>
                <th className="text-left p-4 text-white/70 font-medium">Notes</th>
                <th className="text-left p-4 text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t border-white/10">
                  <td colSpan="7" className="p-8 text-center text-white/60">
                    <RefreshCw size={20} className="animate-spin inline mr-2" />
                    Loading participants...
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td colSpan="7" className="p-8 text-center text-white/60">
                    No participants found
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-4 text-white">#{participant.id}</td>
                    <td className="p-4 text-white font-medium">{participant.full_name}</td>
                    <td className="p-4 text-white">{participant.email}</td>
                    <td className="p-4 text-white">{participant.phone}</td>
                    <td className="p-4 text-white">
                      {participant.tickets?.map(t => t.serial_code).join(', ') || 'N/A'}
                    </td>
                    <td className="p-4 text-white/70 text-xs">
                      {participant.team_name ? `Team: ${participant.team_name}` : 'Individual'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-white/10 rounded text-blue-400">
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
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

export default ParticipantsManagement
