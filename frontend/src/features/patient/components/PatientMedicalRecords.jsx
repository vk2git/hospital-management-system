import React from 'react';
import AIBanner from '@/shared/components/AIBanner';

const MedicalRecords = ({ records, aiSummary, fetchRecords }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Medical Records</h2>
          <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mt-1">View your clinical history and diagnoses.</p>
        </div>
      </div>

      {aiSummary && (
        <div className="bg-[var(--md-sys-color-secondary-container)] p-6 rounded-2xl border border-[var(--md-sys-color-outline-variant)] shadow-sm animate-fade-in">
          <h3 className="text-lg font-bold text-[var(--md-sys-color-on-secondary-container)] mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            AI Health Summary
          </h3>
          <div className="prose prose-sm text-[var(--md-sys-color-on-secondary-container)] mb-6">
            <p className="whitespace-pre-wrap">{aiSummary}</p>
          </div>
          <AIBanner />
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Medical Records</h3>
          <p className="text-gray-500 text-sm">You do not have any medical records yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map(record => (
            <div key={record.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{record.diagnosis || "General Consultation"}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(record.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  Dr. {record.doctor_name || "Unknown"}
                </div>
              </div>
              
              {record.symptoms && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Symptoms</p>
                  <p className="text-sm text-gray-700">{record.symptoms}</p>
                </div>
              )}
              
              {record.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Doctor's Notes</p>
                  <p className="text-sm text-gray-700">{record.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
