import React, { useState } from 'react';
import Sidebar from '@/shared/components/Sidebar';
import AdminOverview from '@/features/admin/components/AdminOverview';
import AccountRequests from '@/features/admin/components/AccountRequests';
import UserManagement from '@/features/admin/components/UserManagement';

export default function HospitalAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Hospital Overview', icon: '📊' },
    { id: 'requests', label: 'Account Requests', icon: '🔔' },
    { id: 'users', label: 'User Management', icon: '⚙️' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--md-sys-color-background)] relative">
      <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 p-8 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--md-sys-color-on-background)]">
              Hospital Admin Portal
            </h1>
            <p className="text-lg text-[var(--md-sys-color-on-surface-variant)] mt-2">
              Manage hospital users, doctors, and monitor metrics.
            </p>
          </header>

          <main className="animate-slide-up">
            {activeTab === 'overview' && <AdminOverview />}
            {activeTab === 'requests' && <AccountRequests />}
            {activeTab === 'users' && <UserManagement />}
          </main>
        </div>
      </div>
    </div>
  );
}
