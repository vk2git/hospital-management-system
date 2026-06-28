import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import LandingPage from '@/pages/LandingPage/LandingPage';

// Lazy loaded pages to optimize bundle size
const Login = lazy(() => import('@/features/auth/components/Login'));
const Register = lazy(() => import('@/features/auth/components/Register'));
const PatientDashboard = lazy(() => import('@/pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('@/pages/DoctorDashboard'));
const HmsAdminDashboard = lazy(() => import('@/pages/HmsAdminDashboard'));
const HospitalAdminDashboard = lazy(() => import('@/pages/HospitalAdminDashboard'));
const StaffDashboard = lazy(() => import('@/pages/StaffDashboard'));
const PharmacyDashboard = lazy(() => import('@/pages/PharmacyDashboard'));

// A simple loading fallback for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[var(--md-sys-color-background)]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--md-sys-color-primary)]"></div>
  </div>
);

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Router>
        <div className="flex flex-col min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] font-outfit">
          <main className="flex-grow flex flex-col">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Patient Routes */}
                <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
                  <Route path="/dashboard" element={<PatientDashboard />} />
                </Route>

                {/* Doctor Routes */}
                <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                  <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                </Route>

                {/* HMS Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/hms-admin" element={<HmsAdminDashboard />} />
                </Route>

                {/* Hospital Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['hospital_admin']} />}>
                  <Route path="/hospital-admin" element={<HospitalAdminDashboard />} />
                </Route>

                {/* Staff Routes */}
                <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
                  <Route path="/staff-dashboard" element={<StaffDashboard />} />
                </Route>

                {/* Pharmacy Routes */}
                <Route element={<ProtectedRoute allowedRoles={['pharmacy']} />}>
                  <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={
                  <div className="flex-grow flex items-center justify-center flex-col gap-4">
                    <h1 className="text-4xl font-bold text-[var(--md-sys-color-error)]">404</h1>
                    <p className="text-xl">Page not found</p>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
