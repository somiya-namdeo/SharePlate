import { Navbar } from '../components/layout/Navbar';
import { Hero } from '../components/sections/Hero';
import { RescueFlow } from '../components/sections/RescueFlow';
import { Features } from '../components/sections/Features';
import { ForNGOs } from '../components/sections/ForNGOs';
import { ImpactStrip } from '../components/sections/ImpactStrip';
import { Footer } from '../components/layout/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#33251E] selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Navbar />
      <main>
        <Hero />
        <ImpactStrip />
        <RescueFlow />
        <Features />
        <ForNGOs />
      </main>
      <Footer />
    </div>
  );
}
