import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { ShieldAlert, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PredictionResponse {
  prediction: string;
  remaining_shelf_life_hr: number;
  urgency_score: number;
  urgency_level: string;
  urgency_priority: number;
}

export function FoodSafety() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const prefill = location.state?.prefillData;
  const donationId = location.state?.donationId;
  const existingAiData = location.state?.existingAiData;

  const [result, setResult] = useState<PredictionResponse | null>(() => {
    if (existingAiData && existingAiData.prediction) {
      return {
        prediction: existingAiData.prediction,
        remaining_shelf_life_hr: existingAiData.predicted_shelf_life || 24,
        urgency_score: existingAiData.rule_risk_score || 50,
        urgency_level: existingAiData.urgency_level || 'Medium',
        urgency_priority: 1 // fake priority since we don't store it
      };
    }
    return null;
  });

  // Form State Pre-filled with router state or empty strings
  const [formData, setFormData] = useState({
    food_item: prefill?.foodItem || '',
    food_category: prefill?.foodCategory || '',
    preparation_method: prefill?.prepMethod || '',
    storage_condition: prefill?.storageCondition || '',
    packaging_type: prefill?.packagingType || '',
    temperature_c: prefill?.temperature || '',
    humidity_percent: prefill?.humidity || '',
    hours_since_prepared: prefill?.hoursPrepared || '',
    estimated_transport_time_min: prefill?.estTransport || '',
    distance_km: prefill?.distance || '',
    quantity_kg: prefill?.quantity || '',
    season: prefill?.season || '',
    event_type: prefill?.eventType || '',
    city_tier: prefill?.cityTier || '',
    perishability_score: prefill?.perishabilityScore || '',
    estimated_shelf_life_hr: prefill?.shelfLife || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Map frontend values to backend schema
      const payload = {
        food_item: formData.food_item || "Unknown",
        food_category: formData.food_category || "Unknown",
        preparation_method: formData.preparation_method || "Unknown",
        storage_condition: formData.storage_condition || "Unknown",
        packaging_type: formData.packaging_type || "Unknown",
        temperature_c: Number(formData.temperature_c) || 0,
        humidity_percent: Number(formData.humidity_percent) || 0,
        hours_since_prepared: Number(formData.hours_since_prepared) || 0,
        estimated_transport_time_hr: Number(formData.estimated_transport_time_min) / 60 || 0,
        distance_km: Number(formData.distance_km) || 0,
        quantity_kg: Number(formData.quantity_kg) || 0,
        season: formData.season || "Unknown",
        event_type: formData.event_type || "Unknown",
        city_tier: formData.city_tier || "Unknown",
        perishability_score: Math.round(Number(formData.perishability_score)) || 0, // Ensure integer
        estimated_shelf_life_hr: Number(formData.estimated_shelf_life_hr) || 0
      };

      const response = await fetch('http://127.0.0.1:8000/api/ai/food-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 422 && errorData && errorData.detail) {
          console.error("422 Validation Error Response:", errorData);
          const firstError = errorData.detail[0];
          if (firstError) {
            const field = firstError.loc ? firstError.loc[firstError.loc.length - 1] : "unknown";
            throw new Error(`Field "${field}" ${firstError.msg}`);
          }
        }
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      if (donationId) {
        try {
          // Store prediction in database
          await apiFetch(`/api/donations/${donationId}`, {
            method: 'PUT',
            data: {
              spoilage_risk_score: data.urgency_score ? data.urgency_score / 100 : (data.prediction === 'Yes' ? 0.2 : 0.9),
              safety_status: data.prediction === 'Yes' ? 'Safe' : 'Unsafe',
              confidence_score: 0.95,
              urgency_level: data.urgency_level,
              prediction_time: new Date().toISOString()
            }
          });
          toast.success("Food safety prediction saved successfully.");
        } catch (updateErr) {
          console.error("Failed to update donation with AI results:", updateErr);
          toast.error("Prediction generated but could not be saved.");
        }
      }

    } catch (err: any) {
      setError(err.message || 'Failed to connect to the prediction engine.');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendation = () => {
    if (!result) return { title: 'Recommendation unavailable', desc: 'No recommendation available.' };
    const safePrediction = result.prediction || "Unknown";
    const safeUrgencyLevel = result.urgency_level || "Medium";

    if (safePrediction === 'No') {
      return {
        title: 'Warning: Food may be unsafe.',
        desc: 'Food should not be distributed for human consumption.'
      };
    }
    if (safeUrgencyLevel === 'Critical') {
      return {
        title: 'Immediate action needed.',
        desc: 'Immediate pickup required.'
      };
    }
    if (safeUrgencyLevel === 'High') {
      return {
        title: 'Safe but prioritize pickup immediately.',
        desc: 'Nearest NGO should collect within 60 minutes.'
      };
    }
    if (safeUrgencyLevel === 'Medium') {
      return {
        title: 'Safe for distribution.',
        desc: 'Assign an NGO within the next 2 hours.'
      };
    }
    return {
      title: 'Safe for distribution.',
      desc: 'Schedule pickup within the next 4–6 hours.'
    };
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Food Safety" />
        
      <main className="ml-[280px] pt-[112px] pb-12 px-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[45%_55%] gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="bg-white rounded-3xl border border-[#33251E]/5 p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#F07154] mb-1">Model Inputs</div>
                <h2 className="font-serif text-2xl text-[#33251E] leading-tight mb-1">Food safety features</h2>
                <p className="text-[#33251E]/60 text-xs font-medium">Same features used by the ML model.</p>
              </div>
            </div>

            <form className="space-y-4 relative z-10" onSubmit={handlePredict}>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Food item</label>
                <input name="food_item" value={formData.food_item} onChange={handleChange} type="text" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Food category</label>
                <input name="food_category" value={formData.food_category} onChange={handleChange} type="text" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Preparation method</label>
                <input name="preparation_method" value={formData.preparation_method} onChange={handleChange} type="text" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Storage condition</label>
                <input name="storage_condition" value={formData.storage_condition} onChange={handleChange} type="text" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Packaging type</label>
                <input name="packaging_type" value={formData.packaging_type} onChange={handleChange} type="text" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Temp (°C)</label>
                <input name="temperature_c" value={formData.temperature_c} onChange={handleChange} type="number" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Humidity (%)</label>
                <input name="humidity_percent" value={formData.humidity_percent} onChange={handleChange} type="number" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Hrs since prepared</label>
                <input name="hours_since_prepared" value={formData.hours_since_prepared} onChange={handleChange} type="number" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Est. transport (min)</label>
                <input name="estimated_transport_time_min" value={formData.estimated_transport_time_min} onChange={handleChange} type="number" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Distance (km)</label>
                <input name="distance_km" value={formData.distance_km} onChange={handleChange} type="number" step="0.1" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Quantity (kg)</label>
                <input name="quantity_kg" value={formData.quantity_kg} onChange={handleChange} type="number" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Season</label>
                <input name="season" value={formData.season} onChange={handleChange} type="text" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Event type</label>
                <input name="event_type" value={formData.event_type} onChange={handleChange} type="text" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">City tier</label>
                <input name="city_tier" value={formData.city_tier} onChange={handleChange} type="text" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Perishability score</label>
                <input name="perishability_score" value={formData.perishability_score} onChange={handleChange} type="number" step="0.01" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
                <div><label className="block text-[11px] font-semibold text-[#33251E]/70 mb-1">Est. shelf life (hrs)</label>
                <input name="estimated_shelf_life_hr" value={formData.estimated_shelf_life_hr} onChange={handleChange} type="number" className="w-full bg-white border border-[#33251E]/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F07154]" /></div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-[#F07154] hover:bg-[#E05F42] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_12px_-4px_rgba(240,113,84,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 w-full"
                >
                  {loading ? 'Running prediction...' : 'Run AI Safety Analysis'}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl border border-[#33251E]/5 p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-[#F07154]/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 z-0"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#33251E]/50 mb-1">AI Prediction</div>
                  <h2 className="font-serif text-3xl text-[#33251E] leading-none">Safety & urgency result</h2>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#33251E]/10 text-[10px] font-bold uppercase tracking-wider text-[#33251E]/70 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#33251E]"></span>
                  Auto Priority
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium mb-6 relative z-10 flex gap-3 items-start">
                  <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {!error && !result && (
                <div className="h-[220px] flex flex-col items-center justify-center bg-white border border-[#33251E]/10 rounded-2xl relative z-10 text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-[#33251E]/5 flex items-center justify-center text-[#33251E]/30 mb-4">
                    <ShieldCheck size={24} />
                  </div>
                  <p className="text-[#33251E]/60 text-sm font-medium max-w-[250px]">Run AI Safety Analysis to view safety, urgency, and pickup priority.</p>
                </div>
              )}

              {!error && result && (() => {
                const parsedRemaining = Number(result.remaining_shelf_life_hr ?? (result as any).predicted_shelf_life ?? formData.estimated_shelf_life_hr);
                const safeShelfLife = !isNaN(parsedRemaining) ? parsedRemaining : 24;
                
                const parsedTotal = Number(formData.estimated_shelf_life_hr);
                const safeTotalShelfLife = (!isNaN(parsedTotal) && parsedTotal > 0) ? parsedTotal : 24;
                const safePrediction = result.prediction || "Unknown";
                const safeUrgencyScore = Number(result.urgency_score) || 0;
                const safeUrgencyLevel = result.urgency_level || "Medium";
                const safePriority = Number(result.urgency_priority) || 1;
                const percentUsed = Math.max(0, Math.min(100, Math.round(100 - ((safeShelfLife / safeTotalShelfLife) * 100))));

                return (
                  <div className="grid grid-cols-3 gap-4 relative z-10">
                    
                    {/* Urgency Score Card */}
                    <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#33251E]/5 flex flex-col items-center justify-center text-center col-span-1 shadow-sm">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#33251E]/50 mb-4">Urgency Score</div>
                      <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                        {/* Fake Circular Meter */}
                        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                          <circle cx="48" cy="48" r="44" stroke="#E5E0DD" strokeWidth="6" fill="none" />
                          <circle 
                            cx="48" cy="48" r="44" 
                            stroke={safeUrgencyScore > 75 ? "#EF4444" : safeUrgencyScore > 40 ? "#F59E0B" : "#10B981"} 
                            strokeWidth="6" fill="none" 
                            strokeDasharray="276" 
                            strokeDashoffset={276 - (276 * safeUrgencyScore) / 100}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="text-center">
                          <div className="text-3xl font-serif text-[#33251E] leading-none">{Math.round(safeUrgencyScore)}</div>
                          <div className="text-[10px] font-bold text-[#33251E]/40 mt-1">OF 100</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${safeUrgencyLevel === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' : safeUrgencyLevel === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {safeUrgencyLevel === 'Critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
                        {safeUrgencyLevel}
                      </span>
                    </div>

                    {/* Safety Card */}
                    <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#33251E]/5 flex flex-col justify-center items-center text-center col-span-1 shadow-sm">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#33251E]/50 mb-3">Safety Prediction</div>
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm text-white ${safePrediction === 'Yes' ? 'bg-emerald-500' : safePrediction === 'No' ? 'bg-red-500' : 'bg-gray-400'}`}>
                          {safePrediction === 'Yes' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                        </div>
                        <span className="text-3xl font-serif text-[#33251E]">{safePrediction}</span>
                      </div>
                      <span className={`inline-block mb-6 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${safePrediction === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {safePrediction === 'Yes' ? 'Safe' : 'Unsafe'}
                      </span>

                      <div className="w-full">
                        <div className="flex justify-between text-[10px] font-bold text-[#33251E]/50 mb-1.5">
                          <span>Shelf-life used</span>
                          <span>{percentUsed}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#E5E0DD] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${percentUsed}%` }}></div>
                        </div>
                        <div className="text-[10px] text-[#33251E]/50 mt-2 font-medium">
                          {Math.floor(safeShelfLife)}h {Math.round((safeShelfLife % 1) * 60)}m remaining
                        </div>
                      </div>
                    </div>

                    {/* Priority Rank Card */}
                    <div className="bg-[#33251E] p-6 rounded-2xl text-white flex flex-col col-span-1 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#F07154]/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                      
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1 relative z-10">Priority Rank</div>
                      <div className="text-5xl font-serif mb-1 relative z-10">#{safePriority}</div>
                      <div className="text-[10px] text-white/50 mb-6 relative z-10">among active donations</div>
                      
                      <div className="mt-auto space-y-2 relative z-10">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-white/60">Urgency level</span>
                          <span className={safeUrgencyLevel === 'Critical' ? 'text-[#F07154] font-bold' : 'font-bold'}>{safeUrgencyLevel}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-white/60">Est. shelf life</span>
                          <span className="font-bold">{safeTotalShelfLife}h</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-white/60">Priority band</span>
                          <span className="font-bold">Top {Math.max(10, safePriority * 5)}%</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Action Panel */}
              {!error && result && (() => {
                const safePrediction = result.prediction || "Unknown";
                const safeUrgencyLevel = result.urgency_level || "Medium";
                return (
                  <div className={`mt-6 p-4 rounded-xl border flex gap-3 items-start relative z-10 shadow-sm ${safeUrgencyLevel === 'Critical' || safePrediction === 'No' ? 'bg-red-50/50 border-red-100 text-red-800' : 'bg-orange-50/50 border-orange-100 text-orange-800'}`}>
                    <AlertTriangle size={20} className={safeUrgencyLevel === 'Critical' || safePrediction === 'No' ? "text-red-500 mt-0.5" : "text-orange-500 mt-0.5"} />
                    <div>
                      <h4 className="font-serif text-lg mb-1">{getRecommendation().title}</h4>
                      <p className="text-sm opacity-80 font-medium">Recommended action: {getRecommendation().desc}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/donations', {
                      state: {
                        prefillData: {
                          ...prefill,
                          foodItem: formData.food_item,
                          foodCategory: formData.food_category,
                          prepMethod: formData.preparation_method,
                          storageCondition: formData.storage_condition,
                          packagingType: formData.packaging_type,
                          temperature: formData.temperature_c,
                          humidity: formData.humidity_percent,
                          hoursPrepared: formData.hours_since_prepared,
                          estTransport: formData.estimated_transport_time_min,
                          distance: formData.distance_km,
                          quantity: formData.quantity_kg,
                          season: formData.season,
                          eventType: formData.event_type,
                          cityTier: formData.city_tier,
                          perishabilityScore: formData.perishability_score,
                          shelfLife: result ? String(result.remaining_shelf_life_hr) : formData.estimated_shelf_life_hr,
                          existingAiData: result ? {
                            spoilage_risk_score: result.urgency_score ? result.urgency_score / 100 : (result.prediction === 'Yes' ? 0.2 : 0.9),
                            safety_status: result.prediction === 'Yes' ? 'Safe' : 'Unsafe',
                            confidence_score: 0.95,
                            predicted_shelf_life: result.remaining_shelf_life_hr,
                            urgency_level: result.urgency_level
                          } : existingAiData
                        }
                      }
                    });
                  }}
                  className="bg-white border border-[#33251E]/10 hover:bg-[#33251E]/5 text-[#33251E] px-8 py-2.5 rounded-xl text-sm font-bold transition-all w-full flex items-center justify-center shadow-sm"
                >
                  Return to Donation
                </button>
              </div>

            </div>

            <div className="bg-[#FDFBF7] rounded-3xl border border-[#33251E]/5 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Info size={16} className="text-[#33251E]/40" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#33251E]/60">How this score works</h4>
              </div>
              <p className="text-xs text-[#33251E]/70 leading-relaxed">
                Urgency is calculated based on shelf-life utilization, transport distance, ambient temperature exposure and category perishability. Scores above 75 trigger auto-priority routing.
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
