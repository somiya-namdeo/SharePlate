import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Sparkles, ChevronDown } from 'lucide-react';

export function DemandForecasting() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Demand Forecasting" />

      <main className="ml-[280px] pt-[112px] pb-12 px-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-4 flex flex-wrap gap-4">
          {[
            { label: "Location / Zone" },
            { label: "Date" },
            { label: "Meal type" },
            { label: "Food category" },
            { label: "NGO type" },
            { label: "Event type" }
          ].map((filter, i) => (
            <div key={i} className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1.5 px-1">{filter.label}</label>
              <button className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-2.5 text-sm text-[#33251E] flex items-center justify-between hover:border-[#33251E]/30 transition-colors">
                Any
                <ChevronDown size={16} className="text-[#33251E]/40" />
              </button>
            </div>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-[#33251E]/60 uppercase tracking-[0.1em] mb-2 block">Predicted demand tonight</span>
            <div className="font-serif text-4xl font-bold text-[#33251E] mb-1">684</div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">+18% VS AVG</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-[#33251E]/60 uppercase tracking-[0.1em] mb-2 block">Expected shortage</span>
            <div className="font-serif text-4xl font-bold text-[#33251E] mb-1">142</div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F07154]">MEALS</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-[#33251E]/60 uppercase tracking-[0.1em] mb-2 block">High-demand zone</span>
            <div className="font-serif text-3xl font-bold text-[#33251E] mb-1">Zone B</div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#33251E]/40">7-9 PM PEAK</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-[#33251E]/60 uppercase tracking-[0.1em] mb-2 block">Recommended quantity</span>
            <div className="font-serif text-3xl font-bold text-[#33251E] mb-1">120 kg</div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F07154]">COOKED MEAL</span>
          </div>
        </div>

        {/* Charts Row 1: 2fr / 1fr */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 items-stretch h-[420px]">
          {/* Line Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full">
            <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">TREND</span>
            <h2 className="font-serif text-xl font-semibold text-[#33251E] mb-6">Demand vs supply • 7d</h2>
            <div className="flex-1 w-full relative">
              {/* SVG Line Chart */}
              <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Grid Lines */}
                {[0, 75, 150, 225, 300].map((y) => (
                  <g key={y}>
                    <line x1="0" y1={y} x2="800" y2={y} stroke="#33251E" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 4" />
                    {y !== 300 && <text x="-10" y={y + 4} fill="#33251E" fillOpacity="0.4" fontSize="12" textAnchor="end">{800 - y * (800/300)}</text>}
                  </g>
                ))}
                
                {/* Supply Line (Dashed Green) */}
                <path 
                  d="M0,250 C100,240 200,210 300,200 C400,190 500,160 600,130 C700,120 800,110 800,110" 
                  fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" 
                />
                
                {/* Demand Line (Solid Coral) */}
                <path 
                  d="M0,220 C100,200 200,180 300,170 C400,150 500,110 600,70 C700,40 800,50 800,50" 
                  fill="none" stroke="#F07154" strokeWidth="3" strokeLinecap="round" 
                />
                
                {/* Data Points */}
                <circle cx="600" cy="70" r="4" fill="#F07154" />
                <circle cx="600" cy="130" r="4" fill="#10b981" />
              </svg>
            </div>
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-6 text-[10px] font-bold text-[#33251E]/40 uppercase pl-8">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full items-center justify-between">
            <div className="w-full text-left">
              <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">DISTRIBUTION</span>
              <h2 className="font-serif text-xl font-semibold text-[#33251E]">Meal type mix</h2>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[220px]">
              <div className="relative w-[220px] h-[220px]">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Produce (Espresso) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#33251E" strokeWidth="20" strokeDasharray="30 251.2" strokeDashoffset="0" />
                  {/* Dairy (Amber) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="20" strokeDasharray="40 251.2" strokeDashoffset="-32" />
                  {/* Bakery (Emerald) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="60 251.2" strokeDashoffset="-74" />
                  {/* Cooked (Coral) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F07154" strokeWidth="20" strokeDasharray="115 251.2" strokeDashoffset="-136" />
                </svg>
              </div>
            </div>
            
            <div className="w-full flex flex-wrap justify-center gap-x-4 gap-y-2 pt-2">
              {[
                { label: "Cooked", color: "bg-[#F07154]" },
                { label: "Bakery", color: "bg-emerald-500" },
                { label: "Dairy", color: "bg-amber-400" },
                { label: "Produce", color: "bg-[#33251E]" },
                { label: "Dry", color: "bg-cyan-500" },
              ].map((legend, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-[#33251E]/60 uppercase tracking-widest">
                  <span className={`w-2.5 h-2.5 rounded-full ${legend.color}`}></span>
                  {legend.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Bar Chart (Left) */}
          <div className="xl:col-span-4 bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-[420px]">
            <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">BY ZONE</span>
            <h2 className="font-serif text-xl font-semibold text-[#33251E] mb-6">Predicted demand</h2>
            <div className="flex-1 w-full relative">
               <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 62.5, 125, 187.5, 250].map((y) => (
                    <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#33251E" strokeOpacity="0.05" strokeWidth="1" />
                  ))}
                  
                  {/* Bars (Coral) */}
                  <rect x="20" y="100" width="40" height="150" fill="#F07154" rx="4" />
                  <rect x="95" y="40" width="40" height="210" fill="#F07154" rx="4" />
                  <rect x="170" y="70" width="40" height="180" fill="#F07154" rx="4" />
                  <rect x="245" y="150" width="40" height="100" fill="#F07154" rx="4" />
                  <rect x="320" y="90" width="40" height="160" fill="#F07154" rx="4" />
               </svg>
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-[#33251E]/40 uppercase px-4 shrink-0">
              <span>Zone A</span><span>Zone B</span><span>Zone C</span><span>Zone D</span><span>Zone E</span>
            </div>
          </div>

          {/* Table (Right) */}
          <div className="xl:col-span-8 bg-white rounded-2xl shadow-sm border border-[#33251E]/10 flex flex-col h-[420px] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start p-6 pb-4 bg-white border-b border-[#33251E]/5 shrink-0">
              <div>
                <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">FORECAST TABLE</span>
                <h2 className="font-serif text-xl font-semibold text-[#33251E]">Zone-wise demand vs supply</h2>
              </div>
              <span className="bg-[#F07154]/10 text-[#F07154] text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#F07154]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F07154]"></span> FORECAST
              </span>
            </div>
            
            {/* Table Area (with internal scroll) */}
            <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar relative">
              <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 bg-white z-10 shadow-[0_2px_0_0_rgba(51,37,30,0.1)]">
                  <tr>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60 bg-white">Zone</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60 bg-white">Predicted</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60 bg-white">Supply</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60 bg-white">Delta</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60 bg-white">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { zone: "Zone A", pred: 210, supply: 180, delta: -30, p: "Medium", pColor: "amber" },
                    { zone: "Zone B", pred: 340, supply: 220, delta: -120, p: "Critical", pColor: "red" },
                    { zone: "Zone C", pred: 280, supply: 260, delta: -20, p: "Low", pColor: "emerald" },
                    { zone: "Zone D", pred: 160, supply: 210, delta: "+50", p: "Low", pColor: "emerald" },
                    { zone: "Zone E", pred: 220, supply: 150, delta: -70, p: "High", pColor: "red" },
                    { zone: "Zone F", pred: 190, supply: 190, delta: 0, p: "Low", pColor: "emerald" },
                    { zone: "Zone G", pred: 300, supply: 150, delta: -150, p: "Critical", pColor: "red" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-[#33251E]/5 hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3.5 text-sm font-semibold text-[#33251E]">{row.zone}</td>
                      <td className="py-3.5 text-sm text-[#33251E]">{row.pred}</td>
                      <td className="py-3.5 text-sm text-[#33251E]">{row.supply}</td>
                      <td className={`py-3.5 text-sm font-semibold ${typeof row.delta === 'number' && row.delta < 0 ? 'text-[#F07154]' : 'text-emerald-600'}`}>{row.delta}</td>
                      <td className="py-3.5 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          row.pColor === 'red' ? 'bg-red-50 text-red-700' :
                          row.pColor === 'amber' ? 'bg-amber-50 text-amber-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            row.pColor === 'red' ? 'bg-red-500' :
                            row.pColor === 'amber' ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`}></span>
                          {row.p}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-orange-50 to-emerald-50 border border-[#33251E]/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-[#F07154]" />
            <h3 className="text-[11px] font-bold text-[#33251E]/80 uppercase tracking-[0.1em]">AI Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/5 text-sm text-[#33251E]/80 leading-relaxed">
              Zone C may require <strong className="text-[#33251E]">120 meals</strong> tonight — allocate cooked meals early.
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/5 text-sm text-[#33251E]/80 leading-relaxed">
              Demand highest for <strong className="text-[#33251E]">cooked meals between 7–9 PM</strong> across all tiers.
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/5 text-sm text-[#33251E]/80 leading-relaxed">
              Surplus bakery items should be redirected to <strong className="text-[#33251E]">Zone A</strong> for breakfast programs.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
