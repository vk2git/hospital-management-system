import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/features/auth/context/AuthContext';
import Sidebar from '@/shared/components/Sidebar';
import Overview from '@/features/patient/components/PatientOverview';
import Appointments from '@/features/patient/components/PatientAppointments';
import MedicalRecords from '@/features/patient/components/PatientMedicalRecords';
import Prescriptions from '@/features/patient/components/PatientPrescriptions';
import { 
  getPatientAppointments, 
  getPatientMedicalRecords, 
  getPatientMedicalRecordsAiSummary,
  getPatientPayments,
  getPatientProfile,
  updatePatientProfile,
  requestPasswordReset,
  requestAccountDeletion,
  getHospitalPrivacySettings,
  updateHospitalPrivacy
} from '@/shared/api/api';
import toast from 'react-hot-toast';
import AIChatbot from '@/shared/components/AIChatbot';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Shared State
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState({});
  const [privacySettings, setPrivacySettings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [apptsRes, recordsRes, paymentsRes, profileRes, privacyRes] = await Promise.all([
        getPatientAppointments(),
        getPatientMedicalRecords(),
        getPatientPayments(),
        getPatientProfile(),
        getHospitalPrivacySettings()
      ]);
      setAppointments(apptsRes.data);
      setRecords(recordsRes.data);
      setPayments(paymentsRes.data);
      setProfile(profileRes.data);
      setPrivacySettings(privacyRes.data);

      // Fetch AI summary only if there are records
      if (recordsRes.data.length > 0) {
        try {
          const aiRes = await getPatientMedicalRecordsAiSummary();
          setAiSummary(aiRes.data.summary);
        } catch (e) {
          console.error("AI Summary failed", e);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updatePatientProfile(profile);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handlePrivacyToggle = async (hospitalId, currentHiddenStatus) => {
    const nextHiddenStatus = !currentHiddenStatus;
    try {
      await updateHospitalPrivacy({
        hospital_id: hospitalId,
        is_hidden: nextHiddenStatus
      });
      toast.success(
        nextHiddenStatus 
          ? 'Your details are now hidden from this hospital.' 
          : 'Your details are now shared with this hospital.'
      );
      setPrivacySettings(prev => prev.map(h => h.id === hospitalId ? { ...h, is_hidden: nextHiddenStatus } : h));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update privacy settings.');
    }
  };

  const handlePasswordReset = async () => {
    if (window.confirm('Request a password reset? The administrator will review your request.')) {
      try {
        await requestPasswordReset();
        toast.success('Password reset request submitted to admin.');
      } catch (e) {
        toast.error(e.response?.data?.detail || 'Failed to submit request.');
      }
    }
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('WARNING: Are you sure you want to request account deletion? The administrator will review your request.')) {
      try {
        await requestAccountDeletion();
        toast.success('Account deletion request submitted to admin.');
      } catch (e) {
        toast.error(e.response?.data?.detail || 'Failed to submit request.');
      }
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { id: 'appointments', label: 'Appointments', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: 'records', label: 'Medical Records', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
    { id: 'payments', label: 'Payments', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
    { id: 'profile', label: 'Profile', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--md-sys-color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-[var(--md-sys-color-surface-variant)] min-h-screen">
      <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'overview' && <Overview user={user} appointments={appointments} records={records} />}
          {activeTab === 'appointments' && <Appointments />}
          {activeTab === 'records' && <MedicalRecords records={records} aiSummary={aiSummary} fetchRecords={fetchDashboardData} />}
          {activeTab === 'prescriptions' && <Prescriptions />}
          
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Payment History</h2>
              {payments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm">No payment history.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Description</th>
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payments.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-4 text-sm text-gray-900">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-sm text-gray-600">{p.description}</td>
                          <td className="p-4 text-sm font-bold text-gray-900">${p.amount}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                              p.status === 'completed' ? 'bg-green-100 text-green-800' :
                              p.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Profile Settings</h2>
              
              <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100">
                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input type="date" value={profile.date_of_birth || ''} onChange={e => setProfile({...profile, date_of_birth: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      <input type="text" value={profile.blood_group || ''} onChange={e => setProfile({...profile, blood_group: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} rows="2" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                    <input type="text" value={profile.emergency_contact || ''} onChange={e => setProfile({...profile, emergency_contact: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full font-bold shadow-sm hover:shadow-md transition-all">Save Changes</button>
                </form>
              </div>

              {/* Hospital Privacy Settings Card */}
              <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100 mt-8 transition-all hover:shadow-md">
                <h3 className="text-lg font-bold text-[var(--md-sys-color-on-surface)] mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--md-sys-color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Hospital Privacy Settings
                </h3>
                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-6">
                  Control which hospitals can see your health record and profile. Hiding your details from a hospital prevents booking appointments or sharing details with their staff.
                </p>

                <div className="space-y-4">
                  {privacySettings.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No active hospitals registered in the system.</p>
                  ) : (
                    privacySettings.map(h => (
                      <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/70 transition-all border border-gray-100/50">
                        <div className="pr-4">
                          <h4 className="font-bold text-gray-900 text-base">{h.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {h.is_hidden ? '🚫 Your profile and medical history are hidden' : '✅ Sharing your profile and medical history'}
                          </p>
                        </div>
                        
                        {/* Toggle Switch */}
                        <button
                          onClick={() => handlePrivacyToggle(h.id, h.is_hidden)}
                          className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${
                            h.is_hidden ? 'bg-red-500' : 'bg-green-500'
                          }`}
                        >
                          <span 
                            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${
                              h.is_hidden ? 'translate-x-6' : 'translate-x-0'
                            }`} 
                          />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-red-50 rounded-2xl p-8 shadow-sm border border-red-100 mt-8">
                <h3 className="text-lg font-bold text-red-900 mb-4">Danger Zone</h3>
                <div className="flex gap-4">
                  <button onClick={handlePasswordReset} className="px-5 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Request Password Reset</button>
                  <button onClick={handleAccountDeletion} className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Request Account Deletion</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <AIChatbot type="medical" />
    </div>
  );
};

export default Dashboard;
