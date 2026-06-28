import React, { useState } from 'react';
import Sidebar from '@/shared/components/Sidebar';
import DoctorAppointments from '@/features/doctor/components/DoctorAppointments';
import DoctorPatients from '@/features/doctor/components/DoctorPatients';
import SmartSearch from '@/features/doctor/components/SmartSearch';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');

  const menuItems = [
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'patients', label: 'My Patients & Records', icon: '👥' },
    { id: 'smart-search', label: 'Smart Search (AI)', icon: '✨' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--md-sys-color-background)] relative">
      <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 p-8 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--md-sys-color-on-background)]">
              Doctor Workspace
            </h1>
            <p className="text-lg text-[var(--md-sys-color-on-surface-variant)] mt-2">
              Manage appointments, review patient records, and leverage AI clinical assistance.
            </p>
          </header>

          <main className="animate-slide-up">
            {activeTab === 'appointments' && <DoctorAppointments />}
            {activeTab === 'patients' && <DoctorPatients />}
            {activeTab === 'smart-search' && <SmartSearch />}
          </main>
        </div>
      </div>
    </div>
  );
}
