import { Utensils, Leaf, HeartHandshake, Users } from 'lucide-react';

const stats = [
  {
    icon: <Utensils size={20} strokeWidth={2} />,
    value: "125K+",
    label: "MEALS RESCUED"
  },
  {
    icon: <HeartHandshake size={20} strokeWidth={2} />,
    value: "40+",
    label: "NGO PARTNERS"
  },
  {
    icon: <Users size={20} strokeWidth={2} />,
    value: "17",
    label: "DONATION ZONES"
  },
  {
    icon: <Leaf size={20} strokeWidth={2} />,
    value: "AI Powered",
    label: "SAFETY ASSESSMENT"
  }
];

export function ImpactStrip() {
  return (
    <div className="w-full border-y border-[#33251E]/10 bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[#33251E]/10">
          {stats.map((stat, i) => (
            <div key={i} className={`flex items-center gap-4 ${i !== 0 ? 'md:pl-8' : ''}`}>
              <div className="bg-[#F07154]/10 p-3 rounded-full text-[#F07154]">
                {stat.icon}
              </div>
              <div>
                <div className="font-serif text-2xl text-[#33251E] leading-tight mb-1">{stat.value}</div>
                <div className="text-[10px] text-[#33251E]/50 font-semibold tracking-widest uppercase">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
