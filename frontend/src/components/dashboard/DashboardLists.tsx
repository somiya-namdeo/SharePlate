import { Package, Utensils, ArrowRight, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, desc }: any) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/50 rounded-2xl border border-dashed border-[#33251E]/10 min-h-[160px]">
    <Icon size={28} className="text-[#33251E]/20 mb-2" />
    <div className="font-bold text-[#33251E]/60 text-sm">{title}</div>
    <div className="text-xs text-[#33251E]/40 mt-1">{desc}</div>
  </div>
);

const SectionWrapper = ({ title, label, link, children }: any) => (
  <div className="bg-[#FDFBF7] rounded-3xl border border-[#33251E]/10 p-5 flex flex-col h-full shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="text-[10px] uppercase font-bold tracking-wider text-[#33251E]/50 mb-0.5">{label}</div>
        <h2 className="font-serif text-xl text-[#33251E]">{title}</h2>
      </div>
      {link && (
        <Link to={link} className="text-xs font-bold text-[#F07154] hover:text-[#E05F42] transition-colors flex items-center gap-1">
          View all <ArrowRight size={14} />
        </Link>
      )}
    </div>
    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-brand">
      {children}
    </div>
  </div>
);

export function ActiveMatchesList({ matches, role }: { matches: any[], role: string }) {
  return (
    <SectionWrapper title="Active Matches" label="In Progress" link="/matches">
      {matches.length === 0 ? (
        <EmptyState icon={HeartHandshake} title="No active matches" desc="You don't have any matches in progress." />
      ) : (
        matches.map((m) => {
          const otherParty = role === 'ngo' 
            ? m.donor_profile?.organization || m.donor_profile?.full_name || 'Donor'
            : m.ngo_profile?.organization || m.ngo_profile?.full_name || 'NGO';
            
          const foodName = m.donations?.food_category || m.donations?.food_type || 'Food Donation';
          
          return (
            <div key={m.id} className="bg-white p-3 rounded-2xl border border-[#33251E]/5 flex items-center gap-3 hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                <HeartHandshake size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[#33251E] truncate leading-tight mb-0.5">
                  {otherParty}
                </h4>
                <p className="text-xs text-[#33251E]/60 truncate">
                  {foodName} • {m.donations?.quantity ? `${m.donations.quantity} kg` : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                  {m.status}
                </span>
              </div>
            </div>
          );
        })
      )}
    </SectionWrapper>
  );
}

export function RecentRequestsList({ requests }: { requests: any[] }) {
  return (
    <SectionWrapper title="My Recent Requests" label="Your Needs" link="/requests">
      {requests.length === 0 ? (
        <EmptyState icon={Utensils} title="No recent requests" desc="You haven't made any food requests yet." />
      ) : (
        requests.map((r) => (
          <div key={r.id} className="bg-white p-3 rounded-2xl border border-[#33251E]/5 flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Utensils size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[#33251E] truncate leading-tight mb-0.5">
                {r.preferred_food_type || 'Food Request'}
              </h4>
              <p className="text-xs text-[#33251E]/60 truncate">
                {r.meals_needed} meals needed
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {r.urgency_level?.toLowerCase() === 'critical' && <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">Critical</span>}
              {r.urgency_level?.toLowerCase() === 'high' && <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">High</span>}
            </div>
          </div>
        ))
      )}
    </SectionWrapper>
  );
}

export function DonationList({ donations, title, label, emptyDesc }: { donations: any[], title: string, label: string, emptyDesc: string }) {
  return (
    <SectionWrapper title={title} label={label} link="/donations">
      {donations.length === 0 ? (
        <EmptyState icon={Package} title="No donations" desc={emptyDesc} />
      ) : (
        donations.map((d) => (
          <div key={d.id} className="bg-white p-3 rounded-2xl border border-[#33251E]/5 flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 rounded-full bg-[#F07154]/10 flex items-center justify-center text-[#F07154] flex-shrink-0 group-hover:scale-105 transition-transform">
              <Package size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[#33251E] truncate leading-tight mb-0.5">
                {d.food_category || d.food_type || 'Food Donation'}
              </h4>
              <p className="text-xs text-[#33251E]/60 truncate">
                {d.quantity ? `${d.quantity} kg` : ''} 
                {d.quantity && d.address ? ' · ' : ''}
                {d.address || 'Unknown Location'}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {d.urgency_level?.toLowerCase() === 'critical' && <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">Critical</span>}
              {d.urgency_level?.toLowerCase() === 'high' && <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">High</span>}
              {d.safety_status?.toLowerCase() === 'safe' && <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">Safe</span>}
            </div>
          </div>
        ))
      )}
    </SectionWrapper>
  );
}
