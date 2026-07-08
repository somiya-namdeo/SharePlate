
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Star, MapPin, Clock, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export function SmartMatching() {
  const matches = [
    {
      name: "Hope Foundation",
      score: 98,
      distance: "1.2 km",
      time: "15 mins",
      capacity: "Needs 50 kg",
      verified: true,
      tags: ["Cooked Meals", "High Priority"],
      topMatch: true
    },
    {
      name: "Bhopal Food Bank",
      score: 85,
      distance: "3.5 km",
      time: "25 mins",
      capacity: "Needs 20 kg",
      verified: true,
      tags: ["Dry Rations"],
      topMatch: false
    },
    {
      name: "Sunrise Shelter",
      score: 72,
      distance: "5.0 km",
      time: "40 mins",
      capacity: "Needs 100 kg",
      verified: false,
      tags: ["Cooked Meals", "Produce"],
      topMatch: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Smart Matching" />

      <main className="ml-[280px] pt-[112px] pb-12 px-8 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <span className="text-[11px] font-bold text-[#F07154] uppercase tracking-[0.1em] mb-1 block">Active Donation</span>
          <h2 className="font-serif text-3xl font-bold text-[#33251E]">25 kg Dal & Rice • MP Nagar</h2>
          <p className="text-sm text-[#33251E]/70 mt-2">AI has found 3 suitable NGOs for this donation based on distance, requirement, and historical reliability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {matches.map((match, i) => (
            <div 
              key={i} 
              className={cn(
                "bg-white rounded-2xl shadow-sm border p-6 flex flex-col relative transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full",
                match.topMatch ? "border-[#F07154] ring-1 ring-[#F07154]" : "border-[#33251E]/10"
              )}
            >
              {match.topMatch && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F07154] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star size={12} className="fill-white" />
                  Top Recommendation
                </div>
              )}

              <div className="flex justify-between items-start mb-6 pt-2">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif text-xl font-bold text-[#33251E]">{match.name}</h3>
                    {match.verified && (
                      <ShieldCheck size={18} className="text-emerald-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {match.tags.map((tag, j) => (
                      <span key={j} className="bg-[#FDFBF7] border border-[#33251E]/10 text-[#33251E]/60 text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Score Circle */}
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                    <circle 
                      cx="32" cy="32" r="28" 
                      stroke="currentColor" 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 28} 
                      strokeDashoffset={2 * Math.PI * 28 * (1 - match.score / 100)} 
                      className={match.score >= 90 ? "text-emerald-500" : match.score >= 80 ? "text-[#F07154]" : "text-amber-500"} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-bold text-lg leading-none text-[#33251E]">{match.score}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-8 flex-1">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-[#33251E]/40 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block">Distance</span>
                    <span className="text-sm font-semibold text-[#33251E]">{match.distance}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={16} className="text-[#33251E]/40 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block">Est. Time</span>
                    <span className="text-sm font-semibold text-[#33251E]">{match.time}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 col-span-2">
                  <Users size={16} className="text-[#33251E]/40 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block">Capacity</span>
                    <span className="text-sm font-semibold text-[#33251E]">{match.capacity}</span>
                  </div>
                </div>
              </div>

              <button className={cn(
                "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-auto",
                match.topMatch 
                  ? "bg-[#F07154] hover:bg-[#E05F42] text-white shadow-sm" 
                  : "bg-[#FDFBF7] hover:bg-[#33251E]/5 border border-[#33251E]/10 text-[#33251E]"
              )}>
                Select Match
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
