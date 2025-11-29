import { useState } from 'react';

const Approvals = () => {
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  
  const registrations = [
    {
      id: 'REG001',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91 98765 43210',
      ticketType: 'Individual',
      status: 'pending',
      submitted: '2024-11-24 10:30 AM',
      proofUrl: 'https://via.placeholder.com/400x600/667eea/ffffff?text=Payment+Screenshot',
      amount: '500'
    },
    {
      id: 'REG002',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+91 98765 43211',
      ticketType: 'Bulk (4 members)',
      status: 'pending',
      submitted: '2024-11-24 09:15 AM',
      proofUrl: 'https://via.placeholder.com/400x600/10b981/ffffff?text=Payment+Proof',
      amount: '2000'
    },
  ];

  const handleApprove = (regId) => {
    console.log('Approving:', regId);
    // API call to approve
  };

  const handleReject = (regId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      console.log('Rejecting:', regId, 'Reason:', reason);
      // API call to reject
    }
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-200px)]">
      {/* LEFT PANE - Registrations List */}
      <div className="w-96 bg-white/10 backdrop-blur-md rounded-xl overflow-hidden flex flex-col shadow-lg">
        <div className="p-5 border-b border-white/10 flex flex-col gap-2.5">
          <input 
            type="text" 
            placeholder="🔍 Search by name, ID..." 
            className="w-full px-2.5 py-2.5 bg-white/10 border border-white/20 rounded-md text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/50"
          />
          <select className="w-full px-2.5 py-2.5 bg-white/10 border border-white/20 rounded-md text-sm text-white focus:outline-none focus:border-white/50">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className={`p-4 border rounded-lg mb-2.5 cursor-pointer transition-all ${
                selectedRegistration?.id === reg.id
                  ? 'bg-white/20 border-white/40'
                  : 'border-white/20 hover:bg-white/10 hover:border-white/30'
              }`}
              onClick={() => setSelectedRegistration(reg)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white text-[13px]">{reg.id}</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/80 text-white">
                  {reg.status.toUpperCase()}
                </span>
              </div>
              <div className="font-semibold text-white mb-1.5">{reg.name}</div>
              <div className="text-[13px] text-white/70">
                {reg.ticketType} • {reg.submitted}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANE - Screenshot Preview & Actions */}
      <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-8 overflow-y-auto shadow-lg">
        {selectedRegistration ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-5">{selectedRegistration.name}</h2>
              <div>
                <div className="flex py-3 border-b border-white/10">
                  <span className="w-36 text-white/70 font-medium text-sm">Registration ID:</span>
                  <span className="flex-1 text-white font-medium text-sm">{selectedRegistration.id}</span>
                </div>
                <div className="flex py-3 border-b border-white/10">
                  <span className="w-36 text-white/70 font-medium text-sm">Email:</span>
                  <span className="flex-1 text-white font-medium text-sm">{selectedRegistration.email}</span>
                </div>
                <div className="flex py-3 border-b border-white/10">
                  <span className="w-36 text-white/70 font-medium text-sm">Phone:</span>
                  <span className="flex-1 text-white font-medium text-sm">{selectedRegistration.phone}</span>
                </div>
                <div className="flex py-3 border-b border-white/10">
                  <span className="w-36 text-white/70 font-medium text-sm">Ticket Type:</span>
                  <span className="flex-1 text-white font-medium text-sm">{selectedRegistration.ticketType}</span>
                </div>
                <div className="flex py-3 border-b border-white/10">
                  <span className="w-36 text-white/70 font-medium text-sm">Amount:</span>
                  <span className="flex-1 text-white font-medium text-sm">₹{selectedRegistration.amount}</span>
                </div>
                <div className="flex py-3 border-b border-white/10">
                  <span className="w-36 text-white/70 font-medium text-sm">Submitted:</span>
                  <span className="flex-1 text-white font-medium text-sm">{selectedRegistration.submitted}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Payment Screenshot</h3>
              <div className="border-2 border-white/20 rounded-lg overflow-hidden bg-white/5">
                <img 
                  src={selectedRegistration.proofUrl} 
                  alt="Payment Proof"
                  className="w-full h-auto block"
                />
              </div>
              <button className="w-full bg-indigo-600 text-white px-5 py-2.5 rounded-md text-sm font-medium mt-2.5 hover:bg-indigo-700 transition">
                🔍 Zoom
              </button>
            </div>

            <div className="flex gap-4 mb-8">
              <button 
                className="flex-1 bg-emerald-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-emerald-600 transition"
                onClick={() => handleApprove(selectedRegistration.id)}
              >
                ✓ Approve Registration
              </button>
              <button 
                className="flex-1 bg-red-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-red-600 transition"
                onClick={() => handleReject(selectedRegistration.id)}
              >
                ✗ Reject
              </button>
            </div>

            <div>
              <h4 className="text-base font-semibold text-white mb-3">Admin Notes</h4>
              <textarea 
                placeholder="Add internal notes about this registration..."
                className="w-full min-h-[100px] px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 resize-y mb-2.5 focus:outline-none focus:border-white/50"
              ></textarea>
              <button className="bg-white/20 text-white px-3 py-1.5 rounded-md text-[13px] font-medium border border-white/20 hover:bg-white/30 transition">
                Save Notes
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-5">📋</div>
            <p className="text-base">Select a registration to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
