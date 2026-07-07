export function RescueFlow() {
  const steps = [
    {
      num: "01",
      title: "Donor submits food details",
      desc: "Form or a natural-language message — both work."
    },
    {
      num: "02",
      title: "AI checks safety & urgency",
      desc: "Shelf life, priority score, recommended action."
    },
    {
      num: "03",
      title: "System matches an NGO",
      desc: "Ranked by distance, demand and compatibility."
    },
    {
      num: "04",
      title: "Pickup is prioritized",
      desc: "Critical items surface first in the queue."
    },
    {
      num: "05",
      title: "Impact is tracked",
      desc: "Meals rescued, waste prevented, CO₂ avoided."
    }
  ];

  return (
    <section id="how-it-works" className="w-full bg-[#3B2B23] py-24 text-white">
      <div className="container mx-auto px-6">
        
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h3 className="text-[#F07154] text-xs font-bold uppercase tracking-widest mb-4 flex justify-center">Rescue Flow</h3>
          <h2 className="font-serif text-5xl leading-tight mb-6">From surplus to served — in five steps.</h2>
          <p className="text-lg text-white/70">
            Every donation is safety-checked, urgency-scored and matched by AI before a volunteer even opens the app.
          </p>
        </div>

        <div className="relative">
          {/* Horizontal Line */}
          <div className="absolute top-7 left-0 w-full h-[1px] bg-white/20 hidden md:block"></div>

          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative z-10">
                <div className="w-14 h-14 bg-[#F07154] rounded-full flex items-center justify-center font-serif text-xl font-medium mb-6">
                  {step.num}
                </div>
                <h4 className="font-bold text-lg mb-2 leading-tight">{step.title}</h4>
                <p className="text-white/60 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
