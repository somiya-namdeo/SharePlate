import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { ChevronDown, Phone, Route } from 'lucide-react';
import { cn } from '../lib/utils';

export function SmartMatching() {
  const matches = [
    {
      id: "MATCH #1",
      name: "Roti Bank",
      confidence: "Very High",
      details: "2.1 km • 80 kg cooked",
      score: 94,
      reasons: ["Close distance", "High demand", "Compatible category", "Critical urgency"],
      highlight: true
    },
    {
      id: "MATCH #2",
      name: "Feeding Hands",
      confidence: "High",
      details: "4.4 km • 40 kg cooked",
      score: 82,
      reasons: ["Compatible category", "Pickup available", "Medium urgency"],
      highlight: false
    },
    {
      id: "MATCH #3",
      name: "Seva Kitchen",
      confidence: "Moderate",
      details: "5.9 km • 60 meals",
      score: 76,
      reasons: ["Compatible category", "Route feasible"],
      highlight: false
    }
  ];

  const queue = [
    { id: "D-1042", ngo: "Roti Bank", dist: "2.1 km", score: 94, priority: "Critical", pColor: "red", status: "Assigned" },
    { id: "D-1039", ngo: "Feeding Hands", dist: "4.4 km", score: 88, priority: "High", pColor: "amber", status: "Scheduled" },
    { id: "D-1040", ngo: "Aasha Foundation", dist: "3.2 km", score: 91, priority: "Medium", pColor: "emerald", status: "In transit" },
    { id: "D-1037", ngo: "Seva Kitchen", dist: "5.9 km", score: 76, priority: "High", pColor: "amber", status: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Smart Matching" />

      <main className="ml-[280px] pt-[112px] pb-12 px-8 max-w-[1600px] mx-auto flex flex-col">
        
        {/* Top Control Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex-1 min-w-[200px]">
              <button className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E]/60 flex items-center justify-between hover:border-[#33251E]/30 transition-colors">
                Search donations, NGOs, zones...
                <ChevronDown size={16} className="text-[#33251E]/40" />
              </button>
            </div>
            <div className="flex-1 min-w-[200px]">
              <button className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E]/60 flex items-center justify-between hover:border-[#33251E]/30 transition-colors">
                Select NGO request
                <ChevronDown size={16} className="text-[#33251E]/40" />
              </button>
            </div>
            <div className="flex-1 min-w-[200px] flex">
              <button className="w-full bg-[#33251E] hover:bg-[#33251E]/90 text-white rounded-xl px-4 py-3 text-sm font-bold transition-colors">
                Match automatically
              </button>
            </div>
          </div>
        </div>

        {/* Match Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
          {matches.map((match, i) => (
            <div 
              key={i} 
              className={cn(
                "rounded-3xl shadow-sm border p-5 flex flex-col relative h-[360px]",
                match.highlight ? "bg-[#FDF6F4] border-[#F07154]" : "bg-white border-[#33251E]/10"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">{match.id}</span>
                  <h3 className="font-serif text-2xl font-bold text-[#33251E]">{match.name}</h3>
                  <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mt-1">AI Confidence • {match.confidence}</div>
                  <p className="text-xs text-[#33251E]/60 mt-1 font-medium">{match.details}</p>
                </div>
                
                {/* Score Circle */}
                <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                    <circle 
                      cx="28" cy="28" r="24" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 24} 
                      strokeDashoffset={2 * Math.PI * 24 * (1 - match.score / 100)} 
                      className={
                        match.score >= 90 ? "text-emerald-500" :
                        match.score >= 80 ? "text-[#F07154]" : "text-amber-500"
                      } 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={cn(
                      "font-bold text-sm leading-none",
                      match.score >= 90 ? "text-emerald-600" :
                      match.score >= 80 ? "text-[#F07154]" : "text-amber-600"
                    )}>{match.score}%</span>
                  </div>
                </div>
              </div>

              {/* Why this match box */}
              <div className="bg-white rounded-2xl border border-[#33251E]/5 p-4 mb-4 flex-1 shadow-sm overflow-hidden">
                <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-2 block">WHY THIS MATCH</span>
                <ul className="space-y-2">
                  {match.reasons.map((reason, j) => (
                    <li key={j} className="flex items-center gap-2 text-[13px] text-[#33251E]/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F07154] shrink-0"></div>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 mt-auto">
                <button className="bg-[#33251E] hover:bg-[#33251E]/90 text-white rounded-full px-5 py-2.5 text-sm font-bold flex items-center gap-2 transition-colors">
                  Assign NGO
                </button>
                <button className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-full px-5 py-2.5 text-sm font-bold flex items-center gap-2 transition-colors">
                  <Route size={16} />
                  View route
                </button>
                <button className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-full p-2.5 flex items-center justify-center transition-colors">
                  <Phone size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Assignment Queue */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#33251E]/10 flex flex-col overflow-hidden">
          <div className="flex justify-between items-end p-6 pb-4 bg-white border-b border-[#33251E]/5 shrink-0">
            <div>
              <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">ALL MATCHES</span>
              <h2 className="font-serif text-2xl font-semibold text-[#33251E]">Assignment queue</h2>
            </div>
            <span className="bg-[#FDFBF7] text-[#33251E]/60 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#33251E]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span> AI ASSISTED • LIVE
            </span>
          </div>
          
          <div className="w-full overflow-x-auto p-6 pt-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#33251E]/10">
                  <th className="py-3 font-semibold text-sm text-[#33251E]/60">Donation</th>
                  <th className="py-3 font-semibold text-sm text-[#33251E]/60">NGO</th>
                  <th className="py-3 font-semibold text-sm text-[#33251E]/60">Distance</th>
                  <th className="py-3 font-semibold text-sm text-[#33251E]/60">Score</th>
                  <th className="py-3 font-semibold text-sm text-[#33251E]/60">Priority</th>
                  <th className="py-3 font-semibold text-sm text-[#33251E]/60">Status</th>
                  <th className="py-3 font-semibold text-sm text-[#33251E]/60"></th>
                </tr>
              </thead>
              <tbody>
                {queue.map((row, i) => (
                  <tr key={i} className="border-b border-[#33251E]/5 hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-4.5 text-sm font-semibold text-[#33251E]/80">{row.id}</td>
                    <td className="py-4.5 text-sm font-semibold text-[#33251E]">{row.ngo}</td>
                    <td className="py-4.5 text-sm text-[#33251E]/80">{row.dist}</td>
                    <td className="py-4.5 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn(
                            "h-full rounded-full",
                            row.score >= 90 ? "bg-emerald-500" :
                            row.score >= 80 ? "bg-[#F07154]" : "bg-amber-500"
                          )} style={{ width: `${row.score}%` }}></div>
                        </div>
                        <span className="font-semibold text-[#33251E]">{row.score}%</span>
                      </div>
                    </td>
                    <td className="py-4.5 text-sm">
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
                        {row.priority}
                      </span>
                    </td>
                    <td className="py-4.5 text-sm">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        row.status === "Assigned" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        row.status === "Scheduled" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        row.status === "In transit" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          row.status === "Assigned" ? "bg-emerald-500" :
                          row.status === "Scheduled" ? "bg-blue-500" :
                          row.status === "In transit" ? "bg-amber-500" :
                          "bg-slate-400"
                        )}></span>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4.5 text-sm text-right">
                      <button className="text-[#33251E]/60 hover:text-[#33251E] font-semibold text-sm transition-colors">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
