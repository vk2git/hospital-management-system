import React, { useState, useEffect, useRef } from 'react';
import { createHospital } from '@/shared/api/api';
import toast from 'react-hot-toast';

// ── GLOBAL COUNTRY DATA (ALL WORLD COUNTRIES WITH DIAL CODES & FLAGS) ──
const countryData = [
  { name: "Afghanistan", code: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "+213", flag: "🇩🇿" },
  { name: "Andorra", code: "+376", flag: "🇦🇩" },
  { name: "Angola", code: "+244", flag: "🇦🇴" },
  { name: "Antigua and Barbuda", code: "+1", flag: "🇦🇬" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Armenia", code: "+374", flag: "🇦🇲" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "+994", flag: "🇦🇿" },
  { name: "Bahamas", code: "+1", flag: "🇧🇸" },
  { name: "Bahrain", code: "+973", flag: "🇧🇭" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { name: "Barbados", code: "+1", flag: "🇧🇧" },
  { name: "Belarus", code: "+375", flag: "🇧🇾" },
  { name: "Belgium", code: "+32", flag: "🇧🇪" },
  { name: "Belize", code: "+501", flag: "🇧🇿" },
  { name: "Benin", code: "+229", flag: "🇧🇯" },
  { name: "Bhutan", code: "+975", flag: "🇧🇹" },
  { name: "Bolivia", code: "+591", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", code: "+387", flag: "🇧🇦" },
  { name: "Botswana", code: "+267", flag: "🇧🇼" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Brunei", code: "+673", flag: "🇧🇳" },
  { name: "Bulgaria", code: "+359", flag: "🇧🇬" },
  { name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
  { name: "Burundi", code: "+257", flag: "🇧🇮" },
  { name: "Cabo Verde", code: "+238", flag: "🇨🇻" },
  { name: "Cambodia", code: "+855", flag: "🇰🇭" },
  { name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Central African Republic", code: "+236", flag: "🇨🇫" },
  { name: "Chad", code: "+235", flag: "🇹🇩" },
  { name: "Chile", code: "+56", flag: "🇨🇱" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "+57", flag: "🇨🇴" },
  { name: "Comoros", code: "+269", flag: "🇰🇲" },
  { name: "Congo", code: "+242", flag: "🇨🇬" },
  { name: "Costa Rica", code: "+506", flag: "🇨🇷" },
  { name: "Croatia", code: "+385", flag: "🇭🇷" },
  { name: "Cuba", code: "+53", flag: "🇨🇺" },
  { name: "Cyprus", code: "+357", flag: "🇨🇾" },
  { name: "Czechia", code: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "+45", flag: "🇩🇰" },
  { name: "Djibouti", code: "+253", flag: "🇩🇯" },
  { name: "Dominica", code: "+1", flag: "🇩🇲" },
  { name: "Dominican Republic", code: "+1", flag: "🇩🇴" },
  { name: "Ecuador", code: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "El Salvador", code: "+503", flag: "🇸🇻" },
  { name: "Equatorial Guinea", code: "+240", flag: "🇬🇶" },
  { name: "Eritrea", code: "+291", flag: "🇪🇷" },
  { name: "Estonia", code: "+372", flag: "🇪🇪" },
  { name: "Eswatini", code: "+268", flag: "🇸🇿" },
  { name: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { name: "Fiji", code: "+679", flag: "🇫🇯" },
  { name: "Finland", code: "+358", flag: "🇫🇮" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Gabon", code: "+241", flag: "🇬🇦" },
  { name: "Gambia", code: "+220", flag: "🇬🇲" },
  { name: "Georgia", code: "+995", flag: "🇬🇪" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "+30", flag: "🇬🇷" },
  { name: "Grenada", code: "+1", flag: "🇬🇩" },
  { name: "Guatemala", code: "+502", flag: "🇬🇹" },
  { name: "Guinea", code: "+224", flag: "🇬🇳" },
  { name: "Guinea-Bissau", code: "+245", flag: "🇬🇼" },
  { name: "Guyana", code: "+592", flag: "🇬🇾" },
  { name: "Haiti", code: "+509", flag: "🇭🇹" },
  { name: "Honduras", code: "+504", flag: "🇭🇳" },
  { name: "Hungary", code: "+36", flag: "🇭🇺" },
  { name: "Iceland", code: "+354", flag: "🇮🇸" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Ivory Coast", code: "+225", flag: "🇨🇮" },
  { name: "Jamaica", code: "+1", flag: "🇯🇲" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "+7", flag: "🇰🇿" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Kiribati", code: "+686", flag: "🇰🇮" },
  { name: "Kuwait", code: "+965", flag: "🇰🇼" },
  { name: "Kyrgyzstan", code: "+996", flag: "🇰🇬" },
  { name: "Laos", code: "+856", flag: "🇱🇦" },
  { name: "Latvia", code: "+371", flag: "🇱🇻" },
  { name: "Lebanon", code: "+961", flag: "🇱🇧" },
  { name: "Lesotho", code: "+266", flag: "🇱🇸" },
  { name: "Liberia", code: "+231", flag: "🇱🇷" },
  { name: "Libya", code: "+218", flag: "🇱🇾" },
  { name: "Liechtenstein", code: "+423", flag: "🇱🇮" },
  { name: "Lithuania", code: "+370", flag: "🇱🇹" },
  { name: "Luxembourg", code: "+352", flag: "🇱🇺" },
  { name: "Madagascar", code: "+261", flag: "🇲🇬" },
  { name: "Malawi", code: "+265", flag: "🇲🇼" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Maldives", code: "+960", flag: "🇲🇻" },
  { name: "Mali", code: "+223", flag: "🇲🇱" },
  { name: "Malta", code: "+356", flag: "🇲🇹" },
  { name: "Marshall Islands", code: "+692", flag: "🇲🇭" },
  { name: "Mauritania", code: "+222", flag: "🇲🇷" },
  { name: "Mauritius", code: "+230", flag: "🇲🇺" },
  { name: "Mexico", code: "+52", flag: "🇲🇽" },
  { name: "Micronesia", code: "+691", flag: "🇫🇲" },
  { name: "Moldova", code: "+373", flag: "🇲🇩" },
  { name: "Monaco", code: "+377", flag: "🇲🇨" },
  { name: "Mongolia", code: "+976", flag: "🇲🇳" },
  { name: "Montenegro", code: "+382", flag: "🇲🇪" },
  { name: "Morocco", code: "+212", flag: "🇲🇦" },
  { name: "Mozambique", code: "+258", flag: "🇲🇿" },
  { name: "Myanmar", code: "+95", flag: "🇲🇲" },
  { name: "Namibia", code: "+264", flag: "🇳🇦" },
  { name: "Nauru", code: "+674", flag: "🇳🇷" },
  { name: "Nepal", code: "+977", flag: "🇳🇵" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "+64", flag: "🇳🇿" },
  { name: "Nicaragua", code: "+505", flag: "🇳🇮" },
  { name: "Niger", code: "+227", flag: "🇳🇪" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "North Korea", code: "+850", flag: "🇰🇵" },
  { name: "North Macedonia", code: "+389", flag: "🇲🇰" },
  { name: "Norway", code: "+47", flag: "🇳🇴" },
  { name: "Oman", code: "+968", flag: "🇴🇲" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "Palau", code: "+680", flag: "🇵🇼" },
  { name: "Palestine", code: "+970", flag: "🇵🇸" },
  { name: "Panama", code: "+507", flag: "🇵🇦" },
  { name: "Papua New Guinea", code: "+675", flag: "🇵🇬" },
  { name: "Paraguay", code: "+595", flag: "🇵🇾" },
  { name: "Peru", code: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "+351", flag: "🇵🇹" },
  { name: "Qatar", code: "+974", flag: "🇶🇦" },
  { name: "Romania", code: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
  { name: "Saint Kitts and Nevis", code: "+1", flag: "🇰🇳" },
  { name: "Saint Lucia", code: "+1", flag: "🇱🇨" },
  { name: "Saint Vincent", code: "+1", flag: "🇻🇨" },
  { name: "Samoa", code: "+685", flag: "🇼🇸" },
  { name: "San Marino", code: "+378", flag: "🇸🇲" },
  { name: "Sao Tome and Principe", code: "+239", flag: "🇸🇹" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Senegal", code: "+221", flag: "🇸🇳" },
  { name: "Serbia", code: "+381", flag: "🇷🇸" },
  { name: "Seychelles", code: "+248", flag: "🇸🇨" },
  { name: "Sierra Leone", code: "+232", flag: "🇸🇱" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "Slovakia", code: "+421", flag: "🇸🇰" },
  { name: "Slovenia", code: "+386", flag: "🇸🇮" },
  { name: "Solomon Islands", code: "+677", flag: "🇸🇧" },
  { name: "Somalia", code: "+252", flag: "🇸🇴" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "South Korea", code: "+82", flag: "🇰🇷" },
  { name: "South Sudan", code: "+211", flag: "🇸🇸" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { name: "Sudan", code: "+249", flag: "🇸🇩" },
  { name: "Suriname", code: "+597", flag: "🇸🇷" },
  { name: "Sweden", code: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { name: "Syria", code: "+963", flag: "🇸🇾" },
  { name: "Tajikistan", code: "+992", flag: "🇹🇯" },
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Timor-Leste", code: "+670", flag: "🇹🇱" },
  { name: "Togo", code: "+228", flag: "🇹🇬" },
  { name: "Tonga", code: "+676", flag: "🇹🇴" },
  { name: "Trinidad and Tobago", code: "+1", flag: "🇹🇹" },
  { name: "Tunisia", code: "+216", flag: "🇹🇳" },
  { name: "Turkey", code: "+90", flag: "🇹🇷" },
  { name: "Turkmenistan", code: "+993", flag: "🇹🇲" },
  { name: "Tuvalu", code: "+688", flag: "🇹🇻" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Ukraine", code: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "Uruguay", code: "+598", flag: "🇺🇾" },
  { name: "Uzbekistan", code: "+998", flag: "🇺🇿" },
  { name: "Vanuatu", code: "+678", flag: "🇻🇺" },
  { name: "Venezuela", code: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { name: "Yemen", code: "+967", flag: "🇾🇪" },
  { name: "Zambia", code: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "+263", flag: "🇿🇼" }
];

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

// ── CUSTOM MATERIAL 3 COUNTRY SELECTOR (SEARCHABLE POPOVER) ──
function M3CountrySelector({ label, id, icon, required, value, onChange, options, disabled }) {
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

  const selectedOption = options.find(opt => opt.name === value) || { name: value, flag: '' };
  
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
          <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
            {isFloating && selectedOption.flag && <span className="text-base leading-none">{selectedOption.flag}</span>}
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
              name="country-search"
              placeholder="Search country..."
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
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.name === value;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => {
                      onChange(opt.name);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors duration-150
                      ${isSelected 
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold' 
                        : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'}
                    `}
                  >
                    <span className="text-base select-none flex-shrink-0">{opt.flag}</span>
                    <span className="truncate flex-1">{opt.name}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-[var(--md-sys-color-on-surface-variant)] text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CUSTOM MATERIAL 3 COUNTRY CODE SELECTOR (SEARCHABLE POPOVER) ──
function M3CountryCodeSelector({ id, value, selectedCountry, onChange, options, disabled }) {
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

  const selectedOption = options.find(opt => opt.name === selectedCountry) || 
                         options.find(opt => opt.value === value) || 
                         { value: value, flag: '', name: '' };
  
  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.value.includes(searchQuery)
  );

  return (
    <div className="w-full flex flex-col relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-between h-[56px] w-full rounded-2xl border transition-all duration-200 bg-[var(--md-sys-color-surface-container-lowest)] px-3 select-none
          ${isOpen 
            ? 'border-[var(--md-sys-color-primary)] border-2 px-[11px]' 
            : 'border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)]'}
          ${disabled ? 'opacity-40 cursor-not-allowed bg-neutral-100' : 'cursor-pointer'}
        `}
      >
        {/* Selected Display */}
        <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
          <span className="text-base leading-none">{selectedOption.flag}</span>
          <span className="leading-none">{selectedOption.value}</span>
        </span>

        {/* Dropdown Chevron */}
        <div className={`transition-transform duration-200 text-[var(--md-sys-color-on-surface-variant)] flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 top-[60px] w-[260px] max-h-[280px] overflow-y-auto rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xl z-50 py-2 flex flex-col">
          {/* Search Header */}
          <div className="px-3 py-1.5 bg-[var(--md-sys-color-surface-container-lowest)] border-b border-[var(--md-sys-color-outline-variant)] sticky top-0 z-10">
            <input 
              type="text" 
              name="country-code-search"
              placeholder="Search code or country..."
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
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.name + opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value, opt.name);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors duration-150
                      ${isSelected 
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold' 
                        : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'}
                    `}
                  >
                    <span className="text-base select-none flex-shrink-0">{opt.flag}</span>
                    <span className="font-semibold w-10 flex-shrink-0">{opt.value}</span>
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate flex-1">{opt.name}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-[var(--md-sys-color-on-surface-variant)] text-center">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterHospital({ onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    street: '',
    suite: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    countryCode: '+1',
    phoneNumber: '',
    contact_email: ''
  });
  const [loading, setLoading] = useState(false);

  // Field validation functions
  const isNameValid = form.name.trim().length >= 3;
  
  const isStreetValid = form.street.trim().length >= 3;
  const isCityValid = form.city.trim().length >= 2;
  const isStateValid = form.state.trim().length >= 2;
  const isZipValid = form.zip.trim().length >= 3;
  const isCountryValid = form.country.trim().length >= 2;
  const isAddressValid = isStreetValid && isCityValid && isStateValid && isZipValid && isCountryValid;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email);
  const isPhoneValid = form.phoneNumber.trim().length >= 7;

  // Combine address components into a single formatted string
  const combinedAddress = [
    form.street.trim(),
    form.suite.trim(),
    form.city.trim(),
    form.state.trim(),
    form.zip.trim(),
    form.country.trim()
  ].filter(Boolean).join(', ');

  // Combine phone parts
  const combinedPhone = `${form.countryCode}-${form.phoneNumber.trim()}`;

  const handlePhoneChange = (val) => {
    // Keep it clean: allow digits, hyphens, and spaces
    const cleanVal = val.replace(/[^\d\s-]/g, '');
    const limit = 20 - form.countryCode.length - 1; // 20 max limit for DB varchar(20)
    if (cleanVal.length <= limit) {
      setForm(prev => ({ ...prev, phoneNumber: cleanVal }));
    }
  };

  const handleCountryChange = (countryName) => {
    const matchingCountry = countryData.find(c => c.name === countryName);
    setForm(prev => {
      const updated = { ...prev, country: countryName };
      if (matchingCountry) {
        updated.countryCode = matchingCountry.code;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isNameValid) {
      toast.error("Hospital Name must be at least 3 characters.");
      return;
    }
    if (!isAddressValid) {
      toast.error("Please complete all required address details.");
      return;
    }
    if (!isEmailValid) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!isPhoneValid) {
      toast.error("Phone number must contain at least 7 digits.");
      return;
    }

    setLoading(true);
    try {
      await createHospital({
        name: form.name.trim(),
        address: combinedAddress,
        contact_email: form.contact_email.trim(),
        contact_phone: combinedPhone
      });
      toast.success("Hospital registered successfully!");
      setForm({
        name: '',
        street: '',
        suite: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
        countryCode: '+1',
        phoneNumber: '',
        contact_email: ''
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to register hospital.");
    } finally {
      setLoading(false);
    }
  };

  // Maps country codes selector items dynamically from countryData
  const countryCodeOptions = countryData.map(c => ({
    value: c.code,
    name: c.name,
    flag: c.flag
  }));

  // Bullet steps validation
  const section1Valid = isNameValid;
  const section2Valid = isAddressValid;
  const section3Valid = isEmailValid && isPhoneValid;

  return (
    <div className="w-full max-w-3xl mx-auto py-4 animate-fade-in">
      {/* Header Area */}
      <div className="space-y-4 mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-[var(--md-sys-color-on-background)] leading-tight font-brand">
          Register New Hospital
        </h2>
        <p className="text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          Configure and add a new hospital tenant. This initializes an isolated database instance with customized credentials and location parameters.
        </p>
      </div>

      {/* Vertical Form Timeline */}
      <form onSubmit={handleSubmit} className="flex flex-col" autoComplete="off">
        
        {/* ── STEP 1: IDENTITY ── */}
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
                Hospital Identity
              </h3>
            </div>

            {/* Form Input */}
            <div className="space-y-1.5">
              <M3TextField
                required
                id="hms-hospital-name"
                label="Hospital Name"
                placeholder="e.g. Rising Health Hospital"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                isValid={isNameValid}
                helperText="The legal registration name of the hospital tenant. Must be at least 3 characters."
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>

        {/* ── STEP 2: LOCATION ── */}
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
            {/* Connecting Line */}
            <div className="w-0.5 flex-grow bg-[var(--md-sys-color-outline-variant)] mt-2"></div>
          </div>

          {/* Right Content Column */}
          <div className="flex-grow pb-10 space-y-5">
            {/* Section Header */}
            <div className="flex items-center gap-2 select-none">
              <span className="p-1.5 rounded-lg bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-tertiary)] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <h3 className="text-xl font-extrabold text-[var(--md-sys-color-on-surface)]">
                Location Details
              </h3>
            </div>

            {/* Location Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-4">
                <M3TextField
                  required
                  id="hms-street"
                  label="Street Address"
                  placeholder="e.g. 123 Health Ave"
                  value={form.street}
                  onChange={e => setForm({ ...form, street: e.target.value })}
                  isValid={isStreetValid}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  }
                />
              </div>
              <div className="md:col-span-2">
                <M3TextField
                  id="hms-suite"
                  label="Suite / Unit"
                  placeholder="e.g. Suite 4B"
                  value={form.suite}
                  onChange={e => setForm({ ...form, suite: e.target.value })}
                  isValid={true}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                    </svg>
                  }
                />
              </div>

              {/* City Input ( Skyline building group icon ) */}
              <div className="md:col-span-3">
                <M3TextField
                  required
                  id="hms-city"
                  label="City"
                  placeholder="e.g. New York"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  isValid={isCityValid}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h3v11H3V10zm5-4h4v15H8V6zm6 7h3v8h-3v-8zm5-9h3v17h-3V4z" />
                    </svg>
                  }
                />
              </div>
              <div className="md:col-span-3">
                <M3TextField
                  required
                  id="hms-state"
                  label="State / Province"
                  placeholder="e.g. NY"
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  isValid={isStateValid}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 4L9 7" />
                    </svg>
                  }
                />
              </div>

              <div className="md:col-span-3">
                <M3TextField
                  required
                  id="hms-zip"
                  label="Postal / ZIP Code"
                  placeholder="e.g. 10001"
                  value={form.zip}
                  onChange={e => setForm({ ...form, zip: e.target.value })}
                  isValid={isZipValid}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                    </svg>
                  }
                />
              </div>

              {/* Custom Searchable Country Dropdown */}
              <div className="md:col-span-3">
                <M3CountrySelector
                  required
                  id="hms-country"
                  label="Country"
                  value={form.country}
                  onChange={handleCountryChange}
                  options={countryData}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2a2 2 0 002-2V7.5a2.5 2.5 0 00-2.5-2.5h-1.5A2 2 0 0114 3.935M12 2a10 10 0 100 20 10 10 0 000-20z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 3: CONTACT & VERIFICATION ── */}
        <div className="flex items-stretch gap-6">
          {/* Left Timeline Column */}
          <div className="flex flex-col items-center flex-shrink-0 w-6">
            {/* Bullet Node */}
            <div 
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 flex-shrink-0 mt-1
                ${section3Valid 
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] scale-110 shadow-sm' 
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-outline)] border-2 border-[var(--md-sys-color-outline-variant)]'}
              `}
            >
              {section3Valid ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                "3"
              )}
            </div>
            {/* No Connecting Line below Step 3 */}
          </div>

          {/* Right Content Column */}
          <div className="flex-grow space-y-5">
            {/* Section Header */}
            <div className="flex items-center gap-2 select-none">
              <span className="p-1.5 rounded-lg bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-secondary)] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <h3 className="text-xl font-extrabold text-[var(--md-sys-color-on-surface)]">
                Primary Contact
              </h3>
            </div>

            <div className="space-y-4">
              {/* Contact Email */}
              <M3TextField
                required
                type="email"
                id="hms-email"
                label="Contact Email"
                placeholder="e.g. contact@risinghealth.com"
                value={form.contact_email}
                onChange={e => setForm({ ...form, contact_email: e.target.value })}
                isValid={isEmailValid}
                helperText="Primary administrative email address for tenant account notifications."
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              {/* Combined Phone Input */}
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row gap-3 items-start">
                  <div className="w-full md:w-[100px] flex-shrink-0">
                    <M3CountryCodeSelector
                      id="hms-country-code"
                      value={form.countryCode}
                      selectedCountry={form.country}
                      onChange={(code, country) => setForm({ ...form, countryCode: code, country: country })}
                      options={countryCodeOptions}
                    />
                  </div>
                  <div className="flex-grow w-full">
                    <M3TextField
                      required
                      id="hms-phone"
                      label="Phone Number"
                      placeholder="e.g. 5550199"
                      value={form.phoneNumber}
                      onChange={e => handlePhoneChange(e.target.value)}
                      isValid={isPhoneValid}
                      helperText={`Direct phone line. Max ${20 - form.countryCode.length - 1} characters for this code. Combined total: ${combinedPhone.length}/20 chars.`}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      }
                    />
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
            disabled={loading || !isNameValid || !isAddressValid || !isEmailValid || !isPhoneValid}
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
                Registering Hospital...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 5V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002-2z" />
                </svg>
                Register Hospital
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
