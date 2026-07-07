import { PackageOpen, AlertTriangle, Utensils, HeartHandshake, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { StatCard } from '../components/dashboard/StatCard';
import { DonationQueue } from '../components/dashboard/DonationQueue';
import { InsightsPanel } from '../components/dashboard/InsightsPanel';
import { MapCard } from '../components/dashboard/MapCard';
import { ForecastChart } from '../components/dashboard/ForecastChart';
import { WorkflowTimeline } from '../components/dashboard/WorkflowTimeline';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Overview" />
        
      <main className="ml-[280px] pt-[112px] pb-12 px-8 max-w-[1600px] mx-auto flex flex-col gap-8">
          
        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard title="Active Donations" value="24" trend="+8 today" icon={PackageOpen} iconColorClass="text-[#F07154]" />
            <StatCard title="Critical Pickups" value="6" trend="2 unresolved" icon={AlertTriangle} iconColorClass="text-red-600" />
            <StatCard title="Meals Rescued Today" value="412" trend="+12% vs yday" icon={Utensils} iconColorClass="text-emerald-600" />
            <StatCard title="NGO Requests" value="9" trend="3 open" icon={HeartHandshake} iconColorClass="text-[#F07154]" />
            <StatCard title="Predicted Demand" value="684" trend="For tonight" icon={TrendingUp} iconColorClass="text-emerald-600" />
            <StatCard title="Waste Prevented" value="82 kg" trend="Past 24h" icon={ShieldCheck} iconColorClass="text-emerald-600" />
          </div>

        {/* Row 2: Queue & Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-[65%_35%] gap-6 h-auto xl:h-[520px]">
          <div className="h-full xl:max-h-[520px]">
            <DonationQueue />
          </div>
          <div className="h-full xl:max-h-[520px]">
            <InsightsPanel />
          </div>
        </div>

        {/* Row 3: Map & Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-[35%_65%] gap-6 h-[380px]">
          <div className="h-full max-h-[380px]">
            <MapCard />
          </div>
          <div className="h-full max-h-[380px]">
            <ForecastChart />
          </div>
        </div>

        {/* Row 4: Workflow & Feed */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 h-[280px]">
          <div className="h-full max-h-[280px]">
            <WorkflowTimeline />
          </div>
          <div className="h-full max-h-[280px]">
            <ActivityFeed />
          </div>
        </div>

        {/* Row 5: Bottom Alert */}
        <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-6 flex items-center justify-center gap-5 text-left shadow-sm w-full h-[150px] mt-4 relative z-10">
          <div className="w-14 h-14 bg-emerald-500 rounded-full text-white flex items-center justify-center shadow-md flex-shrink-0">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-emerald-900 mb-1.5 leading-tight">No unresolved critical alerts. Great work!</h3>
            <p className="text-emerald-700 font-medium">We'll notify the team immediately when a new critical pickup appears.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
