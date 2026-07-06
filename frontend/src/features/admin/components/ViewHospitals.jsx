import React, { useState, useEffect } from 'react';
import { getHospitals, getAdminUsers } from '@/shared/api/api';
import toast from 'react-hot-toast';

// Helper to generate initials from hospital name
const getInitials = (name) => {
  if (!name) return 'H';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Helper to generate a unique Material 3 color signature solid theme based on name
const getEmblemColors = (name) => {
  const palettes = [
    { bg: 'bg-[var(--md-sys-color-primary-container)]', text: 'text-[var(--md-sys-color-on-primary-container)]' },
    { bg: 'bg-[var(--md-sys-color-secondary-container)]', text: 'text-[var(--md-sys-color-on-secondary-container)]' },
    { bg: 'bg-[var(--md-sys-color-tertiary-container)]', text: 'text-[var(--md-sys-color-on-tertiary-container)]' },
    { bg: 'bg-[var(--md-sys-color-surface-container-highest)]', text: 'text-[var(--md-sys-color-on-surface)]' },
  ];
  if (!name) return palettes[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
};

// Helper to parse address strings for cleaner styling
const parseAddress = (address) => {
  if (!address) return { main: 'Address Not Provided', sub: '' };
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    const main = parts[0] + (parts[1] ? `, ${parts[1]}` : '');
    const sub = parts.slice(2).join(', ');
    return { main, sub };
  }
  return { main: address, sub: '' };
};

export default function ViewHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc'); // name-asc, name-desc, recent
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch both hospitals and admin users in parallel
      const [hospitalsRes, adminsRes] = await Promise.all([
        getHospitals(),
        getAdminUsers('hospital_admin')
      ]);
      
      setHospitals(hospitalsRes.data);
      setAdmins(adminsRes.data);

      // Auto-select first hospital on desktop if none selected yet
      if (hospitalsRes.data.length > 0 && !selectedId && window.innerWidth >= 1024) {
        const initialSorted = [...hospitalsRes.data].sort((a, b) => a.name.localeCompare(b.name));
        setSelectedId(initialSorted[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync database directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectHospital = (id) => {
    setSelectedId(id);
    setMobileShowDetail(true);
  };

  const handleBackToList = () => {
    setMobileShowDetail(false);
  };

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  // Filter logic
  const filteredHospitals = hospitals.filter(h => {
    const query = searchQuery.toLowerCase();
    return (
      h.name.toLowerCase().includes(query) ||
      (h.address && h.address.toLowerCase().includes(query)) ||
      (h.contact_email && h.contact_email.toLowerCase().includes(query)) ||
      (h.contact_phone && h.contact_phone.toLowerCase().includes(query))
    );
  });

  // Sort logic
  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
    } else if (sortBy === 'recent') {
      return b.id - a.id;
    }
    return 0;
  });

  const selectedHospital = hospitals.find(h => h.id === selectedId);
  const selectedHospitalAdmins = selectedHospital
    ? admins.filter(admin => admin.hospital_name === selectedHospital.name)
    : [];

  const emblemColors = selectedHospital ? getEmblemColors(selectedHospital.name) : null;

  return (
    <div className="w-full select-none animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--md-sys-color-on-background)] font-brand">
            Hospitals Network
          </h1>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Registry details and operational controls for integrated hospital tenants.
          </p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="p-3 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-all duration-200 focus:outline-none flex items-center justify-center disabled:opacity-40 md:mr-32"
          title="Sync Directory"
        >
          <span className={`material-symbols-rounded text-2xl ${loading ? 'animate-spin' : ''}`}>
            sync
          </span>
        </button>
      </div>

      {/* Main Content Layout - Canvas-integrated columns without cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[620px]">
        
        {/* LEFT COLUMN: LIST DIRECTORY */}
        <div className={`lg:col-span-5 flex flex-col space-y-4 ${mobileShowDetail ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Search Input Container */}
            <div className="relative w-full flex items-center">
              <span className="material-symbols-rounded absolute left-4 text-[var(--md-sys-color-outline)] pointer-events-none">
                search
              </span>
              <input 
                type="text"
                placeholder="Search by name, city, email..."
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

            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-auto flex-shrink-0">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto h-12 px-4 pr-10 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] cursor-pointer appearance-none focus:border-[var(--md-sys-color-primary)]"
              >
                <option value="name-asc">Sort: A-Z</option>
                <option value="name-desc">Sort: Z-A</option>
                <option value="recent">Sort: Newest</option>
              </select>
              <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-lg text-[var(--md-sys-color-outline)] pointer-events-none">
                keyboard_arrow_down
              </span>
            </div>
          </div>

          {/* Directory Listings */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 flex-grow">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--md-sys-color-primary)] mb-3"></div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Accessing host registry...</p>
            </div>
          ) : sortedHospitals.length > 0 ? (
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 flex-grow">
              {sortedHospitals.map(h => {
                const isSelected = h.id === selectedId;
                const sign = getEmblemColors(h.name);
                const addressData = parseAddress(h.address);
                
                return (
                  <div
                    key={h.id}
                    onClick={() => handleSelectHospital(h.id)}
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

                    {/* Solid Emblem Squircle */}
                    <div 
                      className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-bold text-sm shadow-inner transition-transform duration-300 group-hover:scale-105 ${sign.bg} ${sign.text}`}
                    >
                      {getInitials(h.name)}
                    </div>

                    {/* Text Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-tight truncate">
                          {h.name}
                        </span>
                        {/* Glow status dot */}
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" title="Active Core"></span>
                      </div>
                      <span className="text-xs opacity-75 truncate block mt-0.5">
                        {addressData.sub || 'Location Unspecified'}
                      </span>
                    </div>

                    {/* Trailing Icon Indicator */}
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
              <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">No registries match query</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-[240px] mt-1">
                Refine the search query parameters or verify database tenant synchronization.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAIL WORKSPACE */}
        <div className={`lg:col-span-7 flex flex-col ${!mobileShowDetail ? 'hidden lg:flex' : 'flex'}`}>
          
          {selectedHospital ? (
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

              {/* Profile identity header & Quick Operational KPI Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--md-sys-color-outline-variant)]/40 select-none">
                
                {/* Left: Brand/Name */}
                <div className="flex items-center gap-5 min-w-0">
                  {/* Logo emblem */}
                  <div 
                    className={`w-16 h-16 rounded-[var(--md-sys-shape-corner-large)] flex items-center justify-center font-extrabold text-2xl border border-[var(--md-sys-color-outline-variant)] flex-shrink-0 ${emblemColors.bg} ${emblemColors.text}`}
                  >
                    {getInitials(selectedHospital.name)}
                  </div>
                  
                  {/* Title and details */}
                  <div className="min-w-0">
                    <span className="md-label-large text-[var(--md-sys-color-primary)] font-bold tracking-wider uppercase block mb-1">
                      Core Tenant Registry
                    </span>
                    <h2 className="md-headline-medium text-[var(--md-sys-color-on-background)] font-extrabold tracking-tight truncate leading-tight font-brand">
                      {selectedHospital.name}
                    </h2>
                  </div>
                </div>

                {/* Right: Operational KPIs */}
                <div className="flex items-center gap-6 md:border-l md:border-[var(--md-sys-color-outline-variant)]/40 md:pl-6 flex-shrink-0">
                  <div className="flex flex-col space-y-1">
                    <span className="md-label-large text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-semibold">Assigned Admins</span>
                    <span className="md-title-large text-[var(--md-sys-color-primary)] font-extrabold flex items-center gap-1.5 mt-1 leading-none">
                      <span className="material-symbols-rounded">group</span>
                      {selectedHospitalAdmins.length}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1 border-l border-[var(--md-sys-color-outline-variant)]/40 pl-6">
                    <span className="md-label-large text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-semibold">Tenant Status</span>
                    <span className="md-title-large text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1.5 mt-1 leading-none">
                      <span className="material-symbols-rounded">check_circle</span>
                      Active
                    </span>
                  </div>
                </div>

              </div>

              {/* Physical Location Details Section */}
              <div className="space-y-4 pb-6 border-b border-[var(--md-sys-color-outline-variant)]/40">
                <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface)] select-none">
                  <span className="material-symbols-rounded text-[var(--md-sys-color-primary)] text-xl">
                    location_on
                  </span>
                  <h3 className="md-title-medium text-[var(--md-sys-color-on-surface)] font-bold tracking-wide">
                    Physical Headquarters
                  </h3>
                </div>

                <div className="pl-7 space-y-4">
                  <div className="flex flex-col">
                    <span className="md-body-large text-[var(--md-sys-color-on-surface)] font-bold leading-relaxed">
                      {parseAddress(selectedHospital.address).main}
                    </span>
                    <span className="md-body-medium text-[var(--md-sys-color-on-surface-variant)] leading-normal mt-1">
                      {parseAddress(selectedHospital.address).sub || 'No geographical specifics entered.'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    {/* Maps Redirection */}
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHospital.address || selectedHospital.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 h-10 rounded-full border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] md-label-large font-bold bg-transparent transition-none"
                    >
                      <span className="material-symbols-rounded text-lg">map</span>
                      Directions via Maps
                    </a>

                    {/* Copy Address */}
                    <button 
                      onClick={() => copyToClipboard(selectedHospital.address, "Address")}
                      className="inline-flex items-center gap-2 px-4 h-10 rounded-full text-[var(--md-sys-color-on-surface-variant)] md-label-large font-bold bg-transparent transition-none"
                    >
                      <span className="material-symbols-rounded text-lg">content_copy</span>
                      Copy Address
                    </button>
                  </div>
                </div>
              </div>

              {/* Communication Details Section */}
              <div className="space-y-4 pb-6 border-b border-[var(--md-sys-color-outline-variant)]/40">
                <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface)] select-none">
                  <span className="material-symbols-rounded text-[var(--md-sys-color-tertiary)] text-xl">
                    contact_phone
                  </span>
                  <h3 className="md-title-medium text-[var(--md-sys-color-on-surface)] font-bold tracking-wide">
                    Communication Channels
                  </h3>
                </div>

                <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="flex flex-col space-y-1.5">
                    <span className="md-label-large text-[var(--md-sys-color-on-surface-variant)] font-semibold uppercase tracking-wider">Primary Email Address</span>
                    {selectedHospital.contact_email ? (
                      <div className="flex items-center gap-2">
                        <a 
                          href={`mailto:${selectedHospital.contact_email}`}
                          className="md-body-large font-bold text-[var(--md-sys-color-primary)] truncate"
                        >
                          {selectedHospital.contact_email}
                        </a>
                        <button 
                          onClick={() => copyToClipboard(selectedHospital.contact_email, "Email")}
                          className="p-1.5 rounded-full text-[var(--md-sys-color-outline)] active:bg-[var(--md-sys-color-surface-container-high)] transition-none"
                        >
                          <span className="material-symbols-rounded text-lg">content_copy</span>
                        </button>
                      </div>
                    ) : (
                      <span className="md-body-medium text-[var(--md-sys-color-on-surface-variant)] italic">No email registered</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col space-y-1.5">
                    <span className="md-label-large text-[var(--md-sys-color-on-surface-variant)] font-semibold uppercase tracking-wider">Primary Contact Phone</span>
                    {selectedHospital.contact_phone ? (
                      <div className="flex items-center gap-2">
                        <a 
                          href={`tel:${selectedHospital.contact_phone}`}
                          className="md-body-large font-bold text-[var(--md-sys-color-primary)]"
                        >
                          {selectedHospital.contact_phone}
                        </a>
                        <button 
                          onClick={() => copyToClipboard(selectedHospital.contact_phone, "Phone")}
                          className="p-1.5 rounded-full text-[var(--md-sys-color-outline)] active:bg-[var(--md-sys-color-surface-container-high)] transition-none"
                        >
                          <span className="material-symbols-rounded text-lg">content_copy</span>
                        </button>
                      </div>
                    ) : (
                      <span className="md-body-medium text-[var(--md-sys-color-on-surface-variant)] italic">No phone registered</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cross-Referenced Administrators Section */}
              <div className="space-y-4 pb-6 border-b border-[var(--md-sys-color-outline-variant)]/40">
                <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface)] select-none">
                  <span className="material-symbols-rounded text-[var(--md-sys-color-secondary)] text-xl">
                    supervisor_account
                  </span>
                  <h3 className="md-title-medium text-[var(--md-sys-color-on-surface)] font-bold tracking-wide">
                    Associated Administrators
                  </h3>
                </div>

                <div className="pl-7">
                  {selectedHospitalAdmins.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[var(--md-sys-color-on-surface-variant)] border-b border-[var(--md-sys-color-outline-variant)]">
                            <th className="py-3 px-2 md-label-large font-bold uppercase tracking-wider">Name</th>
                            <th className="py-3 px-2 md-label-large font-bold uppercase tracking-wider">Email</th>
                            <th className="py-3 px-2 md-label-large font-bold uppercase tracking-wider text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedHospitalAdmins.map(admin => (
                            <tr key={admin.id} className="border-b border-[var(--md-sys-color-outline-variant)]/20 text-xs transition-none">
                              <td className="py-3 px-2 md-body-medium font-bold text-[var(--md-sys-color-on-surface)]">
                                {admin.first_name} {admin.last_name}
                              </td>
                              <td className="py-3 px-2 md-body-medium text-[var(--md-sys-color-on-surface-variant)] font-normal">
                                <a href={`mailto:${admin.email}`} className="text-[var(--md-sys-color-primary)]">
                                  {admin.email}
                                </a>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <span className={`px-2 py-0.5 rounded-full md-label-large font-bold ${admin.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                                  {admin.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-[var(--md-sys-shape-corner-large)] p-4 bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border border-[var(--md-sys-color-error)]/20 flex items-start gap-3">
                      <span className="material-symbols-rounded text-xl flex-shrink-0 mt-0.5 text-[var(--md-sys-color-error)]">
                        warning
                      </span>
                      <div className="space-y-1">
                        <h4 className="md-title-medium font-bold text-[var(--md-sys-color-on-error-container)]">No Admins Assigned</h4>
                        <p className="md-body-medium opacity-90 leading-relaxed">
                          This hospital tenant does not have any assigned administrators. Go to the <span className="font-bold underline">Assign Admin</span> tab to configure a manager for this facility.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical / System Parameters Footer */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface)] select-none">
                  <span className="material-symbols-rounded text-[var(--md-sys-color-outline)] text-xl">
                    settings_ethernet
                  </span>
                  <h3 className="md-title-medium text-[var(--md-sys-color-on-surface)] font-bold tracking-wide">
                    System Configuration
                  </h3>
                </div>

                <div className="pl-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="block md-label-large font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">Database Instance</span>
                    <span className="md-body-medium font-bold text-[var(--md-sys-color-on-surface)] mt-1 block">Isolated Master</span>
                  </div>
                  <div>
                    <span className="block md-label-large font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">Tenant Class</span>
                    <span className="md-body-medium font-bold text-[var(--md-sys-color-on-surface)] mt-1 block">Standard Node</span>
                  </div>
                  <div>
                    <span className="block md-label-large font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">API Sync Index</span>
                    <span className="md-body-medium font-bold text-[var(--md-sys-color-on-surface)] mt-1 block">Synced (0s ago)</span>
                  </div>
                  <div>
                    <span className="block md-label-large font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">Storage Allocated</span>
                    <span className="md-body-medium font-bold text-[var(--md-sys-color-on-surface)] mt-1 block">1.5 GB / Unlimited</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="pl-7 flex justify-end gap-3 pt-2">
                  <button 
                    disabled 
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-full border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-outline)] opacity-40 cursor-not-allowed md-label-large font-bold bg-transparent transition-none"
                    title="Tenant edit controls require standard user roles"
                  >
                    Edit Registry
                  </button>
                  <button 
                    disabled
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-full text-[var(--md-sys-color-error)] opacity-40 cursor-not-allowed md-label-large font-bold bg-transparent transition-none"
                  >
                    Deactivate Tenant
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Blank state when no hospital selected */
            <div className="flex flex-col items-center justify-center py-20 text-center flex-grow border border-dashed border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-extra-large)] p-8 min-h-[500px]">
              {/* Pulsing ring M3 shape overlay */}
              <div className="w-24 h-24 rounded-[var(--md-sys-shape-corner-extra-large)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center mb-6 shadow-sm animate-pulse">
                <span className="material-symbols-rounded text-5xl">
                  domain
                </span>
              </div>
              <h2 className="md-headline-small text-[var(--md-sys-color-on-background)] font-extrabold font-brand">
                Select a Hospital Tenant
              </h2>
              <p className="md-body-medium text-[var(--md-sys-color-on-surface-variant)] max-w-sm mt-2 leading-relaxed">
                Choose a hospital node from the directory list on the left to inspect detailed registry metrics, geographic locations, communication channels, and associated administrators.
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] md-label-large font-bold">
                <span className="material-symbols-rounded text-sm">info</span>
                Tip: Type coordinates or phone prefixes to filter listing logs.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
