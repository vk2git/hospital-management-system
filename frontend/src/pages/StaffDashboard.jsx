import React, { useState, useEffect } from 'react';
import Sidebar from '@/shared/components/Sidebar';
import { getStaffMembers, inviteStaff } from '@/shared/api/api';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('roster');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Invite Form
  const [showForm, setShowForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role_title: '', department: '' });
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await getStaffMembers();
      setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await inviteStaff(inviteForm);
      setInviteForm({ email: '', role_title: '', department: '' });
      setShowForm(false);
      toast.success('Invitation sent successfully.');
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const menuItems = [
    { id: 'roster', label: 'Staff Roster', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> }
  ];

  return (
    <div className="flex bg-[var(--md-sys-color-surface-variant)] min-h-screen">
      <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Staff Roster</h2>
              <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mt-1">Manage hospital staff and send onboarding invitations.</p>
            </div>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-[var(--md-sys-color-primary)] text-white font-bold rounded-xl text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" /></svg>
              Invite Staff
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--md-sys-color-primary)] animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] px-4 py-1 text-xs font-bold rounded-bl-xl">INVITATION</div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Send Staff Invitation</h3>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email Address *</label>
                    <input required type="email" value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Role Title *</label>
                    <input required type="text" placeholder="e.g. Senior Nurse" value={inviteForm.role_title} onChange={e => setInviteForm({...inviteForm, role_title: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                    <input type="text" placeholder="e.g. ICU" value={inviteForm.department} onChange={e => setInviteForm({...inviteForm, department: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="submit" disabled={inviteLoading} className="px-6 py-2.5 bg-[var(--md-sys-color-primary)] text-white font-bold rounded-xl text-sm transition-all hover:shadow-md disabled:opacity-70">
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-all hover:bg-gray-200">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-sys-color-primary)] mx-auto"></div></div>
          ) : staff.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500">No staff members found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Department</th>
                    <th className="p-4 font-medium">Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{s.first_name || 'Pending Invite'} {s.last_name || ''}</div>
                        <div className="text-xs text-gray-500">{s.email || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          {s.role_title}
                        </span>
                        {s.is_head && <span className="ml-2 text-xs font-bold text-[var(--md-sys-color-primary)]">HEAD</span>}
                      </td>
                      <td className="p-4 text-sm text-gray-600">{s.department || '-'}</td>
                      <td className="p-4 text-sm text-gray-600">{s.shift || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
