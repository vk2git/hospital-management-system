import React, { useState, useEffect } from 'react';
import { getAdminStats } from '@/shared/api/api';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load statistics.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.total_users} icon="👥" color="bg-blue-50 text-blue-700" />
        <StatCard title="Total Appointments" value={stats.total_appointments} icon="📅" color="bg-green-50 text-green-700" />
        <StatCard title="Total Prescriptions" value={stats.total_prescriptions} icon="💊" color="bg-purple-50 text-purple-700" />
        <StatCard title="Total Payments" value={`$${stats.total_payments}`} icon="💰" color="bg-orange-50 text-orange-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4">Users by Role</h3>
          <div className="space-y-3">
            {stats.users_by_role.map(role => (
              <div key={role.role} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="font-medium capitalize">{role.role}s</span>
                <span className="font-bold text-lg bg-white px-3 py-1 rounded-lg shadow-sm">{role.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4">Appointments Status</h3>
          <div className="space-y-3">
            {stats.appointments_by_status.map(status => (
              <div key={status.status} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="font-medium capitalize">{status.status}</span>
                <span className={`font-bold text-lg px-3 py-1 rounded-lg shadow-sm ${
                  status.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  status.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
