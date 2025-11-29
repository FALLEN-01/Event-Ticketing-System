import { CreditCard, CheckCircle, AlertTriangle, Search } from 'lucide-react'

function PaymentsVerification() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Payments Verification</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div>
            <p className="text-white/70 text-sm">Total Payments</p>
            <p className="text-3xl font-bold text-white mt-2">0</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div>
            <p className="text-white/70 text-sm">Verified</p>
            <p className="text-3xl font-bold text-green-300 mt-2">0</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div>
            <p className="text-white/70 text-sm">Suspicious</p>
            <p className="text-3xl font-bold text-red-300 mt-2">0</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input 
            type="text" 
            placeholder="Search by transaction ID, UPI ID..." 
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
                <th className="text-left p-4 text-white/70 font-medium">Amount</th>
                <th className="text-left p-4 text-white/70 font-medium">Screenshot</th>
                <th className="text-left p-4 text-white/70 font-medium">Status</th>
                <th className="text-left p-4 text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10">
                <td colSpan="6" className="p-8 text-center text-white/60">
                  No payment screenshots to verify
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PaymentsVerification
