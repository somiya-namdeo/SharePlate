import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  iconColorClass: string;
}

export function StatCard({ title, value, trend, icon: Icon, iconColorClass }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 16px 32px -12px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white p-6 rounded-3xl border border-[#33251E]/5 shadow-sm transition-colors h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-[#FDFBF7] border border-[#33251E]/5", iconColorClass)}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <ArrowUpRight size={16} className="text-[#33251E]/30" />
      </div>
      
      <div>
        <h3 className="font-serif text-3xl text-[#33251E] leading-none mb-2">{value}</h3>
        <p className="text-xs font-bold uppercase tracking-wider text-[#33251E]/60 mb-2">{title}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#F07154]">{trend}</p>
      </div>
    </motion.div>
  );
}
