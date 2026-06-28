import React, { useState, useEffect, useRef } from 'react';
import { getHospitals, createHospitalRole } from '@/shared/api/api';
import toast from 'react-hot-toast';

// ── CUSTOM INPUT COMPONENT WITH FLOATING LABELS ──
function M3TextField({ label, id, icon, required, type = "text", value, onChange, placeholder, disabled, isValid, isError, helperText }) {
  const [focused, setFocused] = useState(false);
  const isFloating = focused || value;

  return (
    <div className="w-full flex flex-col gap-1">
      <div 
        className={`
          relative flex items-center h-[56px] rounded-2xl border transition-all duration-200 bg-[var(--md-sys-color-surface-container-lowest)]
          ${focused 
            ? 'border-[var(--md-sys-color-primary)] border-2 px-[15px]' 
            : isError
              ? 'border-[var(--md-sys-color-error)] px-4'
              : 'border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)] px-4'}
          ${disabled ? 'opacity-40 cursor-not-allowed bg-neutral-100' : ''}
        `}
      >
        {/* Leading Icon */}
        {icon && (
          <div className={`
            mr-3 transition-colors duration-200
            ${focused 
              ? 'text-[var(--md-sys-color-primary)]' 
              : isError
                ? 'text-[var(--md-sys-color-error)]'
                : 'text-[var(--md-sys-color-outline)]'}
          `}>
            {icon}
          </div>
        )}

        {/* Input area */}
        <div className="relative flex-grow h-full flex flex-col justify-center">
          <input
            id={id}
            name={id}
            required={required}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={focused ? placeholder : ""}
            autoComplete="off"
            data-1p-ignore="true"
            data-bwignore="true"
            data-protonpass-ignore="true"
            data-lpignore="true"
            data-dashlane-ignore="true"
            className="w-full h-full bg-transparent border-none text-[var(--md-sys-color-on-surface)] text-sm font-medium focus:outline-none focus:ring-0 pt-[18px] pb-1"
          />
          <label 
            htmlFor={id}
            className={`
              absolute left-0 pointer-events-none transition-all duration-200 select-none
              ${isFloating 
                ? 'top-1.5 text-[9px] font-bold text-[var(--md-sys-color-primary)] uppercase tracking-wider' 
                : 'top-1/2 -translate-y-1/2 text-sm text-[var(--md-sys-color-on-surface-variant)] font-medium'}
              ${isError && !focused ? 'text-[var(--md-sys-color-error)]' : ''}
            `}
          >
            {label} {required && <span className="text-[var(--md-sys-color-error)] ml-0.5">*</span>}
          </label>
        </div>

        {/* Validation Checkmark */}
        {value && isValid && !isError && (
          <div className="ml-2 text-emerald-500 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {helperText && (
        <span className={`text-[10px] px-2 font-medium tracking-wide ${isError ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>
          {helperText}
        </span>
      )}
    </div>
  );
}

// ── CUSTOM MATERIAL 3 SEARCHABLE SELECTOR ──
function M3HospitalSelector({ label, id, icon, required, value, onChange, options, disabled, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.id === value) || { name: '-- Select Hospital Tenant --' };
  
  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFloating = isOpen || value;

  return (
    <div className="w-full flex flex-col gap-1 relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center h-[56px] w-full rounded-2xl border transition-all duration-200 bg-[var(--md-sys-color-surface-container-lowest)] text-left select-none
          ${isOpen 
            ? 'border-[var(--md-sys-color-primary)] border-2 px-[15px]' 
            : 'border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)] px-4'}
          ${disabled ? 'opacity-40 cursor-not-allowed bg-neutral-100' : 'cursor-pointer'}
        `}
      >
        {/* Leading Icon */}
        {icon && (
          <div className={`mr-3 transition-colors duration-200 ${isOpen ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-outline)]'}`}>
            {icon}
          </div>
        )}

        {/* Selected Display */}
        <div className="relative flex-grow h-full flex flex-col justify-center pt-3.5 pb-0.5">
          <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
            <span className="truncate leading-none">{isFloating ? selectedOption.name : ''}</span>
          </span>
          <span 
            className={`
              absolute left-0 pointer-events-none transition-all duration-200 select-none
              ${isFloating 
                ? 'top-1.5 text-[9px] font-bold text-[var(--md-sys-color-primary)] uppercase tracking-wider' 
                : 'top-1/2 -translate-y-1/2 text-sm text-[var(--md-sys-color-on-surface-variant)] font-medium'}
            `}
          >
            {label} {required && <span className="text-[var(--md-sys-color-error)] ml-0.5">*</span>}
          </span>
        </div>

        {/* Dropdown Chevron */}
        <div className={`transition-transform duration-200 text-[var(--md-sys-color-on-surface-variant)] flex-shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 top-[60px] w-full min-w-[260px] max-h-[280px] overflow-y-auto rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xl z-50 py-2 flex flex-col">
          {/* Search Header */}
          <div className="px-3 py-1.5 bg-[var(--md-sys-color-surface-container-lowest)] border-b border-[var(--md-sys-color-outline-variant)] sticky top-0 z-10">
            <input 
              type="text" 
              name="hms-hospital-search"
              placeholder="Search hospital..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
              data-1p-ignore="true"
              data-bwignore="true"
              data-protonpass-ignore="true"
              data-lpignore="true"
              data-dashlane-ignore="true"
              className="w-full px-3 py-1.5 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
              onClick={e => e.stopPropagation()} 
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-grow">
            {loading ? (
              <div className="px-4 py-3 text-xs text-[var(--md-sys-color-primary)] text-center animate-pulse">
                Loading hospitals...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors duration-150
                      ${isSelected 
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold' 
                        : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'}
                    `}
                  >
                    <span className="truncate flex-1">{opt.name}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-[var(--md-sys-color-on-surface-variant)] text-center">
                No hospitals found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssignAdmin() {
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', role: 'hospital_admin', hospital_id: '' });
  const [loading, setLoading] = useState(false);
  const [fetchingHospitals, setFetchingHospitals] = useState(false);

  const fetchHospitals = async () => {
    setFetchingHospitals(true);
    try {
      const res = await getHospitals();
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load hospitals for dropdown");
    } finally {
      setFetchingHospitals(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isFirstNameValid = form.first_name.trim().length >= 2;
  const isLastNameValid = form.last_name.trim().length >= 2;
  const isHospitalSelected = form.hospital_id !== '';

  const section1Valid = isHospitalSelected;
  const section2Valid = isEmailValid && isFirstNameValid && isLastNameValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isHospitalSelected) {
      toast.error("Please select a hospital.");
      return;
    }
    if (!section2Valid) {
      toast.error("Please fill in all administrator details correctly.");
      return;
    }
    setLoading(true);
    try {
      await createHospitalRole(form);
      toast.success("Hospital Admin assigned successfully!");
      setForm({ email: '', first_name: '', last_name: '', role: 'hospital_admin', hospital_id: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to assign hospital admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4 animate-fade-in">
      {/* Header Area */}
      <div className="space-y-4 mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-[var(--md-sys-color-on-background)] leading-tight font-brand">
          Assign Hospital Admin
        </h2>
        <p className="text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          Create or assign a hospital administrator account for a specific hospital tenant.
        </p>
      </div>

      {/* Vertical Form Timeline */}
      <form onSubmit={handleSubmit} className="flex flex-col" autoComplete="off">
        
        {/* ── STEP 1: TARGET TENANT ── */}
        <div className="flex items-stretch gap-6">
          {/* Left Timeline Column */}
          <div className="flex flex-col items-center flex-shrink-0 w-6">
            {/* Bullet Node */}
            <div 
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 flex-shrink-0 mt-1
                ${section1Valid 
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] scale-110 shadow-sm' 
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-outline)] border-2 border-[var(--md-sys-color-outline-variant)]'}
              `}
            >
              {section1Valid ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                "1"
              )}
            </div>
            {/* Connecting Line */}
            <div className="w-0.5 flex-grow bg-[var(--md-sys-color-outline-variant)] mt-2"></div>
          </div>

          {/* Right Content Column */}
          <div className="flex-grow pb-10 space-y-5">
            {/* Section Header */}
            <div className="flex items-center gap-2 select-none">
              <span className="p-1.5 rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
                </svg>
              </span>
              <h3 className="text-xl font-extrabold text-[var(--md-sys-color-on-surface)]">
                Target Hospital
              </h3>
            </div>

            {/* Selector field */}
            <div className="space-y-1.5">
              <M3HospitalSelector
                required
                id="hms-assign-hospital"
                label="Select Hospital"
                value={form.hospital_id}
                onChange={val => setForm({ ...form, hospital_id: val })}
                options={hospitals}
                loading={fetchingHospitals}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>

        {/* ── STEP 2: ADMINISTRATOR PROFILE ── */}
        <div className="flex items-stretch gap-6">
          {/* Left Timeline Column */}
          <div className="flex flex-col items-center flex-shrink-0 w-6">
            {/* Bullet Node */}
            <div 
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 flex-shrink-0 mt-1
                ${section2Valid 
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] scale-110 shadow-sm' 
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-outline)] border-2 border-[var(--md-sys-color-outline-variant)]'}
              `}
            >
              {section2Valid ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                "2"
              )}
            </div>
          </div>

          {/* Right Content Column */}
          <div className="flex-grow space-y-5">
            {/* Section Header */}
            <div className="flex items-center gap-2 select-none">
              <span className="p-1.5 rounded-lg bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-tertiary)] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <h3 className="text-xl font-extrabold text-[var(--md-sys-color-on-surface)]">
                Administrator Identity
              </h3>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <M3TextField
                  required
                  type="email"
                  id="hms-admin-email"
                  label="Admin Email"
                  placeholder="e.g. admin@hospital.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  isValid={isEmailValid}
                  helperText="Primary email used by the admin to log in and manage the assigned tenant."
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>

              <div>
                <M3TextField
                  required
                  id="hms-admin-first-name"
                  label="First Name"
                  placeholder="e.g. John"
                  value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })}
                  isValid={isFirstNameValid}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
              </div>

              <div>
                <M3TextField
                  required
                  id="hms-admin-last-name"
                  label="Last Name"
                  placeholder="e.g. Doe"
                  value={form.last_name}
                  onChange={e => setForm({ ...form, last_name: e.target.value })}
                  isValid={isLastNameValid}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
              </div>

              <div className="md:col-span-2">
                <div className="w-full flex flex-col gap-1 opacity-80 select-none">
                  <div className="relative flex items-center h-[56px] rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] px-4">
                    <div className="mr-3 text-[var(--md-sys-color-outline)]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="relative flex-grow h-full flex flex-col justify-center pt-3.5 pb-0.5">
                      <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface-variant)]">
                        Hospital Admin
                      </span>
                      <span className="absolute left-0 top-1.5 text-[9px] font-bold text-[var(--md-sys-color-outline)] uppercase tracking-wider">
                        System Role
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading || !section1Valid || !section2Valid}
            className="
              flex items-center gap-2 px-8 py-4 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] 
              font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] 
              disabled:opacity-40 disabled:scale-100 disabled:shadow-none text-sm select-none
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Assigning...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Assign Admin Role
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
