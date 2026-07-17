import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      const sections = ['features', 'how-it-works', 'for-ngos'];
      let current = '';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = section;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);
  
  const scrollToSection = (id: string) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#33251E]/5">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 md:gap-4 group">
            <img src="/logo.png" alt="SharePlate Logo" className="w-10 h-10 md:w-12 md:h-12 lg:w-[52px] lg:h-[52px] object-contain flex-shrink-0 group-hover:scale-105 transition-transform" />
            <span className="font-serif text-2xl md:text-3xl lg:text-[32px] font-bold tracking-tight text-[#33251E] group-hover:text-[#F07154] transition-colors pt-0.5">
              SharePlate
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#33251E]/70">
          <button 
            onClick={() => scrollToSection('features')} 
            className={`transition-colors ${activeSection === 'features' ? 'text-[#F07154]' : 'hover:text-[#F07154]'}`}
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')} 
            className={`transition-colors ${activeSection === 'how-it-works' ? 'text-[#F07154]' : 'hover:text-[#F07154]'}`}
          >
            How it works
          </button>
          <button 
            onClick={() => scrollToSection('for-ngos')} 
            className={`transition-colors ${activeSection === 'for-ngos' ? 'text-[#F07154]' : 'hover:text-[#F07154]'}`}
          >
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
