import { CheckCircle, XCircle, Search, ZoomIn, Eye } from 'lucide-react'
import { useState } from 'react'

function Approvals() {
  const [selectedReg, setSelectedReg] = useState(null)
  const [filter, setFilter] = useState('pending')

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Payment Approvals</h2>

      {/* Two-Pane Split Layout */}
      <div className="grid md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
        
        {/* LEFT PANE: Registrations List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden flex flex-col">
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
              {/* Registration Item */}
              <div className="p-4 text-center text-white/60">
                No {filter} registrations
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Screenshot Preview */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden flex flex-col">
          {selectedReg ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Registration #123</h3>
                    <p className="text-white/60 text-sm">John Doe</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </div>
              </div>

              {/* Screenshot Preview */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* User Details */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">User Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Email:</span>
                        <span className="text-white">john@example.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Phone:</span>
                        <span className="text-white">+1234567890</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Type:</span>
                        <span className="text-white">Individual</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Submitted:</span>
                        <span className="text-white">2 hours ago</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Screenshot */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">Payment Screenshot</h4>
                      <button className="text-white/70 hover:text-white">
                        <ZoomIn size={18} />
                      </button>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                      <Eye size={48} className="text-white/40" />
                      <p className="text-white/60 ml-3">Screenshot will appear here</p>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Admin Notes</h4>
                    <textarea 
                      rows="3" 
                      placeholder="Add notes about this verification..."
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-white/10 flex gap-3">
                <button className="flex-1 px-4 py-3 bg-green-500/30 hover:bg-green-500/40 rounded-lg text-white font-medium flex items-center justify-center gap-2">
                  <CheckCircle size={18} />
                  Approve
                </button>
                <button className="flex-1 px-4 py-3 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-white font-medium flex items-center justify-center gap-2">
                  <XCircle size={18} />
                  Reject
                </button>
              </div>
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
