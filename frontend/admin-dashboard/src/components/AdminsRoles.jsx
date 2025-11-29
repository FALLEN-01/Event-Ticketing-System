import { Shield, UserPlus, Edit, Trash2, X, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import axiosInstance from '../config'

function AdminsRoles() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'reviewer'
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await axiosInstance.get('/admin/admins')
      setAdmins(response.data)
    } catch (error) {
      console.error('Failed to fetch admins:', error)
      alert('Failed to fetch admins')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post('/admin/admins', formData)
      alert('Admin added successfully!')
      setShowAddModal(false)
      resetForm()
      fetchAdmins()
    } catch (error) {
      alert('Failed to add admin: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      const updateData = { ...formData }
      if (!updateData.password) delete updateData.password // Don't update if empty
      
      await axiosInstance.put(`/admin/admins/${selectedAdmin.id}`, updateData)
      alert('Admin updated successfully!')
      setShowEditModal(false)
      resetForm()
      fetchAdmins()
    } catch (error) {
      alert('Failed to update admin: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleDelete = async (admin) => {
    if (!confirm(`Are you sure you want to delete ${admin.name}?`)) return
    
    try {
      await axiosInstance.delete(`/admin/admins/${admin.id}`)
      alert('Admin deleted successfully!')
      fetchAdmins()
    } catch (error) {
      alert('Failed to delete admin: ' + (error.response?.data?.detail || error.message))
    }
  }

  const openEditModal = (admin) => {
    setSelectedAdmin(admin)
    setFormData({
      email: admin.email,
      password: '',
      name: admin.name,
      role: admin.role
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'reviewer'
    })
    setSelectedAdmin(null)
  }

  const getRoleBadgeColor = (role) => {
    if (role === 'superadmin') return 'bg-purple-500/20 text-purple-300'
    if (role === 'staff') return 'bg-green-500/20 text-green-300'
    return 'bg-blue-500/20 text-blue-300'  // reviewer
  }

  const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Admins & Roles</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/40 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
        >
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
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center text-white/70">Loading...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-white/70">No admins found</td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-4 text-white">{admin.name}</td>
                    <td className="p-4 text-white/70">{admin.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 ${getRoleBadgeColor(admin.role)} rounded text-xs font-medium`}>
                        {admin.role === 'superadmin' ? 'Super Admin' : admin.role === 'staff' ? 'Staff' : 'Reviewer'}
                      </span>
                    </td>
                    <td className="p-4 text-white/70">{formatDate(admin.last_login)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(admin)}
                          className="p-1.5 hover:bg-white/10 rounded"
                        >
                          <Edit size={16} className="text-white/70" />
                        </button>
                        <button 
                          onClick={() => handleDelete(admin)}
                          className="p-1.5 hover:bg-white/10 rounded"
                        >
                          <Trash2 size={16} className="text-red-300" />
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

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Add New Admin</h3>
              <button 
                onClick={() => { setShowAddModal(false); resetForm(); }} 
                className="text-gray-500 hover:text-gray-800 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm mb-2 block font-medium">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm mb-2 block font-medium">Email</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm mb-2 block font-medium">Password</label>
                <input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter strong password"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm mb-2 block font-medium">Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                    appearance: 'none'
                  }}
                >
                  <option value="reviewer">Reviewer</option>
                  <option value="staff">Staff</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
              >
                <Save size={18} />
                Create Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Edit Admin</h3>
              <button 
                onClick={() => { setShowEditModal(false); resetForm(); }} 
                className="text-gray-500 hover:text-gray-800 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm mb-2 block font-medium">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm mb-2 block font-medium">Email</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm mb-2 block font-medium">Password <span className="text-gray-500 text-xs">(optional)</span></label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Leave empty to keep current"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm mb-2 block font-medium">Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                    appearance: 'none'
                  }}
                >
                  <option value="reviewer">Reviewer</option>
                  <option value="staff">Staff</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
              >
                <Save size={18} />
                Update Admin
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminsRoles
