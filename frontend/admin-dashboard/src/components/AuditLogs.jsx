import { Shield, Clock, MapPin, Monitor, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import axiosInstance from '../config'

function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAuditLogs()
    fetchStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAuditLogs()
      fetchStats()
    }, 30000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchAuditLogs = async () => {
    try {
      const params = filter !== 'all' ? { action: filter } : {}
      const response = await axiosInstance.get('/admin/audit/logs', { params })
      setLogs(response.data)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/audit/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchAuditLogs()
    fetchStats()
  }

  const getActionColor = (action) => {
    const colors = {
      LOGIN: 'bg-green-500/20 text-green-300',
      LOGOUT: 'bg-gray-500/20 text-gray-300',
      APPROVE_PAYMENT: 'bg-blue-500/20 text-blue-300',
      REJECT_PAYMENT: 'bg-red-500/20 text-red-300',
      CREATE_ADMIN: 'bg-purple-500/20 text-purple-300',
      UPDATE_ADMIN: 'bg-yellow-500/20 text-yellow-300',
      DELETE_ADMIN: 'bg-red-500/20 text-red-300',
      UPDATE_SETTINGS: 'bg-orange-500/20 text-orange-300',
      UPLOAD_QR: 'bg-cyan-500/20 text-cyan-300',
      PASSWORD_CHANGE: 'bg-pink-500/20 text-pink-300',
      NEW_REGISTRATION: 'bg-emerald-500/20 text-emerald-300',
      TICKET_CHECKIN: 'bg-indigo-500/20 text-indigo-300',
      SEND_APPROVAL_EMAIL: 'bg-blue-400/20 text-blue-300',
      SEND_REJECTION_EMAIL: 'bg-red-400/20 text-red-300',
      SEND_PENDING_EMAIL: 'bg-yellow-400/20 text-yellow-300',
    }
    return colors[action] || 'bg-gray-500/20 text-gray-300'
  }

  const getActionIcon = (action) => {
    return <Shield size={16} />
  }

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const parseDetails = (details) => {
    if (!details) return null
    try {
      return JSON.parse(details)
    } catch {
      return details
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
          <p className="text-white/60 text-sm mt-1">Track all admin activities and system changes</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/40 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-white/60 text-sm mb-1">Total Logs</div>
            <div className="text-3xl font-bold text-white">{stats.total_logs}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-white/60 text-sm mb-1">Last 24 Hours</div>
            <div className="text-3xl font-bold text-white">{stats.last_24h}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-white/60 text-sm mb-1">Logins</div>
            <div className="text-3xl font-bold text-white">{stats.action_counts.LOGIN || 0}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-white/60 text-sm mb-1">Approvals</div>
            <div className="text-3xl font-bold text-white">{stats.action_counts.APPROVE_PAYMENT || 0}</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'LOGIN', 'APPROVE_PAYMENT', 'REJECT_PAYMENT', 'CREATE_ADMIN', 'UPDATE_ADMIN', 'UPDATE_SETTINGS'].map((action) => (
          <button
            key={action}
            onClick={() => setFilter(action)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === action
                ? 'bg-purple-500/30 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {action === 'all' ? 'All' : formatAction(action)}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Activity Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/70 font-medium">Time</th>
                <th className="text-left p-4 text-white/70 font-medium">Action</th>
                <th className="text-left p-4 text-white/70 font-medium">Admin</th>
                <th className="text-left p-4 text-white/70 font-medium">Details</th>
                <th className="text-left p-4 text-white/70 font-medium">IP Address</th>
                <th className="text-left p-4 text-white/70 font-medium">Device</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-white/70">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-white/70">No audit logs found</td></tr>
              ) : (
                logs.map((log) => {
                  const details = parseDetails(log.details)
                  return (
                    <tr key={log.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="p-4 text-white/70">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {formatDate(log.created_at)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 ${getActionColor(log.action)} rounded text-xs font-medium inline-flex items-center gap-1`}>
                          {getActionIcon(log.action)}
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">{log.admin_name}</div>
                        <div className="text-white/50 text-xs">{log.admin_email}</div>
                      </td>
                      <td className="p-4 text-white/70 max-w-xs">
                        {details && typeof details === 'object' ? (
                          <div className="text-xs">
                            {Object.entries(details).slice(0, 3).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-white/50">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs">{details || '-'}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-white/70">
                          <MapPin size={14} />
                          <span className="text-xs">{log.ip_address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-white/70">
                          <Monitor size={14} />
                          <span className="text-xs truncate max-w-[150px]" title={log.user_agent}>
                            {log.user_agent ? log.user_agent.split('/')[0] : 'N/A'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditLogs
