import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Utensils, Leaf, ShieldCheck, Users, Timer, Flame, TrendingUp, ChevronDown, Calendar, MapPin } from 'lucide-react';

export function Analytics() {
  const kpis = [
    { label: "Meals rescued", value: "128,430", icon: Utensils, color: "text-[#F07154]", trend: "↑ 12% this month", trendColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Food diverted", value: "42.1t", icon: Leaf, color: "text-[#F07154]", trend: "↑ 8% vs last week", trendColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Donations completed", value: "3,204", icon: ShieldCheck, color: "text-[#F07154]", trend: "↑ 5% this month", trendColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "NGOs served", value: "96", icon: Users, color: "text-[#F07154]", trend: "↑ 2 new this week", trendColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Avg pickup time", value: "38 min", icon: Timer, color: "text-[#F07154]", trend: "↓ 3% this month", trendColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Critical resolved", value: "97%", icon: Flame, color: "text-[#F07154]", trend: "↓ 1% vs last month", trendColor: "text-red-600 bg-red-50 border-red-100" }
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Analytics" />

      <main className="ml-0 lg:ml-[280px] pt-[112px] pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Analytics Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
           <h2 className="font-serif text-2xl font-bold text-[#33251E]">Operations Intelligence</h2>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <select className="bg-white shadow-sm border border-[#33251E]/10 rounded-xl pl-9 pr-8 py-2.5 text-sm font-bold text-[#33251E] focus:outline-none focus:border-[#F07154] cursor-pointer appearance-none transition-colors group-hover:bg-gray-50">
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                    <option>This Year</option>
                 </select>
                 <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50" />
                 <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50 pointer-events-none" />
              </div>
              <div className="relative group">
                 <select className="bg-white shadow-sm border border-[#33251E]/10 rounded-xl pl-9 pr-8 py-2.5 text-sm font-bold text-[#33251E] focus:outline-none focus:border-[#F07154] cursor-pointer appearance-none transition-colors group-hover:bg-gray-50">
                    <option>All Cities</option>
                    <option>Bhopal</option>
                    <option>Indore</option>
                 </select>
                 <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50" />
                 <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50 pointer-events-none" />
              </div>
              <div className="relative group">
                 <select className="bg-white shadow-sm border border-[#33251E]/10 rounded-xl pl-9 pr-8 py-2.5 text-sm font-bold text-[#33251E] focus:outline-none focus:border-[#F07154] cursor-pointer appearance-none transition-colors group-hover:bg-gray-50">
                    <option>All Categories</option>
                    <option>Cooked Meals</option>
                    <option>Raw Ingredients</option>
                 </select>
                 <Utensils size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50" />
                 <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50 pointer-events-none" />
              </div>
           </div>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-5 flex flex-col justify-center group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="w-9 h-9 rounded-full bg-[#FDF6F4] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={16} className={kpi.color} />
                </div>
                <div className="font-serif text-2xl font-bold text-[#33251E] mb-1">{kpi.value}</div>
                <div className="text-xs font-semibold text-[#33251E]/60 mb-3">{kpi.label}</div>
                <div className={`text-[10px] font-bold px-2 py-1 rounded-md border w-fit ${kpi.trendColor}`}>
                   {kpi.trend}
                </div>
              </div>
            );
          })}
        </div>

        {/* Impact Banner */}
        <div className="bg-[#4A3228] rounded-2xl p-8 flex flex-col md:flex-row gap-8 justify-between text-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
            <div className="flex items-center gap-2 mb-2 text-white/60">
               <Leaf size={14} />
               <div className="text-[10px] font-bold uppercase tracking-widest">IMPACT</div>
            </div>
            <div className="font-serif text-3xl font-bold mb-1">42.1 t</div>
            <div className="text-sm font-bold text-white/90 mb-1">Food Diverted</div>
            <div className="text-[11px] text-white/60 font-semibold">prevented from landfills</div>
          </div>
          <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
            <div className="flex items-center gap-2 mb-2 text-white/60">
               <Utensils size={14} />
               <div className="text-[10px] font-bold uppercase tracking-widest">REDIRECTED</div>
            </div>
            <div className="font-serif text-3xl font-bold mb-1">128k</div>
            <div className="text-sm font-bold text-white/90 mb-1">Meals rescued</div>
            <div className="text-[11px] text-white/60 font-semibold">across 17 zones</div>
          </div>
          <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
            <div className="flex items-center gap-2 mb-2 text-white/60">
               <Users size={14} />
               <div className="text-[10px] font-bold uppercase tracking-widest">COMMUNITIES</div>
            </div>
            <div className="font-serif text-3xl font-bold mb-1">96</div>
            <div className="text-sm font-bold text-white/90 mb-1">NGOs Served</div>
            <div className="text-[11px] text-white/60 font-semibold">shelters & kitchens</div>
          </div>
          <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex items-center gap-2 mb-2 text-white/60">
               <TrendingUp size={14} />
               <div className="text-[10px] font-bold uppercase tracking-widest">MONTHLY TREND</div>
            </div>
            <div className="font-serif text-3xl font-bold mb-1 text-emerald-400">↑ 22%</div>
            <div className="text-sm font-bold text-white/90 mb-1">Growth in rescue</div>
            <div className="text-[11px] text-white/60 font-semibold">vs last month</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 items-stretch h-[340px]">
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 pt-8 flex flex-col h-full overflow-hidden relative group">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-serif text-xl font-bold text-[#33251E]">Donations over time</h3>
               <div className="relative">
                  <select className="bg-white border border-[#33251E]/10 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-[#33251E] focus:outline-none focus:border-[#F07154] cursor-pointer appearance-none hover:bg-gray-50 transition-colors">
                     <option>Last 7 Days</option>
                     <option>Last 30 Days</option>
                     <option>Last 90 Days</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#33251E]/50 pointer-events-none" />
               </div>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0 relative mt-2">
               {/* Y-Axis & Chart Container */}
               <div className="flex flex-1 relative">
                  {/* Y-Axis Labels */}
                  <div className="flex flex-col justify-between text-[10px] font-bold text-[#33251E]/40 pr-4 pb-6 text-right shrink-0 w-10">
                     <span>1.0k</span>
                     <span>750</span>
                     <span>500</span>
                     <span>250</span>
                     <span>0</span>
                  </div>
                  
                  {/* Chart Area */}
                  <div className="flex-1 relative border-l border-[#33251E]/5 pl-2 flex flex-col">
                     
                     {/* Exact wrapper for chart and dots */}
                     <div className="relative flex-1 w-full ml-1 mr-2 mb-6">
                        
                        {/* Horizontal Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                           <div className="border-t border-[#33251E]/5 w-full"></div>
                           <div className="border-t border-[#33251E]/5 w-full"></div>
                           <div className="border-t border-[#33251E]/5 w-full"></div>
                           <div className="border-t border-[#33251E]/5 w-full"></div>
                           <div className="border-t border-[#33251E]/10 w-full"></div>
                        </div>
                        
                        {/* Smooth SVG Path */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                           <path 
                              d="M 0 85 C 8.33 85, 8.33 75, 16.66 75 C 25 75, 25 60, 33.33 60 C 41.66 60, 41.66 45, 50 45 C 58.33 45, 58.33 40, 66.66 40 C 75 40, 75 20, 83.33 20 C 91.66 20, 91.66 10, 100 10" 
                              fill="none" 
                              stroke="#F07154" 
                              strokeWidth="3" 
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              vectorEffect="non-scaling-stroke" 
                           />
                        </svg>

                        {/* HTML Data Points & Tooltips */}
                        <div className="absolute inset-0 pointer-events-none">
                           {[
                              {day: 'Monday', x: '0%', y: '85%', val: 150, meals: '600', align: 'left-0'},
                              {day: 'Tuesday', x: '16.66%', y: '75%', val: 300, meals: '1.2k', align: 'left-1/2 -translate-x-1/2'},
                              {day: 'Wednesday', x: '33.33%', y: '60%', val: 450, meals: '1.8k', align: 'left-1/2 -translate-x-1/2'},
                              {day: 'Thursday', x: '50%', y: '45%', val: 550, meals: '2.2k', align: 'left-1/2 -translate-x-1/2'},
                              {day: 'Friday', x: '66.66%', y: '40%', val: 700, meals: '2.8k', align: 'left-1/2 -translate-x-1/2'},
                              {day: 'Saturday', x: '83.33%', y: '20%', val: 750, meals: '3.0k', align: 'left-1/2 -translate-x-1/2'},
                              {day: 'Sunday', x: '100%', y: '10%', val: 900, meals: '3.6k', align: 'right-0'}
                           ].map((pt, idx) => (
                              <div key={idx} className="absolute w-[6px] h-[6px] bg-white border-[1.5px] border-[#F07154] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-150 hover:bg-[#F07154] transition-all duration-300 z-10 group/pt" style={{left: pt.x, top: pt.y}}>
                                 <div className={`absolute bottom-full mb-3 ${pt.align} bg-[#33251E] text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover/pt:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-lg scale-90 group-hover/pt:scale-100 origin-bottom`}>
                                    <div className="font-bold text-[#FDFBF7] mb-1 text-sm">{pt.day}</div>
                                    <div className="flex items-center justify-between gap-4 mb-0.5"><span className="text-white/60">Donations</span><span className="font-bold">{pt.val}</span></div>
                                    <div className="flex items-center justify-between gap-4"><span className="text-white/60">Meals</span><span className="font-bold">{pt.meals}</span></div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* X-Axis Labels */}
                     <div className="absolute left-1 right-2 bottom-0 h-6 flex items-end justify-between text-[10px] text-[#33251E]/50 font-bold uppercase">
                        <span className="w-8 text-left">Mon</span>
                        <span className="w-8 text-center -ml-2">Tue</span>
                        <span className="w-8 text-center -ml-3">Wed</span>
                        <span className="w-8 text-center">Thu</span>
                        <span className="w-8 text-center ml-2">Fri</span>
                        <span className="w-8 text-center ml-2">Sat</span>
                        <span className="w-8 text-right">Sun</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full relative overflow-hidden group">
            <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6 shrink-0">Food category</h3>
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative">
               <div className="relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <svg className="w-40 h-40" viewBox="0 0 36 36">
                     <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#69b3a2" strokeWidth="4" strokeDasharray="42, 100" className="cursor-pointer hover:stroke-[5px] transition-all"><title>Cooked Meals: 42%</title></path>
                     <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F07154" strokeWidth="4" strokeDasharray="30, 100" strokeDashoffset="-42" className="cursor-pointer hover:stroke-[5px] transition-all"><title>Raw Ingredients: 30%</title></path>
                     <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fbbf24" strokeWidth="4" strokeDasharray="18, 100" strokeDashoffset="-72" className="cursor-pointer hover:stroke-[5px] transition-all"><title>Bakery: 18%</title></path>
                     <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5a2b" strokeWidth="4" strokeDasharray="10, 100" strokeDashoffset="-90" className="cursor-pointer hover:stroke-[5px] transition-all"><title>Packaged Food: 10%</title></path>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none bg-white rounded-full m-3 shadow-inner">
                     <div className="font-serif text-lg font-bold text-[#33251E] leading-tight">3,204</div>
                     <div className="text-[9px] font-bold uppercase text-[#33251E]/50 tracking-wider">Donations</div>
                  </div>
               </div>
               
               <div className="w-full max-w-[220px] grid grid-cols-2 gap-x-4 gap-y-3 mt-8 px-2 shrink-0">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#33251E]/60">
                     <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#69b3a2]"></span> Cooked</span>
                     <span className="text-[#33251E]">42%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#33251E]/60">
                     <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#F07154]"></span> Raw</span>
                     <span className="text-[#33251E]">30%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#33251E]/60">
                     <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#fbbf24]"></span> Bakery</span>
                     <span className="text-[#33251E]">18%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#33251E]/60">
                     <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#8b5a2b]"></span> Packaged</span>
                     <span className="text-[#33251E]">10%</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch h-[320px]">
          {/* Safety Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full overflow-hidden">
            <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">Safety distribution</h3>
            <div className="flex-1 flex flex-col justify-around">
               <div className="flex items-center gap-4 group">
                  <span className="w-12 text-xs font-semibold text-[#33251E]/80 text-right group-hover:text-[#33251E] transition-colors">Safe</span>
                  <div className="flex-1 h-10 bg-gray-50 rounded-r-md relative flex items-center group-hover:bg-gray-100 transition-colors shadow-inner">
                     <div className="h-full bg-emerald-500 rounded-r-md flex items-center justify-end pr-3 transition-all duration-700 hover:brightness-110 cursor-pointer shadow-sm" style={{width: '78%'}}>
                        <span className="text-[10px] font-bold text-white">78%</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-4 group">
                  <span className="w-12 text-xs font-semibold text-[#33251E]/80 text-right group-hover:text-[#33251E] transition-colors">Review</span>
                  <div className="flex-1 h-10 bg-gray-50 rounded-r-md relative flex items-center group-hover:bg-gray-100 transition-colors shadow-inner">
                     <div className="h-full bg-amber-400 rounded-r-md flex items-center justify-end pr-3 transition-all duration-700 hover:brightness-110 cursor-pointer shadow-sm" style={{width: '15%'}}>
                        <span className="text-[10px] font-bold text-white">15%</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-4 group">
                  <span className="w-12 text-xs font-semibold text-[#33251E]/80 text-right group-hover:text-[#33251E] transition-colors">Unsafe</span>
                  <div className="flex-1 h-10 bg-gray-50 rounded-r-md relative flex items-center group-hover:bg-gray-100 transition-colors shadow-inner">
                     <div className="h-full bg-[#F07154] rounded-r-md flex items-center justify-end pr-3 transition-all duration-700 hover:brightness-110 cursor-pointer shadow-sm" style={{width: '7%'}}>
                        <span className="text-[10px] font-bold text-white">7%</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
          
          {/* Urgency Levels */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full overflow-hidden">
            <h3 className="font-serif text-xl font-bold text-[#33251E] mb-4 shrink-0">Urgency levels</h3>
            <div className="flex-1 border-b border-l border-[#33251E]/10 flex items-end justify-around pt-4 pb-6 mt-2 relative">
               {[
                  {label: 'Low', val: 120, height: '40%'},
                  {label: 'Medium', val: 210, height: '80%'},
                  {label: 'High', val: 180, height: '65%'},
                  {label: 'Critical', val: 90, height: '25%'}
               ].map((item, idx) => (
                  <div key={idx} className="w-10 md:w-12 bg-[#F07154]/20 hover:bg-[#F07154]/30 cursor-pointer rounded-t-md relative flex flex-col justify-end items-center group transition-colors" style={{height: item.height}}>
                     <div className="absolute bottom-full mb-1.5 text-[10px] font-bold text-[#33251E]/80 group-hover:-translate-y-1 transition-transform">{item.val}</div>
                     <div className="absolute bottom-full mb-6 bg-[#33251E] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 shadow-lg group-hover:-translate-y-1">
                        <span className="font-bold text-[#FDFBF7]">{item.label} Urgency:</span> <span className="text-white/80">{item.val}</span>
                     </div>
                     <div className="w-full bg-[#F07154] rounded-t-md absolute bottom-0 left-0 transition-all duration-500 group-hover:brightness-110 shadow-[0_-2px_4px_rgba(240,113,84,0.3)]" style={{height: '100%'}}></div>
                     <span className="absolute top-full mt-2 w-full text-center text-[10px] text-[#33251E]/60 font-semibold group-hover:text-[#33251E] transition-colors">{item.label}</span>
                  </div>
               ))}
            </div>
          </div>
          
          {/* Zone Demand */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full overflow-hidden">
            <h3 className="font-serif text-xl font-bold text-[#33251E] mb-4 shrink-0">Zone demand</h3>
            <div className="flex-1 border-b border-l border-[#33251E]/10 flex items-end justify-around pt-4 pb-6 mt-2 relative">
               {[
                  {label: 'Zone A', val: 180, height: '55%'},
                  {label: 'Zone B', val: 280, height: '90%', sub: 'Highest demand'},
                  {label: 'Zone C', val: 240, height: '75%'},
                  {label: 'Zone D', val: 140, height: '40%'},
                  {label: 'Zone E', val: 190, height: '60%'}
               ].map((item, idx) => (
                  <div key={idx} className="w-6 md:w-8 bg-amber-400/20 hover:bg-amber-400/30 cursor-pointer rounded-t-md relative flex flex-col justify-end items-center group transition-colors" style={{height: item.height}}>
                     <div className="absolute bottom-full mb-1 text-[9px] font-bold text-[#33251E]/80 group-hover:-translate-y-1 transition-transform">{item.val}</div>
                     <div className="absolute bottom-full mb-6 bg-[#33251E] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 shadow-lg text-center group-hover:-translate-y-1">
                        <div className="font-bold text-[#FDFBF7] mb-0.5">{item.label}</div>
                        <div className="text-white/80">{item.val} requests</div>
                        {item.sub && <div className="text-amber-400 text-[10px] mt-1 font-bold">{item.sub}</div>}
                     </div>
                     <div className="w-full bg-amber-400 rounded-t-md absolute bottom-0 left-0 transition-all duration-500 group-hover:brightness-110 shadow-[0_-2px_4px_rgba(251,191,36,0.3)]" style={{height: '100%'}}></div>
                     <span className="absolute top-full mt-2 w-full text-center text-[10px] text-[#33251E]/60 font-semibold group-hover:text-[#33251E] transition-colors whitespace-nowrap -ml-1 md:ml-0">{item.label}</span>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* Operational Insights */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col mt-2">
          <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">Operational insights</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
             {[
                {label: 'Most donated', val: 'Cooked meals', sub: '(42%)'},
                {label: 'Highest demand', val: 'Zone B', sub: '• dinner'},
                {label: 'Avg shelf life', val: '4.6 hrs', sub: null},
                {label: 'Avg match time', val: '2.1 mins', sub: null},
                {label: 'Review rate', val: '15%', sub: null},
                {label: 'Unsafe donation', val: '7%', color: 'text-[#F07154]'},
                {label: 'NGO fulfillment', val: '91%', color: 'text-emerald-600'},
                {label: 'Critical today', val: '4', color: 'text-amber-600'},
                {label: 'Active requests', val: '18', sub: null},
                {label: 'Processed today', val: '142', sub: null}
             ].map((insight, i) => (
               <div key={i} className="border border-[#33251E]/5 rounded-xl p-4 flex flex-col justify-center bg-[#FDFBF7]/50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group">
                  <div className="text-[10px] text-[#33251E]/50 mb-1 font-bold uppercase tracking-wider group-hover:text-[#33251E]/70 transition-colors">{insight.label}</div>
                  <div className={`font-sans text-xl md:text-2xl font-bold ${insight.color || 'text-[#33251E]'}`}>
                     {insight.val} {insight.sub && <span className="text-sm text-[#33251E]/50 font-medium ml-1">{insight.sub}</span>}
                  </div>
               </div>
             ))}
          </div>
        </div>

      </main>
    </div>
  );
}
