import { MapPin, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export function DashboardPreview() {
  return (
    <div className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-[#33251E]/5 overflow-hidden w-full">
      {/* Window Controls */}
      <div className="px-5 py-3 border-b border-[#33251E]/5 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        </div>
        <div className="text-xs font-medium text-[#33251E]/40">SharePlate · Overview</div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wide">
          <Sparkles size={10} />
          AI Assisted
        </div>
      </div>

      <div className="p-6 bg-[#FDFBF7]/30">
        {/* Top Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-[#33251E]/5 shadow-sm">
            <div className="text-[10px] text-[#33251E]/50 uppercase tracking-wider font-semibold mb-2">Active Donations</div>
            <div className="font-serif text-3xl text-[#33251E]">24</div>
            <div className="h-1 w-8 bg-[#F07154] mt-2 rounded-full"></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#33251E]/5 shadow-sm">
            <div className="text-[10px] text-[#33251E]/50 uppercase tracking-wider font-semibold mb-2">Critical Pickups</div>
            <div className="font-serif text-3xl text-[#33251E]">6</div>
            <div className="h-1 w-8 bg-red-500 mt-2 rounded-full"></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#33251E]/5 shadow-sm">
            <div className="text-[10px] text-[#33251E]/50 uppercase tracking-wider font-semibold mb-2">Meals Today</div>
            <div className="font-serif text-3xl text-[#33251E]">412</div>
            <div className="h-1 w-8 bg-emerald-500 mt-2 rounded-full"></div>
          </div>
        </div>

        {/* Bottom Layout */}
        <div className="grid grid-cols-5 gap-4">
          {/* Urgent Queue */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#33251E]">Urgent pickup queue</h3>
              <span className="text-[10px] text-[#33251E]/40 font-medium">shelf-life aware</span>
            </div>
            
            <div className="space-y-2">
              {[
                { item: 'Dal & Rice', qty: '25 kg', loc: 'MP Nagar', tag: 'Critical', safe: 'Safe' },
                { item: 'Paneer curry', qty: '12 kg', loc: 'Arera Colony', tag: 'Critical', safe: 'Review' },
                { item: 'Sandwiches', qty: '150 pcs', loc: 'Bittan Mkt', tag: 'High', safe: 'Safe' }
              ].map((row, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-[#33251E]/5 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[#33251E]">{row.item} <span className="text-[#33251E]/40">— {row.qty}</span></div>
                    <div className="text-xs text-[#33251E]/60">{row.loc}</div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", row.tag === 'Critical' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600")}>
                      <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                      {row.tag}
                    </span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border", row.safe === 'Safe' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600")}>
                      {row.safe}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Preview */}
          <div className="col-span-2 bg-[#33251E] rounded-xl p-4 text-white relative overflow-hidden flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-white/70 mb-1 z-10 uppercase tracking-widest font-semibold text-[10px]">
              <MapPin size={10} />
              Live Map
            </div>
            <div className="font-serif text-lg z-10 mb-auto">Live rescue zones</div>
            
            {/* Abstract Map Dots */}
            <div className="absolute inset-0 opacity-50">
              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-red-400 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.8)]"></div>
              <div className="absolute top-1/3 left-1/2 w-1.5 h-1.5 bg-[#F07154] rounded-full"></div>
              <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-emerald-400 rounded-full"></div>
              <div className="absolute top-2/3 left-2/3 w-1.5 h-1.5 bg-[#F07154] rounded-full"></div>
              <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/40 rounded-full"></div>
            </div>

            <div className="flex items-center gap-3 z-10 mt-6 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span> 6 critical</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#F07154] rounded-full"></span> 18 donors</div>
            </div>
            <div className="flex items-center gap-1 z-10 mt-1 text-[10px]">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> 9 NGOs
            </div>
          </div>
        </div>

        {/* AI Insight Bar */}
        <div className="mt-4 bg-[#F07154]/10 border border-[#F07154]/20 rounded-xl p-3 flex items-start gap-2.5">
          <Sparkles size={14} className="text-[#F07154] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#33251E]/80 leading-snug">
            <span className="font-semibold text-[#F07154]">AI Insight:</span> Zone B needs 120 dinner meals tonight — 3 nearby donors are surplus-ready.
          </p>
        </div>
      </div>
    </div>
  );
}
