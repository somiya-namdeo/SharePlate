import { Utensils, ArrowRight } from 'lucide-react';

const queueData = [
  { id: '1', name: 'Dal & Rice (cooked)', donor: 'Bhopal Grand Hotel', location: 'MP Nagar, Bhopal', qty: '25 kg', time: '3h left', priority: 'Critical', safety: 'Safe', status: 'Matched' },
  { id: '2', name: 'Paneer curry', donor: 'Wedding — Ashoka Gardens', location: 'Arera Colony', qty: '12 kg', time: '2h left', priority: 'Critical', safety: 'Review', status: 'Pending' },
  { id: '3', name: 'Fresh bakery bread', donor: 'Sunrise Bakery', location: 'New Market', qty: '40 loaves', time: '14h left', priority: 'Medium', safety: 'Safe', status: 'Scheduled' },
  { id: '4', name: 'Cut fruit boxes', donor: 'IIT Bhopal Mess', location: 'Bhauri', qty: '60 boxes', time: '6h left', priority: 'High', safety: 'Safe', status: 'Matched' },
  { id: '5', name: 'Milk cartons', donor: 'MotherDairy Depot', location: 'Habibganj', qty: '80 L', time: '20h left', priority: 'Medium', safety: 'Safe', status: 'Completed' },
];

export function DonationQueue() {
  return (
    <div className="bg-[#FDFBF7] rounded-3xl border border-[#33251E]/10 p-6 flex flex-col h-full shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
      
      {/* Header - Fixed */}
      <div className="flex flex-shrink-0 items-center justify-between mb-4 relative z-10">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#33251E]/50 mb-1">Rescue Queue</div>
          <h2 className="font-serif text-2xl text-[#33251E]">Urgent pickups</h2>
        </div>
        <button className="text-sm font-semibold text-[#F07154] hover:text-[#E05F42] transition-colors flex items-center gap-1">
          View all <ArrowRight size={16} />
        </button>
      </div>

      {/* List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-3 relative z-10 scrollbar-hide pr-2">
        {queueData.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-[#33251E]/5 flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer">
            
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-[#F07154]/10 flex items-center justify-center text-[#F07154] flex-shrink-0 group-hover:scale-105 transition-transform">
              <Utensils size={20} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[#33251E] truncate mb-1">{item.name}</h4>
              <p className="text-xs text-[#33251E]/60 truncate">{item.donor} · {item.location} · {item.qty}</p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4">
              <div className="text-xs font-semibold text-[#33251E]/50 w-12 text-right">{item.time}</div>
              
              <div className="flex flex-col gap-1 items-end w-24">
                {item.priority === 'Critical' && <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Critical</span>}
                {item.priority === 'High' && <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>High</span>}
                {item.priority === 'Medium' && <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Medium</span>}
                
                {item.safety === 'Safe' && <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">Safe</span>}
                {item.safety === 'Review' && <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">Review</span>}
              </div>

              <div className="w-20 text-right">
                {item.status === 'Matched' && <span className="text-xs font-bold text-[#F07154] bg-[#F07154]/10 px-2.5 py-1 rounded-lg">Matched</span>}
                {item.status === 'Pending' && <span className="text-xs font-bold text-[#33251E]/50 bg-[#33251E]/5 px-2.5 py-1 rounded-lg">Pending</span>}
                {item.status === 'Scheduled' && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Scheduled</span>}
                {item.status === 'Completed' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Completed</span>}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
