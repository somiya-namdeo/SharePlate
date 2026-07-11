import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { ChevronDown, Phone, Route as RouteIcon, MapPin } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { getUser } from '../lib/auth';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Fix Leaflet's default icon path issues with bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const donorIcon = L.divIcon({
  html: `<div style="background-color: #F07154; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const ngoIcon = L.divIcon({
  html: `<div style="background-color: #33251E; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

function MapBounds({ markers }: { markers: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [markers, map]);
  return null;
}

export function MapLogistics() {
  const filters = ["Urgency", "Safety", "Category", "NGO Request", "Pickup Status"];
  
  const [searchParams] = useSearchParams();
  const requestIdParam = searchParams.get('request');

  const [donations, setDonations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  
  const [selectedPickup, setSelectedPickup] = useState<any | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  useEffect(() => {
    setIsContactModalOpen(false);
  }, [selectedPickup]);
  
  const fetchData = async () => {
    try {
      const [donRes, reqRes] = await Promise.all([
        apiFetch('/api/donations/'),
        apiFetch('/api/requests/')
      ]);
      
      const donList = Array.isArray(donRes) ? donRes : (donRes.data || []);
      const reqList = Array.isArray(reqRes) ? reqRes : (reqRes.data || []);
      
      setDonations(donList.filter((d: any) => d.latitude !== null && d.longitude !== null && ['pending', 'matched', 'picked_up'].includes((d.status || 'pending').toLowerCase())));
      setRequests(reqList.filter((r: any) => r.latitude !== null && r.longitude !== null && (r.status || 'open').toLowerCase() === 'open'));
      
      const user = getUser();
      if (user && user.id) {
        const role = user.user_metadata?.role === 'ngo' ? 'ngo' : 'donor';
        const matchRes = await apiFetch(`/api/matches/${role}/${user.id}`);
        if (matchRes.success && Array.isArray(matchRes.data)) {
           setMatches(matchRes.data.filter((m: any) => ['pending', 'accepted', 'picked_up'].includes((m.status || 'pending').toLowerCase())));
        }
      }
    } catch (err) {
      console.error("Failed to fetch map data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle auto-selection for deep-linked requests
  useEffect(() => {
    if (requestIdParam && donations.length > 0 && requests.length > 0 && matches.length > 0 && !selectedPickup) {
      const activeMatchForRequest = matches.find((m: any) => 
        m.request_id === requestIdParam && 
        ['pending', 'accepted'].includes((m.status || '').toLowerCase())
      );
      if (activeMatchForRequest) {
        const donationForMatch = donations.find((d: any) => d.id === activeMatchForRequest.donation_id);
        if (donationForMatch) {
          setSelectedPickup({ ...donationForMatch, type: 'donation' });
        }
      }
    }
  }, [requestIdParam, donations, requests, matches, selectedPickup]);

  const updateMatchStatus = async (matchId: string, status: string) => {
    try {
      const res = await apiFetch(`/api/matches/${matchId}/status`, {
        method: 'PUT',
        data: { status }
      });
      if (res.success) {
        toast.success(`Match marked as ${status}`);
        if (['completed', 'rejected', 'cancelled'].includes(status)) {
          setSelectedPickup(null);
        }
        fetchData();
      } else {
        toast.error(res.detail || res.message || 'Failed to update match status');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to update match status');
    }
  };

  // Apply deterministic display offset for overlapping coordinates
  const displayDonations = useMemo(() => {
    let filteredDonations = donations;
    
    // Deep-link isolation: if request ID is passed, only show its matched donation
    if (requestIdParam && matches.length > 0) {
      const activeMatch = matches.find((m: any) => 
        m.request_id === requestIdParam && 
        ['pending', 'accepted'].includes((m.status || '').toLowerCase())
      );
      if (activeMatch) {
        filteredDonations = donations.filter(d => d.id === activeMatch.donation_id);
      }
    }

    return filteredDonations.map((d, i) => {
      const angle = i * 137.5 * (Math.PI / 180);
      const radius = 0.0003 + (0.0001 * (i % 3));
      return { 
        ...d, 
        displayLat: d.latitude + Math.sin(angle) * radius, 
        displayLng: d.longitude + Math.cos(angle) * radius 
      };
    });
  }, [donations, requestIdParam, matches]);

  const displayRequests = useMemo(() => {
    let filteredRequests = requests;
    
    // Deep-link isolation: if request ID is passed, only show that specific request
    if (requestIdParam) {
      filteredRequests = requests.filter(r => r.id === requestIdParam);
    }

    return filteredRequests.map((r, i) => {
      const angle = (i * 137.5 + 45) * (Math.PI / 180);
      const radius = 0.0003 + (0.0001 * (i % 3));
      return { 
        ...r, 
        displayLat: r.latitude + Math.sin(angle) * radius, 
        displayLng: r.longitude + Math.cos(angle) * radius 
      };
    });
  }, [requests, requestIdParam]);

  const allValidCoords = useMemo(() => {
    const coords: [number, number][] = [];
    
    // Use the filtered display collections to determine bounds so the map focuses
    // strictly on the isolated deep-link pair if applicable.
    displayDonations.forEach((d: any) => {
      const lat = d.latitude;
      const lng = d.longitude;
      if (lat > 22 && lat < 24.5 && lng > 76 && lng < 79) {
        coords.push([lat, lng]);
      } else if (lat && lng) {
        console.warn(`[Suspicious Coordinate - Viewport Excluded] Donation ID: ${d.id} | Lat: ${lat}, Lng: ${lng}`);
      }
    });

    displayRequests.forEach((r: any) => {
      const lat = r.latitude;
      const lng = r.longitude;
      if (lat > 22 && lat < 24.5 && lng > 76 && lng < 79) {
        coords.push([lat, lng]);
      } else if (lat && lng) {
        console.warn(`[Suspicious Coordinate - Viewport Excluded] NGO Request ID: ${r.id} | Lat: ${lat}, Lng: ${lng}`);
      }
    });
    
    return coords;
  }, [displayDonations, displayRequests]);
  
  const defaultCenter: [number, number] = [23.2599, 77.4126];

  // Selected Data Computations
  const activeMatches = useMemo(() => {
    return matches.filter((m: any) => {
      const status = (m.status || '').toLowerCase();
      return ['pending', 'accepted'].includes(status);
    });
  }, [matches]);

  const selectedActiveMatch = useMemo(() => {
    if (!selectedPickup || selectedPickup.type !== 'donation') return null;
    return activeMatches.find((m: any) => m.donation_id === selectedPickup.id);
  }, [activeMatches, selectedPickup]);

  const visibleMatches = useMemo(() => {
    if (selectedPickup && selectedPickup.type === 'donation') {
      return selectedActiveMatch ? [selectedActiveMatch] : [];
    }
    return activeMatches;
  }, [activeMatches, selectedPickup, selectedActiveMatch]);

  const selectedMatch = selectedActiveMatch;
  
  const getSelectedNGO = () => {
    if (!selectedMatch) return null;
    return requests.find((r: any) => r.id === selectedMatch.request_id);
  };
  const selectedNGO = getSelectedNGO();

  // Polylines using original coordinates
  const matchLines = visibleMatches.map((m: any, i: number) => {
    const d = donations.find((don: any) => don.id === m.donation_id);
    const r = requests.find((req: any) => req.id === m.request_id);
    if (d && r) {
      return (
        <Polyline 
          key={`match-${m.id || i}`} 
          positions={[[d.latitude, d.longitude], [r.latitude, r.longitude]]} 
          pathOptions={{ color: '#34d399', dashArray: '5, 5', weight: 3 }} 
        />
      );
    }
    return null;
  });

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Map & Logistics" />

      <main className="ml-0 lg:ml-[280px] pt-[112px] pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto flex flex-col">
        
        {/* Top Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-4 mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-[#33251E]/40 uppercase tracking-widest mr-2">Filters</span>
            {filters.map((f, i) => (
              <button key={i} className="bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-2 text-xs font-semibold text-[#33251E]/80 flex items-center gap-2 hover:border-[#33251E]/30 transition-colors">
                {f}
                <ChevronDown size={14} className="text-[#33251E]/40" />
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-[#33251E]/60 uppercase tracking-widest bg-[#FDFBF7] px-4 py-2.5 rounded-xl border border-[#33251E]/5">
             <span className="mr-2 opacity-50">LEGEND</span>
             <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe</span>
             <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending Safety</span>
             <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#F07154]"></span> Donor</span>
             <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#33251E]"></span> NGO</span>
          </div>
        </div>

        {/* Main Map Row */}
        <div className="grid grid-cols-1 xl:grid-cols-[7fr_3fr] gap-6 mb-6 items-stretch xl:h-[560px]">
          
          {/* Map Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 flex flex-col h-full overflow-hidden relative">
             
             {/* Card Header */}
             <div className="p-6 border-b border-[#33251E]/5 shrink-0 bg-white relative z-20">
                <h3 className="font-serif text-2xl font-bold text-[#33251E]">Live Rescue Map</h3>
                <p className="text-sm text-[#33251E]/70 mt-1">Track urgent pickups, NGOs, donors, and demand hotspots.</p>
             </div>
             
             {/* Map Canvas */}
             <div className="flex-1 w-full relative z-10 bg-[#e5e3df]">
                <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  {allValidCoords.length > 0 && <MapBounds markers={allValidCoords} />}
                  
                  {matchLines}

                  {displayDonations.map((d, i) => (
                    <Marker 
                      key={`don-${i}`} 
                      position={[d.displayLat, d.displayLng]} 
                      icon={donorIcon}
                      eventHandlers={{ click: () => setSelectedPickup({ ...d, type: 'donation' }) }}
                    />
                  ))}

                  {displayRequests.map((r, i) => (
                    <Marker 
                      key={`req-${i}`} 
                      position={[r.displayLat, r.displayLng]} 
                      icon={ngoIcon}
                    >
                      <Popup className="font-sans">
                        <div className="p-1 min-w-[150px]">
                          <span className="text-[10px] font-bold text-[#F07154] uppercase tracking-widest block mb-1">NGO Request</span>
                          <div className="font-bold text-[#33251E] mb-1">{r.preferred_food_type || 'Food'}</div>
                          <div className="text-sm text-[#33251E]/80 mb-2">{r.meals_needed} meals needed</div>
                          <div className="flex gap-2">
                             <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">{r.urgency_level || 'Medium'}</span>
                             <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded capitalize">{r.status || 'Open'}</span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
             </div>
          </div>
          
          {/* Selected Marker Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 flex flex-col justify-between h-full overflow-hidden">
             <div className="p-6 pb-4 overflow-y-auto">
               <span className="text-[11px] font-bold text-[#F07154] uppercase tracking-[0.1em] mb-2 flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#F07154]"></span>
                 SELECTED DONATION
               </span>
               
               {selectedPickup && selectedPickup.type === 'donation' ? (
                 <>
                   <h2 className="font-serif text-3xl font-bold text-[#33251E] truncate" title={selectedPickup.food_type || 'Food Donation'}>
                     {selectedPickup.food_type || 'Food Donation'}
                   </h2>
                   <p className="text-sm text-[#33251E]/70 mt-1 mb-5">
                     {selectedPickup.quantity} {selectedPickup.quantity <= 1000 ? 'kg' : ''} • {selectedPickup.address || 'Location unavailable'}
                   </p>
                   
                   <div className="flex gap-2 mb-6">
                     {(() => {
                       const rawSafety = (selectedPickup.safety_status || '').toLowerCase();
                       if (['yes', 'safe'].includes(rawSafety)) {
                         return <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border border-emerald-200">SAFE</span>;
                       } else if (['no', 'unsafe'].includes(rawSafety)) {
                         return <span className="bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border border-red-200">UNSAFE</span>;
                       }
                       return <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border border-amber-200">PENDING SAFETY</span>;
                     })()}
                   </div>
                   
                   <div className="space-y-2">
                      <div className="flex justify-between items-center py-2.5 border-b border-[#33251E]/5">
                         <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest">Est Shelf Life</span>
                         <span className="text-sm font-semibold text-[#33251E]">{selectedPickup.predicted_shelf_life ? `${selectedPickup.predicted_shelf_life} hrs` : '—'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5 border-b border-[#33251E]/5">
                         <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest">Assigned NGO</span>
                         <span className="text-sm font-semibold text-[#33251E] truncate max-w-[120px]" title={selectedMatch?.ngo_name || selectedNGO?.ngo_name || selectedNGO?.organization || 'Not assigned'}>{selectedMatch?.ngo_name || selectedNGO?.ngo_name || selectedNGO?.organization || 'Not assigned'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5">
                         <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest">Distance</span>
                         <span className="text-sm font-semibold text-[#33251E]">{selectedMatch?.distance_km ? `${selectedMatch.distance_km} km` : '—'}</span>
                      </div>
                   </div>
                 </>
               ) : (
                 <div className="flex flex-col items-center justify-center h-48 text-[#33251E]/40">
                   <MapPin size={32} className="mb-3 opacity-50" />
                   <p className="text-sm font-medium">Click a donor marker to view details</p>
                 </div>
               )}
             </div>
             
             {/* Footer Area */}
             <div className="p-6 bg-[#FDFBF7] border-t border-[#33251E]/10 shrink-0">
               {selectedMatch && (
                 <div className="mb-3 space-y-2">
                   {(() => {
                     const currentUserId = getUser()?.id;
                     const isNgo = currentUserId === selectedMatch.ngo_id;
                     
                     if (selectedMatch.status === 'pending' && isNgo) {
                       return (
                         <div className="flex gap-2">
                           <button onClick={() => updateMatchStatus(selectedMatch.id, 'accepted')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-sm font-bold transition-colors shadow-sm border border-emerald-700">Accept Match</button>
                           <button onClick={() => updateMatchStatus(selectedMatch.id, 'rejected')} className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl py-2.5 text-sm font-bold transition-colors">Reject</button>
                         </div>
                       );
                     }
                     if (selectedMatch.status === 'accepted') {
                       return (
                         <button onClick={() => updateMatchStatus(selectedMatch.id, 'completed')} className="w-full bg-[#33251E] hover:bg-black text-white rounded-xl py-2.5 text-sm font-bold transition-colors shadow-sm">Complete Rescue</button>
                       );
                     }
                     return null;
                   })()}
                 </div>
               )}
               <div className="flex gap-3">
                 <button 
                    disabled={!selectedPickup || !selectedNGO || !selectedPickup.latitude || !selectedNGO.latitude}
                    onClick={() => {
                      if (selectedPickup && selectedNGO && selectedPickup.latitude && selectedNGO.latitude) {
                        window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${selectedPickup.latitude},${selectedPickup.longitude};${selectedNGO.latitude},${selectedNGO.longitude}`, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="flex-1 bg-[#F07154] hover:bg-[#E05F42] text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                   <RouteIcon size={18} /> {(!selectedPickup || !selectedMatch) ? 'No destination assigned' : 'Navigate'}
                 </button>
                 <button 
                    disabled={!selectedMatch} 
                    onClick={() => setIsContactModalOpen(true)}
                    className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-xl px-5 py-3 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                   <Phone size={18} />
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* Logistics Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6">
              <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-2">Live Donations</span>
              <div className="font-serif text-3xl font-bold text-[#33251E]">
                {donations.length} 
                <span className="text-sm font-sans font-semibold text-[#33251E]/40 uppercase tracking-wider ml-1">Total</span>
              </div>
           </div>
           <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6">
              <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-2">Active Matches</span>
              <div className="font-serif text-3xl font-bold text-[#33251E]">
                {activeMatches.length} 
                <span className="text-sm font-sans font-semibold text-emerald-500 uppercase tracking-wider ml-1">Live</span>
              </div>
           </div>
           <div className="bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6">
              <span className="text-[11px] font-bold text-[#33251E]/40 uppercase tracking-widest block mb-2">NGOs Needing Food</span>
              <div className="font-serif text-3xl font-bold text-[#33251E]">
                {requests.length} 
                <span className="text-sm font-sans font-semibold text-[#F07154] uppercase tracking-wider ml-1">Open</span>
              </div>
           </div>
        </div>

      </main>

      {/* Contact Modal */}
      {isContactModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsContactModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[#33251E]/10">
              <h3 className="font-serif text-2xl font-bold text-[#33251E]">Contact Details</h3>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const currentUserId = getUser()?.id;
                const isNgo = currentUserId === selectedMatch.ngo_id;
                
                const contactName = isNgo ? selectedMatch.donor_name : selectedMatch.ngo_name;
                const contactPhone = isNgo ? selectedMatch.donor_phone : selectedMatch.ngo_phone;
                const contactEmail = isNgo ? selectedMatch.donor_email : selectedMatch.ngo_email;
                
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
