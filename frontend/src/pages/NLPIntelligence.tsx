import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Sparkles, Check, Wand2, ArrowRight } from 'lucide-react';

export function NLPIntelligence() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="NLP Intelligence" />

      <main className="ml-[280px] pt-[112px] pb-12 px-8 max-w-[1600px] mx-auto flex flex-col items-start">
        
        {/* Workflow Strip */}
        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.1em] mb-8 border border-[#33251E]/10 bg-white rounded-full px-4 py-2 shadow-sm">
          <span className="text-[#33251E]/50">Message</span>
          <ArrowRight size={14} className="text-[#33251E]/30" />
          <span className="text-[#33251E]/50">Extraction</span>
          <ArrowRight size={14} className="text-[#33251E]/30" />
          <span className="text-[#F07154] flex items-center gap-1"><Check size={14} strokeWidth={3} /> Structured Donation</span>
        </div>

        <div className="flex flex-col gap-8 w-full">
          
          {/* AI Input Card & Examples */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="flex justify-between items-center mb-2 relative z-10">
              <span className="text-[11px] font-bold text-[#F07154] uppercase tracking-[0.1em]">AI Assistant</span>
              <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F07154]"></span> AI Assisted
              </span>
            </div>
            
            <h2 className="font-serif text-3xl font-bold text-[#33251E] mb-1 relative z-10">Paste a donation message</h2>
            <p className="text-sm text-[#33251E]/70 mb-6 relative z-10">WhatsApp, email or SMS — we'll structure it.</p>
            
            <textarea 
              className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl p-4 text-sm text-[#33251E] placeholder:text-[#33251E]/40 focus:outline-none focus:ring-2 focus:ring-[#F07154]/20 min-h-[160px] resize-none relative z-10 shadow-inner"
              defaultValue="We have 25 kg of freshly prepared dal and rice available near MP Nagar, Bhopal. Pickup possible before 8 PM."
            />
            
            <button className="mt-6 bg-[#F07154] hover:bg-[#E05F42] text-white font-semibold py-3 px-6 rounded-full inline-flex items-center justify-center gap-2 w-max transition-colors relative z-10 shadow-sm">
              <Wand2 size={18} />
              Extract donation details
            </button>

            <div className="mt-8 pt-6 border-t border-[#33251E]/5 relative z-10">
              <h3 className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-4">Try Examples</h3>
              <div className="flex flex-col md:flex-row gap-3">
                {[
                  "\"Wedding at Ashoka Gardens has 12 kg extra paneer curry, please pick up by 10 PM.\"",
                  "\"Sunrise Bakery has 40 loaves left over, good until tomorrow morning.\"",
                  "\"IIT Bhopal mess — 60 fruit boxes ready, need pickup within 6 hours.\""
                ].map((example, i) => (
                  <button key={i} className="text-left flex-1 p-4 rounded-xl border border-[#33251E]/10 hover:border-[#F07154]/40 hover:bg-[#F07154]/5 transition-colors text-sm text-[#33251E]/80 italic bg-[#FDFBF7]">
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full">
            
            {/* Extracted Entities Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">Extracted Entities</span>
                  <h2 className="font-serif text-2xl font-bold text-[#33251E]">What SharePlate understood</h2>
                </div>
                <div className="bg-emerald-50 text-emerald-700 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100 mt-1">
                  <Sparkles size={14} />
                  7 entities • 92% match
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1">
                {[
                  { label: "Food Item", value: "Dal & Rice", confidence: "High", color: "emerald" },
                  { label: "Quantity", value: "25 kg", confidence: "High", color: "emerald" },
                  { label: "Location", value: "MP Nagar, Bhopal", confidence: "High", color: "emerald" },
                  { label: "Pickup Time", value: "Before 8:00 PM", confidence: "High", color: "emerald" },
                  { label: "Food Category", value: "Cooked meal", confidence: "Medium", color: "amber" },
                  { label: "Donor Intent", value: "Freshly prepared surplus", confidence: "Medium", color: "amber" },
                ].map((entity, i) => (
                  <div key={i} className="border border-[#33251E]/10 rounded-xl p-4 bg-[#FDFBF7]/50">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest">{entity.label}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        entity.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>{entity.confidence}</span>
                    </div>
                    <div className="font-medium text-[#33251E]">{entity.value}</div>
                  </div>
                ))}
                
                {/* Full width special notes */}
                <div className="border border-[#33251E]/10 rounded-xl p-4 bg-[#FDFBF7]/50 col-span-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest">Special Notes</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-600">Needs review</span>
                  </div>
                  <div className="font-medium text-[#33251E]">None detected</div>
                </div>
              </div>
            </div>

            {/* Auto-Filled Preview Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full">
              <span className="text-[11px] font-bold text-[#F07154] uppercase tracking-[0.1em] mb-1 block">Auto-filled preview</span>
              <h2 className="font-serif text-2xl font-bold text-[#33251E] mb-6">Structured donation, ready to save</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
                {[
                  { label: "Food Item", value: "Dal & Rice (cooked)" },
                  { label: "Category", value: "Cooked meal" },
                  { label: "Quantity", value: "25 kg" },
                  { label: "Location", value: "MP Nagar, Bhopal" },
                  { label: "Pickup by", value: "8:00 PM today" },
                  { label: "Est. shelf life", value: "3 hrs" },
                ].map((field, i) => (
                  <div key={i} className="border border-[#33251E]/10 rounded-xl p-4 bg-[#FDFBF7]">
                    <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">{field.label}</span>
                    <div className="font-medium text-[#33251E]">{field.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4 flex flex-wrap items-center gap-4">
                <button className="bg-[#F07154] hover:bg-[#E05F42] text-white font-semibold py-3 px-6 rounded-full transition-colors shadow-sm">
                  Create donation
                </button>
                <button className="bg-white border border-[#33251E]/10 hover:bg-[#33251E]/5 text-[#33251E] font-semibold py-3 px-6 rounded-full transition-colors">
                  Edit details
                </button>
                <div className="md:ml-auto flex items-center gap-2 text-sm font-semibold text-[#33251E]/70 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                  <Check size={18} className="text-emerald-600" />
                  <span className="text-emerald-800">Safety check passed</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
