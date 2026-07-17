import { useState, useEffect } from 'react';
import { PackageOpen, Utensils, HeartHandshake, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { StatCard } from '../components/dashboard/StatCard';
import { ActiveMatchesList, RecentRequestsList, DonationList } from '../components/dashboard/DashboardLists';
import { apiFetch } from '../lib/api';
import { getUser } from '../lib/auth';
import toast from 'react-hot-toast';

export function Dashboard() {
  const user = getUser();
  const role = user?.user_metadata?.role || 'donor';
  const userId = user?.id;

  // Data states
  const [activeMatches, setActiveMatches] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [availableDonations, setAvailableDonations] = useState<any[]>([]);
  const [activeDonations, setActiveDonations] = useState<any[]>([]);
  const [completedDonations, setCompletedDonations] = useState<any[]>([]);

  // Computed KPIs
  const [kpis, setKpis] = useState({
    activeRequests: 0,
    matchesInProgress: 0,
    mealsRequested: 0,
    mealsRescued: 0,
    activeDonations: 0,
    totalRescues: 0,
    quantityRescued: 0,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {

        
        let fetchedMatches: any[] = [];
        let fetchedRequests: any[] = [];
        let fetchedDonations: any[] = [];

        // Fetch Matches
        const matchRes = await apiFetch(`/api/matches/me`);
        if (matchRes.data && Array.isArray(matchRes.data)) {
          fetchedMatches = matchRes.data;
        }

        if (role === 'ngo') {
          // Fetch Available Donations
          const donRes = await apiFetch('/api/donations/');
          if (donRes.data && Array.isArray(donRes.data)) {
            fetchedDonations = donRes.data;
          }
          // Fetch My Requests
          const reqRes = await apiFetch('/api/requests/me');
          if (reqRes.data && Array.isArray(reqRes.data)) {
            fetchedRequests = reqRes.data;
          }
        } else {
          // Fetch My Donations
          const donRes = await apiFetch('/api/donations/me');
          if (donRes.data && Array.isArray(donRes.data)) {
            fetchedDonations = donRes.data;
          }
        }

        // --- Process Data for Lists --- //
        
        // Active Matches
        const pendingMatches = fetchedMatches.filter((m: any) => ['pending', 'scheduled'].includes(m.status?.toLowerCase()));
        setActiveMatches(pendingMatches.slice(0, 5));

        // Available Donations (NGO)
        if (role === 'ngo') {
          const pendingDonations = fetchedDonations
            .filter((d: any) => d.status?.toLowerCase() === 'pending')
            .sort((a: any, b: any) => {
              const weights: Record<string, number> = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
              const wA = weights[a.urgency_level?.toLowerCase()] || 0;
              const wB = weights[b.urgency_level?.toLowerCase()] || 0;
              return wB - wA;
            });
          setAvailableDonations(pendingDonations.slice(0, 5));
        }

        // Active & Completed Donations (Donor)
        if (role === 'donor') {
          const myPendingDonations = fetchedDonations
            .filter((d: any) => d.status?.toLowerCase() === 'pending')
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setActiveDonations(myPendingDonations.slice(0, 5));

          const myCompleted = fetchedDonations
            .filter((d: any) => d.status?.toLowerCase() === 'completed')
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setCompletedDonations(myCompleted.slice(0, 5));
        }

        // Recent Requests (NGO)
        if (role === 'ngo') {
          const myRequests = fetchedRequests
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setRecentRequests(myRequests.slice(0, 5));
        }


        // --- Process KPIs --- //
        const completedMatches = fetchedMatches.filter((m: any) => m.status?.toLowerCase() === 'completed');

        if (role === 'ngo') {
          const activeReqs = fetchedRequests.filter((r: any) => r.status?.toLowerCase() === 'open');
          
          let mealsReq = 0;
          fetchedRequests.forEach((r: any) => { mealsReq += (r.meals_needed || 0); });
          
          let mealsRes = 0;
          completedMatches.forEach((m: any) => {
            if (m.ngo_requests && m.ngo_requests.meals_needed) {
              mealsRes += m.ngo_requests.meals_needed;
            }
          });

          setKpis((prev) => ({
            ...prev,
            activeRequests: activeReqs.length,
            matchesInProgress: pendingMatches.length,
            mealsRequested: mealsReq,
            mealsRescued: mealsRes,
          }));

        } else {
          // Donor KPIs
          const activeDons = fetchedDonations.filter((d: any) => d.status?.toLowerCase() === 'pending');
          
          let quantRes = 0;
          completedMatches.forEach((m: any) => {
            if (m.donations && m.donations.quantity) {
              quantRes += m.donations.quantity;
            }
          });

          setKpis((prev) => ({
            ...prev,
            activeDonations: activeDons.length,
            matchesInProgress: pendingMatches.length,
            totalRescues: completedMatches.length,
            quantityRescued: quantRes,
          }));
        }

      } catch (err: any) {
        toast.error(err.message || 'Failed to load dashboard data');
      } finally {

      }
    };

    fetchData();
  }, [userId, role]);

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Overview" />
        
      <main className="ml-0 md:ml-[280px] pt-[112px] pb-12 px-4 md:px-8 max-w-[1200px] mx-auto flex flex-col gap-8">
          
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {role === 'ngo' ? (
            <>
              <StatCard title="Active Requests" value={kpis.activeRequests.toString()} trend="" subtitle={kpis.activeRequests === 0 ? "No open requests" : "Open requests"} icon={PackageOpen} iconColorClass="text-blue-600" />
              <StatCard title="Matches in Progress" value={kpis.matchesInProgress.toString()} trend="" subtitle={kpis.matchesInProgress === 0 ? "Waiting for new matches" : "Active matching"} icon={HeartHandshake} iconColorClass="text-amber-600" />
              <StatCard title="Meals Requested" value={kpis.mealsRequested.toString()} trend="" subtitle={kpis.mealsRequested === 0 ? "No requested meals" : "Total meals requested"} icon={Utensils} iconColorClass="text-[#33251E]/60" />
              <StatCard title="Meals Rescued" value={kpis.mealsRescued.toString()} trend="" subtitle={kpis.mealsRescued === 0 ? "No rescued meals yet" : "Completed rescues"} icon={CheckCircle2} iconColorClass="text-emerald-600" />
            </>
          ) : (
            <>
              <StatCard title="Active Donations" value={kpis.activeDonations.toString()} trend="" subtitle={kpis.activeDonations === 0 ? "No pending donations" : "Pending donations"} icon={PackageOpen} iconColorClass="text-blue-600" />
              <StatCard title="Matches in Progress" value={kpis.matchesInProgress.toString()} trend="" subtitle={kpis.matchesInProgress === 0 ? "Waiting for new matches" : "Active matching"} icon={HeartHandshake} iconColorClass="text-amber-600" />
              <StatCard title="Total Rescues" value={kpis.totalRescues.toString()} trend="" subtitle={kpis.totalRescues === 0 ? "No completed rescues yet" : "Completed donations"} icon={CheckCircle2} iconColorClass="text-emerald-600" />
              <StatCard title="Quantity Rescued" value={`${kpis.quantityRescued} kg`} trend="" subtitle={kpis.quantityRescued === 0 ? "No rescued quantity yet" : "Total food rescued"} icon={ShieldCheck} iconColorClass="text-emerald-600" />
            </>
          )}
        </div>

        {/* Content Row */}
        {role === 'ngo' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            <div className="min-w-0 w-full">
              <ActiveMatchesList matches={activeMatches} role={role} title="Recent Matches" className="h-[380px]" />
            </div>
            <div className="min-w-0 w-full">
              <RecentRequestsList requests={recentRequests} className="h-[380px]" />
            </div>
            <div className="min-w-0 w-full md:col-span-2 xl:col-span-1">
              <DonationList 
                donations={availableDonations} 
                title="Available Donations" 
                label="Claim Food" 
                emptyTitle="No Available Donations"
                emptyDesc="No pending donations available right now." 
                className="h-[380px]"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            <div className="min-w-0 w-full">
              <DonationList 
                donations={activeDonations} 
                title="Recent Donations" 
                label="Pending Match" 
                emptyTitle="No Active Donations"
                emptyDesc="You haven't created any donations yet. Start by adding your first food donation." 
                actionLabel="Add Donation"
                actionLink="/donations"
                className="h-[380px]"
              />
            </div>
            <div className="min-w-0 w-full">
              <ActiveMatchesList matches={activeMatches} role={role} title="Recent Matches" className="h-[380px]" />
            </div>
            <div className="min-w-0 w-full md:col-span-2 xl:col-span-1">
              <DonationList 
                donations={completedDonations} 
                title="Recent Completed Rescues" 
                label="Completed" 
                emptyTitle="No Completed Rescues"
                emptyDesc="No completed donations yet." 
                className="h-[380px]"
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
