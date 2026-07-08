import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Phone, MapPin, Package, Heart, Truck } from 'lucide-react';
import { cn } from '../lib/utils';

export function NGORequests() {
  const requests = [
    { ngo: "Roti Bank", id: "R-221", needs: "Cooked meal", qty: "80 kg", loc: "Old Bhopal", urgency: "Critical", status: "Open", match: "D-1042", color: "red" },
    { ngo: "Aasha Foundation", id: "R-220", needs: "Bakery", qty: "50 loaves", loc: "New Market", urgency: "Medium", status: "Fulfilled", match: "D-1010", color: "amber" },
    { ngo: "Feeding Hands", id: "R-219", needs: "Fresh produce", qty: "40 boxes", loc: "Bhauri", urgency: "High", status: "In transit", match: "D-1039", color: "amber" },
    { ngo: "Annadaan Trust", id: "R-218", needs: "Dry ration", qty: "200 kg", loc: "Kolar", urgency: "Low", status: "Open", match: "-", color: "emerald" },
    { ngo: "Seva Kitchen", id: "R-217", needs: "Cooked meal", qty: "120 meals", loc: "Habibganj", urgency: "High", status: "Open", match: "-", color: "red" },
    { ngo: "Hope Shelter", id: "R-216", needs: "Packaged", qty: "20 boxes", loc: "Bairagarh", urgency: "Medium", status: "Open", match: "-", color: "amber" }
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="NGO Requests" />

      <main className="ml-0 lg:ml-[280px] pt-[112px] pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto flex flex-col">
        
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-6 items-start">
          
          {/* Left Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-8 flex flex-col">
             <div className="shrink-0 mb-8">
                <span className="text-[11px] font-bold text-[#F07154] uppercase tracking-[0.1em] mb-1 block">NEW REQUEST</span>
                <h2 className="font-serif text-3xl font-bold text-[#33251E]">What does your NGO need today?</h2>
                <p className="text-sm text-[#33251E]/70 mt-2">We'll match it with nearby surplus donations in real time.</p>
             </div>
             
             <div className="flex flex-col gap-6">
                <div>
                   <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">NGO name<span className="text-red-500 ml-1">*</span></label>
                   <input type="text" placeholder="e.g. Roti Bank" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Food category<span className="text-red-500 ml-1">*</span></label>
                      <input type="text" placeholder="e.g. Cooked meal" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Quantity<span className="text-red-500 ml-1">*</span></label>
                      <input type="text" placeholder="e.g. 80 kg" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Location<span className="text-red-500 ml-1">*</span></label>
                   <input type="text" placeholder="e.g. Old Bhopal" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Preferred pickup time<span className="text-red-500 ml-1">*</span></label>
                      <input type="text" placeholder="e.g. 7 - 9 PM" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Urgency<span className="text-red-500 ml-1">*</span></label>
                      <select className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors appearance-none">
                        <option>High</option>
                        <option>Critical</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Contact person</label>
                   <input type="text" placeholder="+91 98xxx xx" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                </div>
                <div>
                   <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Notes</label>
                   <textarea placeholder="Anything the donor should know..." rows={4} className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors resize-none"></textarea>
                </div>
             </div>
             
             <div className="shrink-0 mt-6 pt-4">
                <button className="w-full bg-[#F07154] hover:bg-[#E05F42] text-white rounded-xl py-3.5 text-sm font-bold transition-colors shadow-sm">
                   Post request
                </button>
             </div>
          </div>
          
          {/* Right Column: Board & Detail */}
          <div className="flex flex-col gap-6">
             
             {/* Stats Bar */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/10">
                     <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Open Requests</div>
                     <div className="font-serif text-xl font-bold text-[#33251E]">12</div>
                 </div>
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/10">
                     <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Critical</div>
                     <div className="font-serif text-xl font-bold text-red-500">4</div>
                 </div>
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/10">
                     <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Fulfilled Today</div>
                     <div className="font-serif text-xl font-bold text-[#33251E]">7</div>
                 </div>
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/10">
                     <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Match Success</div>
                     <div className="font-serif text-xl font-bold text-[#33251E]">91%</div>
                 </div>
             </div>

             {/* Demand Board */}
             <div className="bg-[#FDFBF7] rounded-2xl shadow-sm border border-[#33251E]/10 flex flex-col">
                <div className="p-6 pb-4 border-b border-[#33251E]/5 shrink-0 bg-white rounded-t-2xl">
                   <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">LIVE REQUESTS</span>
                   <h2 className="font-serif text-2xl font-bold text-[#33251E]">NGO demand board</h2>
                </div>
                
                <div className="overflow-x-auto p-6 pt-0">
                   <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[#33251E]/10">
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">NGO</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Needs</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Qty</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Location</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Urgency</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Status</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Match</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((r, i) => (
                           <tr key={i} className="border-b border-[#33251E]/5 hover:bg-gray-50/80 transition-colors cursor-pointer group">
                              <td className="py-3.5">
                                 <div className="font-bold text-sm text-[#33251E]">{r.ngo}</div>
                                 <div className="text-xs text-[#33251E]/50 font-medium font-mono mt-0.5">{r.id}</div>
                              </td>
                              <td className="py-3.5 text-sm text-[#33251E]/80 pr-4">{r.needs}</td>
                              <td className="py-3.5 text-sm text-[#33251E]/80 pr-4">{r.qty}</td>
                              <td className="py-3.5 text-sm text-[#33251E]/80 pr-4">{r.loc}</td>
                              <td className="py-3.5">
                                 <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest min-w-[80px] justify-center",
                                    r.color === 'red' ? 'bg-red-50 text-red-700' :
                                    r.color === 'amber' ? 'bg-amber-50 text-amber-700' :
                                    'bg-emerald-50 text-emerald-700'
                                 )}>
                                    <span className={cn(
                                       "w-1.5 h-1.5 rounded-full",
                                       r.color === 'red' ? 'bg-red-500' :
                                       r.color === 'amber' ? 'bg-amber-500' :
                                       'bg-emerald-500'
                                    )}></span>
                                    {r.urgency}
                                 </span>
                              </td>
                              <td className="py-3.5 text-sm text-[#33251E]/80">{r.status}</td>
                              <td className="py-3.5 text-sm font-semibold text-[#33251E] font-mono">{r.match}</td>
                           </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
             
             {/* Request Detail Card */}
             <div className="bg-[#FDF6F4] border border-[#F07154]/20 rounded-2xl p-6 shrink-0 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <span className="text-[11px] font-bold text-[#F07154] uppercase tracking-[0.1em] mb-1 block">REQUEST DETAIL</span>
                      <h3 className="font-serif text-2xl font-bold text-[#33251E]">R-221 • Roti Bank</h3>
                   </div>
                   <span className="bg-red-50 border border-red-200 text-red-700 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></span> CRITICAL
                   </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
                   <div className="bg-white/60 rounded-xl p-5 border border-[#33251E]/5 flex flex-col items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FDF6F4] flex items-center justify-center text-[#F07154]"><Heart size={14} /></div>
                      <div>
                         <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Demand need</div>
                         <div className="font-semibold text-sm text-[#33251E]">80 kg cooked meal</div>
                      </div>
                   </div>
                   <div className="bg-white/60 rounded-xl p-5 border border-[#33251E]/5 flex flex-col items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FDF6F4] flex items-center justify-center text-[#F07154]"><Package size={14} /></div>
                      <div>
                         <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Matched donation</div>
                         <div className="font-semibold text-sm text-[#33251E] font-mono">D-1042 • <span className="font-sans">Dal & Rice</span></div>
                      </div>
                   </div>
                   <div className="bg-white/60 rounded-xl p-5 border border-[#33251E]/5 flex flex-col items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Truck size={14} /></div>
                      <div>
                         <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Delivery status</div>
                         <div className="font-semibold text-sm text-[#33251E]">In transit • ETA 14 min</div>
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-3">
                   <button className="bg-[#F07154] hover:bg-[#E05F42] text-white rounded-xl px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                      <Phone size={16} /> Call NGO
                   </button>
                   <button className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-xl px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors">
                      <MapPin size={16} /> View on map
                   </button>
                </div>
             </div>
             
          </div>
        </div>

      </main>
    </div>
  );
}
