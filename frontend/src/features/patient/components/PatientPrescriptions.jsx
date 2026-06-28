import React, { useState, useEffect } from 'react';
import { getPatientPrescriptions, sharePrescription } from '@/shared/api/api';
import toast from 'react-hot-toast';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareToken, setShareToken] = useState(null);
  const [sharingId, setSharingId] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const { data } = await getPatientPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (id) => {
    setSharingId(id);
    setShareToken(null);
    try {
      const { data } = await sharePrescription(id);
      setShareToken(data);
      toast.success('Sharing token generated!');
    } catch (err) {
      toast.error('Failed to generate sharing token.');
    } finally {
      setSharingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-sys-color-primary)] mx-auto"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Prescriptions</h2>
        <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mt-1">View your medications and share them with the pharmacy.</p>
      </div>

      {shareToken && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 animate-fade-in relative">
          <button onClick={() => setShareToken(null)} className="absolute top-4 right-4 text-green-700 hover:bg-green-100 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
          <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Pharmacy Access Token Generated
          </h3>
          <p className="text-green-800 mt-2 text-sm">Provide this 1-time token to the pharmacy. It expires in 10 minutes.</p>
          <div className="mt-4 flex items-center gap-3">
            <code className="px-4 py-3 bg-white text-green-900 font-mono text-xl font-bold rounded-lg border border-green-200 tracking-wider shadow-inner">{shareToken.access_token}</code>
          </div>
        </div>
      )}

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3L22 4" /></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Prescriptions</h3>
          <p className="text-gray-500 text-sm">You do not have any prescriptions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(presc => (
            <div key={presc.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-hidden relative">
              {presc.is_ai_generated && (
                <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-amber-200">
                  AI ASSISTED
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Prescription from Dr. {presc.doctor_name || "Unknown"}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Issued on {new Date(presc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => handleShare(presc.id)}
                  disabled={sharingId === presc.id}
                  className="px-4 py-2 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-lg text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center gap-2"
                >
                  {sharingId === presc.id ? (
                    <div className="w-4 h-4 border-2 border-[var(--md-sys-color-on-primary-container)] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  )}
                  Share with Pharmacy
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Medications</h4>
                <div className="space-y-3">
                  {presc.medications.map((med, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-[var(--md-sys-color-primary)]">{med.name}</p>
                        <p className="text-sm text-gray-600">{med.dosage} — {med.frequency}</p>
                      </div>
                      <div className="text-sm font-medium bg-white px-3 py-1 rounded-full border border-gray-200 self-start sm:self-auto text-gray-700">
                        {med.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {presc.instructions && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Instructions</h4>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">{presc.instructions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
