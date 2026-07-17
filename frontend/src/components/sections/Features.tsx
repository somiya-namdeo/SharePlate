import { ShieldCheck, SplitSquareHorizontal, ClockAlert, Map, TextSearch, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck size={20} strokeWidth={2} />,
    title: "AI Food Safety Assessment",
    desc: "Predicts food safety status, spoilage risk, confidence score, and estimated shelf life."
  },
  {
    icon: <TextSearch size={20} strokeWidth={2} />,
    title: "NLP Donation Extraction",
    desc: "Extracts food details, quantity, pickup location, and donation information from natural language."
  },
  {
    icon: <ClockAlert size={20} strokeWidth={2} />,
    title: "Urgency Prediction Engine",
    desc: "Calculates urgency level, pickup priority, and remaining shelf life using AI."
  },
  {
    icon: <SplitSquareHorizontal size={20} strokeWidth={2} />,
    title: "Smart NGO Matching",
    desc: "Matches donations with the most suitable NGOs using location, demand, and food category."
  },
  {
    icon: <Map size={20} strokeWidth={2} />,
    title: "Maps & Logistics",
    desc: "Displays donation locations, optimized pickup routes, and nearby NGOs on an interactive map."
  },
  {
    icon: <TrendingUp size={20} strokeWidth={2} />,
    title: "Analytics Dashboard",
    desc: "Visualizes donation trends, rescue impact, food categories, and operational insights."
  }
];

export function Features() {
  return (
    <section id="features" className="w-full bg-[#FDFBF7] py-24">
      <div className="container mx-auto px-6">
        
        <div className="mb-16">
          <h3 className="text-[#F07154] text-xs font-bold uppercase tracking-widest mb-4">The Platform</h3>
          <h2 className="font-serif text-5xl text-[#33251E] mb-4">Six modules. One rescue flow.</h2>
          <p className="text-lg text-[#33251E]/70 max-w-4xl">
            Six intelligent systems working together to rescue food before it goes to waste.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div key={i} className={`bg-white p-8 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-[#33251E]/5 hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 h-full flex flex-col`}>
              <div className="bg-[#F07154]/10 w-12 h-12 rounded-full flex items-center justify-center text-[#F07154] mb-6">
                {feat.icon}
              </div>
              <h4 className="font-serif text-xl text-[#33251E] mb-3">{feat.title}</h4>
              <p className="text-[#33251E]/70 text-sm leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
