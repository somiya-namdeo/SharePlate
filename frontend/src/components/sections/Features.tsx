import { ShieldCheck, LineChart, SplitSquareHorizontal, ClockAlert, Map, TextSearch, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: <TrendingUp size={20} strokeWidth={2} />,
    title: "Surplus Food Prediction",
    desc: "Predicts surplus food availability using historical donation and food supply patterns."
  },
  {
    icon: <TextSearch size={20} strokeWidth={2} />,
    title: "NLP Donation Information Extraction",
    desc: "Extracts food item, quantity, location, and pickup details from natural-language donation text."
  },
  {
    icon: <LineChart size={20} strokeWidth={2} />,
    title: "Demand Forecasting",
    desc: "Forecasts food demand across locations, time periods, and NGO requirements."
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={2} />,
    title: "Food Safety Classification",
    desc: "Predicts whether donated food is safe to donate, requires review, or should not be redistributed."
  },
  {
    icon: <ClockAlert size={20} strokeWidth={2} />,
    title: "Urgency Priority Engine",
    desc: "Calculates remaining shelf life, urgency score, urgency level, and pickup priority."
  },
  {
    icon: <SplitSquareHorizontal size={20} strokeWidth={2} />,
    title: "Smart Donor-NGO Matching",
    desc: "Matches donors with suitable NGOs based on distance, demand, food type, and urgency."
  },
  {
    icon: <Map size={20} strokeWidth={2} />,
    title: "Map & Analytics Dashboard",
    desc: "Visualizes donation locations, NGO zones, pickup priorities, and impact analytics."
  }
];

export function Features() {
  return (
    <section id="features" className="w-full bg-[#FDFBF7] py-24">
      <div className="container mx-auto px-6">
        
        <div className="mb-16">
          <h3 className="text-[#F07154] text-xs font-bold uppercase tracking-widest mb-4">The Platform</h3>
          <h2 className="font-serif text-5xl text-[#33251E] mb-4">Seven modules. One rescue flow.</h2>
          <p className="text-lg text-[#33251E]/70 max-w-4xl">
            Seven intelligent systems working together to rescue food before it goes to waste.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div key={i} className={`bg-white p-8 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-[#33251E]/5 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 ${i === 6 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
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
