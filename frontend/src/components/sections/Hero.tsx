import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardPreview } from '../ui/DashboardPreview';

export function Hero() {
  return (
    <section className="relative w-full pt-20 pb-16 overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div className="max-w-xl z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F07154]/10 text-[#F07154] text-xs font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F07154] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F07154]"></span>
            </span>
            AI-Powered Food Redistribution Platform
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-6xl leading-[1.1] text-[#33251E] mb-6"
          >
            A second chance for food. <br/> A better chance for <span className="text-[#F07154]">someone else</span>.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#33251E]/70 mb-10 leading-relaxed"
          >
            SharePlate combines AI-powered food safety assessment, urgency scoring, NLP-assisted donation processing, intelligent NGO matching, and live logistics to redistribute surplus food safely, efficiently, and transparently.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mb-16"
          >
            <Link to="/signup" className="bg-[#F07154] hover:bg-[#E05F42] text-white px-6 py-3.5 rounded-full text-base font-medium transition-colors flex items-center gap-2">
              Start Donating
              <span className="text-xl leading-none">&rarr;</span>
            </Link>
          </motion.div>
        </div>

        {/* Right Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative w-full mx-auto z-10"
        >
          {/* Subtle gradient blob behind card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#F07154]/20 to-emerald-200/20 blur-3xl -z-10 rounded-full" />
          
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}
