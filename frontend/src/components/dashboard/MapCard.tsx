import { ArrowRight, Sparkles } from 'lucide-react';

export function MapCard() {
  return (
    <div className="bg-white rounded-3xl border border-[#33251E]/5 p-6 shadow-sm h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#33251E]/50 mb-1">Zones</div>
          <h2 className="font-serif text-2xl text-[#33251E]">Live map</h2>
        </div>
        <button className="text-sm font-semibold text-[#F07154] hover:text-[#E05F42] transition-colors flex items-center gap-1">
          Open <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex-1 bg-[#F5F8F6] rounded-2xl border border-emerald-100/50 overflow-hidden relative min-h-[200px] shadow-inner">
        {/* Mockup SVG Map routes */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M 30,40 Q 45,20 65,25" fill="none" stroke="#F07154" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <path d="M 25,60 Q 45,75 75,50" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        </svg>

        {/* Nodes */}
        <div className="absolute top-[28%] left-[28%] w-3 h-3 rounded-full bg-[#F07154] shadow-[0_0_0_4px_rgba(240,113,84,0.2)]"></div>
        <div className="absolute top-[23%] left-[63%] w-4 h-4 rounded-full bg-red-500 shadow-[0_0_0_6px_rgba(239,68,68,0.2)] z-10 animate-pulse"></div>
        <div className="absolute top-[58%] left-[23%] w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"></div>
        <div className="absolute top-[48%] left-[73%] w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"></div>
        
        <div className="absolute top-[40%] left-[45%] w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.2)]"></div>

        {/* AI Route Badge */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-[#33251E]/10 px-2.5 py-1.5 rounded-lg text-[9px] font-bold text-[#33251E] flex items-center gap-1.5 shadow-sm">
          <Sparkles size={12} className="text-[#F07154]" />
          Route Optimized
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-5 relative z-10">
        <div className="flex items-center gap-1.5 bg-white border border-[#33251E]/10 px-2 py-1 rounded-md text-[10px] font-bold text-[#33251E]/70 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Critical pickup
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#33251E]/10 px-2 py-1 rounded-md text-[10px] font-bold text-[#33251E]/70 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F07154]"></span> Donor
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#33251E]/10 px-2 py-1 rounded-md text-[10px] font-bold text-[#33251E]/70 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> NGO
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#33251E]/10 px-2 py-1 rounded-md text-[10px] font-bold text-[#33251E]/70 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Demand hotspot
        </div>
      </div>
    </div>
  );
}
