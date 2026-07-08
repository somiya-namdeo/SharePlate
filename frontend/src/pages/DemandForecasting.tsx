
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Sparkles, ChevronDown } from 'lucide-react';

export function DemandForecasting() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Demand Forecasting" />

      <main className="ml-[280px] pt-[112px] pb-12 px-8 max-w-[1600px] mx-auto flex flex-col gap-8">
        
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
            <div key={i} className="flex-1 min-w-[150px]">
              <label className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1.5 px-1">{filter.label}</label>
              <button className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-2.5 text-sm text-[#33251E] flex items-center justify-between hover:border-[#33251E]/30 transition-colors">
                Any
                <ChevronDown size={16} className="text-[#33251E]/40" />
              </button>
            </div>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Line Chart Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-8 min-h-[400px] flex flex-col">
            <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">TREND</span>
            <h2 className="font-serif text-xl font-semibold text-[#33251E] mb-6">Demand vs supply • 7d</h2>
            <div className="flex-1 border-b-2 border-l-2 border-[#33251E]/10 relative">
               {/* Decorative lines representing chart */}
               <div className="absolute inset-0 flex flex-col justify-between pt-4 pb-0">
                  <div className="border-b border-dashed border-[#33251E]/5 w-full h-0"></div>
                  <div className="border-b border-dashed border-[#33251E]/5 w-full h-0"></div>
                  <div className="border-b border-dashed border-[#33251E]/5 w-full h-0"></div>
                  <div className="border-b border-dashed border-[#33251E]/5 w-full h-0"></div>
               </div>
               {/* SVG path mockup for line chart */}
               <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                 <path d="M0,80 L20,70 L40,65 L60,55 L80,45 L100,50" fill="none" stroke="#F07154" strokeWidth="2" />
                 <path d="M0,85 L20,75 L40,70 L60,65 L80,55 L100,52" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
               </svg>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-[#33251E]/40 uppercase">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          {/* Donut Chart Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-8 min-h-[400px] flex flex-col">
            <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">DISTRIBUTION</span>
            <h2 className="font-serif text-xl font-semibold text-[#33251E] mb-6">Meal type mix</h2>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-48 h-48 rounded-full border-[24px] border-[#F07154] relative">
                <div className="absolute top-[-24px] right-[-24px] w-24 h-24 rounded-tr-full border-t-[24px] border-r-[24px] border-[#33251E]"></div>
                <div className="absolute bottom-[-24px] right-[-24px] w-24 h-24 rounded-br-full border-b-[24px] border-r-[24px] border-amber-400"></div>
                <div className="absolute bottom-[-24px] left-[-24px] w-24 h-24 rounded-bl-full border-b-[24px] border-l-[24px] border-emerald-500"></div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {[
                { label: "Cooked", color: "bg-[#F07154]" },
                { label: "Bakery", color: "bg-emerald-500" },
                { label: "Dairy", color: "bg-amber-400" },
                { label: "Produce", color: "bg-[#33251E]" },
              ].map((legend, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] font-bold text-[#33251E]/60 uppercase tracking-[0.1em]">
                  <span className={`w-3 h-3 rounded-full ${legend.color}`}></span>
                  {legend.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          {/* Bar Chart Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-8 min-h-[400px] flex flex-col">
            <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">BY ZONE</span>
            <h2 className="font-serif text-xl font-semibold text-[#33251E] mb-6">Predicted demand</h2>
            <div className="flex-1 flex items-end justify-between border-b-2 border-[#33251E]/10 pb-2 px-4 gap-4">
               <div className="w-full bg-[#F07154] rounded-t-sm h-[50%]"></div>
               <div className="w-full bg-[#F07154] rounded-t-sm h-[90%]"></div>
               <div className="w-full bg-[#F07154] rounded-t-sm h-[70%]"></div>
               <div className="w-full bg-[#F07154] rounded-t-sm h-[40%]"></div>
               <div className="w-full bg-[#F07154] rounded-t-sm h-[60%]"></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-[#33251E]/40 uppercase px-4">
              <span>Zone A</span><span>Zone B</span><span>Zone C</span><span>Zone D</span><span>Zone E</span>
            </div>
          </div>

          {/* Table Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-8 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">FORECAST TABLE</span>
                <h2 className="font-serif text-xl font-semibold text-[#33251E]">Zone-wise demand vs supply</h2>
              </div>
              <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F07154]"></span> FORECAST
              </span>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#33251E]/10">
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">Zone</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">Predicted</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">Supply</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">Delta</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { zone: "Zone A", pred: 210, supply: 180, delta: -30, p: "Medium", pColor: "amber" },
                    { zone: "Zone B", pred: 340, supply: 220, delta: -120, p: "Critical", pColor: "red" },
                    { zone: "Zone C", pred: 280, supply: 260, delta: -20, p: "Low", pColor: "emerald" },
                    { zone: "Zone D", pred: 160, supply: 210, delta: "+50", p: "Low", pColor: "emerald" },
                    { zone: "Zone E", pred: 220, supply: 150, delta: -70, p: "High", pColor: "red" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-[#33251E]/5 hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-4 text-sm font-semibold text-[#33251E]">{row.zone}</td>
                      <td className="py-4 text-sm text-[#33251E]">{row.pred}</td>
                      <td className="py-4 text-sm text-[#33251E]">{row.supply}</td>
                      <td className={`py-4 text-sm font-semibold ${typeof row.delta === 'number' && row.delta < 0 ? 'text-[#F07154]' : 'text-emerald-600'}`}>{row.delta}</td>
                      <td className="py-4 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
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
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/5 text-sm text-[#33251E]/80">
              Zone C may require <strong className="text-[#33251E]">120 meals</strong> tonight — allocate cooked meals early.
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/5 text-sm text-[#33251E]/80">
              Demand highest for <strong className="text-[#33251E]">cooked meals between 7-9 PM</strong> across all tiers.
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/5 text-sm text-[#33251E]/80">
              Surplus bakery items should be redirected to <strong className="text-[#33251E]">Zone A</strong> for breakfast programs.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
