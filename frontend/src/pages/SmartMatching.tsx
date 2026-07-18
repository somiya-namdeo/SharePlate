import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { ChevronDown, Phone, Route, Loader2, CheckCircle2, Bot, ListX, ArrowDownUp, Users, BarChart2, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiFetch } from '../lib/api';
import { getUser } from '../lib/auth';
import toast from 'react-hot-toast';

export function SmartMatching() {
  const location = useLocation();
  const stateDonationId = location.state?.donationId;
  const user = getUser();
  const userRole = user?.user_metadata?.role;

  const [donationId, setDonationId] = useState(stateDonationId || '');
  const [donationsList, setDonationsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [assigningMatch, setAssigningMatch] = useState<string | null>(null);
  const [isMatched, setIsMatched] = useState(false);
  const [ngoRequestsList, setNgoRequestsList] = useState<any[]>([]);
  const [selectedNgoRequestId, setSelectedNgoRequestId] = useState<string>('');
  
  // Assignment queue state
  const [queue, setQueue] = useState<any[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'distance' | 'priority' | 'newest'>('newest');
  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);

  const sortedQueue = [...queue].sort((a, b) => {
    if (sortBy === 'score') return (b.match_score || 0) - (a.match_score || 0);
    if (sortBy === 'distance') return (a.distance_km || 9999) - (b.distance_km || 9999);
    if (sortBy === 'priority') {
      const pWeights: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 };
      return (pWeights[(b.urgency || '').toLowerCase()] || 0) - (pWeights[(a.urgency || '').toLowerCase()] || 0);
    }
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const totalMatches = queue.length;
  const avgScore = totalMatches > 0 ? Math.round(queue.reduce((acc, curr) => acc + (curr.match_score || 0), 0) / totalMatches) : 0;
  const highPriorityCount = queue.filter(q => ['high', 'critical'].includes((q.urgency || '').toLowerCase())).length;

  const fetchQueue = async () => {
    const user = getUser();
    if (!user || !user.id) return;
    
    setLoadingQueue(true);
    try {
      const response = await apiFetch('/api/matches/me');
      if (response.success && Array.isArray(response.data)) {
        setQueue(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch assignment queue", error);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const user = getUser();
        const role = user?.user_metadata?.role;
        const endpoint = role === 'donor' ? '/api/donations/me?status=pending' : '/api/donations/';
        const response = await apiFetch(endpoint);
        const list = Array.isArray(response) ? response : (response.data || []);
        
        const matchingEligible = list;
        
        setDonationsList(matchingEligible);
        
        if (stateDonationId) {
          setDonationId(stateDonationId);
        } else if (matchingEligible.length > 0) {
          setDonationId(matchingEligible[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch donations", error);
      }
    };
    const fetchNgoRequests = async () => {
      try {
        const response = await apiFetch('/api/requests/me?status=open');
        const list = Array.isArray(response) ? response : (response.data || []);
        setNgoRequestsList(list);
      } catch (error) {
        console.error("Failed to fetch NGO requests", error);
      }
    };

    fetchDonations();
    fetchQueue();
    fetchNgoRequests();
  }, [stateDonationId]);

  const handleFindMatches = async () => {
    if (!donationId) {
      toast.error('Please select a donation');
      return;
    }
    
    setLoading(true);
    setHasSearched(true);
    setIsMatched(false);
    
    try {
      const url = selectedNgoRequestId 
        ? `/api/matches/suggest/${donationId}?ngo_request_id=${selectedNgoRequestId}` 
        : `/api/matches/suggest/${donationId}`;
      const response = await apiFetch(url);
      if (response.success && response.data?.best_matches) {
        setMatches(response.data.best_matches);
      } else {
        setMatches([]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignNGO = async (requestId: string) => {
    if (!donationId) return;
    
    setAssigningMatch(requestId);
    try {
      const pickupTime = new Date();
      pickupTime.setMinutes(pickupTime.getMinutes() + 30);
      
      const response = await apiFetch('/api/matches/', {
        method: 'POST',
        data: {
          donation_id: donationId,
          request_id: requestId,
          recommended_pickup_time: pickupTime.toISOString()
        }
      });
      
      if (response.success) {
        toast.success('Successfully assigned NGO!');
        setIsMatched(true);
        await handleFindMatches();
        await fetchQueue(); // Refresh queue to show the newly assigned match
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign NGO');
    } finally {
      setAssigningMatch(null);
    }
  };

  const donationMatch = queue.find(m => m.donation_id === donationId && ['pending', 'accepted', 'completed'].includes((m.status || '').toLowerCase()));
  const matchStatus = donationMatch ? (donationMatch.status || '').toLowerCase() : '';
  const donorStatusText = matchStatus === 'completed' ? 'Rescue Completed' : (matchStatus === 'accepted' ? 'Accepted by NGO' : 'Waiting for NGO acceptance');

  const isAlreadyMatched = isMatched || ['pending', 'accepted'].includes(matchStatus);

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Smart Matching" />

      <main className="ml-[280px] pt-[112px] pb-12 px-8 max-w-[1600px] mx-auto flex flex-col min-h-screen">
        
        {/* Top Control Card */}
        <div className={cn("bg-white rounded-2xl shadow-sm border p-4 mb-6 transition-colors duration-300", 
            isAlreadyMatched ? "border-emerald-400 bg-emerald-50/30" : "border-[#33251E]/10"
        )}>
          <div className="flex justify-between items-center mb-4 md:hidden">
            {isAlreadyMatched && (
               <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-100 px-3 py-1 rounded-full">
                 <CheckCircle2 size={16} /> Donation Matched
               </span>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="w-full relative">
              <div className="relative">
                <select 
                  value={donationId}
                  onChange={(e) => setDonationId(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] focus-visible:ring-2 focus-visible:ring-[#F07154]/20 transition-all appearance-none pr-10 truncate cursor-pointer hover:border-[#33251E]/30"
                >
                  {donationsList.length === 0 ? (
                    <option value="" disabled>No donations available</option>
                  ) : (
                    donationsList.map(d => {
                      const locality = d.address ? d.address.split(',')[0].trim() : '';
                      return (
                        <option key={d.id} value={d.id} title={`${d.food_type} (${d.quantity} ${d.quantity <= 1000 ? 'kg' : ''}) - ${d.address}`}>
                          {d.food_type} • {d.quantity} {d.quantity <= 1000 ? 'kg' : ''} {locality ? `• ${locality}` : ''}
                        </option>
                      );
                    })
                  )}
                </select>
                <ChevronDown size={16} className="text-[#33251E]/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="w-full relative">
              <div className="relative">
                <select 
                  value={selectedNgoRequestId}
                  onChange={(e) => setSelectedNgoRequestId(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] focus-visible:ring-2 focus-visible:ring-[#F07154]/20 transition-all appearance-none pr-10 truncate cursor-pointer hover:border-[#33251E]/30"
                >
                  {ngoRequestsList.length === 0 ? (
                    <option value="">No NGO requests available</option>
                  ) : (
                    <>
                      <option value="">Select NGO request (Optional)</option>
                      {ngoRequestsList.map(req => (
                        <option key={req.id} value={req.id}>
                          {req.preferred_food_type || 'Food'} • {req.meals_needed} meals • {req.urgency_level} Priority
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <ChevronDown size={16} className="text-[#33251E]/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {ngoRequestsList.length === 0 && (
                <p className="text-[10px] text-[#33251E]/50 mt-1.5 font-medium px-1">
                  NGO requests will appear here once NGOs submit requests.
                </p>
              )}
            </div>
            <div className="w-full flex items-center gap-3">
              <button 
                onClick={handleFindMatches}
                disabled={loading || !donationId || donationsList.length === 0}
                className="w-full bg-[#33251E] hover:bg-[#33251E]/90 focus-visible:ring-2 focus-visible:ring-[#33251E]/30 text-white rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Finding Matches...' : 'Find Matches'}
              </button>
              {isAlreadyMatched && (
                <div className="hidden md:flex items-center gap-1.5 text-emerald-600 font-bold text-sm whitespace-nowrap bg-emerald-100/80 px-3 py-2 rounded-xl">
                  <CheckCircle2 size={18} /> Matched
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {matches.map((match, i) => {
            const isHighlight = i === 0 && match.match_score >= 80;
            const scoreColor = match.match_score >= 90 ? "text-emerald-500" : match.match_score >= 70 ? "text-[#F07154]" : "text-amber-500";
            const scoreTextColor = match.match_score >= 90 ? "text-emerald-600" : match.match_score >= 70 ? "text-[#F07154]" : "text-amber-600";
            const confidence = match.match_score >= 90 ? "Excellent Match" : match.match_score >= 70 ? "Strong Match" : "Good Match";
            const isAssigningThis = assigningMatch === match.request_id;
            
            return (
              <div 
                key={match.request_id || i} 
                className={cn(
                  "rounded-3xl shadow-sm border p-5 flex flex-col relative h-[360px] transition-opacity duration-300",
                  isHighlight ? "bg-[#FDF6F4] border-[#F07154]" : "bg-white border-[#33251E]/10",
                  isAlreadyMatched ? "opacity-60 grayscale-[0.2]" : ""
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="max-w-[70%]">
                    <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block truncate" title={match.request_id}>
                      REQ: {match.request_id?.slice(0, 8)}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#33251E] truncate" title={match.ngo_name}>
                      {match.ngo_name}
                    </h3>
                    <div className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest mt-1">
                      {confidence}
                    </div>
                    <p className="text-xs text-[#33251E]/60 mt-1 font-medium">
                      {match.distance_km ?? 'Unknown'} km • {match.quantity_needed} needed • {match.food_needed}
                    </p>
                  </div>
                  
                  {/* Score Circle */}
                  <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                      <circle 
                        cx="28" cy="28" r="24" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 24} 
                        strokeDashoffset={2 * Math.PI * 24 * (1 - (match.match_score || 0) / 100)} 
                        className={scoreColor} 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className={cn("font-bold text-sm leading-none", scoreTextColor)}>
                        {match.match_score}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Why this match box */}
                <div className="bg-white rounded-2xl border border-[#33251E]/5 p-4 mb-4 flex-1 shadow-sm overflow-hidden">
                  <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-2 block">WHY THIS MATCH</span>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-[13px] text-[#33251E]/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F07154] shrink-0"></div>
                      Distance: {match.distance_km ?? 'Unknown'} km
                    </li>
                    <li className="flex items-center gap-2 text-[13px] text-[#33251E]/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F07154] shrink-0"></div>
                      Urgency: {match.urgency}
                    </li>
                    {match.estimated_pickup_time && (
                      <li className="flex items-center gap-2 text-[13px] text-[#33251E]/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F07154] shrink-0"></div>
                        Est. Pickup: {new Date(match.estimated_pickup_time).toLocaleString()}
                      </li>
                    )}
                  </ul>
                </div>

                {/* Buttons / Status */}
                {userRole === 'donor' ? (
                  <div className="mt-auto flex flex-col items-center bg-[#FDFBF7] rounded-xl p-3 border border-[#33251E]/10">
                    <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Status</span>
                    <span className="text-sm font-bold text-[#33251E]">
                      {donorStatusText}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-auto">
                    <button 
                      onClick={() => handleAssignNGO(match.request_id)}
                      disabled={isAlreadyMatched || assigningMatch !== null}
                      className="bg-[#33251E] hover:bg-[#33251E]/90 text-white rounded-full px-5 py-2.5 text-sm font-bold flex items-center justify-center gap-2 flex-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAssigningThis ? (
                         <Loader2 size={16} className="animate-spin" />
                      ) : isAlreadyMatched ? (
                         <>Assigned</>
                      ) : (
                         <>Assign NGO</>
                      )}
                    </button>
                    <button className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-full px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                      <Route size={16} />
                    </button>
                    <button className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-full p-2.5 flex items-center justify-center transition-colors disabled:opacity-50">
                      <Phone size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {matches.length === 0 && !loading && (
            <div className="col-span-1 lg:col-span-3 flex flex-col items-center justify-center py-16 bg-white border border-[#33251E]/10 rounded-3xl shadow-sm hover:border-[#33251E]/20 transition-colors duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#FDFBF7] border border-[#33251E]/5 flex items-center justify-center mb-4 shadow-sm">
                <Bot className="text-[#F07154]" size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#33251E] mb-2">No AI Match Results</h3>
              <p className="text-[#33251E]/60 font-medium text-center max-w-md px-4 leading-relaxed">
                Select a donation and click "Find Matches" to generate AI-powered NGO recommendations based on food safety, urgency, distance, and NGO suitability.
              </p>
            </div>
          )}
        </div>

        {/* Match Summary */}
        {sortedQueue.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
             <div className="bg-white rounded-2xl p-4 border border-[#33251E]/10 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-full bg-[#33251E]/5 flex items-center justify-center text-[#33251E]"><Users size={20}/></div>
               <div><div className="text-2xl font-bold text-[#33251E]">{totalMatches}</div><div className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest">Matches Found</div></div>
             </div>
             <div className="bg-white rounded-2xl p-4 border border-[#33251E]/10 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><BarChart2 size={20}/></div>
               <div><div className="text-2xl font-bold text-[#33251E]">{avgScore}%</div><div className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest">Avg Match Score</div></div>
             </div>
             <div className="bg-white rounded-2xl p-4 border border-[#33251E]/10 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><AlertCircle size={20}/></div>
               <div><div className="text-2xl font-bold text-[#33251E]">{highPriorityCount}</div><div className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest">High Priority</div></div>
             </div>
          </div>
        )}

        {/* Assignment Queue */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#33251E]/10 flex flex-col overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end p-6 pb-4 bg-white border-b border-[#33251E]/5 shrink-0 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">ALL MATCHES</span>
              <h2 className="font-serif text-2xl font-semibold text-[#33251E]">Assignment queue</h2>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full md:w-auto bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-2 text-sm font-semibold text-[#33251E] focus:outline-none focus:border-[#F07154] appearance-none pr-9 cursor-pointer hover:border-[#33251E]/30 transition-colors"
                >
                  <option value="newest">Newest</option>
                  <option value="score">Highest Score</option>
                  <option value="priority">Highest Priority</option>
                  <option value="distance">Closest NGO</option>
                </select>
                <ArrowDownUp size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#33251E]/40 pointer-events-none" />
              </div>

              <span className="bg-[#FDFBF7] hidden md:flex text-[#33251E]/60 text-[10px] px-3 py-2.5 rounded-xl font-bold uppercase tracking-wider items-center gap-1.5 border border-[#33251E]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span> AI LIVE
              </span>
            </div>
          </div>
          
          <div className="w-full overflow-x-auto p-6 pt-0">
            {loadingQueue ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#F07154]" />
              </div>
            ) : sortedQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#33251E]/5 flex items-center justify-center mb-4">
                  <ListX className="text-[#33251E]/40" size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#33251E] mb-1">No Matches Found</h3>
                <p className="text-[#33251E]/60 font-medium text-sm">AI recommendations will appear here after running Smart Matching.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#33251E]/10">
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">Donation</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">NGO</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">Distance</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">Score</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">Priority</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60">Status</th>
                    <th className="py-3 font-semibold text-sm text-[#33251E]/60"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedQueue.map((row, i) => {
                    const score = Math.round(row.match_score || 0);
                    const urgency = (row.urgency || "Low").toLowerCase();
                    const pColor = urgency === "critical" || urgency === "high" ? "amber" : urgency === "medium" ? "blue" : "slate";
                    const status = row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : "Pending";
                    const displayFood = row.food_type || row.donation_id?.slice(0, 8);
                    
                    return (
                      <tr 
                        key={row.id || i} 
                        onClick={() => setSelectedDetails(row)}
                        className="border-b border-[#33251E]/5 hover:bg-[#FDFBF7] transition-colors duration-200 cursor-pointer group"
                      >
                        <td className="py-5 align-middle text-sm font-semibold text-[#33251E]/80">
                          {displayFood}
                        </td>
                        <td className="py-5 align-middle text-sm font-semibold text-[#33251E]">
                          {row.ngo_name || 'Unknown NGO'}
                        </td>
                        <td className="py-5 align-middle text-sm text-[#33251E]/80">
                          {row.distance_km ?? '?'} km
                        </td>
                        <td className="py-5 align-middle text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={cn(
                                "h-full rounded-full",
                                score >= 90 ? "bg-emerald-500" :
                                score >= 70 ? "bg-[#F07154]" : "bg-amber-500"
                              )} style={{ width: `${score}%` }}></div>
                            </div>
                            <span className="font-semibold text-[#33251E]">{score}%</span>
                          </div>
                        </td>
                        <td className="py-5 align-middle text-sm">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            pColor === "amber" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            pColor === "blue" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-slate-50 text-slate-700 border-slate-200"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              pColor === "amber" ? "bg-amber-500" :
                              pColor === "blue" ? "bg-blue-500" :
                              "bg-slate-400"
                            )}></span>
                            {row.urgency || 'Low'}
                          </span>
                        </td>
                        <td className="py-5 align-middle text-sm">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            status === "Accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            status === "Picked_up" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-slate-50 text-slate-700 border-slate-200"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              status === "Accepted" ? "bg-emerald-500" :
                              status === "Pending" ? "bg-amber-500" :
                              status === "Picked_up" ? "bg-blue-500" :
                              "bg-slate-400"
                            )}></span>
                            {status}
                          </span>
                        </td>
                        <td className="py-5 align-middle text-sm text-right">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDetails(row);
                            }}
                            className="bg-white border border-[#33251E]/10 hover:bg-gray-50 text-[#33251E] font-bold text-xs px-3 py-1.5 rounded-lg transition-colors duration-200 group-hover:border-[#33251E]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F07154]/50"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>

      {/* Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#33251E]/20 backdrop-blur-sm" onClick={() => setSelectedDetails(null)}>
          <div 
            className="bg-white rounded-3xl shadow-xl border border-[#33251E]/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-[#33251E]/5">
              <h3 className="font-serif text-2xl font-bold text-[#33251E]">Match Details</h3>
              <button onClick={() => setSelectedDetails(null)} className="p-2 hover:bg-[#33251E]/5 rounded-full text-[#33251E]/60 transition-colors">
                <span className="sr-only">Close</span>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Donation Type</span>
                  <div className="text-sm font-semibold text-[#33251E]">{selectedDetails.food_type || 'Unknown'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Status</span>
                  <div className="text-sm font-semibold text-[#33251E] capitalize">{selectedDetails.status || 'Pending'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Quantity / Needed</span>
                  <div className="text-sm font-semibold text-[#33251E]">
                    {(() => {
                      const d = donationsList.find(don => don.id === selectedDetails.donation_id);
                      const q = selectedDetails.quantity || d?.quantity;
                      if (q) return `${q} ${!isNaN(Number(q)) ? 'kg' : ''}`.trim();
                      return selectedDetails.quantity_needed || 'Unknown';
                    })()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Distance</span>
                  <div className="text-sm font-semibold text-[#33251E]">{selectedDetails.distance_km ?? '?'} km</div>
                </div>
              </div>

              <div className="bg-[#FDFBF7] rounded-xl p-4 border border-[#33251E]/5">
                <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-2">Assigned NGO</span>
                <div className="text-base font-bold text-[#33251E] mb-1">{selectedDetails.ngo_name || 'Unknown NGO'}</div>
                <div className="text-sm font-mono text-[#33251E]/60">{selectedDetails.request_id ? `REQ: ${selectedDetails.request_id.slice(0, 12)}...` : 'No Request ID'}</div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-[#FDFBF7] rounded-xl p-4 border border-[#33251E]/5 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Match Score</span>
                  <div className="text-2xl font-bold text-[#F07154]">{Math.round(selectedDetails.match_score || 0)}%</div>
                </div>
                <div className="flex-1 bg-[#FDFBF7] rounded-xl p-4 border border-[#33251E]/5 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Priority Level</span>
                  <div className="text-lg font-bold text-[#33251E] capitalize">{selectedDetails.urgency || 'Low'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
