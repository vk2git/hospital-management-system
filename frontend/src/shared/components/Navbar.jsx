import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll for transparent -> solid elevation transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      isScrolled 
        ? 'bg-[var(--md-sys-color-surface-container-low)] shadow-[var(--md-sys-elevation-2)] py-2 border-b border-[var(--md-sys-color-outline-variant)]' 
        : 'bg-transparent py-4'
    }`}>
      <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center">
        {/* Brand/Logo (Left) */}
        <Link to="/" className="flex items-center gap-3 group no-underline hover:no-underline">
          <div className="w-10 h-10 bg-[var(--md-sys-color-primary)] rounded-full flex items-center justify-center text-[var(--md-sys-color-on-primary)] shadow-[var(--md-sys-elevation-1)]">
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="M420-260h120v-100h100v-120H540v-100H420v100H320v120h100v100ZM280-120q-33 0-56.5-23.5T200-200v-440q0-33 23.5-56.5T280-720h400q33 0 56.5 23.5T760-640v440q0 33-23.5 56.5T680-120H280Zm0-80h400v-440H280v440Zm-40-560v-80h480v80H240Zm40 120v440-440Z"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
            Rising <span className="text-[var(--md-sys-color-primary)]">Hospital</span>
          </span>
        </Link>

        {/* Navigation Items (Center) - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-6">
          <a 
            href="#services" 
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-all duration-200 no-underline hover:no-underline"
          >
            Services
          </a>
          <a 
            href="#why-us" 
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-all duration-200 no-underline hover:no-underline"
          >
            About
          </a>
          <a 
            href="#footer-contact" 
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-all duration-200 no-underline hover:no-underline"
          >
            Contact
          </a>
        </div>

        {/* Action Buttons (Right) - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-all duration-200 no-underline hover:no-underline"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="group relative px-6 py-2.5 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full text-sm font-bold shadow-[var(--md-sys-elevation-1)] transition-all duration-200 no-underline hover:no-underline inline-flex items-center justify-center overflow-hidden"
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] transition-all duration-300 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
              arrow_forward
            </span>
            <span className="transition-transform duration-300 transform group-hover:translate-x-3">
              Sign Up
            </span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-rounded text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 absolute top-full left-0 right-0 bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] shadow-lg animate-fade-in">
          <div className="flex flex-col gap-2 rounded-3xl p-4 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
            <a
              href="#services"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-2xl text-base font-medium text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-all duration-200 no-underline hover:no-underline"
            >
              Services
            </a>
            <a
              href="#why-us"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-2xl text-base font-medium text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-all duration-200 no-underline hover:no-underline"
            >
              About
            </a>
            <a
              href="#footer-contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-2xl text-base font-medium text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-all duration-200 no-underline hover:no-underline"
            >
              Contact
            </a>
            
            <div className="h-px bg-[var(--md-sys-color-outline-variant)] my-2" />
            
            <div className="flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-2xl text-base font-medium text-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-primary-container)] transition-all duration-200 no-underline hover:no-underline"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-2xl text-base font-bold shadow-md transition-all duration-200 no-underline hover:no-underline"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
