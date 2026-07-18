export function RescueFlow() {
  const steps = [
    {
      num: "01",
      title: "Donor submits donation",
      desc: "Food details are entered manually or extracted using NLP."
    },
    {
      num: "02",
      title: "AI predicts safety & urgency",
      desc: "Food safety, remaining shelf life, urgency level, and pickup priority are assessed."
    },
    {
      num: "03",
      title: "AI matches the best NGO",
      desc: "Matching is based on distance, demand, food type, and availability."
    },
    {
      num: "04",
      title: "Pickup is prioritized",
      desc: "Urgent donations are surfaced first for volunteers."
    },
    {
      num: "05",
      title: "Impact is recorded",
      desc: "Meals rescued, waste reduced, and distribution analytics are tracked."
    }
  ];

  return (
    <section id="how-it-works" className="w-full bg-[#3B2B23] py-24 text-white">
      <div className="container mx-auto px-6">

        <div className="max-w-3xl mx-auto text-center mb-20">
          <h3 className="text-[#F07154] text-xs font-bold uppercase tracking-widest mb-4 flex justify-center">Rescue Flow</h3>
          <h2 className="font-serif text-5xl leading-tight mb-6">From surplus to served — in five steps.</h2>
          <p className="text-lg text-white/70">
            Every donation passes through AI-powered safety analysis, urgency prediction, intelligent NGO matching, and logistics coordination before pickup.
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
