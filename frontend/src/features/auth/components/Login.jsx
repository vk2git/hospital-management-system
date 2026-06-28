import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/features/auth/context/AuthContext';
import { checkEmail } from '@/shared/api/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [step, setStep] = useState(1); // 1: Email & Password, 3: Set Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { login, completeSetPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const isEmailValid = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const isButtonDisabled = () => {
    if (loading) return true;
    if (step === 1) {
      return !email.trim() || !isEmailValid(email) || password.length < 6;
    }
    if (step === 3) {
      return password.length < 6 || confirmPassword.length < 6;
    }
    return false;
  };

  const handleRoute = (user) => {
    switch (user.role) {
      case 'patient': navigate('/dashboard'); break;
      case 'doctor': navigate('/doctor-dashboard'); break;
      case 'admin': navigate('/hms-admin'); break;
      case 'hospital_admin': navigate('/hospital-admin'); break;
      case 'staff': navigate('/staff-dashboard'); break;
      case 'pharmacy': navigate('/pharmacy-dashboard'); break;
      default: navigate('/');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Verify email first to support the new user setup flow
      const res = await checkEmail(email);
      if (!res.data.exists) {
        setError("Email not found. If you are a patient, please register first.");
        setLoading(false);
        return;
      }
      
      if (res.data.is_new_user) {
        // Go to Set Password step (prefilling password from step 1)
        setStep(3);
        setLoading(false);
        return;
      }

      // 2. Log in directly
      const user = await login({ email, password });
      handleRoute(user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const user = await completeSetPassword({ email, password });
      handleRoute(user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 pt-20 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--md-sys-color-primary-container)] opacity-50 blur-3xl -z-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--md-sys-color-tertiary-container)] opacity-50 blur-3xl -z-10 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-[var(--md-sys-color-surface)] p-8 sm:p-10 rounded-[32px] relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--md-sys-color-primary)] rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            RH
          </div>
          <h2 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">
            {step === 1 ? "Welcome Back" : "Complete Setup"}
          </h2>
          {error ? (
            <p className="text-[var(--md-sys-color-error)] mt-2 font-medium flex items-center justify-center gap-1.5 animate-fade-in min-h-[24px]">
              <span className="material-symbols-rounded text-lg select-none shrink-0 text-[var(--md-sys-color-error)]">error</span>
              <span>{error}</span>
            </p>
          ) : (
            <p className="text-[var(--md-sys-color-on-surface-variant)] mt-2 min-h-[24px]">
              {step === 1 ? "Enter your credentials to log in" : "Confirm your new password to activate your account"}
            </p>
          )}
        </div>

        <form onSubmit={step === 1 ? handleLogin : handleSetPassword} className="space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">Email</label>
                <input
                  type="email"
                  required
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      passwordRef.current?.focus();
                    }
                  }}
                  className="w-full px-5 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all placeholder:text-gray-400"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    ref={passwordRef}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.target.select()}
                    className="w-full pl-5 pr-12 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-rounded text-xl select-none">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    autoFocus
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        confirmPasswordRef.current?.focus();
                      }
                    }}
                    className="w-full pl-5 pr-12 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-rounded text-xl select-none">
                      {showNewPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] ml-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    ref={confirmPasswordRef}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.target.select()}
                    className="w-full pl-5 pr-12 py-3.5 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] border-none rounded-2xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-rounded text-xl select-none">
                      {showConfirmPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isButtonDisabled()}
              className={`w-full py-4 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full font-bold text-lg transition-all flex justify-center items-center ${
                isButtonDisabled()
                  ? 'opacity-45 cursor-not-allowed'
                  : 'hover:bg-[var(--md-sys-color-primary)]/90 cursor-pointer shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                step === 1 ? 'Sign In' : 'Set Password'
              )}
            </button>
            
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setPassword('');
                  setConfirmPassword('');
                  setShowPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="w-full py-3 text-[var(--md-sys-color-primary)] font-medium hover:bg-[var(--md-sys-color-surface-variant)] rounded-full transition-colors"
              >
                Use a different email
              </button>
            )}
          </div>
        </form>

        {step === 1 && (
          <p className="mt-8 text-center text-[var(--md-sys-color-on-surface-variant)]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[var(--md-sys-color-primary)] hover:underline">
              Register as a Patient
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
