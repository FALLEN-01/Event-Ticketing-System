import { useState } from 'react'
import { FileText, CheckCircle, User, Settings, LogOut, Bell, Calendar } from 'lucide-react'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showNotifications, setShowNotifications] = useState(false) ;
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
        <div className="absolute inset-0 bg-linear-to-br from-black/40 via-black/30 to-black/50"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden md:flex md:flex-col w-64 h-screen bg-white/10 backdrop-blur-md sticky left-0 top-0">
          <div className="h-16 px-4 flex items-center shrink-0 border-b border-white/10" style={{ marginBottom: '20px' }}>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-white">Dashboard</span>
            </div>
          </div>

          <nav className="flex-1 p-6">
            <div>
              <button 
                onClick={() => setActiveTab("dashboard")}
                style={{ marginBottom: '20px', paddingLeft: '32px' }}
                className={`w-full flex items-center gap-4 pr-6 py-5 rounded-xl transition-all ${activeTab === "dashboard" ? "text-white" : "text-white/70 hover:text-white"}`}
              >
                <FileText size={22} className="shrink-0" />
                <span>Home</span>
              </button>
              <button 
                onClick={() => setActiveTab("events")}
                style={{ marginBottom: '20px', paddingLeft: '32px' }}
                className={`w-full flex items-center gap-4 pr-6 py-5 rounded-xl transition-all ${activeTab === "events" ? "text-white" : "text-white/70 hover:text-white"}`}
              >
                <Calendar size={22} className="shrink-0" />
                <span>Events</span>
              </button>
              <button 
                onClick={() => setActiveTab("tickets")}
                style={{ marginBottom: '20px', paddingLeft: '32px' }}
                className={`w-full flex items-center gap-4 pr-6 py-5 rounded-xl transition-all ${activeTab === "tickets" ? "text-white" : "text-white/70 hover:text-white"}`}
              >
                <FileText size={22} className="shrink-0" />
                <span>Tickets</span>
              </button>
              <button 
                onClick={() => setActiveTab("participants")}
                style={{ marginBottom: '20px', paddingLeft: '32px' }}
                className={`w-full flex items-center gap-4 pr-6 py-5 rounded-xl transition-all ${activeTab === "participants" ? "text-white" : "text-white/70 hover:text-white"}`}
              >
                <User size={22} className="shrink-0" />
                <span>Participants</span>
              </button>
              <button 
                onClick={() => setActiveTab("approvals")}
                style={{ marginBottom: '20px', paddingLeft: '32px' }}
                className={`w-full flex items-center gap-4 pr-6 py-5 rounded-xl transition-all ${activeTab === "approvals" ? "text-white" : "text-white/70 hover:text-white"}`}
              >
                <CheckCircle size={22} className="shrink-0" />
                <span>Approvals</span>
              </button>
            </div>
          </nav>

          <div className="p-6 shrink-0">
            <button style={{ marginBottom: '20px', paddingLeft: '32px' }} className="w-full flex items-center gap-4 pr-6 py-5 rounded-xl text-white/70 hover:text-white transition-all text-left">
              <Settings size={22} className="shrink-0" />
              <span>Settings</span>
            </button>
            <button style={{ marginBottom: '20px', paddingLeft: '32px' }} className="w-full flex items-center gap-4 pr-6 py-5 rounded-xl text-white/70 hover:text-white transition-all text-left">
              <LogOut size={22} className="shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 flex items-center justify-between px-6 shrink-0">
            <h1 className="text-xl font-semibold text-white">Event Ticketing Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 transition-all">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white">John</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
