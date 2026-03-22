'use client';
import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, CreditCard, Shield, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';

type Tab = 'profile' | 'security' | 'notifications' | 'billing';

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
      style={{ position:'fixed', bottom:'24px', right:'24px', background: type==='success' ? '#0f766e' : '#ef4444', color:'#fff', borderRadius:'12px', padding:'12px 18px', fontSize:'13.5px', fontWeight:500, display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', zIndex:200 }}>
      {type==='success' ? <Check size={15}/> : <AlertCircle size={15}/>}
      {msg}
    </motion.div>
  );
}

const inputStyle: React.CSSProperties = { width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid rgba(0,0,0,0.1)', background:'var(--bg)', fontSize:'14px', outline:'none', fontFamily:'inherit', color:'var(--text)', transition:'border-color 0.15s' };
const labelStyle: React.CSSProperties = { fontSize:'13px', fontWeight:500, color:'var(--text2)', display:'block', marginBottom:'6px' };

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [toast,     setToast]     = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  // Profile
  const [name,     setName]     = useState(user?.name || '');
  const [currency, setCurrency] = useState((user as any)?.currency || 'INR');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,      setNewPw]     = useState('');
  const [confirmPw,  setConfirmPw] = useState('');
  const [savingPw,   setSavingPw]  = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif,  setPushNotif]  = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as Tab;
    if (tab) setActiveTab(tab);
  }, []);

  const showToast = (msg: string, type: 'success'|'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.patch('/users/profile', { name, currency });
      showToast('Profile updated successfully', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { showToast('New passwords do not match', 'error'); return; }
    if (newPw.length < 8)    { showToast('Password must be at least 8 characters', 'error'); return; }
    setSavingPw(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password changed successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Incorrect current password', 'error');
    } finally { setSavingPw(false); }
  };

  const handleNotifSave = async () => {
    setSavingNotif(true);
    try {
      await api.patch('/users/profile', { notificationEmail: emailNotif, notificationPush: pushNotif });
      showToast('Notification preferences saved', 'success');
    } catch {
      showToast('Failed to save preferences', 'error');
    } finally { setSavingNotif(false); }
  };

  const SIDEBAR_ITEMS: { key: Tab; icon: any; label: string; desc: string }[] = [
    { key:'profile',       icon:User,       label:'Profile',       desc:'Name, currency, avatar' },
    { key:'security',      icon:Lock,       label:'Security',      desc:'Password & authentication' },
    { key:'notifications', icon:Bell,       label:'Notifications', desc:'Email and push alerts' },
    { key:'billing',       icon:CreditCard, label:'Billing',       desc:'Plan and payment' },
  ];

  return (
    <AppShell>
      <div style={{ padding:'24px 24px 0' }}>
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} style={{ marginBottom:'24px' }}>
          <h1 style={{ fontSize:'26px', fontWeight:700, letterSpacing:'-0.5px' }}>Settings</h1>
          <p style={{ fontSize:'13px', color:'var(--text2)', marginTop:'3px' }}>Manage your account preferences</p>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:'20px', alignItems:'start' }}>
          {/* Sidebar */}
          <div style={{ background:'#fff', borderRadius:'20px', padding:'8px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            {SIDEBAR_ITEMS.map(({ key, icon: Icon, label, desc }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', borderRadius:'12px', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'background 0.15s', background: activeTab===key ? 'var(--teal-light)' : 'none', marginBottom:'2px' }}>
                <div style={{ width:34, height:34, borderRadius:'9px', background: activeTab===key ? 'rgba(15,118,110,0.12)' : 'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={16} strokeWidth={2} color={activeTab===key ? 'var(--teal)' : 'var(--text3)'}/>
                </div>
                <div>
                  <p style={{ fontSize:'13.5px', fontWeight: activeTab===key ? 600 : 500, color: activeTab===key ? 'var(--teal)' : 'var(--text)', margin:0 }}>{label}</p>
                  <p style={{ fontSize:'11.5px', color:'var(--text3)', margin:'1px 0 0' }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ background:'#fff', borderRadius:'20px', padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <h2 style={{ fontSize:'18px', fontWeight:700, marginBottom:'4px' }}>Profile Information</h2>
                <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'24px' }}>Update your personal details</p>

                {/* Avatar */}
                <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'28px', padding:'16px', background:'var(--bg)', borderRadius:'14px' }}>
                  <div style={{ width:56, height:56, borderRadius:'14px', background:'linear-gradient(135deg,#0f766e,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:700, color:'#fff' }}>
                    {user?.name?.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2)}
                  </div>
                  <div>
                    <p style={{ fontSize:'14px', fontWeight:600, margin:0 }}>{user?.name}</p>
                    <p style={{ fontSize:'12px', color:'var(--text3)', margin:'2px 0 0' }}>{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                    <div>
                      <label style={labelStyle}>Full name</label>
                      <input value={name} onChange={e=>setName(e.target.value)} style={inputStyle} placeholder="Your name"/>
                    </div>
                    <div>
                      <label style={labelStyle}>Email address</label>
                      <input value={user?.email || ''} disabled style={{ ...inputStyle, opacity:0.6, cursor:'not-allowed' }}/>
                    </div>
                  </div>
                  <div style={{ maxWidth:'200px' }}>
                    <label style={labelStyle}>Currency</label>
                    <select value={currency} onChange={e=>setCurrency(e.target.value)} style={inputStyle}>
                      {['INR','USD','EUR','GBP','JPY','AUD','CAD','SGD'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <button type="submit" disabled={savingProfile}
                      style={{ padding:'10px 24px', borderRadius:'50px', background:'var(--teal)', color:'#fff', border:'none', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:savingProfile?0.7:1 }}>
                      {savingProfile ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <h2 style={{ fontSize:'18px', fontWeight:700, marginBottom:'4px' }}>Security</h2>
                <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'24px' }}>Keep your account secure</p>

                <div style={{ padding:'16px', background:'var(--bg)', borderRadius:'12px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <Shield size={18} color="var(--teal)"/>
                  <div>
                    <p style={{ fontSize:'13px', fontWeight:600, margin:0 }}>Password-based authentication</p>
                    <p style={{ fontSize:'12px', color:'var(--text3)', margin:'2px 0 0' }}>Use a strong password of at least 8 characters</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                  <div>
                    <label style={labelStyle}>Current password</label>
                    <input type="password" value={currentPw} onChange={e=>setCurrentPw(e.target.value)} required style={inputStyle} placeholder="••••••••"/>
                  </div>
                  <div>
                    <label style={labelStyle}>New password</label>
                    <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} required minLength={8} style={inputStyle} placeholder="Min. 8 characters"/>
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm new password</label>
                    <input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} required style={inputStyle} placeholder="Repeat new password"/>
                  </div>
                  <div>
                    <button type="submit" disabled={savingPw}
                      style={{ padding:'10px 24px', borderRadius:'50px', background:'var(--teal)', color:'#fff', border:'none', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:savingPw?0.7:1 }}>
                      {savingPw ? 'Updating…' : 'Update password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <h2 style={{ fontSize:'18px', fontWeight:700, marginBottom:'4px' }}>Notifications</h2>
                <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'24px' }}>Choose how you want to be notified</p>

                {[
                  { label:'Email notifications', desc:'Receive daily digests and weekly insights via email', value: emailNotif, setter: setEmailNotif },
                  { label:'Push notifications',  desc:'Get real-time alerts for anomalies and budget warnings', value: pushNotif,  setter: setPushNotif  },
                ].map(({ label, desc, value, setter }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', borderBottom:'1px solid rgba(0,0,0,0.06)', marginBottom:'4px' }}>
                    <div>
                      <p style={{ fontSize:'14px', fontWeight:500, margin:0 }}>{label}</p>
                      <p style={{ fontSize:'12px', color:'var(--text3)', margin:'3px 0 0' }}>{desc}</p>
                    </div>
                    <button onClick={() => setter(!value)}
                      style={{ width:'44px', height:'24px', borderRadius:'12px', border:'none', cursor:'pointer', background: value ? 'var(--teal)' : '#d1d5db', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                      <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'#fff', position:'absolute', top:'3px', left: value ? '23px' : '3px', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
                    </button>
                  </div>
                ))}

                <div style={{ marginTop:'20px' }}>
                  <button onClick={handleNotifSave} disabled={savingNotif}
                    style={{ padding:'10px 24px', borderRadius:'50px', background:'var(--teal)', color:'#fff', border:'none', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:savingNotif?0.7:1 }}>
                    {savingNotif ? 'Saving…' : 'Save preferences'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <h2 style={{ fontSize:'18px', fontWeight:700, marginBottom:'4px' }}>Billing</h2>
                <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'24px' }}>Your current plan and usage</p>
                <div style={{ padding:'20px', background:'linear-gradient(135deg,#f0fdf9,#f0fdfa)', borderRadius:'16px', border:'1px solid rgba(15,118,110,0.15)' }}>
                  <p style={{ fontSize:'12px', fontWeight:600, color:'var(--teal)', textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 6px' }}>Current Plan</p>
                  <p style={{ fontSize:'22px', fontWeight:700, color:'var(--text)', margin:'0 0 4px' }}>Free Tier</p>
                  <p style={{ fontSize:'13px', color:'var(--text2)', margin:0 }}>All core features included. Upgrade for advanced ML predictions and unlimited history.</p>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </AppShell>
  );
}
