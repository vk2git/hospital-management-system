import React, { useState, useEffect } from 'react';
import { getDoctorAppointments, completeDoctorAppointment, cancelDoctorAppointment, reassignDoctorAppointment, getOtherDoctors, getSharedPatientSummary } from '@/shared/api/api';
import AIBanner from '@/shared/components/AIBanner';
import toast from 'react-hot-toast';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [otherDoctors, setOtherDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reassigningId, setReassigningId] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [summaryModal, setSummaryModal] = useState({ isOpen: false, text: '', loading: false });

  const handleViewSummary = async (id) => {
    setSummaryModal({ isOpen: true, text: '', loading: true });
    try {
      const { data } = await getSharedPatientSummary(id);
      setSummaryModal({ isOpen: true, text: data.summary, loading: false });
    } catch (err) {
      setSummaryModal({ isOpen: true, text: err.response?.data?.detail || 'Failed to load summary.', loading: false, error: true });
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await getDoctorAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherDoctors = async () => {
    try {
      const { data } = await getOtherDoctors();
      setOtherDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchOtherDoctors();
  }, []);

  const handleComplete = async (id) => {
    try {
      await completeDoctorAppointment(id);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error completing appointment');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await cancelDoctorAppointment(id);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error canceling appointment');
    }
  };

  const handleReassign = async (id) => {
    if (!selectedDoctorId) {
      toast.error("Please select a doctor to reassign to.");
      return;
    }
    try {
      await reassignDoctorAppointment(id, selectedDoctorId);
      setReassigningId(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error reassigning appointment');
    }
  };

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>;

  return (
    <div className="bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[var(--md-sys-color-on-surface)]">Today's Schedule</h2>
      
      {error && <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="py-4 px-4 font-semibold text-gray-600">Patient</th>
              <th className="py-4 px-4 font-semibold text-gray-600">Date & Time</th>
              <th className="py-4 px-4 font-semibold text-gray-600">Status</th>
              <th className="py-4 px-4 font-semibold text-gray-600">Reason</th>
              <th className="py-4 px-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No appointments scheduled.</td></tr>
            ) : appointments.map((apt) => (
              <tr key={apt.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 font-medium">{apt.patient_name || 'Unknown'}</td>
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-800">{apt.date}</div>
                  <div className="text-sm text-gray-500">{apt.time_slot}</div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {apt.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-600 truncate max-w-[200px]">{apt.reason || 'N/A'}</td>
                <td className="py-4 px-4">
                  {apt.status === 'scheduled' && (
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleComplete(apt.id)}
                        className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Complete
                      </button>
                      <button 
                        onClick={() => handleCancel(apt.id)}
                        className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                      
                      {reassigningId === apt.id ? (
                        <div className="flex items-center gap-2 mt-2 w-full">
                          <select 
                            className="text-sm p-1.5 border rounded-lg flex-1"
                            value={selectedDoctorId}
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                          >
                            <option value="">Select Doctor...</option>
                            {otherDoctors.map(d => (
                              <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} ({d.specialization})</option>
                            ))}
                          </select>
                          <button onClick={() => handleReassign(apt.id)} className="text-sm px-2 py-1 bg-blue-600 text-white rounded-lg">Confirm</button>
                          <button onClick={() => setReassigningId(null)} className="text-sm px-2 py-1 bg-gray-200 rounded-lg">X</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setReassigningId(apt.id)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Reassign
                        </button>
                      )}
                      {apt.share_medical_summary && (
                        <button 
                          onClick={() => handleViewSummary(apt.id)}
                          className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-bold shadow-sm"
                        >
                          View Summary
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {summaryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-xl max-w-lg w-full border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Patient Summary
              </h3>
              <button onClick={() => setSummaryModal({ isOpen: false, text: '', loading: false })} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl min-h-[150px] max-h-[500px] overflow-y-auto text-gray-700 whitespace-pre-wrap text-sm border border-gray-200">
              {!summaryModal.loading && !summaryModal.error && (
                 <div className="mb-4">
                   <AIBanner />
                 </div>
              )}
              {summaryModal.loading ? (
                <div className="flex items-center justify-center h-full text-gray-500 gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                  Generating insights...
                </div>
              ) : summaryModal.error ? (
                <div className="text-red-500 text-center py-4 flex flex-col items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   {summaryModal.text}
                </div>
              ) : (
                summaryModal.text
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSummaryModal({ isOpen: false, text: '', loading: false })} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
