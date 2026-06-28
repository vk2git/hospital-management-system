import React, { useState, useRef, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/shared/api/api';

const NotificationBell = ({ unreadCount, setUnreadCount, collapsed = true, isOpen: controlledIsOpen, onToggle }) => {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : localIsOpen;
  const setIsOpen = isControlled ? (val) => { if (onToggle) onToggle(val); } : setLocalIsOpen;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Helper to format date
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {collapsed ? (
        // Collapsed state: Icon button with badge aligned to center of 36px width
        <button 
          onClick={toggleDropdown}
          className={`w-9 h-9 rounded-full relative flex items-center justify-center transition-[background-color,color] duration-200 focus:outline-none focus:ring-0 focus:ring-transparent focus:border-transparent outline-none border-none border-transparent ${
            isOpen 
              ? 'bg-[#006493]/10 text-[#006493]' 
              : 'text-[#5f6368] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-white select-none" />
          )}
        </button>
      ) : (
        // Expanded state: Full width row with icon centered in a 48px area matching navigation items
        <button 
          onClick={toggleDropdown}
          className={`w-full flex items-center rounded-full h-12 pr-4 transition-colors duration-200 focus:outline-none outline-none ${
            isOpen 
              ? 'bg-black/5 text-[#1f1f1f]'
              : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <span className="truncate ml-1 text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full select-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white text-[#1f1f1f] rounded-2xl shadow-xl border border-[#e3e3e3] overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="px-4 py-3 bg-[#f0f4f9] border-b border-[#e3e3e3] flex justify-between items-center select-none">
            <h3 className="text-sm font-bold text-[#1f1f1f]">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-[#006493] hover:underline font-semibold focus:outline-none outline-none"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-6 select-none">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#006493]"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-[#5f6368] text-sm select-none">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-[#e3e3e3]/50">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-[#f0f4f9]/50 transition-colors ${notification.is_read ? 'opacity-60' : 'bg-[#cae6ff]/20'}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.is_read ? 'font-medium text-[#1f1f1f]' : 'font-bold text-[#1f1f1f]'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-[#444746] mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[#5f6368] mt-2">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <button 
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="w-2.5 h-2.5 rounded-full bg-[#006493] flex-shrink-0 mt-1.5 hover:scale-125 transition-transform focus:outline-none outline-none"
                          title="Mark as read"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
