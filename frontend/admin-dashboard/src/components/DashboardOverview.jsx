import { Users, ClipboardCheck, CheckCircle, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'
import axiosInstance from '../config'

function DashboardOverview() {
  const [stats, setStats] = useState({
    total_registrations: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, regsRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/admin/registrations')
      ])
      setStats(statsRes.data)
      setRegistrations(regsRes.data.registrations || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      {loading ? (
        <div className="text-white/70">Loading statistics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Registrations</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total_registrations}</p>
              </div>
              <Users className="text-white/50" size={32} />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Pending Approvals</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.pending}</p>
              </div>
              <ClipboardCheck className="text-yellow-300" size={32} />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Approved Tickets</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.approved}</p>
              </div>
              <CheckCircle className="text-green-300" size={32} />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.rejected}</p>
              </div>
              <CreditCard className="text-red-300" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Recent Registrations */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Recent Registrations</h3>
        </div>
        {registrations.length === 0 ? (
          <div className="p-6">
            <p className="text-white/60 text-sm">No registrations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-white/70 font-medium">ID</th>
                  <th className="text-left p-4 text-white/70 font-medium">Name</th>
                  <th className="text-left p-4 text-white/70 font-medium">Email</th>
                  <th className="text-left p-4 text-white/70 font-medium">Type</th>
                  <th className="text-left p-4 text-white/70 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.slice(0, 5).map((reg) => (
                  <tr key={reg.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-4 text-white">#{reg.id}</td>
                    <td className="p-4 text-white">{reg.name}</td>
                    <td className="p-4 text-white/70">{reg.email}</td>
                    <td className="p-4 text-white/70 capitalize">{reg.payment_type}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        reg.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                        reg.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardOverview
