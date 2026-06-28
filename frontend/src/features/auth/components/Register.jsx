import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerPatient, registerStaff } from '@/shared/api/api';

const Register = () => {
  const [role, setRole] = useState('patient'); // 'patient' or 'staff'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    // Patient specific
    date_of_birth: '',
    gender: '',
    blood_group: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'patient') {
        const payload = {
          ...formData,
          date_of_birth: formData.date_of_birth || null,
        };
        await registerPatient(payload);
        navigate('/dashboard');
      } else {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        };
        await registerStaff(payload);
        navigate('/staff-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--md-sys-color-primary-container)] opacity-40 blur-3xl -z-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--md-sys-color-tertiary-container)] opacity-40 blur-3xl -z-10 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-2xl bg-[var(--md-sys-color-surface)] p-8 sm:p-10 rounded-[28px] shadow-xl border border-gray-100 relative z-10 my-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">Create an Account</h2>
          <p className="text-[var(--md-sys-color-on-surface-variant)] mt-2">Join Rising Hospital today</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-[var(--md-sys-color-surface-variant)] p-1 rounded-full mb-8 max-w-sm mx-auto relative z-20">
          <button
            type="button"
            className={`flex-1 py-2 rounded-full font-medium text-sm transition-all ${
              role === 'patient' 
                ? 'bg-white text-[var(--md-sys-color-primary)] shadow-sm' 
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-gray-900'
            }`}
            onClick={() => { setRole('patient'); setError(''); }}
          >
            Patient
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-full font-medium text-sm transition-all ${
              role === 'staff' 
                ? 'bg-white text-[var(--md-sys-color-primary)] shadow-sm' 
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-gray-900'
            }`}
            onClick={() => { setRole('staff'); setError(''); }}
          >
            Hospital Staff
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] rounded-2xl text-sm font-medium animate-fade-in flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {role === 'staff' && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-2xl text-sm border border-blue-100 flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Staff registration requires an invitation from your Head of Staff. Use the exact email address your invitation was sent to.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                required
                className="w-full px-5 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all placeholder:text-gray-400"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                className="w-full px-5 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all placeholder:text-gray-400"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">Email *</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-5 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all placeholder:text-gray-400"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">Phone</label>
              <input
                type="tel"
                name="phone"
                className="w-full px-5 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all placeholder:text-gray-400"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">Password *</label>
            <input
              type="password"
              name="password"
              required
              minLength="6"
              className="w-full px-5 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all placeholder:text-gray-400"
              value={formData.password}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 ml-2 mt-1">Must be at least 6 characters</p>
          </div>

          {role === 'patient' && (
            <>
              <div className="border-t border-gray-100 my-6"></div>
              <h3 className="font-medium text-gray-900 mb-4">Optional Medical Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    className="w-full px-4 py-3 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">Gender</label>
                  <select
                    name="gender"
                    className="w-full px-4 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">Blood Group</label>
                  <select
                    name="blood_group"
                    className="w-full px-4 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all"
                    value={formData.blood_group}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-6 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full font-bold text-lg shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 flex justify-center items-center ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[var(--md-sys-color-on-surface-variant)]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[var(--md-sys-color-primary)] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
