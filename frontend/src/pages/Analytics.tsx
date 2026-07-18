import { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Utensils, Leaf, ShieldCheck, Users, Flame, TrendingUp, ChevronDown, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { getUser } from '../lib/auth';
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid
} from 'recharts';

// Types representing the backend response
interface AnalyticsData {
  filters: { period: string; city: string | null; category: string | null };
  available_filters: { cities: string[]; categories: string[] };
  kpis: {
    successful_rescues: { value: number; trend_percent: number | null; unit?: string };
    quantity_rescued: { value: number; trend_percent: number | null; unit?: string };
    active_requests: { value: number; trend_percent: number | null; unit?: string };
    critical_resolved_percent: { value: number | string; trend_percent: number | null; unit?: string };
    ngos_served?: { value: number; trend_percent: number | null };
  };
  donations_over_time: { date: string; count: number }[];
  food_categories: { category: string; count: number; percentage: number }[];
  safety_distribution: { safety_status: string; count: number; percentage: number }[];
  urgency_distribution: { urgency_level: string; count: number }[];
  requests_by_city: { city: string; count: number }[];
  operational_insights: {
    most_donated_category: string | null;
    highest_demand_city: string | null;
    rescue_completion_rate_percent: number | null;
    unsafe_rate_percent: number | null;
    critical_requests_today: number;
  };
}

export function Analytics() {
  const user = getUser();
  const role = user?.user_metadata?.role;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [period, setPeriod] = useState('30d');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const user = getUser();
        const role = user?.user_metadata?.role;
        
        let fetchedDonations: any[] = [];
        let fetchedRequests: any[] = [];
        let fetchedMatches: any[] = [];

        if (role === 'donor') {
          const [dRes, mRes] = await Promise.all([
             apiFetch('/api/donations/me'),
             apiFetch('/api/matches/me')
          ]);
          fetchedDonations = Array.isArray(dRes) ? dRes : (dRes.data || []);
          fetchedMatches = (mRes.success && Array.isArray(mRes.data)) ? mRes.data : [];
        } else if (role === 'ngo') {
          const [rRes, mRes] = await Promise.all([
             apiFetch('/api/requests/me'),
             apiFetch('/api/matches/me')
          ]);
          fetchedRequests = Array.isArray(rRes) ? rRes : (rRes.data || []);
          fetchedMatches = (mRes.success && Array.isArray(mRes.data)) ? mRes.data : [];
        }

        // Apply Time Filter
        const now = new Date();
        const pastDate = new Date();
        if (period === '7d') pastDate.setDate(now.getDate() - 7);
        else if (period === '30d') pastDate.setDate(now.getDate() - 30);
        else if (period === '90d') pastDate.setDate(now.getDate() - 90);
        else pastDate.setFullYear(2000);

        const isWithinPeriod = (dateStr: string) => new Date(dateStr) >= pastDate;
        
        // Filter Collections
        const donations = fetchedDonations.filter(d => isWithinPeriod(d.created_at));
        const requests = fetchedRequests.filter(r => isWithinPeriod(r.created_at));
        const matches = fetchedMatches.filter(m => isWithinPeriod(m.created_at));
        const completedMatches = matches.filter(m => (m.status || '').toLowerCase() === 'completed');

        const extractCity = (address: string) => {
            if (!address) return 'Unknown';
            const parts = address.split(',').map(p => p.trim());
            if (parts.length >= 3) {
                return parts[parts.length - 2];
            } else if (parts.length === 2) {
                return parts[0];
            }
            return parts[0];
        };

        // Extract Filter Options
        const allCities = new Set<string>();
        const allCategories = new Set<string>();
        fetchedDonations.forEach(d => {
            if (d.address) allCities.add(extractCity(d.address));
            if (d.food_category) allCategories.add(d.food_category);
        });
        fetchedRequests.forEach(r => {
            if (r.address) allCities.add(extractCity(r.address));
            if (r.preferred_food_type) allCategories.add(r.preferred_food_type);
        });

        // Compute KPIs
        let quantityRescued = 0;
        const terminalStatuses = ['completed', 'fulfilled', 'cancelled', 'expired'];
        let activeReqs = role === 'ngo' 
            ? requests.filter(r => (r.status || '').toLowerCase() === 'open').length 
            : donations.filter(d => !terminalStatuses.includes((d.status || '').toLowerCase())).length;
        
        if (role === 'donor') {
           completedMatches.forEach(m => {
              quantityRescued += (m.quantity || 0);
           });
        } else {
           completedMatches.forEach(m => {
              quantityRescued += (m.quantity || 0);
           });
        }

        // Compute Distributions
        const catCounts: Record<string, number> = {};
        const safeCounts: Record<string, number> = { 'safe': 0, 'review': 0, 'unsafe': 0 };
        const urgCounts: Record<string, number> = { 'low': 0, 'medium': 0, 'high': 0, 'critical': 0 };
        const cityCounts: Record<string, number> = {};
        
        let criticalTotal = 0;
        let criticalResolved = 0;

        

        if (role === 'donor') {
           donations.forEach(item => {
              if (item.food_category) catCounts[item.food_category] = (catCounts[item.food_category] || 0) + 1;
              
              const urg = (item.urgency_level || 'medium').toLowerCase();
              if (urgCounts[urg] !== undefined) urgCounts[urg]++;
              if (urg === 'critical') {
                  criticalTotal++;
                  if ((item.status || '').toLowerCase() === 'completed') criticalResolved++;
              }
              
              const safe = (item.safety_status || 'review').toLowerCase();
              if (safeCounts[safe] !== undefined) safeCounts[safe]++;
              
              const city = item.address ? extractCity(item.address) : (item.city_tier || 'Unknown');
              cityCounts[city] = (cityCounts[city] || 0) + 1;
           });
        } else {
           requests.forEach(item => {
              const urg = (item.urgency_level || 'medium').toLowerCase();
              if (urgCounts[urg] !== undefined) urgCounts[urg]++;
              if (urg === 'critical') {
                  criticalTotal++;
                  if ((item.status || '').toLowerCase() === 'fulfilled' || completedMatches.some(m => m.request_id === item.id)) criticalResolved++;
              }
              
              const city = item.address ? extractCity(item.address) : 'Unknown';
              cityCounts[city] = (cityCounts[city] || 0) + 1;
           });
           
           completedMatches.forEach(m => {
              const cat = m.food_type;
              if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
              
              const safe = (m.donation_safety_status || 'review').toLowerCase();
              if (safeCounts[safe] !== undefined) safeCounts[safe]++;
           });
        }
        
        const totalCat = Object.values(catCounts).reduce((a, b) => a + b, 0);
        const food_categories = Object.entries(catCounts).map(([k, v]) => ({ category: k, count: v, percentage: Math.round((v/totalCat)*100) || 0 }));
        
        const safetyBaseTotal = role === 'donor' ? donations.length : completedMatches.length;
        const safety_distribution = Object.entries(safeCounts).map(([k, v]) => ({ safety_status: k, count: v, percentage: safetyBaseTotal > 0 ? Math.round((v/safetyBaseTotal)*100) : 0 })).filter(d => d.count > 0);
        
        const urgency_distribution = Object.entries(urgCounts).map(([k, v]) => ({ urgency_level: k, count: v }));
        const requests_by_city = Object.entries(cityCounts).map(([k, v]) => ({ city: k, count: v }));
        
        // Donations over time (simple daily group)
        const dateMap: Record<string, number> = {};
        if (role === 'donor') {
           donations.forEach(item => {
              const d = new Date(item.created_at).toISOString().split('T')[0];
              dateMap[d] = (dateMap[d] || 0) + 1;
           });
        } else {
           completedMatches.forEach(m => {
              const d = new Date(m.created_at).toISOString().split('T')[0];
              dateMap[d] = (dateMap[d] || 0) + 1;
           });
        }
        const donations_over_time = Object.entries(dateMap).map(([d, c]) => ({ date: d, count: c })).sort((a,b) => a.date.localeCompare(b.date));

        const derivedData: AnalyticsData = {
           filters: { period, city: city || null, category: category || null },
           available_filters: { cities: Array.from(allCities).filter(Boolean), categories: Array.from(allCategories).filter(Boolean) },
           kpis: {
              successful_rescues: { value: completedMatches.length, trend_percent: null },
              quantity_rescued: { value: quantityRescued, trend_percent: null, unit: 'kg' },
              active_requests: { value: activeReqs, trend_percent: null },
              critical_resolved_percent: { value: criticalTotal === 0 ? "N/A" : Math.round((criticalResolved / criticalTotal) * 100), trend_percent: null },
              ngos_served: { value: new Set(completedMatches.map(m => m.ngo_id || m.request_id)).size, trend_percent: null }
           },
           donations_over_time,
           food_categories,
           safety_distribution,
           urgency_distribution,
           requests_by_city,
           operational_insights: {
              most_donated_category: food_categories.sort((a,b) => b.count - a.count)[0]?.category || null,
              highest_demand_city: requests_by_city.sort((a,b) => b.count - a.count)[0]?.city || null,
              rescue_completion_rate_percent: role === 'donor' 
                 ? (matches.length ? Math.round((completedMatches.length / matches.length) * 100) : null)
                 : (requests.length ? Math.round((completedMatches.length / requests.length) * 100) : null),
              unsafe_rate_percent: donations.length ? Math.round((safeCounts['unsafe'] / donations.length) * 100) : 0,
              critical_requests_today: urgCounts['critical'] || 0
           }
        };

        if (isMounted) {
          setData(derivedData);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load analytics data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchAnalytics();
    
    return () => { isMounted = false; };
  }, [period, city, category]);

  const renderTrend = (trendPercent: number | null, inverseColors = false) => {
    if (trendPercent === null) {
      return (
        <div className="text-[10px] font-bold px-2.5 py-1.5 rounded-md border text-gray-500 bg-gray-50 border-gray-100 leading-relaxed text-center">
          Insights are generated from the currently available rescue data and become more accurate as additional history is collected.
        </div>
      );
    }
    const isUp = trendPercent > 0;
    const isZero = trendPercent === 0;
    const arrow = isUp ? '↑' : isZero ? '-' : '↓';
    
    let colorClass = 'text-gray-600 bg-gray-50 border-gray-100';
    if (!isZero) {
        if (inverseColors) {
            colorClass = isUp ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100';
        } else {
            colorClass = isUp ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100';
        }
    }

    return (
      <div className={`text-[10px] font-bold px-2 py-1 rounded-md border w-fit ${colorClass}`}>
        {arrow} {Math.abs(trendPercent)}% vs prior
      </div>
    );
  };

    const getKPIsArray = () => {
    if (!data) return [];
    const k = data.kpis;
    
    const fourthKPILabel = role === 'donor' ? "Critical resolved" : "Request fulfillment rate";
    const fourthKPIValue = role === 'donor' 
        ? (typeof k.critical_resolved_percent.value === 'number' ? `${k.critical_resolved_percent.value}%` : k.critical_resolved_percent.value)
        : (data.operational_insights.rescue_completion_rate_percent !== null && data.operational_insights.rescue_completion_rate_percent !== undefined ? `${data.operational_insights.rescue_completion_rate_percent}%` : "—");
    
    return [
      { label: "Successful rescues", value: k.successful_rescues.value, icon: ShieldCheck, color: "text-[#F07154]", trend: k.successful_rescues.trend_percent, inverse: false },
      { label: `Quantity rescued ${k.quantity_rescued.unit ? `(${k.quantity_rescued.unit})` : ''}`, value: k.quantity_rescued.value, icon: Leaf, color: "text-[#F07154]", trend: k.quantity_rescued.trend_percent, inverse: false },
      { label: role === 'donor' ? "Active donations" : "Active requests", value: k.active_requests.value, icon: AlertCircle, color: "text-[#F07154]", trend: k.active_requests.trend_percent, inverse: true }, // Less active = better usually, or neutral
      { label: fourthKPILabel, value: fourthKPIValue, icon: Flame, color: "text-[#F07154]", trend: role === 'donor' ? k.critical_resolved_percent.trend_percent : null, inverse: false }
    ];
  };

  const CATEGORY_COLORS = ['#69b3a2', '#F07154', '#fbbf24', '#8b5a2b', '#4A3228', '#A3A3A3'];
  const SAFETY_COLORS: Record<string, string> = { 'safe': '#10b981', 'review': '#fbbf24', 'unsafe': '#ef4444' };
  const URGENCY_COLORS: Record<string, string> = { 'low': '#10b981', 'medium': '#fbbf24', 'high': '#f97316', 'critical': '#ef4444' };

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Analytics" />

      <main className="ml-0 lg:ml-[280px] pt-[112px] pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Analytics Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
           <div className="flex items-center gap-4">
              <h2 className="font-serif text-2xl font-bold text-[#33251E]">Operations Intelligence</h2>
              {loading && <Loader2 className="animate-spin text-[#F07154]" size={20} />}
           </div>
           
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <select value={period} onChange={(e) => setPeriod(e.target.value)} disabled={loading} className="bg-white shadow-sm border border-[#33251E]/10 rounded-xl pl-9 pr-8 py-2.5 text-sm font-bold text-[#33251E] focus:outline-none focus:border-[#F07154] cursor-pointer appearance-none transition-colors group-hover:bg-gray-50 disabled:opacity-50">
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="all">All Time</option>
                 </select>
                 <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50" />
                 <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50 pointer-events-none" />
              </div>
              <div className="relative group" title="Filtering will be available as more analytics data is collected.">
                 <select value={city} onChange={(e) => setCity(e.target.value)} disabled={true} className="bg-white shadow-sm border border-[#33251E]/10 rounded-xl pl-9 pr-8 py-2.5 text-sm font-bold text-[#33251E] focus:outline-none focus:border-[#F07154] cursor-not-allowed appearance-none transition-colors group-hover:bg-gray-50 disabled:opacity-50">
                    <option value="">All Cities</option>
                    {data?.available_filters.cities.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50" />
                 <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50 pointer-events-none" />
              </div>
              <div className="relative group" title="Filtering will be available as more analytics data is collected.">
                 <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={true} className="bg-white shadow-sm border border-[#33251E]/10 rounded-xl pl-9 pr-8 py-2.5 text-sm font-bold text-[#33251E] focus:outline-none focus:border-[#F07154] cursor-not-allowed appearance-none transition-colors group-hover:bg-gray-50 disabled:opacity-50">
                    <option value="">All Categories</option>
                    {data?.available_filters.categories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <Utensils size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50" />
                 <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50 pointer-events-none" />
              </div>
           </div>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-bold">
                {error}
            </div>
        )}

        {/* KPIs Row */}
        {!error && data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {getKPIsArray().map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-5 flex flex-col justify-center group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="w-9 h-9 rounded-full bg-[#FDF6F4] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={16} className={kpi.color} />
                    </div>
                    <div className="font-serif text-2xl font-bold text-[#33251E] mb-1">{kpi.value.toLocaleString()}</div>
                    <div className="text-xs font-semibold text-[#33251E]/60 mb-3 truncate">{kpi.label}</div>
                    {renderTrend(kpi.trend, kpi.inverse)}
                </div>
                );
            })}
            </div>
        )}

        {/* Impact Banner */}
        {!error && data && role === 'donor' && (
            <div className="bg-[#4A3228] rounded-2xl p-8 flex flex-col md:flex-row gap-8 justify-between text-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                <div className="flex items-center gap-2 mb-2 text-white/60">
                <Leaf size={14} />
                <div className="text-[10px] font-bold uppercase tracking-widest">IMPACT</div>
                </div>
                <div className="font-serif text-3xl font-bold mb-1">{data.kpis.quantity_rescued.value.toLocaleString()} {data.kpis.quantity_rescued.unit || 'units'}</div>
                <div className="text-sm font-bold text-white/90 mb-1">Quantity Rescued</div>
                <div className="text-[11px] text-white/60 font-semibold">prevented from waste</div>
            </div>
            <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                <div className="flex items-center gap-2 mb-2 text-white/60">
                <Users size={14} />
                <div className="text-[10px] font-bold uppercase tracking-widest">REACH</div>
                </div>
                <div className="font-serif text-3xl font-bold mb-1">{data.kpis.ngos_served?.value || 0}</div>
                <div className="text-sm font-bold text-white/90 mb-1">NGOs Served</div>
                <div className="text-[11px] text-white/60 font-semibold">successfully partnered</div>
            </div>
            <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left">
                <div className="flex items-center gap-2 mb-2 text-white/60">
                <TrendingUp size={14} />
                <div className="text-[10px] font-bold uppercase tracking-widest">TREND</div>
                </div>
                {data.kpis.successful_rescues.trend_percent !== null ? (
                    <div className={`font-serif text-3xl font-bold mb-1 ${data.kpis.successful_rescues.trend_percent >= 0 ? 'text-emerald-400' : 'text-[#F07154]'}`}>
                        {data.kpis.successful_rescues.trend_percent >= 0 ? '↑' : '↓'} {Math.abs(data.kpis.successful_rescues.trend_percent)}%
                    </div>
                ) : (
                    <div className="font-serif text-[13px] font-bold mb-2 text-white/80 leading-snug">Insights are generated from the currently available rescue data and become more accurate as additional history is collected.</div>
                )}
                <div className="text-sm font-bold text-white/90 mb-1">Growth in rescues</div>
                <div className="text-[11px] text-white/60 font-semibold">vs previous period</div>
            </div>
            </div>
        )}

        {/* Charts Row 1 */}
        {!error && data && (
            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 items-stretch h-[380px]">
            <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 pt-8 flex flex-col h-full overflow-hidden relative group">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">{role === 'donor' ? 'Donations over time' : 'Requests fulfilled over time'}</h3>
                <div className="flex-1 flex flex-col min-h-0 relative mt-2 text-xs">
                    {data.donations_over_time.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.donations_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#9ca3af" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#9ca3af" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                    cursor={{ stroke: '#F07154', strokeWidth: 1, strokeDasharray: '3 3' }}
                                />
                                <Line type="monotone" dataKey="count" name={role === 'donor' ? 'Donations' : 'Fulfilled'} stroke="#F07154" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6, fill: '#F07154', stroke: '#fff'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#33251E]/40 font-bold gap-3 text-center px-4">
                            <TrendingUp size={32} className="opacity-40" />
                            <p className="text-sm font-medium leading-relaxed">Need additional completed rescues to calculate trends.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full relative overflow-hidden group">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-2 shrink-0">Food category</h3>
                <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative">
                    {data.food_categories.length > 0 ? (
                        <>
                            <div className="h-44 w-full relative -mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.food_categories}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={75}
                                            paddingAngle={2}
                                            dataKey="count"
                                            nameKey="category"
                                            stroke="none"
                                        >
                                            {data.food_categories.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full grid grid-cols-2 gap-x-2 gap-y-2 px-1 shrink-0 overflow-y-auto max-h-24 custom-scrollbar">
                                {data.food_categories.map((cat, idx) => (
                                    <div key={cat.category} className="flex justify-between items-center text-[10px] font-bold uppercase text-[#33251E]/60 truncate pr-2">
                                        <span className="flex items-center gap-1.5 truncate">
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}}></span> 
                                            <span className="truncate">{cat.category}</span>
                                        </span>
                                        <span className="text-[#33251E] ml-1">{cat.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#33251E]/40 font-bold gap-3 text-center px-4">
                            <Utensils size={32} className="opacity-40" />
                            <p className="text-sm font-medium leading-relaxed">{role === 'donor' ? 'No donations yet. Food category statistics will appear once donations are made.' : 'No fulfilled requests yet. Food category statistics will appear after requests are fulfilled.'}</p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        )}

        {/* Charts Row 2 */}
        {!error && data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch h-[340px]">
            {/* Safety Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full overflow-hidden">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">Safety distribution</h3>
                <div className="flex-1 flex flex-col justify-center gap-4">
                    {data.safety_distribution.length > 0 ? (
                        data.safety_distribution.map(stat => (
                            <div key={stat.safety_status} className="flex items-center gap-4 group">
                                <span className="w-14 text-xs font-semibold text-[#33251E]/80 text-right group-hover:text-[#33251E] transition-colors capitalize">{stat.safety_status}</span>
                                <div className="flex-1 h-10 bg-gray-50 rounded-r-md relative flex items-center group-hover:bg-gray-100 transition-colors shadow-inner">
                                    <div 
                                        className="h-full rounded-r-md flex items-center justify-end pr-3 transition-all duration-700 shadow-sm" 
                                        style={{width: `${Math.max(stat.percentage, 5)}%`, backgroundColor: SAFETY_COLORS[stat.safety_status.toLowerCase()] || '#9ca3af'}}
                                    >
                                        <span className="text-[10px] font-bold text-white mix-blend-difference">{stat.percentage}%</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#33251E]/40 font-bold gap-3 text-center px-4">
                            <ShieldCheck size={32} className="opacity-40" />
                            <p className="text-sm font-medium leading-relaxed">No completed rescues yet. Safety statistics will appear here once donations are fulfilled.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Urgency Levels */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full overflow-hidden">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-2 shrink-0">Urgency levels</h3>
                <div className="flex-1 mt-2 text-xs">
                    {data.urgency_distribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.urgency_distribution} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="urgency_level" stroke="#9ca3af" tick={{fill: '#6b7280'}} tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} axisLine={false} tickLine={false} />
                                <YAxis stroke="#9ca3af" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)', textTransform: 'capitalize' }} />
                                <Bar dataKey="count" name={role === 'donor' ? 'Donations' : 'Requests'} radius={[4, 4, 0, 0]}>
                                    {data.urgency_distribution.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={URGENCY_COLORS[_entry.urgency_level.toLowerCase()] || '#F07154'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 h-full flex items-center justify-center text-[#33251E]/40 font-bold">No urgency data</div>
                    )}
                </div>
            </div>
            
            {/* Requests by City */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col h-full overflow-hidden">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-2 shrink-0">{role === 'donor' ? 'Rescue Locations' : 'Requests by City'}</h3>
                <div className="flex-1 mt-2 text-xs">
                    {data.requests_by_city.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.requests_by_city} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="city" stroke="#9ca3af" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#9ca3af" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{fill: '#fef3c7'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" name={role === 'donor' ? 'Rescues' : 'Requests'} fill="#fbbf24" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 h-full flex items-center justify-center text-[#33251E]/40 font-bold">No city data</div>
                    )}
                </div>
            </div>
            </div>
        )}

        {/* Operational Insights */}
        {!error && data && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6 flex flex-col mt-2">
            <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">Operational insights</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {label: role === 'donor' ? 'Most Donated' : 'Most Requested', val: data.operational_insights.most_donated_category || (role === 'donor' ? 'No donation data' : 'No fulfilled requests'), showForRole: 'both'},
                    {label: role === 'donor' ? 'Top Rescue City' : 'Top Service City', val: data.operational_insights.highest_demand_city || (role === 'donor' ? 'No donation data' : 'No request data'), showForRole: 'both'},
                    {label: role === 'donor' ? 'Rescue Completion Rate' : 'Request Fulfillment Rate', val: data.operational_insights.rescue_completion_rate_percent !== null ? `${data.operational_insights.rescue_completion_rate_percent}%` : '—', color: 'text-emerald-600', showForRole: 'both'},
                    {label: 'Unsafe Rate', val: data.operational_insights.unsafe_rate_percent !== null ? `${data.operational_insights.unsafe_rate_percent}%` : '—', color: 'text-[#F07154]', showForRole: 'donor'},
                    {label: 'Critical Requests Today', val: data.operational_insights.critical_requests_today.toString(), color: 'text-amber-600', showForRole: 'ngo'}
                ].filter(i => i.showForRole === 'both' || i.showForRole === role).map((insight, i) => (
                <div key={i} className="border border-[#33251E]/5 rounded-xl p-4 flex flex-col justify-center bg-[#FDFBF7]/50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group">
                    <div className="text-[10px] text-[#33251E]/50 mb-1 font-bold uppercase tracking-wider group-hover:text-[#33251E]/70 transition-colors truncate">{insight.label}</div>
                    <div className={`font-sans text-xl md:text-2xl font-bold truncate ${insight.color || 'text-[#33251E]'}`}>
                        {insight.val}
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

      </main>
    </div>
  );
}
