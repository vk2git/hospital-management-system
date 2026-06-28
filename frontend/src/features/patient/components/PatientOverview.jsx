import React from 'react';

const Overview = ({ user, appointments, records }) => {
  const nextAppt = appointments.find(a => a.status === 'scheduled');
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">Welcome back, {user?.first_name}</h2>
        <p className="text-[var(--md-sys-color-on-surface-variant)] mt-1">Here is a summary of your health profile and upcoming activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Appointment Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-[var(--md-sys-color-primary)] to-blue-700 rounded-[28px] p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <h3 className="text-blue-100 font-medium mb-4">Next Appointment</h3>
          
          {nextAppt ? (
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center relative z-10">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center min-w-[100px] border border-white/30">
                <div className="text-sm font-bold uppercase tracking-wider">{new Date(`${nextAppt.date}T${nextAppt.time_slot}`).toLocaleDateString(undefined, { month: 'short' })}</div>
                <div className="text-3xl font-black">{new Date(`${nextAppt.date}T${nextAppt.time_slot}`).getDate()}</div>
              </div>
              <div>
                <h4 className="text-2xl font-bold">Dr. {nextAppt.doctor_name}</h4>
                <p className="text-blue-100 mt-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {nextAppt.time_slot} — {nextAppt.specialization}
                </p>
                {nextAppt.reason && <p className="mt-3 text-sm text-blue-50 italic opacity-90">"{nextAppt.reason}"</p>}
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <p className="text-xl font-medium mb-4">No upcoming appointments</p>
              <button className="bg-white text-[var(--md-sys-color-primary)] px-6 py-2 rounded-full font-bold shadow-sm hover:shadow-md transition-shadow">
                Book Now
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-[var(--md-sys-color-surface)] rounded-[28px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="font-bold text-gray-900 mb-6">Quick Health Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-gray-500 text-sm">Past Visits</span>
              <span className="font-bold text-lg text-[var(--md-sys-color-primary)]">{appointments.filter(a => a.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-gray-500 text-sm">Medical Records</span>
              <span className="font-bold text-lg text-[var(--md-sys-color-primary)]">{records.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Active Prescriptions</span>
              <span className="font-bold text-lg text-[var(--md-sys-color-primary)]">--</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-[var(--md-sys-color-surface)] rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6 text-lg">Recent Medical Records</h3>
        {records.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {records.slice(0, 3).map(r => (
              <div key={r.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{r.diagnosis || "Consultation"}</p>
                  <p className="text-sm text-gray-500 mt-1">Dr. {r.doctor_name} • {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No records found.</p>
        )}
      </div>
    </div>
  );
};

export default Overview;
