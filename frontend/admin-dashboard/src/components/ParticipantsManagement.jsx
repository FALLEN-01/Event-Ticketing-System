import { Search, Edit, Trash2, Plus, FileText } from 'lucide-react'

function ParticipantsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Participants</h2>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
          <Plus size={16} />
          Add Manual Entry
        </button>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input 
            type="text" 
            placeholder="Search by name, phone, or registration ID..." 
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50"
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
              <tr className="border-t border-white/10">
                <td colSpan="7" className="p-8 text-center text-white/60">
                  No participants found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ParticipantsManagement
