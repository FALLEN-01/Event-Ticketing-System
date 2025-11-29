import { Shield, UserPlus, Edit, Trash2 } from 'lucide-react'

function AdminsRoles() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Admins & Roles</h2>
        <button className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/40 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
          <UserPlus size={16} />
          Add Admin
        </button>
      </div>

      {/* Roles Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <Shield className="text-purple-300 mb-3" size={32} />
          <h3 className="text-white font-semibold mb-2">Super Admin</h3>
          <p className="text-white/60 text-sm">Full access to all features</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <Shield className="text-blue-300 mb-3" size={32} />
          <h3 className="text-white font-semibold mb-2">Approvals Manager</h3>
          <p className="text-white/60 text-sm">Can approve/reject payments</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <Shield className="text-green-300 mb-3" size={32} />
          <h3 className="text-white font-semibold mb-2">Gate Staff</h3>
          <p className="text-white/60 text-sm">Check-in attendance only</p>
        </div>
      </div>

      {/* Admins List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Admin Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/70 font-medium">Name</th>
                <th className="text-left p-4 text-white/70 font-medium">Email</th>
                <th className="text-left p-4 text-white/70 font-medium">Role</th>
                <th className="text-left p-4 text-white/70 font-medium">Last Login</th>
                <th className="text-left p-4 text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10 hover:bg-white/5">
                <td className="p-4 text-white">Admin User</td>
                <td className="p-4 text-white/70">admin@event.com</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                    Super Admin
                  </span>
                </td>
                <td className="p-4 text-white/70">Just now</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-white/10 rounded">
                      <Edit size={16} className="text-white/70" />
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded">
                      <Trash2 size={16} className="text-red-300" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminsRoles
