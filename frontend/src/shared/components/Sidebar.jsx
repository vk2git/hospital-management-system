import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUnreadNotificationCount } from '@/shared/api/api';
import NotificationBell from '@/shared/components/NotificationBell';
import toast from 'react-hot-toast';

const Sidebar = ({ menuItems, activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Read initial collapsed state from localStorage (default to false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  // Track active dropdown state ('notifications', 'settings', or null)
  const [activeDropdown, setActiveDropdown] = useState(null);
  const isSettingsOpen = activeDropdown === 'settings';
  const setIsSettingsOpen = (val) => {
    setActiveDropdown(val ? 'settings' : null);
  };

  // Force system to stay in light mode on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  // Fetch unread notifications for the logged in user
  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const { data } = await getUnreadNotificationCount();
          setUnreadCount(data.count);
        } catch (e) {
          console.error("Failed to fetch notification count", e);
        }
      };
      fetchUnread();
      
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleCollapseToggle = (e) => {
    e.stopPropagation();
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar_collapsed', String(nextState));
  };

  const handleLogoClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem('sidebar_collapsed', 'false');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper to map tab IDs to premium SVG vector icons instead of flat emojis
  const getProperIconById = (id) => {
    switch (id) {
      case 'overview':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'hospitals':
      case 'view-hospitals':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
          </svg>
        );
      case 'register-hospital':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m4-9h4m-2-2v4M9 17h6" />
          </svg>
        );
      case 'assign-admin':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 11l2 2 4-4" />
          </svg>
        );
      case 'view-hospital-admins':
      case 'users':
      case 'patients':
      case 'members':
      case 'roster':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0-.001h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'appointments':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        );
      case 'smart-search':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904z" />
          </svg>
        );
      case 'inventory':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'prescriptions':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'payments':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m3 0h4" />
          </svg>
        );
      case 'profile':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderIcon = (item) => {
    if (typeof item.icon === 'object') {
      return item.icon;
    }
    const svgIcon = getProperIconById(item.id);
    if (svgIcon) return svgIcon;
    return <span className="text-lg">{item.icon}</span>;
  };

  // Helper to determine brand title and subtitle based on user role
  const getBranding = (role) => {
    switch (role) {
      case 'admin':
        return {
          title: 'HMS Portal',
          subtitle: 'System Admin'
        };
      case 'hospital_admin':
        return {
          title: user?.hospital_name || 'Rising Hospital',
          subtitle: 'Hospital Admin'
        };
      case 'doctor':
        return {
          title: user?.last_name ? `Dr. ${user.last_name}` : 'Doctor Portal',
          subtitle: 'Clinical Workspace'
        };
      case 'patient':
        return {
          title: 'My Health',
          subtitle: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Patient Portal'
        };
      default:
        return {
          title: 'Rising HMS',
          subtitle: role ? role.toUpperCase() : 'Workspace'
        };
    }
  };

  // Helper to determine brand/logo icon dynamically based on user role
  const getRoleLogoIcon = (role) => {
    switch (role) {
      case 'admin':
        return (
          <svg className="w-6 h-6 text-[#006493]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'hospital_admin':
        return (
          <svg className="w-6 h-6 text-[#006493]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
          </svg>
        );
      case 'doctor':
        return (
          <svg className="w-6 h-6 text-[#006493]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 11v2m0 0a2 2 0 10-2-2m2 2a2 2 0 11-2-2m0 0V8a4 4 0 018 0v3m3-3a9 9 0 00-18 0m18 0a9 9 0 01-9 9" />
          </svg>
        );
      case 'patient':
        return (
          <svg className="w-6 h-6 text-[#006493]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'pharmacy':
        return (
          <svg className="w-6 h-6 text-[#006493]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.22a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'staff':
        return (
          <svg className="w-6 h-6 text-[#006493]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-[#006493]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
    }
  };

  // Helper to determine primary action properties and proper vector SVGs based on user role
  const getPrimaryAction = (role) => {
    switch (role) {
      case 'hospital_admin':
        return { 
          tabId: 'users', 
          label: 'Invite User', 
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          )
        };
      case 'doctor':
        return { 
          tabId: 'smart-search', 
          label: 'AI Smart Search', 
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM19.006 5.005L18.5 8l-.505-2.995L15 4.5l2.995-.505L18.5 1l.505 2.995L22 4.5l-2.994.505z" />
            </svg>
          )
        };
      case 'patient':
        return { 
          tabId: 'appointments', 
          label: 'Book Appointment', 
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 5V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2zM16 2v4M8 2v4" />
            </svg>
          ) 
        };
      case 'pharmacy':
        return { 
          tabId: 'inventory', 
          label: 'Add Medicine', 
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m3-8.5v3M4.5 12a7.5 7.5 0 0015 0M4.5 12h15" />
            </svg>
          )
        };
      case 'staff':
        return { 
          tabId: 'users', 
          label: 'Invite Staff', 
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          ) 
        };
      default:
        return null;
    }
  };

  const branding = getBranding(user?.role);
  const primaryAction = getPrimaryAction(user?.role);

  // Determine user display info
  const userDisplayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'System Admin';
  const userInitials = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'A';
  const userSub = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ') + ' Pro') : 'Pro';

  return (
    <>
      {/* Backdrop to close active dropdown when clicking outside */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40 cursor-default" 
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Floating Top Right Pill Controls (Notification, Profile Avatar) */}
      {user && (
        <div className="fixed top-4 right-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-full h-12 px-2 shadow-[0_2px_12px_rgba(0,0,0,0.06)] select-none">
          <NotificationBell 
            collapsed={true} 
            unreadCount={unreadCount} 
            setUnreadCount={setUnreadCount} 
            isOpen={activeDropdown === 'notifications'}
            onToggle={(isOpen) => setActiveDropdown(isOpen ? 'notifications' : null)}
          />

          {/* Profile Circle Avatar (Clicks toggle settings) */}
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'settings' ? null : 'settings')}
            className={`w-9 h-9 rounded-full bg-[#137333] text-white flex items-center justify-center font-bold text-sm shadow-sm border border-transparent hover:scale-105 transition-[background-color,color,transform] duration-200 focus:outline-none focus:ring-0 focus:ring-transparent focus:border-transparent outline-none ${
              activeDropdown === 'settings' ? 'ring-2 ring-[#137333]/30 scale-105' : ''
            }`}
          >
            {userInitials}
          </button>

          {/* Dropdown settings popup (styled below the top right pill) */}
          {isSettingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#e3e3e3] text-[#1f1f1f] rounded-2xl p-4 shadow-xl z-50 flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-[#e3e3e3] pb-2">
                <span className="text-xs font-bold text-[#5f6368] uppercase tracking-wider">Account Settings</span>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-[#5f6368] hover:text-[#1f1f1f] text-xs font-semibold focus:outline-none"
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-100 gap-0.5">
                  <span className="text-xs font-bold text-[#1f1f1f]">{userDisplayName}</span>
                  <span className="text-[10px] text-[#5f6368]">{userSub}</span>
                  <span className="text-[9px] text-neutral-400 mt-1 truncate">{user?.email}</span>
                </div>

                <div className="flex flex-col px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-100 gap-0.5">
                  <span className="text-[10px] text-[#5f6368] font-bold uppercase">HMS Tenant Access</span>
                  <span className="text-xs text-[#1f1f1f] font-semibold">
                    {user?.role === 'admin' ? 'Enterprise License' : 'Standard License'}
                  </span>
                </div>

                {/* Feedback & Help Actions */}
                <button
                  onClick={() => {
                    toast.success("Help documents opened!", {
                      style: { background: 'white', color: '#1f1f1f', border: '1px solid #e3e3e3' }
                    });
                    setIsSettingsOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg hover:bg-neutral-50 text-left text-xs font-medium text-[#444746] hover:text-[#1f1f1f] focus:outline-none"
                >
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
                  </svg>
                  <span>Help & Documentation</span>
                </button>

                <button
                  onClick={() => {
                    const opinion = prompt("Help us improve! Send your feedback:");
                    if (opinion) {
                      toast.success("Feedback submitted! Thank you.", {
                        style: { background: 'white', color: '#1f1f1f', border: '1px solid #e3e3e3' }
                      });
                    }
                    setIsSettingsOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg hover:bg-neutral-50 text-left text-xs font-medium text-[#444746] hover:text-[#1f1f1f] focus:outline-none"
                >
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Send Feedback</span>
                </button>

                {/* Log Out */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 text-left text-xs font-bold focus:outline-none mt-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span className="whitespace-nowrap">Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sidebar Navigation Drawer */}
      <div 
        className={`h-screen sticky top-0 bg-[#f7f9fc] text-[#1f1f1f] border-r border-[#e3e3e3] flex flex-col justify-between py-3.5 px-3 transition-all duration-300 ease-in-out z-40 flex-shrink-0 select-none ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        } overflow-hidden`}
      >
        <div className="flex flex-col min-h-0 w-full">
          
          {/* Brand Header */}
          <div 
            onClick={handleLogoClick}
            className={`flex items-center mb-6 h-12 relative w-full overflow-hidden ${isCollapsed ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center h-12 w-full flex-shrink-0">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                {getRoleLogoIcon(user?.role)}
              </div>
              <div className="flex flex-col min-w-0 ml-1.5">
                <span className="text-[15px] font-bold tracking-tight text-[#1f1f1f] truncate leading-tight">
                  {branding.title}
                </span>
                <span className="text-[9px] text-[#006493] font-bold tracking-wider uppercase leading-none mt-0.5">
                  {branding.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          {primaryAction && (
            <div className="flex mb-6 w-full h-12 relative justify-start items-center">
              <button
                onClick={() => setActiveTab(primaryAction.tabId)}
                className={`flex items-center h-12 rounded-full bg-[#d3e3fd] hover:bg-[#c2e1ff] text-[#041e49] shadow-sm text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none select-none flex-shrink-0 overflow-hidden ${
                  isCollapsed ? 'w-12' : 'w-full'
                }`}
              >
                <span className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-xl">
                  {primaryAction.icon}
                </span>
                <span className="truncate font-bold ml-1">
                  {primaryAction.label}
                </span>
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-1.5 overflow-y-auto flex-grow w-full">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center h-12 rounded-full transition-all duration-300 ease-in-out focus:outline-none select-none flex-shrink-0 overflow-hidden w-full ${
                    isActive
                      ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                      : 'text-[#444746] hover:bg-[#1f1f1f]/5 hover:text-[#1f1f1f]'
                  }`}
                >
                  <span className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-lg">
                    {renderIcon(item)}
                  </span>
                  <span className="truncate text-sm ml-1 font-semibold">
                    {item.label}
                  </span>
                  
                  {/* Badge */}
                  {item.badge && (
                    <span className="ml-auto mr-4 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Toggle Collapse/Expand Button */}
        <div className="w-full h-12 flex items-center justify-start mt-auto flex-shrink-0">
          <button 
            onClick={handleCollapseToggle}
            className="flex items-center h-12 rounded-full text-[#444746] hover:bg-[#1f1f1f]/5 hover:text-[#1f1f1f] transition-all duration-300 ease-in-out focus:outline-none select-none flex-shrink-0 overflow-hidden w-full"
          >
            <span className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-xl">
              {isCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                </svg>
              )}
            </span>
            <span className="truncate text-sm ml-1 font-semibold">
              Collapse Menu
            </span>
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;
