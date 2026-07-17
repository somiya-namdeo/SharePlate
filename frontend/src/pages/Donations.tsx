import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Sparkles, Save, ShieldCheck, Network, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { getUser } from '../lib/auth';
import toast from 'react-hot-toast';


function Badge({ text }: { text: string }) {
  const titleText = text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';
  
  let color = "bg-gray-100 text-gray-700 border-gray-200";
  if (titleText === 'Safe' || titleText === 'Completed' || titleText === 'Delivered') color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (titleText === 'Review' || titleText === 'Medium' || titleText === 'Scheduled') color = "bg-amber-50 text-amber-700 border-amber-200";
  if (titleText === 'Unsafe' || titleText === 'Critical' || titleText === 'Cancelled') color = "bg-red-50 text-red-700 border-red-200";
  if (titleText === 'High' || titleText === 'Matched') color = "bg-orange-50 text-orange-700 border-orange-200";
  if (titleText === 'Accepted') color = "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {titleText === 'Critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
      {titleText}
    </span>
  );
}

export function Donations() {
  const location = useLocation();
  const prefill = location.state?.prefillData;

  const navigate = useNavigate();
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [safetyFilter, setSafetyFilter] = useState('All');

  const [formData, setFormData] = useState({
    id: prefill?.id || '',
    foodItem: prefill?.foodItem || '',
    foodCategory: prefill?.foodCategory || '',
    prepMethod: prefill?.prepMethod || '',
    storageCondition: prefill?.storageCondition || '',
    packagingType: prefill?.packagingType || '',
    temperature: prefill?.temperature !== undefined && prefill?.temperature !== null ? String(prefill.temperature) : '',
    humidity: prefill?.humidity !== undefined && prefill?.humidity !== null ? String(prefill.humidity) : '',
    hoursPrepared: prefill?.hoursPrepared !== undefined && prefill?.hoursPrepared !== null ? String(prefill.hoursPrepared) : '',
    estTransport: prefill?.estTransport !== undefined && prefill?.estTransport !== null ? String(prefill.estTransport) : '',
    distance: prefill?.distance !== undefined && prefill?.distance !== null ? String(prefill.distance) : '',
    quantity: prefill?.quantity !== undefined && prefill?.quantity !== null ? String(prefill.quantity) : '',
    season: prefill?.season || '',
    eventType: prefill?.eventType || '',
    cityTier: prefill?.cityTier || '',
    perishabilityScore: prefill?.perishabilityScore !== undefined && prefill?.perishabilityScore !== null ? String(prefill.perishabilityScore) : '',
    shelfLife: prefill?.shelfLife !== undefined && prefill?.shelfLife !== null ? String(prefill.shelfLife) : '',
    pickupLocation: prefill?.pickupLocation || '',
    donorContact: prefill?.donorContact || '',
    latitude: prefill?.latitude !== undefined ? Number(prefill.latitude) : 23.2599,
    longitude: prefill?.longitude !== undefined ? Number(prefill.longitude) : 77.4126,
    existingAiData: prefill?.existingAiData || null as any
  });

  const fetchDonations = async () => {
    setIsFetching(true);
    try {
      const data = await apiFetch('/api/donations/me');
      if (data.success) {
        setDonations(data.data);
      } else {
        toast.error(data.message || 'Failed to load donations');
      }
    } catch (error: any) {
      toast.error('Failed to load donations');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.foodItem || !formData.quantity || !formData.pickupLocation) {
      toast.error('Please fill required fields (Food item, Quantity, Pickup location)');
      return null;
    }

    const user = getUser();
    if (!user) {
      toast.error('You must be logged in to donate');
      return null;
    }

    setIsLoading(true);
    try {
      let url = '/api/donations/';
      let method = 'POST';
      if (formData.id) {
        url = `/api/donations/${formData.id}`;
        method = 'PUT';
      }

      const payload: any = {
        donor_id: user.id,
        food_type: formData.foodItem,
        quantity: formData.quantity !== '' ? parseFloat(formData.quantity) : null,
        description: formData.foodCategory,
        contact_phone: formData.donorContact || null,
        address: formData.pickupLocation,
        
        food_category: formData.foodCategory || null,
        preparation_method: formData.prepMethod || null,
        storage_condition: formData.storageCondition || null,
        packaging_type: formData.packagingType || null,
        temperature: formData.temperature !== '' ? parseFloat(formData.temperature) : null,
        humidity: formData.humidity !== '' ? parseFloat(formData.humidity) : null,
        hours_since_prepared: formData.hoursPrepared !== '' ? parseFloat(formData.hoursPrepared) : null,
        estimated_transport_time: formData.estTransport !== '' ? parseFloat(formData.estTransport) : null,
        distance: formData.distance !== '' ? parseFloat(formData.distance) : null,
        season: formData.season || null,
        event_type: formData.eventType || null,
        city_tier: formData.cityTier || null,
        predicted_shelf_life: formData.shelfLife !== '' ? parseFloat(formData.shelfLife) : null,
      };

      if (formData.existingAiData) {
        payload.spoilage_risk_score = formData.existingAiData.spoilage_risk_score;
        payload.safety_status = formData.existingAiData.safety_status;
        payload.confidence_score = formData.existingAiData.confidence_score;
        payload.urgency_level = formData.existingAiData.urgency_level;
      }

      const res = await apiFetch(url, {
        method,
        data: payload
      });

      if (!res.success) {
        toast.error(res.message || 'Failed to save donation. Please check your address and try again.');
        setIsLoading(false);
        return null;
      }

      toast.success('Donation saved successfully!');
      
      const newId = res.data.id;
      setFormData({
        id: '', foodItem: '', foodCategory: '', prepMethod: '', storageCondition: '',
        packagingType: '', temperature: '', humidity: '', hoursPrepared: '',
        estTransport: '', distance: '', quantity: '', season: '', eventType: '',
        cityTier: '', perishabilityScore: '', shelfLife: '', pickupLocation: '', donorContact: '',
        latitude: 23.2599, longitude: 77.4126,
        existingAiData: null
      });
      fetchDonations();
      return newId;
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while saving the donation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Donations" />
        
      <main className="ml-[280px] pt-[112px] pb-12 px-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[40%_60%] gap-6 h-[calc(100vh-160px)] min-h-[600px]">
          
          {/* Left Column: Form */}
          <div className="bg-white rounded-3xl border border-[#33251E]/5 p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F07154]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10 flex-shrink-0">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#F07154] mb-1">{formData.id ? 'Edit Donation' : 'New Donation'}</div>
                <h2 className="font-serif text-2xl text-[#33251E] leading-tight mb-1">{formData.id ? 'Update donation details' : 'Ready to rescue this food?'}</h2>
                <p className="text-[#33251E]/60 text-xs font-medium">All fields feed the AI safety + urgency engine.</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#33251E]/5 border border-[#33251E]/10 text-[10px] font-bold uppercase tracking-wider text-[#33251E]/70">
                <Sparkles size={12} className="text-[#F07154]" />
                AI Assisted
              </div>
            </div>

            <form className="relative z-10 flex-1 flex flex-col overflow-hidden" onSubmit={handleSave}>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-brand">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Food item</label>
                    <input type="text" name="foodItem" value={formData.foodItem} onChange={handleChange} placeholder="e.g. Dal & Rice (cooked)" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Food category</label>
                    <input type="text" name="foodCategory" value={formData.foodCategory} onChange={handleChange} placeholder="Cooked meal" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Preparation method</label>
                    <input type="text" name="prepMethod" value={formData.prepMethod} onChange={handleChange} placeholder="Steamed / Boiled" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Storage condition</label>
                    <input type="text" name="storageCondition" value={formData.storageCondition} onChange={handleChange} placeholder="Refrigerated" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Packaging type</label>
                    <input type="text" name="packagingType" value={formData.packagingType} onChange={handleChange} placeholder="Sealed foil trays" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Temperature (°C)</label>
                    <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="6" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Humidity (%)</label>
                    <input type="number" name="humidity" value={formData.humidity} onChange={handleChange} placeholder="45" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Hours since prepared</label>
                    <input type="number" name="hoursPrepared" value={formData.hoursPrepared} onChange={handleChange} placeholder="2" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Est. transport (min)</label>
                    <input type="number" name="estTransport" value={formData.estTransport} onChange={handleChange} placeholder="35" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Distance (km)</label>
                    <input type="number" name="distance" value={formData.distance} onChange={handleChange} placeholder="6.4" step="0.1" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Quantity (kg)</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="25" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Season</label>
                    <input type="text" name="season" value={formData.season} onChange={handleChange} placeholder="Winter" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Event type</label>
                    <input type="text" name="eventType" value={formData.eventType} onChange={handleChange} placeholder="Corporate lunch" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">City tier</label>
                    <input type="text" name="cityTier" value={formData.cityTier} onChange={handleChange} placeholder="Tier-2" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Perishability score</label>
                    <input type="number" name="perishabilityScore" value={formData.perishabilityScore} onChange={handleChange} placeholder="0.62" step="0.01" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Est. shelf life (hrs)</label>
                    <input type="number" name="shelfLife" value={formData.shelfLife} onChange={handleChange} placeholder="3" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Pickup location</label>
                  <input type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} placeholder="MP Nagar, Bhopal" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                </div>
                
                <div>
                  <label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Donor contact</label>
                  <input type="text" name="donorContact" value={formData.donorContact} onChange={handleChange} placeholder="+91 98xxxxxx01" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154] focus:ring-1 focus:ring-[#F07154] text-[#33251E] placeholder:text-[#33251E]/30" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-[#33251E]/5 flex-shrink-0">
                <button 
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    if (!formData.foodItem || !formData.quantity || !formData.pickupLocation) {
                      import('react-hot-toast').then(({ default: toast }) => {
                        toast.error('Please fill required fields (Food item, Quantity, Pickup location)');
                      });
                      return;
                    }
                    navigate('/food-safety', { 
                      state: { 
                        prefillData: formData, 
                        donationId: formData.id || null,
                        existingAiData: formData.existingAiData 
                      } 
                    });
                  }}
                  className="bg-[#F07154] hover:bg-[#E05F42] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_4px_12px_-4px_rgba(240,113,84,0.6)] hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  <ShieldCheck size={16} />
                  Predict safety
                </button>
                <button type="submit" disabled={isLoading} className="bg-white hover:bg-[#33251E]/5 border border-[#33251E]/10 text-[#33251E] px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isLoading ? <Loader2 size={16} className="animate-spin text-[#33251E]/60" /> : <Save size={16} className="text-[#33251E]/60" />}
                  {formData.id ? 'Update donation' : 'Save donation'}
                </button>
                <button 
                  type="button"
                  disabled={isLoading}
                  onClick={async () => {
                    if (!formData.id && !formData.foodItem && !formData.quantity && !formData.pickupLocation) {
                      import('react-hot-toast').then(({ default: toast }) => {
                        toast.error('Please select or save a donation first.');
                      });
                      return;
                    }

                    let currentId = formData.id;
                    if (!currentId) {
                      const newId = await handleSave();
                      if (!newId) return; // Save failed
                      currentId = newId;
                    }
                    
                    navigate('/matching', { 
                      state: { donationId: currentId } 
                    });
                  }}
                  className="bg-white hover:bg-[#33251E]/5 border border-[#33251E]/10 text-[#33251E] px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Network size={16} className="text-[#33251E]/60" />
                  Match
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: List View instead of Table */}
          <div className="bg-white rounded-3xl border border-[#33251E]/5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-[#33251E]/5 flex justify-between items-end flex-shrink-0">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#33251E]/50 mb-1">All Donations</div>
                <h2 className="font-serif text-2xl text-[#33251E] leading-none">Live rescue list</h2>
              </div>
              <div className="flex gap-2">
                <select 
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="bg-white border border-[#33251E]/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#33251E]/70 hover:border-[#33251E]/30 transition-colors focus:outline-none cursor-pointer"
                >
                  <option value="All">All Urgency</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <select 
                  value={safetyFilter}
                  onChange={(e) => setSafetyFilter(e.target.value)}
                  className="bg-white border border-[#33251E]/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#33251E]/70 hover:border-[#33251E]/30 transition-colors focus:outline-none cursor-pointer"
                >
                  <option value="All">All Safety</option>
                  <option value="Safe">Safe</option>
                  <option value="Unsafe">Unsafe</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-brand">
              {isFetching ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-[#F07154]" size={24} />
                </div>
              ) : (() => {
                const filteredDonations = donations.filter(row => {
                  const isSafe = row.spoilage_risk_score && row.spoilage_risk_score > 0.8 ? 'Unsafe' : 'Safe';
                  const urgency = row.urgency_level || 'Medium';
                  const activeStatus = ['pending', 'matched', 'picked_up'].includes((row.status || 'pending').toLowerCase());

                  if (!activeStatus) return false;
                  if (urgencyFilter !== 'All' && urgency !== urgencyFilter) return false;
                  if (safetyFilter !== 'All' && isSafe !== safetyFilter) return false;
                  return true;
                });

                if (filteredDonations.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-full text-[#33251E]/50 text-sm">
                      No donations found
                    </div>
                  );
                }

                return filteredDonations.map((row) => (
                  <div key={row.id} onClick={() => {
                    setFormData({
                      id: row.id,
                      foodItem: row.food_type || '',
                      foodCategory: row.food_category || '',
                      prepMethod: row.preparation_method || '',
                      storageCondition: row.storage_condition || '',
                      packagingType: row.packaging_type || '',
                      temperature: row.temperature !== null && row.temperature !== undefined ? String(row.temperature) : '',
                      humidity: row.humidity !== null && row.humidity !== undefined ? String(row.humidity) : '',
                      hoursPrepared: row.hours_since_prepared !== null && row.hours_since_prepared !== undefined ? String(row.hours_since_prepared) : '',
                      estTransport: row.estimated_transport_time !== null && row.estimated_transport_time !== undefined ? String(row.estimated_transport_time) : '',
                      distance: row.distance !== null && row.distance !== undefined ? String(row.distance) : '',
                      quantity: row.quantity !== null && row.quantity !== undefined ? String(row.quantity) : '',
                      season: row.season || '',
                      eventType: row.event_type || '',
                      cityTier: row.city_tier || '',
                      perishabilityScore: row.spoilage_risk_score !== null && row.spoilage_risk_score !== undefined ? String(row.spoilage_risk_score) : '',
                      shelfLife: row.predicted_shelf_life !== null && row.predicted_shelf_life !== undefined ? String(row.predicted_shelf_life) : '',
                      pickupLocation: row.address || '',
                      donorContact: row.contact_phone || '',
                      latitude: row.latitude !== null && row.latitude !== undefined ? row.latitude : 23.2599,
                      longitude: row.longitude !== null && row.longitude !== undefined ? row.longitude : 77.4126,
                      existingAiData: {
                        spoilage_risk_score: row.spoilage_risk_score,
                        safety_status: row.safety_status,
                        confidence_score: row.confidence_score,
                        predicted_shelf_life: row.predicted_shelf_life,
                        urgency_level: row.urgency_level
                      }
                    });
                  }} className="bg-white border border-[#33251E]/10 p-4 rounded-2xl hover:shadow-md transition-shadow group flex flex-col gap-3 cursor-pointer">
                    {/* Top Header of Card */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-[#33251E]/50 mb-0.5">{row.id.substring(0,8)}</div>
                        <h4 className="font-bold text-[#33251E] text-[15px]">{row.food_type}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge text={row.spoilage_risk_score && row.spoilage_risk_score > 0.8 ? 'Unsafe' : 'Safe'} />
                        <Badge text={row.urgency_level || 'Medium'} />
                      </div>
                    </div>
                    
                    {/* Middle Info */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                      <div>
                        <span className="text-[#33251E]/50 block mb-0.5 font-medium">Quantity</span>
                        <span className="text-[#33251E] font-medium">{row.quantity} kg</span>
                      </div>
                      <div>
                        <span className="text-[#33251E]/50 block mb-0.5 font-medium">Location</span>
                        <span className="text-[#33251E] font-medium">{row.address}</span>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#33251E]/5 mt-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#33251E]/50">Status</span>
                        <div><Badge text={row.status || 'Pending'} /></div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Rescue History */}
            <div className="p-6 border-t border-b border-[#33251E]/5 flex justify-between items-end flex-shrink-0 bg-[#FDFBF7]">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#33251E]/50 mb-1">Historical</div>
                <h2 className="font-serif text-2xl text-[#33251E] leading-none">Rescue history</h2>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-brand bg-[#FDFBF7]">
              {(() => {
                const historyDonations = donations.filter(row => {
                  return ['completed', 'delivered'].includes((row.status || 'pending').toLowerCase());
                });

                if (historyDonations.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-full text-[#33251E]/50 text-sm">
                      No completed rescues
                    </div>
                  );
                }

                return historyDonations.map((row) => (
                  <div key={row.id} className="bg-white border border-[#33251E]/10 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-[#33251E]/50 mb-0.5">{row.id.substring(0,8)}</div>
                        <h4 className="font-bold text-[#33251E] text-[15px]">{row.food_type}</h4>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                         Completed
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                      <div>
                        <span className="text-[#33251E]/50 block mb-0.5 font-medium">Quantity</span>
                        <span className="text-[#33251E] font-medium">{row.quantity}</span>
                      </div>
                      <div>
                        <span className="text-[#33251E]/50 block mb-0.5 font-medium">Location</span>
                        <span className="text-[#33251E] font-medium">{row.address}</span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>


          </div>

        </div>
      </main>
    </div>
  );
}
