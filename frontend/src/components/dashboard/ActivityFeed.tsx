export function ActivityFeed() {
  const activities = [
    { id: 1, title: 'New donation submitted', desc: 'Dal & Rice (25kg) from Hotel Taj', time: '12m ago', type: 'info' },
    { id: 2, title: 'Donation matched', desc: 'Matched with Aashraya Orphanage', time: '24m ago', type: 'success' },
    { id: 3, title: 'Pickup completed', desc: 'Volunteer AK picked up D-1042', time: '1h ago', type: 'success' },
    { id: 4, title: 'Safety review required', desc: 'Milk cartons (80L) flagged for review', time: '1.5h ago', type: 'warning' },
    { id: 5, title: 'NGO request opened', desc: 'Smile Foundation requested 50 meals', time: '2h ago', type: 'info' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#33251E]/5 p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[#33251E]/50 mb-1">Feed</div>
        <h2 className="font-serif text-2xl text-[#33251E]">Recent activity</h2>
      </div>

      <div className="flex-1 relative overflow-y-auto scrollbar-hide pr-2">
        <div className="absolute top-2 bottom-2 left-[15px] w-px bg-[#33251E]/10 z-0"></div>
        
        <div className="space-y-6 relative z-10 pb-4">
          {activities.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="mt-1">
                {item.type === 'info' && <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div></div>}
                {item.type === 'success' && <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div></div>}
                {item.type === 'warning' && <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div></div>}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-bold text-[#33251E]">{item.title}</h4>
                  <span className="text-[10px] font-bold uppercase text-[#33251E]/40 tracking-wider bg-[#FDFBF7] px-2 py-0.5 rounded-full">{item.time}</span>
                </div>
                <p className="text-xs text-[#33251E]/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
