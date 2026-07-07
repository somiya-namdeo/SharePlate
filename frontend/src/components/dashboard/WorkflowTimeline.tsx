import { cn } from '../../lib/utils';

const steps = [
  { id: 1, label: 'Submitted', status: 'completed' },
  { id: 2, label: 'Safety checked', status: 'completed' },
  { id: 3, label: 'Prioritized', status: 'completed' },
  { id: 4, label: 'Matched', status: 'completed' },
  { id: 5, label: 'Picked up', status: 'current' },
  { id: 6, label: 'Delivered', status: 'pending' },
];

export function WorkflowTimeline() {
  return (
    <div className="bg-[#FDFBF7] rounded-3xl border border-[#33251E]/10 p-6 shadow-sm h-full flex flex-col relative overflow-hidden">
      
      <div className="flex items-center justify-between mb-auto">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#33251E]/50 mb-1">Signature Workflow</div>
          <h2 className="font-serif text-2xl text-[#33251E]">Rescue flow · D-1042 · Dal & Rice</h2>
        </div>
        <div className="bg-white border border-[#33251E]/10 px-3 py-1.5 rounded-full shadow-sm text-[9px] font-bold text-[#F07154] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F07154]"></span> Auto Priority
        </div>
      </div>

      <div className="relative w-full flex-1 flex flex-col justify-center">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-[#33251E]/10 -translate-y-[10px] z-0"></div>
        <div className="absolute top-1/2 left-8 w-[80%] h-[2px] bg-[#F07154] -translate-y-[10px] z-0"></div>

        {/* Steps */}
        <div className="flex justify-between relative z-10">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-3 w-24">
              
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors",
                step.status === 'completed' ? "bg-[#F07154] text-white border-2 border-white" :
                step.status === 'current' ? "bg-white text-[#F07154] border-2 border-[#F07154]" :
                "bg-white text-[#33251E]/40 border-2 border-[#33251E]/10"
              )}>
                {step.id}
              </div>
              
              <div className={cn(
                "text-xs font-semibold text-center leading-tight",
                step.status === 'completed' || step.status === 'current' ? "text-[#33251E]" : "text-[#33251E]/40"
              )}>
                {step.label}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
