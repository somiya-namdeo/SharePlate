import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api';
import { setToken, setUser } from '../lib/auth';

export function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        data: { email, password }
      });
      
      if (data.success && data.data) {
        if (data.data.session?.access_token) {
          setToken(data.data.session.access_token);
        }
        if (data.data.user) {
          setUser(data.data.user);
        }
        toast.success(data.message || 'Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
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
              <img src="/logo.png" alt="SharePlate Logo" className="w-8 h-8 object-contain flex-shrink-0" />
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
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#33251E]/10 bg-[#FDFBF7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F07154]/20 focus:border-[#F07154] transition-all shadow-sm placeholder:text-[#33251E]/30 text-[#33251E]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#33251E]">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[#33251E]/10 bg-[#FDFBF7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F07154]/20 focus:border-[#F07154] transition-all shadow-sm placeholder:text-[#33251E]/30 text-[#33251E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#33251E]/40 hover:text-[#F07154] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-1 pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#33251E]/20 rounded group-hover:border-[#F07154] transition-colors bg-[#FDFBF7] flex-shrink-0">
                    <input type="checkbox" className="peer opacity-0 absolute w-full h-full cursor-pointer" />
                    <div className="hidden peer-checked:block w-2.5 h-2.5 bg-[#F07154] rounded-[2px]"></div>
                  </div>
                  <span className="text-sm text-[#33251E]/80 font-medium select-none">Remember me</span>
                </label>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F07154] hover:bg-[#E05F42] text-white py-4 rounded-xl font-bold transition-all hover:shadow-[0_8px_20px_-8px_rgba(240,113,84,0.6)] hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
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
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm text-[#F07154] text-xs font-bold tracking-wider mb-6 shadow-sm border border-[#33251E]/5">
                  <Sparkles size={14} />
                  AI Assisted
                </div>
                
                <h2 className="font-serif text-3xl leading-[1.2] text-[#33251E] mb-4">
                  A second chance for food. <br /> A better chance for <span className="text-[#F07154]">someone else.</span>
                </h2>

                <p className="text-[#33251E]/70 text-sm leading-relaxed mb-8">
                  AI-powered food safety assessment, urgency prediction, intelligent NGO matching, and live logistics help surplus food reach communities safely and efficiently.
                </p>
                
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[#33251E]/5 shadow-sm flex flex-col justify-center">
                    <div className="font-serif text-2xl text-[#33251E] mb-1">125K+</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#33251E]/50 leading-tight">Meals<br/>Rescued</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[#33251E]/5 shadow-sm flex flex-col justify-center">
                    <div className="font-serif text-2xl text-[#33251E] mb-1">40+</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#33251E]/50 leading-tight">NGO<br/>Partners</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[#33251E]/5 shadow-sm flex flex-col justify-center">
                    <div className="font-serif text-2xl text-[#33251E] mb-1">17</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#33251E]/50 leading-tight">Donation<br/>Zones</div>
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
