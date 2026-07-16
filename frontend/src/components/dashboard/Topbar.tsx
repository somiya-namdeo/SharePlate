import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Bell, Plus, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getUser, logout } from '../../lib/auth';

export function Topbar({ title = 'Overview' }: { title?: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadUser = () => {
    setUser(getUser());
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('profileUpdated', loadUser);
    return () => window.removeEventListener('profileUpdated', loadUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = user?.full_name ? getInitials(user.full_name) : 'U';

  return (
    <header className="h-[80px] bg-[#FDFBF7] border-b border-[#33251E]/10 shadow-sm flex items-center justify-between px-8 fixed top-0 right-0 left-[280px] z-20">
      
      {/* Left - Page Title */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#33251E]/40 mb-1">SharePlate</div>
        <h1 className="font-serif text-2xl text-[#33251E] leading-none">{title}</h1>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-8 flex justify-center">
        <div className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#33251E]/40 w-4 h-4 group-focus-within:text-[#F07154] transition-colors" />
          <input 
            type="text" 
            placeholder="Search donations, NGOs, zones..."
            className="w-full bg-white border border-[#33251E]/10 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#F07154] focus:ring-2 focus:ring-[#F07154]/20 transition-all text-[#33251E] placeholder:text-[#33251E]/40 shadow-sm"
          />
        </div>
      </div>

      {/* Right - Controls */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        
        {/* Location Pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-white border border-[#33251E]/10 px-3 py-1.5 rounded-full shadow-sm mr-2">
          <MapPin size={14} className="text-[#F07154]" />
          <span className="text-xs font-semibold text-[#33251E]">Bhopal · MP</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-[#33251E]/60 hover:text-[#33251E] transition-colors hover:bg-white rounded-full">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F07154] rounded-full border-2 border-[#FDFBF7]"></span>
        </button>

        {/* Primary CTA */}
        {user?.user_metadata?.role === 'ngo' ? (
          <button onClick={() => navigate('/requests')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_4px_12px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Create Request
          </button>
        ) : (
          <button onClick={() => navigate('/donations')} className="bg-[#F07154] hover:bg-[#E05F42] text-white px-4 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_4px_12px_-4px_rgba(240,113,84,0.6)] hover:-translate-y-0.5 flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            Add Donation
          </button>
        )}

        {/* Avatar */}
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-10 h-10 rounded-full bg-[#33251E] text-white flex items-center justify-center text-sm font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity select-none"
        >
          {initials}
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-[120%] w-56 bg-white border border-[#33251E]/10 shadow-lg rounded-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-3 border-b border-[#33251E]/5">
              <div className="text-sm font-bold text-[#33251E] truncate">{user?.full_name || 'User'}</div>
              <div className="text-xs text-[#33251E]/60 truncate mt-0.5">{user?.email || ''}</div>
            </div>
            <div className="p-1">
              <Link 
                to="/settings" 
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#33251E]/80 hover:text-[#33251E] hover:bg-gray-50 rounded-xl transition-colors"
              >
                <SettingsIcon size={16} />
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        )}

      </div>

    </header>
  );
}
