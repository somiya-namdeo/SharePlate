import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { ChevronDown, Phone, Route, Loader2, CheckCircle2 } from 'lucide-react';
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <div className="relative">
                <select 
                  value={donationId}
                  onChange={(e) => setDonationId(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors appearance-none pr-10 truncate cursor-pointer"
                >
                  {donationsList.length === 0 ? (
                    <option value="" disabled>No donations available...</option>
                  ) : (
                    donationsList.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.food_type} ({d.quantity} {d.quantity <= 1000 ? 'kg' : ''}) {d.address ? `- ${d.address}` : ''}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={16} className="text-[#33251E]/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1 min-w-[200px] relative">
              <div className="relative">
                <select 
                  value={selectedNgoRequestId}
                  onChange={(e) => setSelectedNgoRequestId(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors appearance-none pr-10 truncate cursor-pointer"
                >
                  <option value="">Select NGO request (Optional)</option>
                  {ngoRequestsList.map(req => (
                    <option key={req.id} value={req.id}>
                      {req.preferred_food_type || 'Food'} - {req.meals_needed} meals ({req.urgency_level} Priority)
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-[#33251E]/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1 min-w-[200px] flex items-center gap-3">
              <button 
                onClick={handleFindMatches}
                disabled={loading}
                className="w-full bg-[#33251E] hover:bg-[#33251E]/90 text-white rounded-xl px-4 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Finding...' : 'Find Matches'}
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
            const confidence = match.match_score >= 90 ? "Very High" : match.match_score >= 70 ? "High" : "Moderate";
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
                    <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mt-1">
                      AI Confidence • {confidence}
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
            <div className="col-span-1 lg:col-span-3 flex flex-col items-center justify-center py-16 bg-white/50 border border-[#33251E]/5 rounded-3xl border-dashed">
              <div className="w-12 h-12 rounded-full bg-[#33251E]/5 flex items-center justify-center mb-3">
                <Route className="text-[#33251E]/40" size={20} />
              </div>
              <p className="text-[#33251E]/60 font-medium">
                {hasSearched ? "No suitable NGOs found for this donation." : "Select a donation and click Find Matches to see suggestions."}
              </p>
            </div>
          )}
        </div>

        {/* Assignment Queue */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#33251E]/10 flex flex-col overflow-hidden">
          <div className="flex justify-between items-end p-6 pb-4 bg-white border-b border-[#33251E]/5 shrink-0">
            <div>
              <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">ALL MATCHES</span>
              <h2 className="font-serif text-2xl font-semibold text-[#33251E]">Assignment queue</h2>
            </div>
            <span className="bg-[#FDFBF7] text-[#33251E]/60 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#33251E]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span> AI ASSISTED • LIVE
            </span>
          </div>
          
          <div className="w-full overflow-x-auto p-6 pt-0">
            {loadingQueue ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#F07154]" />
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#33251E]/60 font-medium">No assigned matches yet.</p>
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
                  {queue.map((row, i) => {
                    const score = Math.round(row.match_score || 0);
                    const urgency = (row.urgency || "Low").toLowerCase();
                    const pColor = urgency === "critical" ? "red" : urgency === "high" ? "amber" : "emerald";
                    const status = row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : "Pending";
                    const displayFood = row.food_type || row.donation_id?.slice(0, 8);
                    
                    return (
                      <tr key={row.id || i} className="border-b border-[#33251E]/5 hover:bg-[#FDFBF7] transition-colors">
                        <td className="py-4.5 text-sm font-semibold text-[#33251E]/80">
                          {displayFood}
                        </td>
                        <td className="py-4.5 text-sm font-semibold text-[#33251E]">
                          {row.ngo_name || 'Unknown NGO'}
                        </td>
                        <td className="py-4.5 text-sm text-[#33251E]/80">
                          {row.distance_km ?? '?'} km
                        </td>
                        <td className="py-4.5 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={cn(
                                "h-full rounded-full",
                                score >= 90 ? "bg-emerald-500" :
                                score >= 80 ? "bg-[#F07154]" : "bg-amber-500"
                              )} style={{ width: `${score}%` }}></div>
                            </div>
                            <span className="font-semibold text-[#33251E]">{score}%</span>
                          </div>
                        </td>
                        <td className="py-4.5 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            pColor === 'red' ? 'bg-red-50 text-red-700' :
                            pColor === 'amber' ? 'bg-amber-50 text-amber-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              pColor === 'red' ? 'bg-red-500' :
                              pColor === 'amber' ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}></span>
                            {row.urgency || 'Low'}
                          </span>
                        </td>
                        <td className="py-4.5 text-sm">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
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
                        <td className="py-4.5 text-sm text-right">
                          <button className="text-[#33251E]/60 hover:text-[#33251E] font-semibold text-sm transition-colors">
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
    </div>
  );
}
