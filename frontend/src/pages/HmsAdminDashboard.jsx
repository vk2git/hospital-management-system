import React, { useState } from 'react';
import Sidebar from '@/shared/components/Sidebar';
import AdminOverview from '@/features/admin/components/AdminOverview';
import RegisterHospital from '@/features/admin/components/RegisterHospital';
import AssignAdmin from '@/features/admin/components/AssignAdmin';
import ViewHospitals from '@/features/admin/components/ViewHospitals';
import ViewHospitalAdmins from '@/features/admin/components/ViewHospitalAdmins';

export default function HmsAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'register-hospital', label: 'Register Hospital', icon: '🏥' },
    { id: 'assign-admin', label: 'Assign Admin', icon: '🔑' },
    { id: 'view-hospitals', label: 'View Hospitals', icon: '🏢' },
    { id: 'view-hospital-admins', label: 'View Hospital Admins', icon: '👥' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--md-sys-color-background)] relative">
      <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 p-8 overflow-y-auto w-full">
        <div className={`${(activeTab === 'view-hospitals' || activeTab === 'view-hospital-admins') ? 'max-w-none' : 'max-w-6xl mx-auto'} space-y-6`}>


          <main className="animate-slide-up">
            {activeTab === 'overview' && <AdminOverview />}
            {activeTab === 'register-hospital' && (
              <RegisterHospital onSuccess={() => setActiveTab('view-hospitals')} />
            )}
            {activeTab === 'assign-admin' && <AssignAdmin />}
            {activeTab === 'view-hospitals' && <ViewHospitals />}
            {activeTab === 'view-hospital-admins' && <ViewHospitalAdmins setActiveTab={setActiveTab} />}
          </main>
        </div>
      </div>
    </div>
  );
}
