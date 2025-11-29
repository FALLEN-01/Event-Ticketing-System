import { Users, ClipboardCheck, CheckCircle, CreditCard } from 'lucide-react'

function DashboardOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Registrations</p>
              <p className="text-3xl font-bold text-white mt-2">0</p>
            </div>
            <Users className="text-white/50" size={32} />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Pending Approvals</p>
              <p className="text-3xl font-bold text-white mt-2">0</p>
            </div>
            <ClipboardCheck className="text-yellow-300" size={32} />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Approved Tickets</p>
              <p className="text-3xl font-bold text-white mt-2">0</p>
            </div>
            <CheckCircle className="text-green-300" size={32} />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">$0</p>
            </div>
            <CreditCard className="text-blue-300" size={32} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Admin Activity</h3>
        <div className="space-y-3">
          <p className="text-white/60 text-sm">No recent activity</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
