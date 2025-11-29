import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, Ticket, Users, User, ClipboardCheck, CreditCard, CheckCircle, Shield, Settings, FileText, LogOut, Bell } from 'lucide-react'
import DashboardOverview from '../components/DashboardOverview'
import EventsManagement from '../components/EventsManagement'
import TicketsManagement from '../components/TicketsManagement'
import ParticipantsManagement from '../components/ParticipantsManagement'
import AttendanceTracking from '../components/AttendanceTracking'
import Approvals from '../components/Approvals'
import PaymentsVerification from '../components/PaymentsVerification'
import AdminsRoles from '../components/AdminsRoles'
import SettingsPage from '../components/SettingsPage'
import AuditLog from '../components/AuditLog'

function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    // Redirect to login
    navigate('/auth')
  }
  return (
    <div className="min-h-screen w-full relative">
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden md:flex md:flex-col w-64 h-screen bg-white/10 backdrop-blur-md sticky left-0 top-0">
          <div className="h-16 px-4 flex items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg transform rotate-12" />
              <span className="text-lg font-semibold text-white truncate">Event Ticketing</span>
            </div>
          </div>

          <nav className="flex-1 p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === "dashboard" 
                    ? "bg-white/20 text-white font-medium" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <LayoutDashboard size={18} className="flex-shrink-0" />
                <span>Dashboard</span>
              </button>
              <button 
                onClick={() => setActiveTab("events")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === "events" 
                    ? "bg-white/20 text-white font-medium" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Calendar size={18} className="flex-shrink-0" />
                <span>Events</span>
              </button>
              <button 
                onClick={() => setActiveTab("tickets")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === "tickets" 
                    ? "bg-white/20 text-white font-medium" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Ticket size={18} className="flex-shrink-0" />
                <span>Tickets</span>
              </button>
              <button 
                onClick={() => setActiveTab("participants")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === "participants" 
                    ? "bg-white/20 text-white font-medium" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Users size={18} className="flex-shrink-0" />
                <span>Participants</span>
              </button>
              <button 
                onClick={() => setActiveTab("attendance")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === "attendance" 
                    ? "bg-white/20 text-white font-medium" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <ClipboardCheck size={18} className="flex-shrink-0" />
                <span>Attendance</span>
              </button>
              <button 
                onClick={() => setActiveTab("payments")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === "payments" 
                    ? "bg-white/20 text-white font-medium" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <CreditCard size={18} className="flex-shrink-0" />
                <span>Payments</span>
              </button>
              <button 
                onClick={() => setActiveTab("approvals")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === "approvals" 
                    ? "bg-white/20 text-white font-medium" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <CheckCircle size={18} className="flex-shrink-0" />
                <span>Approvals</span>
              </button>
              <button 
                onClick={() => setActiveTab("admins")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === "admins" 
                    ? "bg-white/20 text-white font-medium" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Shield size={18} className="flex-shrink-0" />
                <span>Admins / Roles</span>
              </button>
              <button 
                onClick={() => setActiveTab("audit")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === "audit" 
                    ? "bg-white/20 text-white font-medium" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FileText size={18} className="flex-shrink-0" />
                <span>Audit Log</span>
              </button>
            </div>

            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === "settings" 
                    ? "bg-white/20 text-white font-medium" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Settings size={18} className="flex-shrink-0" />
                <span>Settings</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all"
              >
                <LogOut size={18} className="flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 flex items-center justify-between px-6 shrink-0">
            <h1 className="text-xl font-semibold text-white">Event Ticketing Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 transition-all">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white">{user.name || user.email || 'Admin'}</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'dashboard' && <DashboardOverview />}
            {activeTab === 'events' && <EventsManagement />}
            {activeTab === 'tickets' && <TicketsManagement />}
            {activeTab === 'participants' && <ParticipantsManagement />}
            {activeTab === 'attendance' && <AttendanceTracking />}
            {activeTab === 'payments' && <PaymentsVerification />}
            {activeTab === 'approvals' && <Approvals />}
            {activeTab === 'admins' && <AdminsRoles />}
            {activeTab === 'settings' && <SettingsPage />}
            {activeTab === 'audit' && <AuditLog />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
