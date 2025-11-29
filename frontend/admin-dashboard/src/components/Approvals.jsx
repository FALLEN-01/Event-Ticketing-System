import { CheckCircle, XCircle, Search, ZoomIn, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import axiosInstance from '../config'

function Approvals() {
  const [selectedReg, setSelectedReg] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchRegistrations()
  }, [filter])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/admin/registrations?status_filter=${filter}`)
      setRegistrations(response.data.registrations || [])
    } catch (error) {
      console.error('Failed to fetch registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleApprove = async (regId) => {
    try {
      await axiosInstance.post(`/admin/registrations/${regId}/approve`)
      showNotification('Registration approved successfully!', 'success')
      
      // Update the registrations list immediately
      setRegistrations(prevRegs => prevRegs.filter(reg => reg.id !== regId))
      setSelectedReg(null)
      
      // Fetch updated data in background
      fetchRegistrations()
    } catch (error) {
      console.error('Failed to approve:', error)
      showNotification('Failed to approve registration', 'error')
    }
  }

  const handleReject = async (regId) => {
    try {
      await axiosInstance.post(`/admin/registrations/${regId}/reject`, {
        reason: rejectReason || 'Payment verification failed'
      })
      showNotification('Registration rejected', 'success')
      
      // Update the registrations list immediately
      setRegistrations(prevRegs => prevRegs.filter(reg => reg.id !== regId))
      setSelectedReg(null)
      setRejectReason('')
      
      // Fetch updated data in background
      fetchRegistrations()
    } catch (error) {
      console.error('Failed to reject:', error)
      showNotification('Failed to reject registration', 'error')
    }
  }

  const selectRegistration = async (reg) => {
    try {
      const response = await axiosInstance.get(`/admin/registrations/${reg.id}`)
      setSelectedReg(response.data)
    } catch (error) {
      console.error('Failed to fetch registration details:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Custom Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg backdrop-blur-md animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-green-500/90 border border-green-400' 
            : 'bg-red-500/90 border border-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle size={20} className="text-white" />
            ) : (
              <XCircle size={20} className="text-white" />
            )}
            <span className="text-white font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-white">Payment Approvals</h2>

      {/* Two-Pane Split Layout - 30:70 ratio */}
      <div className="flex gap-4 h-[calc(100vh-200px)]">
        
        {/* LEFT PANE: Registrations List - 30% */}
        <div className="w-[30%] bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden flex flex-col">
          {/* Filter Tabs */}
          <div className="p-4 border-b border-white/10">
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'pending' ? 'bg-yellow-500/30 text-yellow-300' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Pending
              </button>
              <button 
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'approved' ? 'bg-green-500/30 text-green-300' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Approved
              </button>
              <button 
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'rejected' ? 'bg-red-500/30 text-red-300' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50"
              />
            </div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-2">
              {loading ? (
                <div className="p-4 text-center text-white/60">Loading...</div>
              ) : registrations.length === 0 ? (
                <div className="p-4 text-center text-white/60">
                  No {filter} registrations
                </div>
              ) : (
                registrations.map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => selectRegistration(reg)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      selectedReg?.id === reg.id
                        ? 'bg-white/20'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{reg.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        reg.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                        reg.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {reg.status}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm font-mono">{reg.serial_code}</p>
                    <p className="text-white/60 text-sm">{reg.email}</p>
                    <p className="text-white/60 text-xs mt-1 capitalize">{reg.payment_type}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Screenshot Preview - 70% */}
        <div className="w-[70%] bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden flex flex-col">
          {selectedReg ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedReg.name}</h3>
                    <p className="text-white/80 text-sm font-mono">{selectedReg.serial_code}</p>
                    <p className="text-white/60 text-xs">{selectedReg.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedReg.payment?.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                    selectedReg.payment?.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {selectedReg.payment?.status || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Screenshot Preview */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* User Details */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Registration Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Registration ID:</span>
                        <span className="text-white font-mono font-bold">{selectedReg.serial_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Name:</span>
                        <span className="text-white">{selectedReg.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Email:</span>
                        <span className="text-white">{selectedReg.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Phone:</span>
                        <span className="text-white">{selectedReg.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Type:</span>
                        <span className="text-white capitalize">{selectedReg.payment_type}</span>
                      </div>
                      {selectedReg.team_name && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Team:</span>
                          <span className="text-white">{selectedReg.team_name}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/60">Tickets:</span>
                        <span className="text-white">{selectedReg.tickets_count || 0}</span>
                      </div>
                      {selectedReg.payment?.amount && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Amount:</span>
                          <span className="text-white font-semibold">₹{selectedReg.payment.amount}</span>
                        </div>
                      )}
                      {selectedReg.payment?.payment_method && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Payment Method:</span>
                          <span className="text-white capitalize">{selectedReg.payment.payment_method}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/60">Submitted:</span>
                        <span className="text-white">{new Date(selectedReg.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Screenshot */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">Payment Screenshot</h4>
                      {selectedReg.payment?.payment_screenshot && (
                        <a 
                          href={selectedReg.payment.payment_screenshot} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-white/70 hover:text-white"
                        >
                          <ZoomIn size={18} />
                        </a>
                      )}
                    </div>
                    {selectedReg.payment?.payment_screenshot ? (
                      <div className="bg-white/5 rounded-lg overflow-hidden">
                        <img 
                          src={selectedReg.payment.payment_screenshot} 
                          alt="Payment proof" 
                          className="w-full h-auto max-h-[400px] object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-white/5 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                        <Eye size={48} className="text-white/40" />
                        <p className="text-white/60 ml-3">No screenshot available</p>
                      </div>
                    )}
                  </div>

                  {/* Rejection Reason (if rejected) */}
                  {selectedReg.payment?.status === 'rejected' && selectedReg.payment?.rejection_reason && (
                    <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                      <h4 className="text-red-300 font-medium mb-2">Rejection Reason</h4>
                      <p className="text-white/70 text-sm">{selectedReg.payment.rejection_reason}</p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {selectedReg.payment?.status === 'pending' && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Rejection Reason (Optional)</h4>
                      <textarea 
                        rows="3" 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason if rejecting..."
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50"
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedReg.payment?.status === 'pending' && (
                <div className="p-4 border-t border-white/10 flex gap-3">
                  <button 
                    onClick={() => handleApprove(selectedReg.id)}
                    className="flex-1 px-4 py-3 bg-green-500/30 hover:bg-green-500/40 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(selectedReg.id)}
                    className="flex-1 px-4 py-3 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/60">
                <Eye size={48} className="mx-auto mb-3 opacity-40" />
                <p>Select a registration to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Approvals
