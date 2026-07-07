import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ForNGOs() {
  const chips = ["Restaurants", "NGOs", "Campuses", "Weddings", "Corporates", "Volunteers"];

  return (
    <section id="for-ngos" className="w-full bg-[#FDFBF7] py-24">
      <div className="container mx-auto px-6">
        
        <div className="w-full rounded-3xl bg-gradient-to-r from-[#FFF0EB] via-[#FDFBF7] to-[#E8F7F0] border border-[#33251E]/10 p-10 lg:p-16 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Subtle dotted background pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#33251E 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 max-w-xl">
            <h2 className="font-serif text-5xl text-[#33251E] mb-6 leading-tight">
              Built for the people already doing this work.
            </h2>
            <p className="text-lg text-[#33251E]/70 mb-10 leading-relaxed">
              SharePlate is designed for NGOs, restaurants, campuses, event organizers and food-rescue volunteers. Warm, quick and safety-first — the way food donation should be.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {chips.map((chip, i) => (
                <div key={i} className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-[#33251E]/10 text-sm font-medium text-[#33251E]/80 shadow-sm">
                  {chip}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/signup" className="inline-block bg-[#F07154] hover:bg-[#E05F42] text-white px-6 py-3 rounded-full text-sm font-medium transition-colors">
                Start Donating
              </Link>
              <Link to="/nlp-demo" className="inline-block bg-white hover:bg-neutral-50 text-[#33251E] border border-[#33251E]/10 px-6 py-3 rounded-full text-sm font-medium transition-colors shadow-sm">
                Try NLP Parser
              </Link>
            </div>
          </div>

          {/* Right Side Visual Card */}
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-[#33251E]/5 rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#F07154]" />
                <span className="text-sm font-bold text-[#33251E]">AI Match Found</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Success</span>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#33251E]/5">
                <div className="text-[10px] text-[#33251E]/50 uppercase tracking-wider font-semibold mb-1">Donor</div>
                <div className="text-sm font-medium text-[#33251E]">City College Cafeteria</div>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#33251E]/5">
                <div className="text-[10px] text-[#33251E]/50 uppercase tracking-wider font-semibold mb-1">Items matched</div>
                <div className="text-sm font-medium text-[#33251E]">120x Pasta, 50x Salads</div>
              </div>
            </div>

            <Link to="/signup" className="w-full bg-[#FDFBF7] hover:bg-[#F3EFE9] text-[#33251E] py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-[#33251E]/10">
              View NGO Match <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
