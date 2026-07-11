import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Sparkles, Check, Wand2, ArrowRight, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import toast from 'react-hot-toast';

export function NLPIntelligence() {
  const navigate = useNavigate();
  const [text, setText] = useState("We have 50 rotis and dal available at MP Nagar before 5 PM.");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleExtract = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    try {
      const response = await apiFetch('/api/ai/donation-ner', {
        method: 'POST',
        data: { text }
      });
      
      setResult(response);
      toast.success('Extraction complete');
    } catch (error: any) {
      toast.error(error.message || 'Failed to extract details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseData = () => {
    if (!result) return;
    
    navigate('/donations', {
      state: {
        prefillData: {
          foodItem: result.food_item || '',
          quantity: result.quantity ? result.quantity.replace(/[^0-9.]/g, '') : '',
          pickupLocation: result.location || ''
        }
      }
    });
  };

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
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl p-4 text-sm text-[#33251E] placeholder:text-[#33251E]/40 focus:outline-none focus:ring-2 focus:ring-[#F07154]/20 min-h-[160px] resize-none relative z-10 shadow-inner"
              placeholder="Enter your donation message here..."
            />
            
            <button 
              onClick={handleExtract}
              disabled={isLoading}
              className="mt-6 bg-[#F07154] hover:bg-[#E05F42] text-white font-semibold py-3 px-6 rounded-full inline-flex items-center justify-center gap-2 w-max transition-colors relative z-10 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              {isLoading ? 'Extracting details...' : 'Extract donation details'}
            </button>

            <div className="mt-8 pt-6 border-t border-[#33251E]/5 relative z-10">
              <h3 className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-4">Try Examples</h3>
              <div className="flex flex-col md:flex-row gap-3">
                {[
                  "We have 50 rotis and dal available at MP Nagar before 5 PM.",
                  "25 kg cooked rice available near AIIMS Bhopal.",
                  "100 food packets available at Arera Colony before 8 PM."
                ].map((example, i) => (
                  <button 
                    key={i} 
                    onClick={() => setText(example)}
                    className="text-left flex-1 p-4 rounded-xl border border-[#33251E]/10 hover:border-[#F07154]/40 hover:bg-[#F07154]/5 transition-colors text-sm text-[#33251E]/80 italic bg-[#FDFBF7]"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Extracted Entities Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">Extracted Entities</span>
                    <h2 className="font-serif text-2xl font-bold text-[#33251E]">What SharePlate understood</h2>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100 mt-1">
                    <Sparkles size={14} />
                    Auto-Extracted
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1">
                  {[
                    { label: "Food Item", value: result.food_item || "Not found" },
                    { label: "Quantity", value: result.quantity || "Not found" },
                    { label: "Location", value: result.location || "Not found" },
                    { label: "Pickup Time", value: result.pickup_time || "Not found" }
                  ].map((entity, i) => (
                    <div key={i} className="border border-[#33251E]/10 rounded-xl p-4 bg-[#FDFBF7]/50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest">{entity.label}</span>
                        {entity.value !== "Not found" && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            Extracted
                          </span>
                        )}
                      </div>
                      <div className={`font-medium ${entity.value === "Not found" ? "text-[#33251E]/40 italic" : "text-[#33251E]"}`}>
                        {entity.value}
                      </div>
                    </div>
                  ))}
                  
                </div>
              </div>

              {/* Auto-Filled Preview Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full">
                <span className="text-[11px] font-bold text-[#F07154] uppercase tracking-[0.1em] mb-1 block">Auto-filled preview</span>
                <h2 className="font-serif text-2xl font-bold text-[#33251E] mb-6">Structured donation, ready to save</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
                  {[
                    { label: "Food Item", value: result.food_item || "—" },
                    { label: "Quantity", value: result.quantity || "—" },
                    { label: "Location", value: result.location || "—" },
                  ].map((field, i) => (
                    <div key={i} className="border border-[#33251E]/10 rounded-xl p-4 bg-[#FDFBF7]">
                      <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">{field.label}</span>
                      <div className="font-medium text-[#33251E] truncate" title={field.value}>{field.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-4 flex flex-wrap items-center gap-4">
                  <button 
                    onClick={handleUseData}
                    className="bg-[#F07154] hover:bg-[#E05F42] text-white font-semibold py-3 px-6 rounded-full inline-flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Save size={18} />
                    Use This Data
                  </button>
                  <div className="md:ml-auto flex items-center gap-2 text-sm font-semibold text-[#33251E]/70 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                    <Check size={18} className="text-emerald-600" />
                    <span className="text-emerald-800">Ready for form</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
