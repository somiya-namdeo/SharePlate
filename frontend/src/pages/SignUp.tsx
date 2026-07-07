import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, ArrowRight, Heart, Store, Truck, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'donor' | 'ngo' | 'volunteer'>('donor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#33251E 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-[#F07154]/10 via-[#F07154]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>

      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 xl:gap-16 items-center z-10 my-8">
        
        {/* LEFT SIDE - FORM CARD */}
        <div className="flex flex-col justify-center lg:items-end w-full">
          <div className="w-full max-w-[540px]">
            <Link to="/" className="inline-block mb-4 text-sm font-semibold text-[#33251E]/60 hover:text-[#F07154] transition-colors">
              &larr; Back to Home
            </Link>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 sm:p-10 lg:p-12 rounded-3xl shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] border border-[#33251E]/5 relative"
            >
            <Link to="/" className="inline-flex items-center gap-2 mb-8 text-[#33251E] hover:text-[#F07154] transition-colors">
              <div className="bg-[#F07154] p-1.5 rounded-full text-white">
                <Utensils size={18} strokeWidth={2.5} />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight">SharePlate</span>
            </Link>

            <h1 className="font-serif text-4xl text-[#33251E] mb-2">Join the rescue network.</h1>
            <p className="text-[#33251E]/70 mb-8 text-sm leading-relaxed">Help surplus food reach the communities that need it most.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#33251E]">I am joining as a...</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('donor')}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden",
                      role === 'donor' 
                        ? "border-[#F07154] bg-[#F07154]/5 shadow-sm" 
                        : "border-[#33251E]/10 hover:border-[#33251E]/20 bg-[#FDFBF7]"
                    )}
                  >
                    {role === 'donor' && <div className="absolute top-2 right-2 text-[#F07154]"><CheckCircle2 size={16} /></div>}
                    <Store size={20} className={role === 'donor' ? "text-[#F07154] mb-3" : "text-[#33251E]/40 mb-3"} />
                    <div className="font-bold text-sm mb-1 text-[#33251E]">Donor</div>
                    <div className="text-[11px] text-[#33251E]/60 leading-tight">I have food to donate.</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ngo')}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden",
                      role === 'ngo' 
                        ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                        : "border-[#33251E]/10 hover:border-[#33251E]/20 bg-[#FDFBF7]"
                    )}
                  >
                    {role === 'ngo' && <div className="absolute top-2 right-2 text-emerald-500"><CheckCircle2 size={16} /></div>}
                    <Heart size={20} className={role === 'ngo' ? "text-emerald-500 mb-3" : "text-[#33251E]/40 mb-3"} />
                    <div className="font-bold text-sm mb-1 text-[#33251E]">NGO</div>
                    <div className="text-[11px] text-[#33251E]/60 leading-tight">I distribute food.</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('volunteer')}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden",
                      role === 'volunteer' 
                        ? "border-amber-500 bg-amber-50 shadow-sm" 
                        : "border-[#33251E]/10 hover:border-[#33251E]/20 bg-[#FDFBF7]"
                    )}
                  >
                    {role === 'volunteer' && <div className="absolute top-2 right-2 text-amber-500"><CheckCircle2 size={16} /></div>}
                    <Truck size={20} className={role === 'volunteer' ? "text-amber-500 mb-3" : "text-[#33251E]/40 mb-3"} />
                    <div className="font-bold text-sm mb-1 text-[#33251E]">Volunteer</div>
                    <div className="text-[11px] text-[#33251E]/60 leading-tight">I help with pickups.</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#33251E]">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 rounded-xl border border-[#33251E]/10 bg-[#FDFBF7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F07154]/20 focus:border-[#F07154] transition-all shadow-sm placeholder:text-[#33251E]/30 text-[#33251E]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#33251E]">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="hello@shareplate.org"
                    className="w-full px-4 py-3.5 rounded-xl border border-[#33251E]/10 bg-[#FDFBF7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F07154]/20 focus:border-[#F07154] transition-all shadow-sm placeholder:text-[#33251E]/30 text-[#33251E]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#33251E]">Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-xl border border-[#33251E]/10 bg-[#FDFBF7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F07154]/20 focus:border-[#F07154] transition-all shadow-sm placeholder:text-[#33251E]/30 text-[#33251E]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#33251E]">Confirm Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-xl border border-[#33251E]/10 bg-[#FDFBF7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F07154]/20 focus:border-[#F07154] transition-all shadow-sm placeholder:text-[#33251E]/30 text-[#33251E]"
                  />
                </div>
              </div>

              <div className="pt-2 pb-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 border-2 border-[#33251E]/20 rounded group-hover:border-[#F07154] transition-colors bg-[#FDFBF7] flex-shrink-0">
                    <input type="checkbox" required className="peer opacity-0 absolute w-full h-full cursor-pointer" />
                    <div className="hidden peer-checked:block w-2.5 h-2.5 bg-[#F07154] rounded-[2px]"></div>
                  </div>
                  <span className="text-sm text-[#33251E]/70 font-medium leading-relaxed select-none">
                    I agree to the <a href="#" className="text-[#33251E] font-bold hover:text-[#F07154] transition-colors">Terms of Service</a> and <a href="#" className="text-[#33251E] font-bold hover:text-[#F07154] transition-colors">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#F07154] hover:bg-[#E05F42] text-white py-4 rounded-xl font-bold transition-all hover:shadow-[0_8px_20px_-8px_rgba(240,113,84,0.6)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Create Account
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-[#33251E]/60">
              Already have an account? <Link to="/signin" className="text-[#F07154] font-bold hover:text-[#E05F42] transition-colors ml-1">Sign In</Link>
            </p>
          </motion.div>
          </div>
        </div>

        {/* RIGHT SIDE - VISUAL PANEL */}
        <div className="hidden lg:flex justify-start items-center">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-[500px]"
          >
            <div className="bg-gradient-to-bl from-[#F5E6DA] via-[#FDFBF7] to-[#E8F0EA] p-10 rounded-3xl border border-[#33251E]/5 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
              
              <div className="relative z-10 w-full max-w-md mx-auto">
                
                <h2 className="font-serif text-3xl leading-[1.2] text-[#33251E] mb-8">
                  A second chance for food. <br /> A better chance for <span className="text-[#F07154]">someone else.</span>
                </h2>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm text-emerald-600 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm border border-[#33251E]/5">
                  <Sparkles size={14} />
                  Match Found
                </div>
                
                {/* Donation Matched Preview Card */}
                <div className="bg-white p-5 rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-[#33251E]/5 mb-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#33251E]/5">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#33251E]/40 mb-1">Donor</div>
                      <div className="font-bold text-[#33251E] text-sm">Hotel Taj Lakefront</div>
                    </div>
                    <ArrowRight className="text-[#F07154] opacity-50 w-4 h-4" />
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-[#33251E]/40 mb-1">NGO</div>
                      <div className="font-bold text-[#33251E] text-sm">Aashraya Orphanage</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-[#FDFBF7] p-2.5 rounded-xl border border-[#33251E]/5 mb-4">
                    <span className="text-xs font-bold text-[#33251E]">Fresh Dal & Roti</span>
                    <span className="text-xs text-[#33251E]/60">~ 80 meals</span>
                  </div>

                  <div className="flex gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Safe to consume
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold bg-amber-50 border border-amber-100 text-amber-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Urgent Pickup
                    </span>
                  </div>
                </div>

                {/* Mini rescue flow */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-[#33251E]/5 shadow-sm">
                  <div className="flex justify-between items-center relative">
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#33251E]/10 z-0"></div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 h-8 rounded-full bg-[#33251E] text-white flex items-center justify-center text-xs shadow-md"><CheckCircle2 size={16} /></div>
                      <span className="text-[9px] font-bold text-[#33251E] uppercase">Donate</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 h-8 rounded-full bg-[#F07154] text-white flex items-center justify-center text-xs shadow-md"><Sparkles size={14} /></div>
                      <span className="text-[9px] font-bold text-[#F07154] uppercase">Check</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#33251E]/10 text-[#33251E]/40 flex items-center justify-center text-xs shadow-sm"><span className="w-2 h-2 rounded-full bg-[#33251E]/20"></span></div>
                      <span className="text-[9px] font-bold text-[#33251E]/50 uppercase">Match</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#33251E]/10 text-[#33251E]/40 flex items-center justify-center text-xs shadow-sm"><span className="w-2 h-2 rounded-full bg-[#33251E]/20"></span></div>
                      <span className="text-[9px] font-bold text-[#33251E]/50 uppercase">Deliver</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
