import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { getUser } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Phone, MapPin, Package, Heart, Truck, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function NGORequests() {
  const user = getUser();
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    foodCategory: '',
    quantity: '',
    location: '',
    urgency: 'Medium',
    ngoName: '',
    pickupTime: '',
    contactPerson: '',
    notes: ''
  });

  const fetchRequests = async () => {
    try {
      const res = await apiFetch('/api/requests/me');
      if (res.success && Array.isArray(res.data)) {
        setRequestsList(res.data);
        if (res.data.length > 0 && !selectedRequestId) {
          setSelectedRequestId(res.data[0].id);
        }
      }

      const user = getUser();
      if (user?.id) {
        const matchesRes = await apiFetch(`/api/matches/me`);
        if (matchesRes.success && Array.isArray(matchesRes.data)) {
          setMatchesList(matchesRes.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.foodCategory) { setError('Food category is required'); return; }
    if (!formData.quantity) { setError('Quantity is required'); return; }
    if (!formData.location) { setError('Location is required'); return; }
    if (!formData.urgency) { setError('Urgency is required'); return; }

    const meals = parseInt(formData.quantity.replace(/\D/g, ''), 10) || 0;
    if (meals <= 0) { setError('Please enter a valid numeric quantity (e.g., 50)'); return; }

    setLoading(true);
    try {
      const payload = {
        preferred_food_type: formData.foodCategory,
        meals_needed: meals,
        address: formData.location,
        urgency_level: formData.urgency === 'Critical' ? 'High' : formData.urgency, // Map to valid schema enum
        contact_phone: formData.contactPerson || null
      };

      const response = await apiFetch('/api/requests/', {
        method: 'POST',
        data: payload
      });

      if (response.success) {
        toast.success('Request posted successfully!');
        setFormData({
          foodCategory: '',
          quantity: '',
          location: '',
          urgency: 'Medium',
          ngoName: '',
          pickupTime: '',
          contactPerson: '',
          notes: ''
        });
        await fetchRequests();
      } else {
        setError(response.message || 'Failed to post request');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while posting the request');
    } finally {
      setLoading(false);
    }
  };

  const selectedRequest = requestsList.find(r => r.id === selectedRequestId) || requestsList[0];
  const activeMatch = selectedRequest ?
    (matchesList.find(m => m.request_id === selectedRequest.id && ['pending', 'accepted', 'picked_up'].includes(m.status?.toLowerCase())) ||
     matchesList.find(m => m.request_id === selectedRequest.id && m.status?.toLowerCase() === 'completed'))
    : null;

  // Derive Statistics
  const openRequestsCount = requestsList.filter(r => r.status?.toLowerCase() !== 'fulfilled').length;
  const criticalRequestsCount = requestsList.filter(r => r.urgency_level?.toLowerCase() === 'critical' && r.status?.toLowerCase() !== 'fulfilled').length;

  const todayStr = new Date().toDateString();
  const fulfilledTodayCount = requestsList.filter(r => {
    const isFulfilled = r.status?.toLowerCase() === 'fulfilled';
    const dateStr = new Date(r.updated_at || r.created_at).toDateString();
    return isFulfilled && dateStr === todayStr;
  }).length;

  const totalRequestsCount = requestsList.length;
  const fulfilledCount = requestsList.filter(r => r.status?.toLowerCase() === 'fulfilled').length;
  const matchSuccessRate = totalRequestsCount > 0 ? Math.round((fulfilledCount / totalRequestsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="NGO Requests" />

      <main className="ml-0 lg:ml-[280px] pt-[112px] pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto flex flex-col">

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-6 items-start">

          {/* Left Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-8 flex flex-col">
             <div className="shrink-0 mb-8">
                <span className="text-[11px] font-bold text-[#F07154] uppercase tracking-[0.1em] mb-1 block">NEW REQUEST</span>
                <h2 className="font-serif text-3xl font-bold text-[#33251E]">What does {user?.user_metadata?.organization || user?.user_metadata?.full_name || 'your NGO'} need today?</h2>
                <p className="text-sm text-[#33251E]/70 mt-2">We'll match it with nearby surplus donations in real time.</p>
             </div>

             <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                 {error && (
                   <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium">
                     {error}
                   </div>
                 )}
                 <div>
                   <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">NGO name<span className="text-red-500 ml-1">*</span></label>
                   <input type="text" name="ngoName" value={formData.ngoName} onChange={handleChange} placeholder="e.g. Roti Bank" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Food category<span className="text-red-500 ml-1">*</span></label>
                       <input type="text" name="foodCategory" value={formData.foodCategory} onChange={handleChange} placeholder="e.g. Cooked meal" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Quantity<span className="text-red-500 ml-1">*</span></label>
                       <input type="text" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g. 80 meals" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Location<span className="text-red-500 ml-1">*</span></label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Old Bhopal" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Preferred pickup time</label>
                       <input type="text" name="pickupTime" value={formData.pickupTime} onChange={handleChange} placeholder="e.g. 7 - 9 PM" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Urgency<span className="text-red-500 ml-1">*</span></label>
                       <select name="urgency" value={formData.urgency} onChange={handleChange} className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors appearance-none">
                         <option value="High">High</option>
                         <option value="Critical">Critical</option>
                         <option value="Medium">Medium</option>
                         <option value="Low">Low</option>
                       </select>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Contact person</label>
                    <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="+91 98xxx xx" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Anything the donor should know..." rows={4} className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors resize-none"></textarea>
                 </div>
                 <div className="shrink-0 pt-2">
                    <button type="submit" disabled={loading} className="w-full bg-[#F07154] hover:bg-[#E05F42] text-white rounded-xl py-3.5 text-sm font-bold transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2">
                       {loading && <Loader2 size={16} className="animate-spin" />}
                       Post request
                    </button>
                 </div>
             </form>

          </div>

          {/* Right Column: Board & Detail */}
          <div className="flex flex-col gap-6">

             {/* Stats Bar */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/10">
                     <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Open Requests</div>
                     <div className="font-serif text-xl font-bold text-[#33251E]">{openRequestsCount}</div>
                 </div>
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/10">
                     <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Critical</div>
                     <div className="font-serif text-xl font-bold text-red-500">{criticalRequestsCount}</div>
                 </div>
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/10">
                     <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Fulfilled Today</div>
                     <div className="font-serif text-xl font-bold text-[#33251E]">{fulfilledTodayCount}</div>
                 </div>
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-[#33251E]/10">
                     <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Match Success</div>
                     <div className="font-serif text-xl font-bold text-[#33251E]">{matchSuccessRate}%</div>
                 </div>
             </div>

             {/* Demand Board */}
             <div className="bg-[#FDFBF7] rounded-2xl shadow-sm border border-[#33251E]/10 flex flex-col">
                <div className="p-6 pb-4 border-b border-[#33251E]/5 shrink-0 bg-white rounded-t-2xl">
                   <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-[0.1em] mb-1 block">LIVE REQUESTS</span>
                   <h2 className="font-serif text-2xl font-bold text-[#33251E]">NGO demand board</h2>
                </div>

                <div className="overflow-x-auto p-6 pt-0">
                   <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[#33251E]/10">
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">NGO</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Needs</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Qty</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Location</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Urgency</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Status</th>
                           <th className="py-4 font-semibold text-xs text-[#33251E]/60 uppercase tracking-wider sticky top-0 bg-[#FDFBF7] z-10">Match</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requestsList.length > 0 ? requestsList.map((r, i) => {
                           const color = (r.urgency_level || '').toLowerCase() === 'high' || (r.urgency_level || '').toLowerCase() === 'critical' ? 'red' :
                                         (r.urgency_level || '').toLowerCase() === 'medium' ? 'amber' : 'emerald';

                           const rowMatch = matchesList.find(m => m.request_id === r.id && ['pending', 'accepted', 'picked_up'].includes(m.status?.toLowerCase())) ||
                                            matchesList.find(m => m.request_id === r.id && m.status?.toLowerCase() === 'completed');

                           return (
                           <tr key={i} onClick={() => setSelectedRequestId(r.id)} className={cn("border-b border-[#33251E]/5 hover:bg-gray-50/80 transition-colors cursor-pointer group", selectedRequestId === r.id ? "bg-[#FDF6F4]/50" : "")}>
                              <td className="py-3.5">
                                 <div className="font-bold text-sm text-[#33251E]">{r.ngo_name || 'NGO'}</div>
                                 <div className="text-xs text-[#33251E]/50 font-medium font-mono mt-0.5">REQ-{r.id?.substring(0,6).toUpperCase()}</div>
                              </td>
                              <td className="py-3.5 text-sm text-[#33251E]/80 pr-4">{r.preferred_food_type || '-'}</td>
                              <td className="py-3.5 text-sm text-[#33251E]/80 pr-4">{r.meals_needed} meals</td>
                              <td className="py-3.5 text-sm text-[#33251E]/80 pr-4">{r.address}</td>
                              <td className="py-3.5">
                                 <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest min-w-[80px] justify-center",
                                    color === 'red' ? 'bg-red-50 text-red-700' :
                                    color === 'amber' ? 'bg-amber-50 text-amber-700' :
                                    'bg-emerald-50 text-emerald-700'
                                 )}>
                                    <span className={cn(
                                       "w-1.5 h-1.5 rounded-full",
                                       color === 'red' ? 'bg-red-500' :
                                       color === 'amber' ? 'bg-amber-500' :
                                       'bg-emerald-500'
                                    )}></span>
                                    {r.urgency_level || 'Medium'}
                                 </span>
                              </td>
                              <td className="py-3.5">
                                 <div className="flex items-center gap-2">
                                    <span className={cn("w-2 h-2 rounded-full", r.status?.toLowerCase() === 'fulfilled' || (rowMatch ? rowMatch.status : 'awaiting').toLowerCase() === 'accepted' ? 'bg-emerald-500' : (rowMatch ? 'bg-amber-500' : 'bg-[#33251E]/30'))}></span>
                                    <span className="text-sm font-bold text-[#33251E]/70 capitalize">{r.status?.toLowerCase() === 'fulfilled' ? 'Fulfilled' : (rowMatch ? rowMatch.status : 'Awaiting')}</span>
                                 </div>
                              </td>
                              <td className="py-3.5 text-sm text-[#33251E]/50 font-mono font-medium">{rowMatch ? `D-${rowMatch.donation_id?.substring(0,6).toUpperCase()}` : '-'}</td>
                           </tr>
                           );
                        }) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-[#33251E]/50 text-sm">No live requests available.</td>
                          </tr>
                        )}
                      </tbody>
                   </table>
                </div>
             </div>

             {/* Request Detail Card */}
             {selectedRequest && (
             <div className="bg-[#FDF6F4] border border-[#F07154]/20 rounded-2xl p-6 shrink-0 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <span className="text-[11px] font-bold text-[#F07154] uppercase tracking-[0.1em] mb-1 block">REQUEST DETAIL</span>
                      <h3 className="font-serif text-2xl font-bold text-[#33251E]">REQ-{(selectedRequest.id || '').substring(0,6).toUpperCase()} • {selectedRequest.ngo_name || user?.user_metadata?.organization || user?.user_metadata?.full_name || 'Your NGO'}</h3>
                   </div>
                   <span className={cn(
                      "text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 border",
                      (selectedRequest.urgency_level || '').toLowerCase() === 'high' || (selectedRequest.urgency_level || '').toLowerCase() === 'critical' ? 'bg-red-50 border-red-200 text-red-700' :
                      (selectedRequest.urgency_level || '').toLowerCase() === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                   )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full",
                         (selectedRequest.urgency_level || '').toLowerCase() === 'high' || (selectedRequest.urgency_level || '').toLowerCase() === 'critical' ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]' :
                         (selectedRequest.urgency_level || '').toLowerCase() === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      )}></span> {selectedRequest.urgency_level || 'Medium'}
                   </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
                   <div className="bg-white/60 rounded-xl p-5 border border-[#33251E]/5 flex flex-col items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FDF6F4] flex items-center justify-center text-[#F07154]"><Heart size={14} /></div>
                      <div>
                         <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Demand need</div>
                         <div className="font-semibold text-sm text-[#33251E]">{selectedRequest.meals_needed} meals • {selectedRequest.preferred_food_type}</div>
                      </div>
                   </div>
                   <div className="bg-white/60 rounded-xl p-5 border border-[#33251E]/5 flex flex-col items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FDF6F4] flex items-center justify-center text-[#F07154]"><Package size={14} /></div>
                      <div>
                         <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Matched donation</div>
                         <div className="font-semibold text-sm text-[#33251E] font-mono">
                           {activeMatch ? (
                             <>D-{activeMatch.donation_id?.substring(0,6).toUpperCase()} • <span className="font-sans">{activeMatch.food_type}</span></>
                           ) : (
                             <span className="font-sans text-[#33251E]/60 italic">Not matched yet</span>
                           )}
                         </div>
                      </div>
                   </div>
                   <div className="bg-white/60 rounded-xl p-5 border border-[#33251E]/5 flex flex-col items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Truck size={14} /></div>
                      <div>
                         <div className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mb-1">Status</div>
                         <div className="font-semibold text-sm text-[#33251E] capitalize">
                           {selectedRequest.status?.toLowerCase() === 'fulfilled' ? 'Fulfilled' : (activeMatch ? activeMatch.status : 'Awaiting match')}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-3">
                   <button
                     onClick={() => {
                        if (activeMatch?.donor_phone) {
                           setIsContactModalOpen(true);
                        }
                     }}
                     disabled={!activeMatch?.donor_phone}
                     title={!activeMatch?.donor_phone ? "Available after a donation is assigned." : undefined}
                     className="bg-[#F07154] hover:bg-[#E05F42] text-white rounded-xl px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:bg-[#33251E]/10 disabled:text-[#33251E]/40 disabled:cursor-not-allowed">
                      <Phone size={16} /> {activeMatch?.donor_phone ? 'Contact Donor' : 'Phone Unavailable'}
                   </button>
                   <button
                     onClick={() => navigate(`/logistics?request=${selectedRequest.id}`)}
                     className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-xl px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors">
                      <MapPin size={16} /> View on map
                   </button>
                </div>
             </div>
             )}

          </div>
        </div>

      </main>

      {/* Contact Modal */}
      {isContactModalOpen && activeMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsContactModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[#33251E]/10">
              <h3 className="font-serif text-2xl font-bold text-[#33251E]">Contact Details</h3>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const contactName = activeMatch.donor_name;
                const contactPhone = activeMatch.donor_phone;
                const contactEmail = activeMatch.donor_email;

                return (
                  <>
                    <div>
                       <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Organization / Name</span>
                       <div className="text-base font-semibold text-[#33251E]">{contactName || 'Not available'}</div>
                    </div>

                    {contactPhone ? (
                      <div>
                         <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Phone Number</span>
                         <div className="text-base font-semibold text-[#33251E]">{contactPhone}</div>
                      </div>
                    ) : (
                      <div>
                         <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Phone Number</span>
                         <div className="text-sm font-medium text-[#33251E]/60 italic">Phone number not available</div>
                      </div>
                    )}

                    {contactEmail && (
                      <div>
                         <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-1">Email</span>
                         <div className="text-base font-semibold text-[#33251E]">{contactEmail}</div>
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-2 pt-2 border-t border-[#33251E]/10">
                       {contactPhone && (
                         <div className="flex gap-2">
                           <a href={`tel:${contactPhone}`} className="flex-1 bg-[#33251E] hover:bg-black text-white text-sm font-bold py-2.5 rounded-xl flex justify-center items-center transition-colors">
                             Call
                           </a>
                           <button onClick={() => { navigator.clipboard.writeText(contactPhone); toast.success('Copied to clipboard'); }} className="flex-1 bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] text-sm font-bold py-2.5 rounded-xl transition-colors">
                             Copy Number
                           </button>
                         </div>
                       )}
                       {contactEmail && (
                         <button
                           onClick={() => {
                             const encodedEmail = encodeURIComponent(contactEmail);
                             const encodedSubject = encodeURIComponent('SharePlate Donation Coordination');
                             const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedEmail}&su=${encodedSubject}`;
                             window.open(url, '_blank', 'noopener,noreferrer');
                           }}
                           className="w-full bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] text-sm font-bold py-2.5 rounded-xl flex justify-center items-center transition-colors"
                         >
                           Email
                         </button>
                       )}
                       <button onClick={() => setIsContactModalOpen(false)} className="w-full text-[#33251E]/60 hover:text-[#33251E] text-sm font-bold py-2.5 transition-colors mt-2">
                         Close
                       </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
