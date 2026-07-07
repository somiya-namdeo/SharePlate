import { Utensils } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const scrollToSection = (id: string) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#33251E]/5">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#F07154] p-1.5 rounded-full text-white">
              <Utensils size={20} strokeWidth={2.5} />
            </div>
            <span className="font-serif text-2xl font-medium tracking-tight text-[#33251E]">
              SharePlate
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#33251E]/70">
          <button onClick={() => scrollToSection('features')} className="hover:text-[#F07154] transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#F07154] transition-colors">
            How it works
          </button>
          <button onClick={() => scrollToSection('for-ngos')} className="hover:text-[#F07154] transition-colors">
            For NGOs
          </button>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/signin" className="text-sm font-medium text-[#33251E] hover:text-[#33251E]/70 transition-colors">
            Sign in
          </Link>
          <Link to="/signup" className="bg-[#F07154] hover:bg-[#E05F42] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
            Start donating
            <span className="text-lg leading-none">&rarr;</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
