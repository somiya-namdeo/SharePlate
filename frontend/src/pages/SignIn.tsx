import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, ArrowRight, Sparkles } from 'lucide-react';

export function SignIn() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#33251E 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#F07154]/10 via-[#F07154]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center z-10">
        
        {/* LEFT SIDE - FORM CARD */}
        <div className="flex flex-col justify-center lg:items-end w-full">
          <div className="w-full max-w-[480px]">
            <Link to="/" className="inline-block mb-4 text-sm font-semibold text-[#33251E]/60 hover:text-[#F07154] transition-colors">
              &larr; Back to Home
            </Link>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-10 sm:p-12 rounded-3xl shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] border border-[#33251E]/5 relative"
            >
            <Link to="/" className="inline-flex items-center gap-2 mb-10 text-[#33251E] hover:text-[#F07154] transition-colors">
              <div className="bg-[#F07154] p-1.5 rounded-full text-white">
                <Utensils size={20} strokeWidth={2.5} />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight">SharePlate</span>
            </Link>

            <h1 className="font-serif text-4xl text-[#33251E] mb-3">Welcome back.</h1>
            <p className="text-[#33251E]/70 mb-10 text-sm leading-relaxed">Continue rescuing food and creating impact.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#33251E]/20 rounded group-hover:border-[#F07154] transition-colors bg-[#FDFBF7]">
                    <input type="checkbox" className="peer opacity-0 absolute w-full h-full cursor-pointer" />
                    <div className="hidden peer-checked:block w-2.5 h-2.5 bg-[#F07154] rounded-[2px]"></div>
                  </div>
                  <span className="text-sm text-[#33251E]/80 font-medium select-none">Remember me</span>
                </label>
                <a href="#" className="text-sm font-bold text-[#F07154] hover:text-[#E05F42] transition-colors">
                  Forgot Password?
                </a>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#F07154] hover:bg-[#E05F42] text-white py-4 rounded-xl font-bold transition-all hover:shadow-[0_8px_20px_-8px_rgba(240,113,84,0.6)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-[#33251E]/60">
              Don't have an account? <Link to="/signup" className="text-[#F07154] font-bold hover:text-[#E05F42] transition-colors ml-1">Create one</Link>
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
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm text-[#F07154] text-xs font-bold uppercase tracking-wider mb-6 shadow-sm border border-[#33251E]/5">
                  <Sparkles size={14} />
                  AI Assisted
                </div>
                
                <h2 className="font-serif text-3xl leading-[1.2] text-[#33251E] mb-4">
                  A second chance for food. <br /> A better chance for <span className="text-[#F07154]">someone else.</span>
                </h2>

                <p className="text-[#33251E]/70 text-sm leading-relaxed mb-8">
                  SharePlate helps safe surplus food reach communities before it goes to waste.
                </p>
                
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[#33251E]/5 shadow-sm flex flex-col justify-center">
                    <div className="font-serif text-2xl text-[#33251E] mb-1">128k+</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#33251E]/50 leading-tight">Meals<br/>Rescued</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[#33251E]/5 shadow-sm flex flex-col justify-center">
                    <div className="font-serif text-2xl text-[#33251E] mb-1">96</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#33251E]/50 leading-tight">NGOs<br/>Connected</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[#33251E]/5 shadow-sm flex flex-col justify-center">
                    <div className="font-serif text-2xl text-emerald-600 mb-1">42 t</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#33251E]/50 leading-tight">Waste<br/>Reduced</div>
                  </div>
                </div>

                <div className="bg-white/40 backdrop-blur-sm p-5 rounded-2xl border border-[#33251E]/5 italic text-[#33251E]/80 text-sm font-medium text-center">
                  "Every donation can become a meal."
                </div>
              </div>

            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
