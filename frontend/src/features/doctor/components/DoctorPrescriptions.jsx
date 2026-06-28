import React, { useState, useEffect } from 'react';
import { getDoctorPrescriptions, getDoctorPatients, createPrescription, generateAiPrescription } from '@/shared/api/api';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiMode, setIsAiMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [patientInfo, setPatientInfo] = useState('');
  const [manualMeds, setManualMeds] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [manualInstructions, setManualInstructions] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prescRes, patRes] = await Promise.all([
        getDoctorPrescriptions(),
        getDoctorPatients()
      ]);
      setPrescriptions(prescRes.data);
      setPatients(patRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMed = () => setManualMeds([...manualMeds, { name: '', dosage: '', frequency: '', duration: '' }]);
  
  const handleMedChange = (index, field, value) => {
    const newMeds = [...manualMeds];
    newMeds[index][field] = value;
    setManualMeds(newMeds);
  };
  
  const handleRemoveMed = (index) => {
    const newMeds = manualMeds.filter((_, i) => i !== index);
    setManualMeds(newMeds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (isAiMode) {
        await generateAiPrescription({
          patient_id: selectedPatientId,
          diagnosis,
          symptoms,
          patient_info: patientInfo
        });
        alert('AI Prescription generated and saved successfully.');
      } else {
        await createPrescription({
          patient_id: selectedPatientId,
          medications: manualMeds,
          instructions: manualInstructions
        });
        alert('Prescription created successfully.');
      }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create prescription');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatientId('');
    setDiagnosis('');
    setSymptoms('');
    setPatientInfo('');
    setManualMeds([{ name: '', dosage: '', frequency: '', duration: '' }]);
    setManualInstructions('');
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-sys-color-primary)] mx-auto"></div></div>;
  }

  if (showForm) {
    return (
      <div className="bg-[var(--md-sys-color-surface)] rounded-2xl p-6 shadow-sm border border-gray-100 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Create Prescription</h2>
          <button onClick={() => setShowForm(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 max-w-sm">
          <button type="button" className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 ${!isAiMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setIsAiMode(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Manual Form
          </button>
          <button type="button" className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 ${isAiMode ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setIsAiMode(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            AI Assistant
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient *</label>
            <select required value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none">
              <option value="">-- Choose a Patient --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
            </select>
          </div>

          {isAiMode ? (
            <div className="space-y-4 bg-purple-50 p-5 rounded-xl border border-purple-100 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">Diagnosis *</label>
                <input required type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="E.g. Acute Bronchitis" className="w-full p-3 bg-white border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">Symptoms *</label>
                <textarea required value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="E.g. Dry cough, mild fever for 3 days" rows="2" className="w-full p-3 bg-white border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 resize-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">Additional Patient Info (Optional)</label>
                <input type="text" value={patientInfo} onChange={e => setPatientInfo(e.target.value)} placeholder="E.g. Allergic to penicillin, adult male" className="w-full p-3 bg-white border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div className="flex items-start gap-3 bg-white p-3 rounded-lg mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                <p className="text-xs text-gray-600">The AI will analyze the diagnosis and symptoms to generate a structured prescription plan. It is saved directly to the patient's record and flagged as AI-assisted.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-medium text-sm text-gray-700 flex justify-between items-center">
                  Medications
                  <button type="button" onClick={handleAddMed} className="text-blue-600 hover:text-blue-700 font-bold">+ Add Med</button>
                </div>
                <div className="p-4 space-y-4">
                  {manualMeds.map((med, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end pb-4 border-b border-gray-100 last:border-0 last:pb-0 relative">
                      <div className="w-full">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                        <input required type="text" value={med.name} onChange={e => handleMedChange(idx, 'name', e.target.value)} placeholder="Amoxicillin" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Dosage</label>
                        <input required type="text" value={med.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} placeholder="500mg" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Freq</label>
                        <input required type="text" value={med.frequency} onChange={e => handleMedChange(idx, 'frequency', e.target.value)} placeholder="1x/day" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                      </div>
                      <div className="w-full sm:w-1/4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
                        <input required type="text" value={med.duration} onChange={e => handleMedChange(idx, 'duration', e.target.value)} placeholder="7 days" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                      </div>
                      {manualMeds.length > 1 && (
                        <button type="button" onClick={() => handleRemoveMed(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg h-[38px] mb-[1px]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea value={manualInstructions} onChange={e => setManualInstructions(e.target.value)} rows="2" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none"></textarea>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button type="submit" disabled={actionLoading} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-md transition-all ${actionLoading ? 'opacity-70' : isAiMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {actionLoading ? 'Processing...' : isAiMode ? 'Generate AI Prescription' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Issued Prescriptions</h2>
          <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mt-1">Review prescriptions given to your patients.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
          New Prescription
        </button>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500">You haven't issued any prescriptions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(presc => (
            <div key={presc.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
              {presc.is_ai_generated && (
                <div className="absolute top-0 right-0 bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-purple-200">
                  AI ASSISTED
                </div>
              )}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Patient: {presc.patient_name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{new Date(presc.created_at).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {presc.medications.map((med, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="font-bold text-[var(--md-sys-color-primary)] mb-1">{med.name}</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{med.dosage}</span>
                      <span>•</span>
                      <span>{med.frequency}</span>
                      <span>•</span>
                      <span>{med.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
              {presc.instructions && (
                <div className="text-sm text-gray-700 bg-blue-50/50 p-3 rounded-lg">
                  <span className="font-semibold block mb-1">Notes:</span>
                  {presc.instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
