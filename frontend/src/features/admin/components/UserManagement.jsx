import React, { useState, useEffect } from 'react';
import { getAdminUsers, deleteUser, getAdminDoctors, createDoctor } from '@/shared/api/api';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // New Doctor Form State
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [docForm, setDocForm] = useState({
    email: '', password: '', first_name: '', last_name: '', specialization: 'General', experience_years: 0, consultation_fee: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, docsRes] = await Promise.all([
        getAdminUsers(roleFilter),
        getAdminDoctors()
      ]);
      setUsers(usersRes.data);
      setDoctors(docsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`CRITICAL: Are you sure you want to delete user ${name}? This action cannot be undone.`)) return;
    try {
      await deleteUser(id);
      toast.success("User deleted successfully.");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await createDoctor(docForm);
      setShowAddDoctor(false);
      setDocForm({ email: '', password: '', first_name: '', last_name: '', specialization: 'General', experience_years: 0, consultation_fee: 0 });
      toast.success("Doctor created successfully!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create doctor.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Doctor Section */}
      <div className="bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Doctor Management</h2>
            <p className="text-gray-500">Register new doctors into the system.</p>
          </div>
          <button 
            onClick={() => setShowAddDoctor(!showAddDoctor)}
            className="px-6 py-3 bg-[var(--md-sys-color-primary)] text-white rounded-xl font-bold shadow-md hover:bg-opacity-90"
          >
            {showAddDoctor ? 'Cancel' : '+ Register Doctor'}
          </button>
        </div>

        {showAddDoctor && (
          <form onSubmit={handleCreateDoctor} className="bg-gray-50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in mb-8">
            <input required type="email" placeholder="Email" value={docForm.email} onChange={e=>setDocForm({...docForm, email: e.target.value})} className="p-3 rounded-xl border border-gray-200" />
            <input required type="text" placeholder="Temporary Password" value={docForm.password} onChange={e=>setDocForm({...docForm, password: e.target.value})} className="p-3 rounded-xl border border-gray-200" />
            <input required type="text" placeholder="First Name" value={docForm.first_name} onChange={e=>setDocForm({...docForm, first_name: e.target.value})} className="p-3 rounded-xl border border-gray-200" />
            <input required type="text" placeholder="Last Name" value={docForm.last_name} onChange={e=>setDocForm({...docForm, last_name: e.target.value})} className="p-3 rounded-xl border border-gray-200" />
            <input required type="text" placeholder="Specialization (e.g. Cardiology)" value={docForm.specialization} onChange={e=>setDocForm({...docForm, specialization: e.target.value})} className="p-3 rounded-xl border border-gray-200" />
            <div className="flex gap-4">
              <input required type="number" placeholder="Experience (Yrs)" value={docForm.experience_years} onChange={e=>setDocForm({...docForm, experience_years: parseInt(e.target.value)})} className="p-3 w-1/2 rounded-xl border border-gray-200" />
              <input required type="number" placeholder="Fee ($)" value={docForm.consultation_fee} onChange={e=>setDocForm({...docForm, consultation_fee: parseFloat(e.target.value)})} className="p-3 w-1/2 rounded-xl border border-gray-200" />
            </div>
            <button type="submit" className="md:col-span-2 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">Create Doctor Profile</button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="pb-3">Name</th>
                <th className="pb-3">Specialization</th>
                <th className="pb-3">Experience</th>
                <th className="pb-3">Fee</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 font-bold">Dr. {d.first_name} {d.last_name}</td>
                  <td className="py-4 text-gray-600">{d.specialization}</td>
                  <td className="py-4 text-gray-600">{d.experience_years} yrs</td>
                  <td className="py-4 text-gray-600">${d.consultation_fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users List Section */}
      <div className="bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Global User Directory</h2>
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="p-2 border rounded-xl">
            <option value="">All Roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="staff">Staff</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="pb-3">User</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium">{u.first_name} {u.last_name}</td>
                  <td className="py-3 text-gray-600">{u.email}</td>
                  <td className="py-3">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold capitalize">{u.role}</span>
                  </td>
                  <td className="py-3">
                    {u.is_active ? <span className="text-green-600 font-bold">Active</span> : <span className="text-red-600 font-bold">Inactive</span>}
                  </td>
                  <td className="py-3">
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(u.id, u.first_name)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
