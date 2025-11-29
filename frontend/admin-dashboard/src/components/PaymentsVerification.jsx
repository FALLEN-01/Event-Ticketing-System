import { CreditCard, CheckCircle, XCircle, Search, Eye, ZoomIn, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import axiosInstance from '../config'

function PaymentsVerification() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [filter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/admin/registrations')
      const allRegs = response.data.registrations || []
      
      // Filter by payment status
      let filtered = allRegs
      if (filter === 'pending') {
        filtered = allRegs.filter(r => r.payment?.status === 'pending')
      } else if (filter === 'approved') {
        filtered = allRegs.filter(r => r.payment?.status === 'approved')
      } else if (filter === 'rejected') {
        filtered = allRegs.filter(r => r.payment?.status === 'rejected')
      }
      
      setRegistrations(filtered)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
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
      showNotification('Payment approved successfully!', 'success')
      setSelectedPayment(null)
      fetchPayments()
    } catch (error) {
      console.error('Failed to approve:', error)
      showNotification('Failed to approve payment', 'error')
    }
  }

  const handleReject = async (regId) => {
    if (!rejectReason.trim()) {
      showNotification('Please provide a reason for rejection', 'error')
      return
    }
    try {
      await axiosInstance.post(`/admin/registrations/${regId}/reject`, {
        reason: rejectReason
      })
      showNotification('Payment rejected', 'success')
      setSelectedPayment(null)
      setRejectReason('')
      fetchPayments()
    } catch (error) {
      console.error('Failed to reject:', error)
      showNotification('Failed to reject payment', 'error')
    }
  }

  const viewPaymentDetails = async (reg) => {
    try {
      const response = await axiosInstance.get(`/admin/registrations/${reg.id}`)
      setSelectedPayment(response.data)
    } catch (error) {
      console.error('Failed to fetch details:', error)
    }
  }

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.payment?.status === 'pending').length,
    approved: registrations.filter(r => r.payment?.status === 'approved').length,
    rejected: registrations.filter(r => r.payment?.status === 'rejected').length
  }

  const filteredRegistrations = registrations.filter(reg => 
    reg.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.tickets?.[0]?.serial_code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg backdrop-blur-md animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-green-500/90 border border-green-400' 
            : 'bg-red-500/90 border border-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? <CheckCircle size={20} className="text-white" /> : <XCircle size={20} className="text-white" />}
            <span className="text-white font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedPayment?.payment?.payment_screenshot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowImageModal(false)} className="absolute -top-10 right-0 text-white hover:text-red-400 text-xl font-bold">
              ✕ Close
            </button>
            <img src={selectedPayment.payment.payment_screenshot} alt="Payment Screenshot" className="max-w-full max-h-[90vh] rounded-lg" />
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-white">Payments Verification</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <p className="text-white/70 text-sm">Total Payments</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <p className="text-white/70 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-300 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <p className="text-white/70 text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-300 mt-2">{stats.approved}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <p className="text-white/70 text-sm">Rejected</p>
          <p className="text-3xl font-bold text-red-300 mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === status
                ? 'bg-purple-500/30 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input 
            type="text" 
            placeholder="Search by name, email, serial code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50"
          />
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Payment Screenshots</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/70 font-medium">Reg ID</th>
                <th className="text-left p-4 text-white/70 font-medium">Name</th>
                <th className="text-left p-4 text-white/70 font-medium">Email</th>
                <th className="text-left p-4 text-white/70 font-medium">Type</th>
                <th className="text-left p-4 text-white/70 font-medium">Amount</th>
                <th className="text-left p-4 text-white/70 font-medium">Screenshot</th>
                <th className="text-left p-4 text-white/70 font-medium">Status</th>
                <th className="text-left p-4 text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-white/60">Loading...</td></tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-white/60">No payments found</td></tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-4 text-white font-mono">{reg.serial_code}</td>
                    <td className="p-4 text-white">{reg.name}</td>
                    <td className="p-4 text-white/70 text-xs">{reg.email}</td>
                    <td className="p-4 text-white/70 capitalize">{reg.payment_type}</td>
                    <td className="p-4 text-white font-semibold">
                      {reg.payment?.amount ? `₹${reg.payment.amount}` : <span className="text-white/50">N/A</span>}
                    </td>
                    <td className="p-4">
                      <button onClick={() => { viewPaymentDetails(reg); }} className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        <Eye size={16} /> View
                      </button>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        reg.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                        reg.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {reg.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => viewPaymentDetails(reg)} className="px-3 py-1 bg-purple-500/30 hover:bg-purple-500/40 rounded text-white text-xs">
                            Review
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Panel */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setSelectedPayment(null)}>
          <div className="bg-[#1e1e2e] rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Payment Details</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm">Registration ID</p>
                  <p className="text-white font-mono">{selectedPayment.serial_code}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Name</p>
                  <p className="text-white">{selectedPayment.name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Email</p>
                  <p className="text-white">{selectedPayment.email}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Payment Type</p>
                  <p className="text-white capitalize">{selectedPayment.payment_type}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Amount Paid</p>
                  <p className="text-white font-semibold text-lg">
                    {selectedPayment.payment?.amount ? `₹${selectedPayment.payment.amount}` : <span className="text-white/50">N/A</span>}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Payment Method</p>
                  <p className="text-white">{selectedPayment.payment?.payment_method || 'UPI'}</p>
                </div>
              </div>

              {selectedPayment.payment?.payment_screenshot && (
                <div>
                  <p className="text-white/60 text-sm mb-2">Payment Screenshot</p>
                  <div className="relative group">
                    <img src={selectedPayment.payment.payment_screenshot} alt="Payment" className="w-full rounded-lg border border-white/20" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button onClick={() => setShowImageModal(true)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white flex items-center gap-2">
                        <ZoomIn size={16} /> Zoom
                      </button>
                      <a href={selectedPayment.payment.payment_screenshot} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white flex items-center gap-2">
                        <ExternalLink size={16} /> Open
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Rejection Reason (optional)</label>
                    <textarea 
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 min-h-[80px]"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleApprove(selectedPayment.id)} className="flex-1 px-4 py-3 bg-green-500/30 hover:bg-green-500/40 rounded-lg text-green-300 font-medium flex items-center justify-center gap-2">
                      <CheckCircle size={18} /> Approve Payment
                    </button>
                    <button onClick={() => handleReject(selectedPayment.id)} className="flex-1 px-4 py-3 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-red-300 font-medium flex items-center justify-center gap-2">
                      <XCircle size={18} /> Reject Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentsVerification
