import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '@/features/auth/context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--md-sys-color-primary)]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Determine fallback based on role
    switch (user.role) {
      case 'doctor':
        return <Navigate to="/doctor-dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'patient':
        return <Navigate to="/dashboard" replace />;
      case 'staff':
        return <Navigate to="/staff-dashboard" replace />;
      case 'pharmacy':
        return <Navigate to="/pharmacy-dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
