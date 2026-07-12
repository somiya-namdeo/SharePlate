import { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Utensils, Leaf, ShieldCheck, Users, Flame, TrendingUp, ChevronDown, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
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
    meals_fulfilled: { value: number; trend_percent: number | null; unit?: string };
    ngos_served: { value: number; trend_percent: number | null; unit?: string };
    active_requests: { value: number; trend_percent: number | null; unit?: string };
    critical_resolved_percent: { value: number; trend_percent: number | null; unit?: string };
  };
  donations_over_time: { date: string; count: number }[];
  food_categories: { category: string; count: number; percentage: number }[];
  safety_distribution: { safety_status: string; count: number; percentage: number }[];
  urgency_distribution: { urgency_level: string; count: number }[];
  requests_by_city: { city: string; count: number }[];
  operational_insights: {
    most_donated_category: string | null;
    highest_demand_city: string | null;
    avg_shelf_life_hrs: number | null;
    rescue_completion_rate_percent: number | null;
    unsafe_rate_percent: number | null;
    ngo_fulfillment_percent: number | null;
    critical_requests_today: number;
  };
}

export function Analytics() {
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
        const queryParams = new URLSearchParams();
        queryParams.append('period', period);
        if (city) queryParams.append('city', city);
        if (category) queryParams.append('category', category);
        
        const response = await apiFetch(`/api/analytics?${queryParams.toString()}`);
        if (isMounted) {
          setData(response);
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
        <div className="text-[10px] font-bold px-2 py-1 rounded-md border w-fit text-gray-500 bg-gray-50 border-gray-100">
          No prior data
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
    return [
      { label: "Successful rescues", value: k.successful_rescues.value, icon: ShieldCheck, color: "text-[#F07154]", trend: k.successful_rescues.trend_percent, inverse: false },
      { label: `Quantity rescued ${k.quantity_rescued.unit ? `(${k.quantity_rescued.unit})` : ''}`, value: k.quantity_rescued.value, icon: Leaf, color: "text-[#F07154]", trend: k.quantity_rescued.trend_percent, inverse: false },
      { label: "Meals fulfilled", value: k.meals_fulfilled.value, icon: Utensils, color: "text-[#F07154]", trend: k.meals_fulfilled.trend_percent, inverse: false },
      { label: "NGOs served", value: k.ngos_served.value, icon: Users, color: "text-[#F07154]", trend: k.ngos_served.trend_percent, inverse: false },
      { label: "Active requests", value: k.active_requests.value, icon: AlertCircle, color: "text-[#F07154]", trend: k.active_requests.trend_percent, inverse: true }, // Less active = better usually, or neutral
      { label: "Critical resolved", value: `${k.critical_resolved_percent.value}%`, icon: Flame, color: "text-[#F07154]", trend: k.critical_resolved_percent.trend_percent, inverse: false }
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
              <div className="relative group">
                 <select value={city} onChange={(e) => setCity(e.target.value)} disabled={loading} className="bg-white shadow-sm border border-[#33251E]/10 rounded-xl pl-9 pr-8 py-2.5 text-sm font-bold text-[#33251E] focus:outline-none focus:border-[#F07154] cursor-pointer appearance-none transition-colors group-hover:bg-gray-50 disabled:opacity-50">
                    <option value="">All Cities</option>
                    {data?.available_filters.cities.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50" />
                 <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#33251E]/50 pointer-events-none" />
              </div>
              <div className="relative group">
                 <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading} className="bg-white shadow-sm border border-[#33251E]/10 rounded-xl pl-9 pr-8 py-2.5 text-sm font-bold text-[#33251E] focus:outline-none focus:border-[#F07154] cursor-pointer appearance-none transition-colors group-hover:bg-gray-50 disabled:opacity-50">
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
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
        {!error && data && (
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
                <Utensils size={14} />
                <div className="text-[10px] font-bold uppercase tracking-widest">REDIRECTED</div>
                </div>
                <div className="font-serif text-3xl font-bold mb-1">{data.kpis.meals_fulfilled.value.toLocaleString()}</div>
                <div className="text-sm font-bold text-white/90 mb-1">Meals Fulfilled</div>
                {data.available_filters.cities.length > 0 && (
                    <div className="text-[11px] text-white/60 font-semibold">across {data.available_filters.cities.length} cities</div>
                )}
            </div>
            <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                <div className="flex items-center gap-2 mb-2 text-white/60">
                <Users size={14} />
                <div className="text-[10px] font-bold uppercase tracking-widest">COMMUNITIES</div>
                </div>
                <div className="font-serif text-3xl font-bold mb-1">{data.kpis.ngos_served.value.toLocaleString()}</div>
                <div className="text-sm font-bold text-white/90 mb-1">NGOs Served</div>
                <div className="text-[11px] text-white/60 font-semibold">shelters & kitchens</div>
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
                    <div className="font-serif text-xl font-bold mb-1 text-white/80">No prior data</div>
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
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">Donations over time</h3>
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
                                <Line type="monotone" dataKey="count" name="Donations" stroke="#F07154" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6, fill: '#F07154', stroke: '#fff'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[#33251E]/40 font-bold">No donation data for this period</div>
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
                        <div className="flex-1 flex items-center justify-center text-[#33251E]/40 font-bold">No category data</div>
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
                        <div className="flex-1 flex items-center justify-center text-[#33251E]/40 font-bold">No safety data</div>
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
                                <Bar dataKey="count" name="Donations" radius={[4, 4, 0, 0]}>
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
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-2 shrink-0">Requests by City</h3>
                <div className="flex-1 mt-2 text-xs">
                    {data.requests_by_city.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.requests_by_city} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="city" stroke="#9ca3af" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#9ca3af" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{fill: '#fef3c7'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" name="Requests" fill="#fbbf24" radius={[4, 4, 0, 0]} />
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
                    {label: 'Most donated', val: data.operational_insights.most_donated_category || 'N/A'},
                    {label: 'Highest demand city', val: data.operational_insights.highest_demand_city || 'N/A'},
                    {label: 'Avg shelf life', val: data.operational_insights.avg_shelf_life_hrs !== null ? `${data.operational_insights.avg_shelf_life_hrs} hrs` : 'N/A'},
                    {label: 'Rescue completion rate', val: data.operational_insights.rescue_completion_rate_percent !== null ? `${data.operational_insights.rescue_completion_rate_percent}%` : 'N/A', color: 'text-emerald-600'},
                    {label: 'Unsafe rate', val: data.operational_insights.unsafe_rate_percent !== null ? `${data.operational_insights.unsafe_rate_percent}%` : 'N/A', color: 'text-[#F07154]'},
                    {label: 'NGO fulfillment', val: data.operational_insights.ngo_fulfillment_percent !== null ? `${data.operational_insights.ngo_fulfillment_percent}%` : 'N/A', color: 'text-emerald-600'},
                    {label: 'Critical today', val: data.operational_insights.critical_requests_today.toString(), color: 'text-amber-600'}
                ].map((insight, i) => (
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
