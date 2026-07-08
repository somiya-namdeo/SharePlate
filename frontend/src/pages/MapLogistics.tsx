
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Map as MapIcon, Route, Truck } from 'lucide-react';

export function MapLogistics() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Map & Logistics" />

      <main className="ml-[280px] pt-[112px] pb-12 px-8 max-w-[1600px] mx-auto h-[calc(100vh-112px)] flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <h2 className="font-serif text-2xl font-bold text-[#33251E]">Live Logistics Hub</h2>
          <p className="text-sm text-[#33251E]/70 mt-1">Track active deliveries and optimize routes across the city.</p>
        </div>

        {/* Placeholder Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#33251E]/10 flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(51, 37, 30, 0.05) 1px, transparent 0)', 
            backgroundSize: '32px 32px' 
          }}></div>
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-md p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-[#33251E]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-16 h-16 bg-[#FDFBF7] border border-[#33251E]/10 rounded-2xl flex items-center justify-center text-[#F07154] mb-6 shadow-sm">
              <MapIcon size={32} strokeWidth={1.5} />
            </div>
            
            <h3 className="font-serif text-2xl font-bold text-[#33251E] mb-2">Interactive logistics map will appear here</h3>
            <p className="text-[#33251E]/60 text-sm leading-relaxed mb-8">
              We're preparing the integration for live vehicle tracking, AI route optimization, and zone-based delivery heatmaps.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <div className="flex flex-col items-center gap-2 p-3 bg-[#FDFBF7] rounded-xl border border-[#33251E]/5">
                <MapIcon size={20} className="text-[#33251E]/40" />
                <span className="text-[10px] font-bold text-[#33251E]/60 uppercase tracking-widest">Live Map</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-[#FDFBF7] rounded-xl border border-[#33251E]/5">
                <Route size={20} className="text-[#33251E]/40" />
                <span className="text-[10px] font-bold text-[#33251E]/60 uppercase tracking-widest">Routing</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-[#FDFBF7] rounded-xl border border-[#33251E]/5">
                <Truck size={20} className="text-[#33251E]/40" />
                <span className="text-[10px] font-bold text-[#33251E]/60 uppercase tracking-widest">Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
