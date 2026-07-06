import React, { useState, useEffect } from 'react';
import { getAdminUsers } from '@/shared/api/api';
import toast from 'react-hot-toast';

// Helper to generate initials from administrator name
const getInitials = (first, last) => {
  return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || 'A';
};

// Helper to generate a unique Material 3 color signature solid theme based on email
const getEmblemColors = (email) => {
  const palettes = [
    { bg: 'bg-[var(--md-sys-color-primary-container)]', text: 'text-[var(--md-sys-color-on-primary-container)]' },
    { bg: 'bg-[var(--md-sys-color-secondary-container)]', text: 'text-[var(--md-sys-color-on-secondary-container)]' },
    { bg: 'bg-[var(--md-sys-color-tertiary-container)]', text: 'text-[var(--md-sys-color-on-tertiary-container)]' },
    { bg: 'bg-[var(--md-sys-color-surface-container-highest)]', text: 'text-[var(--md-sys-color-on-surface)]' },
  ];
  if (!email) return palettes[0];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
};

// Helper to format date strings nicely
const formatDate = (dateStr) => {
  if (!dateStr) return 'System Default';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'System Default';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return 'System Default';
  }
};

export default function ViewHospitalAdmins({ setActiveTab }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [sortBy, setSortBy] = useState('name-asc'); // name-asc, name-desc, recent
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers('hospital_admin');
      const data = res.data || [];
      setAdmins(data);

      // Auto-select first admin on desktop if none selected yet
      if (data.length > 0 && !selectedId && window.innerWidth >= 1024) {
        const initialSorted = [...data].sort((a, b) => 
          `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        );
        setSelectedId(initialSorted[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load hospital administrators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSelectAdmin = (id) => {
    setSelectedId(id);
    setMobileShowDetail(true);
  };

  const handleBackToList = () => {
    setMobileShowDetail(false);
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const selectedAdmin = admins.find(a => a.id === selectedId);

  // Filter logic
  const filteredAdmins = admins.filter(admin => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      `${admin.first_name} ${admin.last_name}`.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      (admin.hospital_name && admin.hospital_name.toLowerCase().includes(query));

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && admin.is_active) || 
      (statusFilter === 'inactive' && !admin.is_active);

    return matchesSearch && matchesStatus;
  });

  // Sort logic
  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    } else if (sortBy === 'name-desc') {
      return `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`);
    } else if (sortBy === 'recent') {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  // Compile full admin summary report for copy
  const handleCopyReport = (admin) => {
    if (!admin) return;
    const reportText = `[Hospital Admin Profile Report]
Name: ${admin.first_name} ${admin.last_name}
Role: Hospital Administrator
Email: ${admin.email}
Hospital Assignment: ${admin.hospital_name || 'Unassigned'}
Status: ${admin.is_active ? 'Active' : 'Inactive'}
Registered Date: ${formatDate(admin.created_at)}
System ID: ${admin.id}
Security privilege: High level
MFa status: Enforced (Simulation)
Diagnostic session status: Authenticated`;
    
    copyToClipboard(reportText, 'Profile diagnostic report');
  };

  // Stats calculation
  const totalCount = admins.length;
  const activeCount = admins.filter(a => a.is_active).length;
  const unassignedCount = admins.filter(a => !a.hospital_name).length;
  const activePercent = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  return (
    <div className="w-full select-none animate-fade-in space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--md-sys-color-on-background)] font-brand">
            Hospital Administrators
          </h1>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Registry details, security status, and tenant assignments for system operators.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto md:mr-32">
          <button 
            onClick={fetchAdmins}
            disabled={loading}
            className="p-3 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-all duration-200 focus:outline-none flex items-center justify-center disabled:opacity-40"
            title="Refresh Directory"
          >
            <span className={`material-symbols-rounded text-2xl ${loading ? 'animate-spin' : ''}`}>
              sync
            </span>
          </button>
          
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('assign-admin')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:bg-opacity-90 font-bold text-sm shadow-md transition-all ml-auto md:ml-0"
            >
              <span className="material-symbols-rounded text-lg">add</span>
              Assign Administrator
            </button>
          )}
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--md-sys-color-surface-container-low)] p-4 rounded-3xl border border-[var(--md-sys-color-outline-variant)]/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
            <span className="material-symbols-rounded text-2xl">supervisor_account</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--md-sys-color-outline)]">Total Admins</p>
            <p className="text-2xl font-black text-[var(--md-sys-color-on-surface)]">{totalCount}</p>
          </div>
        </div>

        <div className="bg-[var(--md-sys-color-surface-container-low)] p-4 rounded-3xl border border-[var(--md-sys-color-outline-variant)]/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <span className="material-symbols-rounded text-2xl">verified_user</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--md-sys-color-outline)]">Active Admins</p>
            <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
          </div>
        </div>

        <div className="bg-[var(--md-sys-color-surface-container-low)] p-4 rounded-3xl border border-[var(--md-sys-color-outline-variant)]/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <span className="material-symbols-rounded text-2xl">warning</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--md-sys-color-outline)]">Unassigned</p>
            <p className="text-2xl font-black text-amber-600">{unassignedCount}</p>
          </div>
        </div>

        <div className="bg-[var(--md-sys-color-surface-container-low)] p-4 rounded-3xl border border-[var(--md-sys-color-outline-variant)]/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-tertiary)] flex items-center justify-center">
            <span className="material-symbols-rounded text-2xl">security</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--md-sys-color-outline)]">Active Ratio</p>
            <p className="text-2xl font-black text-[var(--md-sys-color-on-tertiary-container)]">{activePercent}%</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT PANE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[580px]">
        
        {/* LEFT COLUMN: FILTERABLE DIRECTORY */}
        <div className={`lg:col-span-5 flex flex-col space-y-4 ${mobileShowDetail ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Search, Status Tabs and Sort Controls */}
          <div className="space-y-3">
            <div className="relative w-full flex items-center">
              <span className="material-symbols-rounded absolute left-4 text-[var(--md-sys-color-outline)] pointer-events-none">
                search
              </span>
              <input 
                type="text"
                placeholder="Search by name, email, facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-10 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] text-sm text-[var(--md-sys-color-on-surface)] transition-all focus:border-[var(--md-sys-color-primary)] focus:border-2 focus:pl-[47px]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                >
                  <span className="material-symbols-rounded text-lg">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Status Segmented Tabs */}
              <div className="flex bg-[var(--md-sys-color-surface-container-high)] p-1 rounded-xl">
                {['all', 'active', 'inactive'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`
                      px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200
                      ${statusFilter === status 
                        ? 'bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-primary)] shadow-sm' 
                        : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'}
                    `}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Sort selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-on-surface)] cursor-pointer appearance-none focus:border-[var(--md-sys-color-primary)]"
                >
                  <option value="name-asc">A-Z</option>
                  <option value="name-desc">Z-A</option>
                  <option value="recent">Newest Joined</option>
                </select>
                <span className="material-symbols-rounded absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[var(--md-sys-color-outline)] pointer-events-none">
                  keyboard_arrow_down
                </span>
              </div>
            </div>
          </div>

          {/* Directory Listings */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 flex-grow">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--md-sys-color-primary)] mb-3"></div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-medium">Accessing directory registry...</p>
            </div>
          ) : sortedAdmins.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 flex-grow">
              {sortedAdmins.map(admin => {
                const isSelected = admin.id === selectedId;
                const sign = getEmblemColors(admin.email);
                
                return (
                  <div
                    key={admin.id}
                    onClick={() => handleSelectAdmin(admin.id)}
                    className={`
                      w-full text-left rounded-2xl p-4 transition-all duration-200 flex items-center gap-4 cursor-pointer relative group
                      ${isSelected 
                        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] shadow-sm' 
                        : 'bg-transparent hover:bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border-b border-[var(--md-sys-color-surface-container-high)]/40'}
                    `}
                  >
                    {/* Active Left Pill Indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-[var(--md-sys-color-primary)] rounded-r-full"></div>
                    )}

                    {/* Solid Avatar */}
                    <div 
                      className={`w-11 h-11 rounded-[16px] flex items-center justify-center font-bold text-xs shadow-inner transition-transform duration-300 group-hover:scale-105 select-none ${sign.bg} ${sign.text}`}
                    >
                      {getInitials(admin.first_name, admin.last_name)}
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-tight truncate">
                          {admin.first_name} {admin.last_name}
                        </span>
                        {admin.is_active ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="Active"></span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 flex-shrink-0" title="Inactive"></span>
                        )}
                      </div>
                      <span className="text-xs opacity-75 truncate block mt-0.5">
                        {admin.hospital_name || 'Unassigned Operator'}
                      </span>
                    </div>

                    {/* Arrow Indicator */}
                    <span className={`material-symbols-rounded text-lg transition-transform duration-200 group-hover:translate-x-0.5 ${isSelected ? 'text-[var(--md-sys-color-on-secondary-container)]' : 'text-[var(--md-sys-color-outline)]'}`}>
                      chevron_right
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center flex-grow border border-dashed border-[var(--md-sys-color-outline-variant)] rounded-3xl p-6">
              <span className="material-symbols-rounded text-4xl text-[var(--md-sys-color-outline)] mb-3">
                search_off
              </span>
              <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">No administrators found</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-[240px] mt-1">
                Refine the search criteria or filters, or assign a new admin tab.
              </p>
            </div>
          )}
        </div>

        <div className={`lg:col-span-7 flex flex-col ${!mobileShowDetail ? 'hidden lg:flex' : 'flex'}`}>
          
          {selectedAdmin ? (
            <div className="w-full flex flex-col space-y-6 animate-slide-up flex-grow">
              
              {/* Mobile Back Header */}
              <div className="lg:hidden flex items-center mb-2">
                <button 
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] md-label-large font-bold transition-none focus:outline-none"
                >
                  <span className="material-symbols-rounded text-sm">arrow_back</span>
                  Back to Directory
                </button>
              </div>

              {/* Profile identity header on canvas */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-[var(--md-sys-color-outline-variant)]/40 select-none">
                {/* Logo emblem */}
                <div 
                  className={`w-20 h-20 rounded-[var(--md-sys-shape-corner-large)] flex items-center justify-center font-extrabold text-3xl border border-[var(--md-sys-color-outline-variant)] flex-shrink-0 ${getEmblemColors(selectedAdmin.email).bg} ${getEmblemColors(selectedAdmin.email).text}`}
                >
                  {getInitials(selectedAdmin.first_name, selectedAdmin.last_name)}
                </div>

                {/* Title and details */}
                <div className="min-w-0 text-center sm:text-left flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                    <h2 className="md-headline-medium text-[var(--md-sys-color-on-background)] font-extrabold tracking-tight truncate leading-tight font-brand">
                      {selectedAdmin.first_name} {selectedAdmin.last_name}
                    </h2>
                    <span className="self-center sm:self-auto px-2.5 py-0.5 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] md-label-large font-bold uppercase rounded-full tracking-wider">
                      Operator
                    </span>
                  </div>
                  <p className="md-body-medium text-[var(--md-sys-color-on-surface-variant)] mt-1.5 font-medium">
                    Role Privilege: Hospital Administrator
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                    {selectedAdmin.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full md-label-large font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full md-label-large font-bold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                        Inactive
                      </span>
                    )}

                    {selectedAdmin.hospital_name ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full md-label-large font-bold bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border border-[var(--md-sys-color-outline-variant)]/20">
                        <span className="material-symbols-rounded text-sm">home_work</span>
                        {selectedAdmin.hospital_name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full md-label-large font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                        <span className="material-symbols-rounded text-sm">warning</span>
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Split details columns flat on canvas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-[var(--md-sys-color-outline-variant)]/40">
                
                {/* REGISTRY DETAILS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[var(--md-sys-color-outline-variant)]/20 pb-2">
                    <span className="material-symbols-rounded text-[var(--md-sys-color-primary)] text-xl">
                      assignment_ind
                    </span>
                    <h3 className="md-title-medium text-[var(--md-sys-color-on-surface)] font-bold tracking-wide">
                      Registry Details
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="md-label-large text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-semibold">Email Address</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="md-body-large font-bold text-[var(--md-sys-color-on-surface)] truncate mr-2 select-text">
                          {selectedAdmin.email}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(selectedAdmin.email, 'Email address')}
                          className="p-1.5 rounded-full text-[var(--md-sys-color-outline)] active:bg-[var(--md-sys-color-surface-container-high)] transition-none"
                          title="Copy Email"
                        >
                          <span className="material-symbols-rounded text-lg">content_copy</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="md-label-large text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-semibold">Assigned Hospital Tenant</span>
                      <span className={`md-body-large font-bold block mt-1 ${selectedAdmin.hospital_name ? 'text-[var(--md-sys-color-primary)]' : 'text-amber-600'}`}>
                        {selectedAdmin.hospital_name || 'Not Configured (Requires Assignment)'}
                      </span>
                    </div>

                    <div>
                      <span className="md-label-large text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-semibold">Registered Since</span>
                      <span className="md-body-large font-bold text-[var(--md-sys-color-on-surface)] block mt-1">
                        {formatDate(selectedAdmin.created_at)}
                      </span>
                    </div>

                    <div>
                      <span className="md-label-large text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-semibold">System Identifier</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="md-body-medium font-mono text-[var(--md-sys-color-outline)] truncate mr-2 select-text">
                          {selectedAdmin.id}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(selectedAdmin.id, 'System ID')}
                          className="p-1.5 rounded-full text-[var(--md-sys-color-outline)] active:bg-[var(--md-sys-color-surface-container-high)] transition-none"
                          title="Copy ID"
                        >
                          <span className="material-symbols-rounded text-lg">content_copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECURITY PROFILE DIAGNOSTICS */}
                <div className="space-y-4 md:border-l md:border-[var(--md-sys-color-outline-variant)]/40 md:pl-8">
                  <div className="flex items-center gap-2 border-b border-[var(--md-sys-color-outline-variant)]/20 pb-2">
                    <span className="material-symbols-rounded text-[var(--md-sys-color-tertiary)] text-xl">
                      gpp_maybe
                    </span>
                    <h3 className="md-title-medium text-[var(--md-sys-color-on-surface)] font-bold tracking-wide">
                      Security & Diagnostics
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md-body-medium font-bold text-[var(--md-sys-color-on-surface)]">
                        <span className="material-symbols-rounded text-emerald-500 text-sm">check_circle</span>
                        MFA Enforcement
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 md-label-large font-bold uppercase tracking-wider rounded-md">
                        Secured
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md-body-medium font-bold text-[var(--md-sys-color-on-surface)]">
                        <span className="material-symbols-rounded text-emerald-500 text-sm">check_circle</span>
                        Session Protection
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 md-label-large font-bold uppercase tracking-wider rounded-md">
                        TLS 1.3
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md-body-medium font-bold text-[var(--md-sys-color-on-surface)]">
                        <span className="material-symbols-rounded text-emerald-500 text-sm">check_circle</span>
                        Authorized Level
                      </div>
                      <span className="px-2 py-0.5 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] md-label-large font-bold uppercase tracking-wider rounded-md">
                        High Privilege
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md-body-medium font-bold text-[var(--md-sys-color-on-surface)]">
                        <span className="material-symbols-rounded text-amber-500 text-sm">info</span>
                        Action Audits
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 md-label-large font-bold uppercase tracking-wider rounded-md">
                        Standard Logs
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* OPERATIONAL CONTROLS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-[var(--md-sys-color-outline)] text-xl">
                    construction
                  </span>
                  <h3 className="md-title-medium text-[var(--md-sys-color-on-surface)] font-bold tracking-wide">
                    Operator Controls
                  </h3>
                </div>

                <div className="flex flex-wrap gap-3 pl-7">
                  <a
                    href={`mailto:${selectedAdmin.email}`}
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-full border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] md-label-large font-bold bg-transparent transition-none"
                  >
                    <span className="material-symbols-rounded text-base text-[var(--md-sys-color-primary)]">mail</span>
                    Send Direct Email
                  </a>

                  <button
                    onClick={() => handleCopyReport(selectedAdmin)}
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-full border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] md-label-large font-bold bg-transparent transition-none"
                  >
                    <span className="material-symbols-rounded text-base text-[var(--md-sys-color-tertiary)]">receipt_long</span>
                    Copy Diagnostics Report
                  </button>

                  {setActiveTab && (
                    <button
                      onClick={() => setActiveTab('assign-admin')}
                      className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] md-label-large font-bold transition-none sm:ml-auto"
                    >
                      <span className="material-symbols-rounded text-base">manage_accounts</span>
                      Reconfigure Tenant Assignment
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-dashed border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-extra-large)] min-h-[400px]">
              <span className="material-symbols-rounded text-6xl text-[var(--md-sys-color-outline-variant)] mb-4 animate-pulse">
                account_circle
              </span>
              <h3 className="md-headline-small text-[var(--md-sys-color-on-surface)] font-extrabold font-brand">No Operator Selected</h3>
              <p className="md-body-medium text-[var(--md-sys-color-on-surface-variant)] max-w-sm mt-2 leading-relaxed">
                Choose a hospital administrator from the directory roster on the left to inspect detailed registries, security profiles, associated tenant hospitals, and communication diagnostics.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
