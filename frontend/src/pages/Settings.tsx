import { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { Key, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api';
import { updateUserLocal } from '../lib/auth';

interface ProfileState {
  fullName: string;
  email: string;
  phone: string;
  orgName: string;
  city: string;
}

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileState>({
    fullName: '',
    email: '',
    phone: '',
    orgName: '',
    city: ''
  });
  const [baselineProfile, setBaselineProfile] = useState<ProfileState>({
    fullName: '',
    email: '',
    phone: '',
    orgName: '',
    city: ''
  });
  
  const [saving, setSaving] = useState(false);

  // Password state
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(baselineProfile);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/users/profile');
      if (res.data) {
        const loaded = {
          fullName: res.data.full_name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          orgName: res.data.organization || '',
          city: res.data.city || ''
        };
        setProfile(loaded);
        setBaselineProfile(loaded);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileChange = (key: keyof ProfileState, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = (key: keyof typeof passwords, value: string) => {
    setPasswords(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    if (!hasChanges || saving) return;
    
    try {
      setSaving(true);
      const res = await apiFetch('/api/users/profile', {
        method: 'PUT',
        data: {
          full_name: profile.fullName,
          phone: profile.phone,
          organization: profile.orgName,
          city: profile.city
        }
      });
      
      if (res.success) {
        setBaselineProfile(profile);
        updateUserLocal({ full_name: profile.fullName });
        toast.success('Profile saved successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setProfile(baselineProfile);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return toast.error('Please fill in all password fields');
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }
    
    try {
      setPasswordSaving(true);
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        data: {
          old_password: passwords.oldPassword,
          new_password: passwords.newPassword
        }
      });
      
      if (res.success) {
        toast.success('Password updated successfully');
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(res.message || 'Failed to update password');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans selection:bg-[#F07154]/20 selection:text-[#33251E]">
      <Sidebar />
      <Topbar title="Settings" />

      <main className="ml-0 lg:ml-[280px] pt-[112px] pb-12 px-4 lg:px-8 max-w-[1200px] mx-auto flex flex-col gap-6">
        
        {/* Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-[#33251E]/10 p-6">
           <div>
              <h2 className="font-serif text-2xl font-bold text-[#33251E] mb-1">Account Settings</h2>
              <p className="text-sm text-[#33251E]/70">Manage your profile, organization, and account security.</p>
           </div>
           <div className="flex items-center gap-3 shrink-0">
              {hasChanges && (
                 <span className="text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-200/50 px-3 py-2 rounded-xl animate-pulse hidden md:block mr-2">
                    Unsaved changes
                 </span>
              )}
              <button 
                onClick={handleDiscard}
                disabled={!hasChanges || saving}
                className={`border rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${hasChanges && !saving ? 'border-[#33251E]/20 hover:bg-gray-50 text-[#33251E]' : 'border-transparent bg-gray-50/50 text-[#33251E]/30 cursor-not-allowed'}`}
              >
                 Discard Changes
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={!hasChanges || saving}
                className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 min-w-[140px] ${hasChanges && !saving ? 'bg-[#F07154] hover:bg-[#E05F42] text-white' : 'bg-[#F07154]/50 text-white/90 cursor-not-allowed shadow-none'}`}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Save changes'
                )}
              </button>
           </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={32} className="animate-spin text-[#F07154]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
            
            {/* User & Organization Profile */}
            <div className="bg-white rounded-2xl border border-[#33251E]/10 shadow-sm p-6">
              <h3 className="font-serif text-xl font-bold text-[#33251E] mb-6">User & Organization Profile</h3>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-[#33251E] text-white flex items-center justify-center font-bold text-lg shadow-md select-none">
                  {getInitials(baselineProfile.fullName)}
                </div>
                <div>
                  <div className="font-bold text-[#33251E]">{baselineProfile.fullName || 'User'}</div>
                  <div className="text-xs text-[#33251E]/60 font-medium">{baselineProfile.email}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Full Name</label>
                  <input 
                    value={profile.fullName} 
                    onChange={(e) => handleProfileChange('fullName', e.target.value)} 
                    type="text" 
                    className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Email</label>
                  <input 
                    value={profile.email} 
                    disabled
                    type="email" 
                    className="w-full bg-gray-50 border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E]/60 cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Phone</label>
                  <input 
                    value={profile.phone} 
                    onChange={(e) => handleProfileChange('phone', e.target.value)} 
                    type="tel" 
                    className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Organization Name</label>
                  <input 
                    value={profile.orgName} 
                    onChange={(e) => handleProfileChange('orgName', e.target.value)} 
                    type="text" 
                    className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">City</label>
                  <input 
                    value={profile.city} 
                    onChange={(e) => handleProfileChange('city', e.target.value)} 
                    type="text" 
                    className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-2xl border border-[#33251E]/10 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Key size={20} className="text-[#33251E]" />
                <h3 className="font-serif text-xl font-bold text-[#33251E]">Account Security</h3>
              </div>
              
              <form onSubmit={handleSavePassword} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Current Password</label>
                  <input 
                    value={passwords.oldPassword} 
                    onChange={(e) => handlePasswordChange('oldPassword', e.target.value)} 
                    type="password" 
                    className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">New Password</label>
                  <input 
                    value={passwords.newPassword} 
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)} 
                    type="password" 
                    className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#33251E]/60 mb-2 block">Confirm New Password</label>
                  <input 
                    value={passwords.confirmPassword} 
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)} 
                    type="password" 
                    className="w-full bg-[#FDFBF7] border border-[#33251E]/10 rounded-xl px-4 py-3 text-sm text-[#33251E] focus:outline-none focus:border-[#F07154] transition-colors" 
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={passwordSaving || !passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword}
                    className="bg-[#33251E] hover:bg-[#4A362C] disabled:bg-[#33251E]/50 text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-colors flex items-center justify-center gap-2 min-w-[180px]"
                  >
                    {passwordSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
