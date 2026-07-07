import { Activity, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const insights = [
  { id: 1, text: 'Critical dairy donations increased by 18% today.', type: 'red', icon: AlertCircle },
  { id: 2, text: 'Zone B has high dinner demand tonight (7–9 PM).', type: 'orange', icon: Activity },
  { id: 3, text: '3 donations require manual review before dispatch.', type: 'yellow', icon: AlertTriangle },
  { id: 4, text: 'Surplus bakery items should be redirected to Zone A.', type: 'green', icon: Info },
];

export function InsightsPanel() {
  return (
    <div className="bg-white rounded-3xl border border-[#33251E]/5 p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] h-auto xl:h-full flex flex-col relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F07154]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      
      {/* Header - Fixed */}
      <div className="flex flex-shrink-0 items-start justify-between mb-6 relative z-10">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#33251E]/50 mb-1">AI Insights</div>
          <h2 className="font-serif text-2xl text-[#33251E] leading-tight">What SharePlate noticed</h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F07154]/10 text-[#F07154] text-[9px] font-bold uppercase tracking-wider border border-[#F07154]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F07154] animate-pulse"></span>
          AI Assisted
        </div>
      </div>

      {/* List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-brand relative z-10">
        {insights.map((insight) => {
          const Icon = insight.icon;
          let colorClasses = "";
          
          switch (insight.type) {
            case 'red':
              colorClasses = "bg-red-50/50 border-red-100 text-red-700";
              break;
            case 'orange':
              colorClasses = "bg-orange-50/50 border-orange-100 text-orange-700";
              break;
            case 'yellow':
              colorClasses = "bg-amber-50/50 border-amber-100 text-amber-700";
              break;
            case 'green':
              colorClasses = "bg-emerald-50/50 border-emerald-100 text-emerald-700";
              break;
          }

          return (
            <div key={insight.id} className={`p-4 rounded-2xl border flex gap-3 items-start transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-default ${colorClasses}`}>
              <div className="mt-0.5 bg-white rounded-full p-1 shadow-sm opacity-90 flex-shrink-0">
                <Icon size={14} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-semibold leading-relaxed tracking-tight text-opacity-90">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
