import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColorClass: string;
}

export function StatCard({ title, value, trend, subtitle, icon: Icon, iconColorClass }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -2, boxShadow: "0 8px 24px -8px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white p-5 rounded-3xl border border-[#33251E]/5 shadow-sm transition-colors flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-[#FDFBF7] border border-[#33251E]/5", iconColorClass)}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      
      <div>
        <h3 className="font-serif text-3xl text-[#33251E] leading-none mb-1.5">{value}</h3>
        <p className="text-xs font-bold uppercase tracking-wider text-[#33251E]/60 mb-1">{title}</p>
        {subtitle && <p className="text-[10px] font-medium text-[#33251E]/50">{subtitle}</p>}
        {trend && <p className="text-[10px] font-bold uppercase tracking-wider text-[#F07154] mt-1">{trend}</p>}
      </div>
    </motion.div>
  );
}
