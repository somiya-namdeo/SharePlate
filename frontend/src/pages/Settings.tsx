import { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Download, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api';

export function Settings() {
  const initialState = {
    fullName: "Ananya Kapoor",
    email: "ananya@shareplate.org",
    phone: "+91 98xxxx01",
    orgName: "SharePlate Bhopal Chapter",
    orgType: "NGO / Food rescue collective",
    address: "MP Nagar",
    city: "Bhopal",
    serviceArea: "Central MP",
    radius: "8",
    window: "15 - 30 mins",
    vehicles: "Van, 2-wheeler",
    route: "Fastest (Time-optimized)",
    
    notificationsEnabled: true,
    autoAccept: true,
    
    autoPriority: 75,
    matchConfidence: 70,
    manualReview: 40
  };

  const [settings, setSettings] = useState(initialState);
  const [hasChanges, setHasChanges] = useState(false);

  const loadData = async () => {
    try {
      const [settingsRes, profileRes] = await Promise.all([
        apiFetch('/api/settings'),
        apiFetch('/api/users/profile')
      ]);
      
      setSettings(prev => ({
        ...prev,
        notificationsEnabled: settingsRes.data?.notifications?.notifications_enabled ?? true,
        fullName: profileRes.data?.full_name || '',
        phone: profileRes.data?.phone || '',
        orgName: profileRes.data?.organization || '',
        city: profileRes.data?.city || '',
        email: profileRes.data?.email || prev.email,
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to load settings");
    }
  };

  // Fetch settings on mount
  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (key: keyof typeof initialState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // 1. Save profile fields
      await apiFetch('/api/users/profile', {
        method: 'PUT',
        data: {
          full_name: settings.fullName,
          phone: settings.phone,
          organization: settings.orgName,
          city: settings.city
        }
      });

      // 2. Save notification settings
      await apiFetch('/api/settings/notifications', {
        method: 'PUT',
        data: {
          notifications_enabled: settings.notificationsEnabled
        }
      });
      
      setHasChanges(false);
      toast.success("Settings saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    }
  };

  const handleDiscard = () => {
    loadData();
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Settings" />

      <main className="ml-0 lg:ml-[280px] pt-[112px] pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6">
           <div>
              <h2 className="font-serif text-2xl font-bold text-[#33251E] mb-1">Account & Organization Settings</h2>
              <p className="text-sm text-[#33251E]/70">Manage profile, organization, notifications, AI thresholds, exports, and account security.</p>
           </div>
           <div className="flex items-center gap-3 shrink-0">
              {hasChanges && (
                 <span className="text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-200/50 px-3 py-2 rounded-xl animate-pulse hidden md:block mr-2">
                    You have unsaved changes
                 </span>
              )}
              <button 
                onClick={handleDiscard}
                disabled={!hasChanges}
                className={`border rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${hasChanges ? 'border-[#33251E]/20 hover:bg-gray-50 text-[#33251E]' : 'border-transparent bg-gray-50/50 text-[#33251E]/30 cursor-not-allowed'}`}
              >
                 Discard Changes
              </button>
              <button 
                onClick={handleSave}
                disabled={!hasChanges}
                className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all shadow-sm ${hasChanges ? 'bg-[#F07154] hover:bg-[#E05F42] text-white' : 'bg-[#F07154]/50 text-white/90 cursor-not-allowed shadow-none'}`}
              >
                 Save changes
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          
          {/* Left Column */}
          <div className="flex flex-col gap-6">
             
             {/* User Profile */}
             <div className="bg-white rounded-2xl border border-[#33251E]/10 shadow-sm p-6">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">User profile</h3>
                
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F07154] to-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      AK
                   </div>
                   <div>
                      <div className="font-bold text-[#33251E]">Ananya Kapoor</div>
                      <div className="text-xs text-[#33251E]/60 font-medium">Coordinator · SharePlate Bhopal</div>
                   </div>
                </div>
                
                <div className="space-y-5">
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Full name</label>
                      <input value={settings.fullName} onChange={(e) => handleChange('fullName', e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Email</label>
                      <input value={settings.email} onChange={(e) => handleChange('email', e.target.value)} type="email" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                      <p className="text-[11px] text-[#33251E]/50 mt-1.5 ml-1">Used for account notifications.</p>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Phone</label>
                      <input value={settings.phone} onChange={(e) => handleChange('phone', e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                   </div>
                </div>
             </div>

             {/* Account Security */}
             <div className="bg-white rounded-2xl border border-[#33251E]/10 shadow-sm p-6">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">Account security</h3>
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <div>
                         <div className="font-semibold text-sm text-[#33251E] flex items-center gap-2"><Key size={14} className="text-[#33251E]/60" /> Password</div>
                         <div className="text-xs text-[#33251E]/60 mt-1">Last changed 4 months ago</div>
                      </div>
                      <button className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
                         Change
                      </button>
                   </div>
                </div>
             </div>
             
             {/* Notification Preferences */}
             <div className="bg-white rounded-2xl border border-[#33251E]/10 shadow-sm p-6">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">Notification preferences</h3>
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <div>
                         <div className="font-semibold text-sm text-[#33251E]">Enable Notifications</div>
                         <div className="text-xs text-[#33251E]/60">Receive in-app alerts and notifications</div>
                      </div>
                      <div onClick={() => handleChange('notificationsEnabled', !settings.notificationsEnabled)} className={`w-10 h-6 rounded-full relative cursor-pointer shadow-inner flex shrink-0 transition-colors duration-300 ${settings.notificationsEnabled ? 'bg-[#F07154]' : 'bg-[#E5E0DA]'}`}>
                         <div className={`w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm transition-transform duration-300 ${settings.notificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* AI Thresholds */}
             <div className="bg-white rounded-2xl border border-[#33251E]/10 shadow-sm p-6">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-2">AI thresholds</h3>
                <p className="text-xs text-[#33251E]/60 mb-6">These values control auto-priority, matching confidence, and manual review routing.</p>
                
                <div className="space-y-6">
                   <div>
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-semibold text-sm text-[#33251E]">Auto-priority urgency score</span>
                         <span className="bg-[#F07154]/10 text-[#F07154] px-2 py-0.5 rounded-md font-bold text-xs">{settings.autoPriority}</span>
                      </div>
                      <div className="relative h-4 flex items-center">
                         <div className="h-1.5 w-full bg-gray-100 rounded-full relative pointer-events-none">
                            <div className="h-full bg-[#F07154] rounded-full" style={{ width: `${settings.autoPriority}%` }}></div>
                            <div className="w-4 h-4 bg-white border-2 border-[#F07154] rounded-full absolute top-1/2 -translate-y-1/2 shadow-sm" style={{ left: `${settings.autoPriority}%`, marginLeft: '-8px' }}></div>
                         </div>
                         <input type="range" min="0" max="100" value={settings.autoPriority} onChange={(e) => handleChange('autoPriority', parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-semibold text-sm text-[#33251E]">Match confidence floor</span>
                         <span className="bg-[#F07154]/10 text-[#F07154] px-2 py-0.5 rounded-md font-bold text-xs">{settings.matchConfidence}</span>
                      </div>
                      <div className="relative h-4 flex items-center">
                         <div className="h-1.5 w-full bg-gray-100 rounded-full relative pointer-events-none">
                            <div className="h-full bg-[#F07154] rounded-full" style={{ width: `${settings.matchConfidence}%` }}></div>
                            <div className="w-4 h-4 bg-white border-2 border-[#F07154] rounded-full absolute top-1/2 -translate-y-1/2 shadow-sm" style={{ left: `${settings.matchConfidence}%`, marginLeft: '-8px' }}></div>
                         </div>
                         <input type="range" min="0" max="100" value={settings.matchConfidence} onChange={(e) => handleChange('matchConfidence', parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-semibold text-sm text-[#33251E]">Manual review trigger</span>
                         <span className="bg-[#F07154]/10 text-[#F07154] px-2 py-0.5 rounded-md font-bold text-xs">{settings.manualReview}</span>
                      </div>
                      <div className="relative h-4 flex items-center">
                         <div className="h-1.5 w-full bg-gray-100 rounded-full relative pointer-events-none">
                            <div className="h-full bg-[#F07154] rounded-full" style={{ width: `${settings.manualReview}%` }}></div>
                            <div className="w-4 h-4 bg-white border-2 border-[#F07154] rounded-full absolute top-1/2 -translate-y-1/2 shadow-sm" style={{ left: `${settings.manualReview}%`, marginLeft: '-8px' }}></div>
                         </div>
                         <input type="range" min="0" max="100" value={settings.manualReview} onChange={(e) => handleChange('manualReview', parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                   </div>
                </div>
                <div className="mt-8 pt-6 border-t border-[#33251E]/5">
                   <button onClick={() => { handleChange('autoPriority', 75); handleChange('matchConfidence', 70); handleChange('manualReview', 40); }} className="text-sm font-semibold text-[#33251E]/70 hover:text-[#33251E] transition-colors bg-white border border-[#33251E]/10 rounded-xl px-5 py-2.5">
                      Reset AI thresholds
                   </button>
                </div>
             </div>
          </div>
          
          {/* Right Column */}
          <div className="flex flex-col gap-6">
             
             {/* Organization */}
             <div className="bg-white rounded-2xl border border-[#33251E]/10 shadow-sm p-6">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">Organization</h3>
                <div className="space-y-5">
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Organization name</label>
                      <input value={settings.orgName} onChange={(e) => handleChange('orgName', e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Type</label>
                      <input value={settings.orgType} onChange={(e) => handleChange('orgType', e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Address</label>
                      <input value={settings.address} onChange={(e) => handleChange('address', e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">City</label>
                         <input value={settings.city} onChange={(e) => handleChange('city', e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Service area</label>
                         <input value={settings.serviceArea} onChange={(e) => handleChange('serviceArea', e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Pickup Preferences */}
             <div className="bg-white rounded-2xl border border-[#33251E]/10 shadow-sm p-6">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">Pickup preferences</h3>
                <div className="space-y-5 mb-8">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Preferred radius (km)</label>
                         <input value={settings.radius} onChange={(e) => handleChange('radius', e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Default pickup window</label>
                         <input value={settings.window} onChange={(e) => handleChange('window', e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Available vehicle types</label>
                      <input value={settings.vehicles} onChange={(e) => handleChange('vehicles', e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Preferred route mode</label>
                      <select value={settings.route} onChange={(e) => handleChange('route', e.target.value)} className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors appearance-none cursor-pointer">
                         <option>Fastest (Time-optimized)</option>
                         <option>Shortest (Distance-optimized)</option>
                         <option>Safest (Avoid heavy traffic)</option>
                      </select>
                   </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-[#33251E]/5">
                   <div>
                      <div className="font-semibold text-sm text-[#33251E]">Auto-accept nearby matches</div>
                      <div className="text-xs text-[#33251E]/60">Assign automatically if score {'>'} 90%</div>
                   </div>
                   <div onClick={() => handleChange('autoAccept', !settings.autoAccept)} className={`w-10 h-6 rounded-full relative cursor-pointer shadow-inner flex shrink-0 transition-colors duration-300 ${settings.autoAccept ? 'bg-[#F07154]' : 'bg-[#E5E0DA]'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm transition-transform duration-300 ${settings.autoAccept ? 'translate-x-4' : 'translate-x-0'}`}></div>
                   </div>
                </div>
             </div>
             
             {/* Data Export */}
             <div className="bg-white rounded-2xl border border-[#33251E]/10 shadow-sm p-6">
                <h3 className="font-serif text-xl font-bold text-[#33251E] mb-2">Data export</h3>
                <p className="text-sm text-[#33251E]/70 mb-6">Download your donation, matching and impact data.</p>
                <div className="flex flex-wrap gap-3">
                   <button className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors">
                      <Download size={14} /> Export CSV
                   </button>
                   <button className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors">
                      <Download size={14} /> Export PDF
                   </button>
                   <button className="bg-white border border-[#33251E]/10 hover:border-[#33251E]/30 text-[#33251E] rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors">
                      <Download size={14} /> Export JSON
                   </button>
                </div>
             </div>

             {/* Account Actions / Danger Zone */}
             <div className="bg-white rounded-2xl border border-red-100/50 shadow-sm p-6">
                <h3 className="font-serif text-xl font-bold text-red-600 mb-2">Account actions</h3>
                <p className="text-sm text-red-600/70 mb-6 font-medium">Warning: These actions cannot be undone.</p>
                
                <div className="flex flex-wrap gap-3">
                   <button className="bg-white border border-[#33251E]/10 hover:bg-gray-50 text-[#33251E] rounded-xl px-5 py-2.5 text-sm font-bold transition-colors">
                      Log out
                   </button>
                   <button className="bg-red-50 hover:bg-red-100 text-red-600 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors">
                      Clear demo data
                   </button>
                   <button className="border border-red-200 hover:bg-red-50 text-red-600 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors">
                      Delete account
                   </button>
                </div>
             </div>

          </div>
        </div>

      </main>
    </div>
  );
}
