import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { ChevronDown, Phone, Route as RouteIcon } from 'lucide-react';

export function MapLogistics() {
  const filters = ["Urgency", "Safety", "Category", "NGO Request", "Pickup Status"];

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Map & Logistics" />

      <main className="ml-0 lg:ml-[280px] pt-[112px] pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto flex flex-col">
        
        {/* Top Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-4 mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mr-2">Filters</span>
            {filters.map((f, i) => (
              <button key={i} className="bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-2 text-xs font-semibold text-[#33251E]/80 flex items-center gap-2 hover:border-[#33251E]/30 transition-colors">
                {f}
                <ChevronDown size={14} className="text-[#33251E]/40" />
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-[#33251E]/60 uppercase tracking-widest bg-[#FDFBF7] px-4 py-2.5 rounded-xl border border-[#33251E]/5">
             <span className="mr-2 opacity-50">LEGEND</span>
             <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe</span>
             <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical</span>
             <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Donor</span>
             <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#33251E]"></span> NGO</span>
          </div>
        </div>

        {/* Main Map Row */}
        <div className="grid grid-cols-1 xl:grid-cols-[7fr_3fr] gap-6 mb-6 items-stretch xl:h-[560px]">
          
          {/* Map Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 flex flex-col h-full overflow-hidden">
             
             {/* Card Header */}
             <div className="p-6 border-b border-[#33251E]/5 shrink-0">
                <h3 className="font-serif text-2xl font-bold text-[#33251E]">Live Rescue Map</h3>
                <p className="text-sm text-[#33251E]/70 mt-1">Track urgent pickups, NGOs, donors, and demand hotspots.</p>
             </div>
             
             {/* Map Canvas - Clean container for future Leaflet integration */}
             <div className="flex-1 w-full relative overflow-hidden bg-[#FDFBF7]">
                <svg className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 600">
                  {/* Roads & River */}
                  <path d="M-100 350 Q 300 400, 500 350 T 1100 200" fill="none" stroke="#a7f3d0" strokeWidth="24" strokeLinecap="round" />
                  <path d="M 300 -100 L 400 300 L 450 700" fill="none" stroke="#e5e5e5" strokeWidth="16" strokeLinecap="round" />
                  <path d="M 700 -100 L 650 300 L 700 700" fill="none" stroke="#e5e5e5" strokeWidth="16" strokeLinecap="round" />

                  {/* Hotspots */}
                  <circle cx="450" cy="250" r="100" fill="#fbbf24" opacity="0.15" filter="blur(16px)" />
                  <circle cx="800" cy="450" r="120" fill="#fbbf24" opacity="0.15" filter="blur(16px)" />
                  
                  {/* Routes */}
                  <path d="M 450 300 L 650 200 L 800 450" fill="none" stroke="#34d399" strokeWidth="3" strokeDasharray="8 8" />
                  <path d="M 250 500 L 450 300 L 750 150" fill="none" stroke="#F07154" strokeWidth="3" strokeDasharray="8 8" />
                  
                  {/* Markers */}
                  <circle cx="450" cy="300" r="10" fill="#F07154" stroke="white" strokeWidth="4" className="drop-shadow-lg" />
                  <circle cx="450" cy="300" r="24" fill="transparent" stroke="#F07154" strokeWidth="2" opacity="0.4" />
                  
                  <circle cx="650" cy="200" r="8" fill="#10b981" stroke="white" strokeWidth="3" className="drop-shadow-sm" />
                  <circle cx="800" cy="450" r="8" fill="#10b981" stroke="white" strokeWidth="3" className="drop-shadow-sm" />
                  <circle cx="750" cy="150" r="8" fill="#F07154" stroke="white" strokeWidth="3" className="drop-shadow-sm" />
                  <circle cx="250" cy="500" r="8" fill="#F07154" stroke="white" strokeWidth="3" className="drop-shadow-sm" />
                  <circle cx="550" cy="400" r="6" fill="#fbbf24" stroke="white" strokeWidth="2" className="drop-shadow-sm" />
                </svg>
                
                {/* Floating stats */}
                <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#33251E]/10 shadow-sm text-[11px] font-bold tracking-wide text-[#33251E]/80 uppercase">
                  8 pickups · 3 routes · 2 hotspots
                </div>
             </div>
          </div>
          
          {/* Selected Marker Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 flex flex-col justify-between h-full overflow-hidden">
             <div className="p-6 pb-4">
               <span className="text-[11px] font-bold text-[#F07154] uppercase tracking-[0.1em] mb-2 flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#F07154]"></span>
                 SELECTED PICKUP
               </span>
               <h2 className="font-serif text-3xl font-bold text-[#33251E]">D-1042 • Dal & Rice</h2>
               <p className="text-sm text-[#33251E]/70 mt-1 mb-5">25 kg • Bhopal Grand Hotel</p>
               
               <div className="flex gap-2 mb-6">
                 <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border border-emerald-200">Safe</span>
                 <span className="bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border border-red-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Critical
                 </span>
               </div>
               
               <div className="space-y-2">
                  <div className="flex justify-between items-center py-2.5 border-b border-[#33251E]/5">
                     <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest">Remaining shelf life</span>
                     <span className="text-sm font-semibold text-[#33251E]">1h 12m</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-[#33251E]/5">
                     <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest">Assigned NGO</span>
                     <span className="text-sm font-semibold text-[#33251E]">Roti Bank</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-[#33251E]/5">
                     <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest">Distance</span>
                     <span className="text-sm font-semibold text-[#33251E]">2.1 km</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                     <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest">ETA</span>
                     <span className="text-sm font-semibold text-[#33251E]">14 min</span>
                  </div>
               </div>
             </div>
             
             {/* Footer Area */}
             <div className="p-6 bg-[#FDFBF7] border-t border-[#33251E]/10 shrink-0">
               <div className="mb-4">
                 <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Suggested route</span>
                 <span className="text-sm font-semibold text-[#33251E]">MP Nagar → Habibganj</span>
               </div>
               <div className="flex gap-3">
                 <button className="flex-1 bg-[#F07154] hover:bg-[#E05F42] text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                   <RouteIcon size={18} /> Navigate
                 </button>
                 <button className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-xl px-5 py-3 flex items-center justify-center transition-colors">
                   <Phone size={18} />
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* Logistics Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6">
              <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-2">Critical Pickups</span>
              <div className="font-serif text-3xl font-bold text-[#33251E]">6 <span className="text-sm font-sans font-semibold text-red-500 uppercase tracking-wider ml-1">Active</span></div>
           </div>
           <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6">
              <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-2">Routes optimized</span>
              <div className="font-serif text-3xl font-bold text-[#33251E]">3 <span className="text-sm font-sans font-semibold text-emerald-500 uppercase tracking-wider ml-1">Live</span></div>
           </div>
           <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6">
              <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-2">NGOs nearby</span>
              <div className="font-serif text-3xl font-bold text-[#33251E]">9 <span className="text-sm font-sans font-semibold text-[#33251E]/40 uppercase tracking-wider ml-1">Available</span></div>
           </div>
        </div>

      </main>
    </div>
  );
}
