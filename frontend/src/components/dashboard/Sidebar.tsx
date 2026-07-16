import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUser } from '../../lib/auth';
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShieldCheck, 
  BrainCircuit, 
  Network, 
  Map as MapIcon, 
  BarChart3, 
  HeartHandshake, 
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const location = useLocation();
  const [role, setRole] = useState<'donor' | 'ngo'>('donor');

  useEffect(() => {
    const user = getUser();
    if (user?.user_metadata?.role) {
      setRole(user.user_metadata.role);
    }
  }, []);

  const allNavItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard', roles: ['donor', 'ngo'] },
    { icon: PackageSearch, label: 'Donations', path: '/donations', roles: ['donor'] },
    { icon: HeartHandshake, label: 'NGO Requests', path: '/requests', roles: ['ngo'] },
    { icon: ShieldCheck, label: 'Food Safety', path: '/food-safety', roles: ['donor'] },
    { icon: BrainCircuit, label: 'NLP Intelligence', path: '/nlp', roles: ['donor', 'ngo'] },
    { icon: Network, label: 'Smart Matching', path: '/matching', roles: ['donor', 'ngo'] },
    { icon: MapIcon, label: 'Map & Logistics', path: '/logistics', roles: ['donor', 'ngo'] },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', roles: ['donor', 'ngo'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['donor', 'ngo'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-[280px] h-screen bg-[#FDFBF7] border-r border-[#33251E]/10 flex flex-col fixed top-0 left-0 z-30 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
      
      {/* Logo Area */}
      <div className="py-5 px-5 border-b border-[#33251E]/5 flex-shrink-0 flex items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="SharePlate Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform flex-shrink-0" />
          <div className="flex flex-col">
            <div className="font-serif text-[26px] font-bold tracking-tight text-[#33251E] leading-none mb-1">SharePlate</div>
            <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#33251E]/40 leading-none whitespace-nowrap">Rescue • Match • Deliver</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 scrollbar-hide">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '#' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all",
                isActive 
                  ? "bg-[#F07154] text-white shadow-sm" 
                  : "text-[#33251E]/70 hover:bg-[#33251E]/5 hover:text-[#33251E]"
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn("flex-shrink-0", isActive ? "text-white" : "text-[#33251E]/50")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Bottom Card */}
      <div className="p-4 pb-5 border-t border-[#33251E]/5 mt-auto flex-shrink-0">
        <div className="bg-[#E8F0EA] p-4 rounded-2xl border border-[#33251E]/5 relative overflow-hidden shadow-sm">
          {/* subtle decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <h4 className="font-bold text-[#33251E] text-[13px] mb-1.5 relative z-10">Rescue Flow</h4>
          <p className="text-[11px] text-[#33251E]/70 leading-relaxed relative z-10 font-medium">
            Every donation is safety-checked and matched by AI in under 3 minutes.
          </p>
        </div>
      </div>
      
    </aside>
  );
}
