import React, { useState, useEffect } from 'react';
import { getDoctorPatients, getDoctorPatientRecords, createMedicalRecord, createPrescription, generateAiPrescription } from '@/shared/api/api';
import AIBanner from '@/shared/components/AIBanner';
import toast from 'react-hot-toast';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrescription, setAiPrescription] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const fetchPatients = async () => {
    try {
      const { data } = await getDoctorPatients(search);
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setShowRecordForm(false);
    setAiPrescription(null);
    setLoading(true);
    try {
      const { data } = await getDoctorPatientRecords(patient.id);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    try {
      await createMedicalRecord({
        patient_id: selectedPatient.id,
        diagnosis,
        symptoms,
        notes
      });
      setShowRecordForm(false);
      setDiagnosis('');
      setSymptoms('');
      setNotes('');
      handleSelectPatient(selectedPatient); // refresh records
    } catch (err) {
      toast.error("Failed to save record");
    }
  };

  const handleAIGenerate = async (recordId, recDiagnosis, recSymptoms) => {
    setAiLoading(true);
    try {
      const { data } = await generateAiPrescription({
        patient_id: selectedPatient.id,
        medical_record_id: recordId,
        diagnosis: recDiagnosis || 'Unknown',
        symptoms: recSymptoms || 'Unknown',
        patient_info: `Name: ${selectedPatient.first_name} ${selectedPatient.last_name}`
      });
      setAiPrescription({ recordId, data });
    } catch (err) {
      toast.error("AI Generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAIPrescription = async () => {
    try {
      await createPrescription({
        patient_id: selectedPatient.id,
        medical_record_id: aiPrescription.recordId,
        medications: aiPrescription.data.medications,
        instructions: aiPrescription.data.instructions
      });
      toast.success("Prescription saved successfully!");
      setAiPrescription(null);
      handleSelectPatient(selectedPatient);
    } catch (err) {
      toast.error("Failed to save prescription");
    }
  };

  return (
    <div className="flex gap-6 h-[700px]">
      {/* Patient List Sidebar */}
      <div className="w-1/3 bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
        <h2 className="text-xl font-bold mb-4">My Patients</h2>
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="w-full px-4 py-2 mb-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {patients.map(p => (
            <div 
              key={p.id} 
              onClick={() => handleSelectPatient(p)}
              className={`p-4 rounded-2xl cursor-pointer transition-colors ${selectedPatient?.id === p.id ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              <div className="font-semibold">{p.first_name} {p.last_name}</div>
              <div className="text-sm opacity-80">{p.email}</div>
            </div>
          ))}
          {patients.length === 0 && <div className="text-gray-500 text-center py-4">No patients found.</div>}
        </div>
      </div>

      {/* Patient Details & Records */}
      <div className="flex-1 bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-sm border border-gray-100 overflow-y-auto relative">
        {!selectedPatient ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a patient to view their clinical records.
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">Loading records...</div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <h2 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)]">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </h2>
                <p className="text-gray-500">{selectedPatient.email}</p>
              </div>
              <button 
                onClick={() => setShowRecordForm(!showRecordForm)}
                className="px-4 py-2 bg-[var(--md-sys-color-primary)] text-white rounded-xl font-medium hover:bg-opacity-90"
              >
                {showRecordForm ? 'Cancel' : '+ Add Record'}
              </button>
            </div>

            {showRecordForm && (
              <form onSubmit={handleSaveRecord} className="mb-8 p-6 bg-gray-50 rounded-2xl space-y-4">
                <h3 className="font-bold text-lg">New Medical Record</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                  <input required value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} type="text" className="w-full p-3 rounded-xl border-gray-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                  <textarea required value={symptoms} onChange={e=>setSymptoms(e.target.value)} className="w-full p-3 rounded-xl border-gray-200"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor's Notes</label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="w-full p-3 rounded-xl border-gray-200"></textarea>
                </div>
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium">Save Record</button>
              </form>
            )}

            <div className="space-y-6">
              <h3 className="text-xl font-bold">Clinical History</h3>
              {records.length === 0 ? <p className="text-gray-500">No medical records found.</p> : null}
              {records.map(record => (
                <div key={record.id} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-gray-500">{new Date(record.created_at).toLocaleDateString()}</div>
                      <h4 className="text-lg font-bold text-red-600">Diagnosis: {record.diagnosis}</h4>
                    </div>
                    
                    <button 
                      onClick={() => handleAIGenerate(record.id, record.diagnosis, record.symptoms)}
                      disabled={aiLoading}
                      className="px-4 py-2 bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] rounded-xl font-medium flex items-center gap-2"
                    >
                      ✨ {aiLoading ? 'Generating...' : 'AI Prescription'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-orange-50 p-3 rounded-xl">
                      <span className="font-semibold block text-orange-800">Symptoms</span>
                      <span className="text-orange-900">{record.symptoms}</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <span className="font-semibold block text-blue-800">Notes</span>
                      <span className="text-blue-900">{record.notes || 'None'}</span>
                    </div>
                  </div>

                  {aiPrescription && aiPrescription.recordId === record.id && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 animate-fade-in">
                      <h5 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <span>✨ AI Generated Prescription Plan</span>
                      </h5>
                      <div className="mb-4">
                        <AIBanner />
                      </div>
                      <div className="space-y-3">
                        {aiPrescription.data.medications.map((m, idx) => (
                          <div key={idx} className="flex justify-between p-3 bg-white rounded-xl shadow-sm text-sm">
                            <span className="font-bold text-gray-800">{m.name}</span>
                            <span className="text-gray-600">{m.dosage} - {m.frequency} for {m.duration}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-white rounded-xl text-sm italic text-gray-700">
                        Instructions: {aiPrescription.data.instructions}
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button onClick={handleSaveAIPrescription} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium">Approve & Save</button>
                        <button onClick={() => setAiPrescription(null)} className="px-4 py-2 bg-white text-gray-600 border rounded-xl font-medium">Discard</button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
