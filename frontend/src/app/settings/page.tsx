'use client';
import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, CreditCard, Shield, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { Select } from '@/components/ui/Select';

type Tab = 'profile'|'security'|'notifications'|'billing';

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
];

function Toast({ msg, type }: { msg:string; type:'success'|'error' }) {
  return (
    <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
      style={{ position:'fixed',bottom:'24px',right:'24px',background:type==='success'?'var(--accent2)':'var(--accent3)',color:'#fff',borderRadius:'12px',padding:'12px 18px',fontSize:'13.5px',fontWeight:500,display:'flex',alignItems:'center',gap:'8px',boxShadow:'0 8px 24px rgba(0,0,0,0.4)',zIndex:200 }}>
      {type==='success'?<Check size={15}/>:<AlertCircle size={15}/>} {msg}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab,   setTab]   = useState<Tab>('profile');
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [name,  setName]  = useState(user?.name||'');
  const [curr,  setCurr]  = useState((user as any)?.currency||'INR');
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [conPw, setConPw] = useState('');
  const [emailN, setEmailN] = useState(true);
  const [pushN,  setPushN]  = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p=new URLSearchParams(window.location.search);
    const t=p.get('tab') as Tab; if(t) setTab(t);
  }, []);

  const show = (msg:string,type:'success'|'error') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const saveProfile = async (e:FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.patch('/users/profile',{name,currency:curr}); show('Profile updated','success'); }
    catch { show('Failed to update','error'); }
    finally { setSaving(false); }
  };

  const savePw = async (e:FormEvent) => {
    e.preventDefault();
    if(newPw!==conPw){show('Passwords do not match','error');return;}
    if(newPw.length<8){show('Password must be 8+ characters','error');return;}
    setSaving(true);
    try { await api.patch('/auth/change-password',{currentPassword:curPw,newPassword:newPw}); setCurPw('');setNewPw('');setConPw(''); show('Password changed','success'); }
    catch(err:any){ show(err.response?.data?.message||'Incorrect current password','error'); }
    finally { setSaving(false); }
  };

  const saveNotif = async () => {
    setSaving(true);
    try { await api.patch('/users/profile',{notificationEmail:emailN,notificationPush:pushN}); show('Preferences saved','success'); }
    catch { show('Failed to save','error'); }
    finally { setSaving(false); }
  };

  const inp: React.CSSProperties = { width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--glass-border)',background:'var(--glass)',fontSize:'14px',color:'var(--text)',fontFamily:'inherit',outline:'none',transition:'border-color 0.15s,background 0.15s' };
  const lbl: React.CSSProperties = { fontSize:'13px',fontWeight:500,color:'var(--text2)',display:'block',marginBottom:'6px' };
  const fi = (e:any) => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--glass-hover)'; };
  const bl = (e:any) => { e.currentTarget.style.borderColor='var(--glass-border)'; e.currentTarget.style.background='var(--glass)'; };

  const ITEMS = [
    { key:'profile' as Tab,      icon:User,       label:'Profile',       desc:'Name, currency, avatar' },
    { key:'security' as Tab,     icon:Lock,       label:'Security',      desc:'Password & auth' },
    { key:'notifications' as Tab,icon:Bell,       label:'Notifications', desc:'Email and push alerts' },
    { key:'billing' as Tab,      icon:CreditCard, label:'Billing',       desc:'Plan and payment' },
  ];

  return (
    <AppShell>
      {/* min-h fills remaining viewport so footer always stays at bottom */}
      <div style={{ padding:'20px 24px 40px', minHeight:'calc(100vh - 80px)' }}>
        <h1 style={{ fontSize:'26px',fontWeight:700,letterSpacing:'-0.5px',color:'var(--text)',margin:'0 0 4px' }}>Settings</h1>
        <p style={{ fontSize:'13px',color:'var(--text2)',marginBottom:'24px' }}>Manage your account preferences</p>

        <div style={{ display:'grid',gridTemplateColumns:'220px 1fr',gap:'16px',alignItems:'start' }}>
          {/* Sidebar */}
          <div className="glass-static" style={{ padding:'8px' }}>
            {ITEMS.map(({key,icon:Icon,label,desc})=>(
              <button key={key} onClick={()=>setTab(key)}
                style={{ width:'100%',display:'flex',alignItems:'center',gap:'12px',padding:'12px 13px',borderRadius:'12px',border:'none',cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'background 0.15s',background:tab===key?'var(--accent-dim)':'transparent',marginBottom:'2px' }}>
                <div style={{ width:32,height:32,borderRadius:'9px',background:tab===key?'var(--accent-dim)':'var(--glass)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'background 0.15s' }}>
                  <Icon size={15} strokeWidth={2} color={tab===key?'var(--accent)':'var(--text3)'}/>
                </div>
                <div>
                  <p style={{ fontSize:'13px',fontWeight:tab===key?600:500,color:tab===key?'var(--accent)':'var(--text)',margin:0 }}>{label}</p>
                  <p style={{ fontSize:'11.5px',color:'var(--text3)',margin:'1px 0 0' }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="glass-static" style={{ padding:'26px' }}>
            {tab==='profile' && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <h2 style={{ fontSize:'17px',fontWeight:700,marginBottom:'4px',color:'var(--text)' }}>Profile Information</h2>
                <p style={{ fontSize:'13px',color:'var(--text2)',marginBottom:'22px' }}>Update your personal details</p>
                <div style={{ display:'flex',alignItems:'center',gap:'14px',marginBottom:'24px',padding:'14px 16px',background:'var(--glass)',borderRadius:'12px',border:'1px solid var(--glass-border)' }}>
                  <div style={{ width:48,height:48,borderRadius:'12px',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:700,color:'#fff' }}>
                    {user?.name?.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2)}
                  </div>
                  <div>
                    <p style={{ fontSize:'14px',fontWeight:600,margin:0,color:'var(--text)' }}>{user?.name}</p>
                    <p style={{ fontSize:'12px',color:'var(--text2)',margin:'2px 0 0' }}>{user?.email}</p>
                  </div>
                </div>
                <form onSubmit={saveProfile} style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px' }}>
                    <div><label style={lbl}>Full name</label><input value={name} onChange={e=>setName(e.target.value)} style={inp} onFocus={fi} onBlur={bl} placeholder="Your name"/></div>
                    <div><label style={lbl}>Email address</label><input value={user?.email||''} disabled style={{ ...inp,opacity:0.5,cursor:'not-allowed' }}/></div>
                  </div>
                  {/* Currency — uses our custom Select component for consistent styling */}
                  <div style={{ maxWidth:'220px', position:'relative', zIndex:10 }}>
                    <Select
                      label="Currency"
                      value={curr}
                      onChange={setCurr}
                      options={CURRENCY_OPTIONS}
                    />
                  </div>
                  <div><button type="submit" disabled={saving} style={{ padding:'10px 24px',borderRadius:'50px',background:'var(--accent)',color:'#fff',border:'none',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',opacity:saving?0.7:1,transition:'filter 0.15s' }} onMouseEnter={e=>(e.currentTarget.style.filter='brightness(1.1)')} onMouseLeave={e=>(e.currentTarget.style.filter='none')}>{saving?'Saving…':'Save changes'}</button></div>
                </form>
              </motion.div>
            )}

            {tab==='security' && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <h2 style={{ fontSize:'17px',fontWeight:700,marginBottom:'4px',color:'var(--text)' }}>Security</h2>
                <p style={{ fontSize:'13px',color:'var(--text2)',marginBottom:'22px' }}>Keep your account secure</p>
                <div style={{ padding:'14px 16px',background:'var(--accent2-dim)',borderRadius:'12px',marginBottom:'22px',display:'flex',alignItems:'center',gap:'12px',border:'1px solid var(--accent2-dim)' }}>
                  <Shield size={17} color="var(--accent2)"/>
                  <div><p style={{ fontSize:'13px',fontWeight:600,margin:0,color:'var(--text)' }}>Password-based authentication</p><p style={{ fontSize:'12px',color:'var(--text2)',margin:'2px 0 0' }}>Use a strong password of at least 8 characters</p></div>
                </div>
                <form onSubmit={savePw} style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
                  {[['Current password',curPw,setCurPw],['New password',newPw,setNewPw],['Confirm new password',conPw,setConPw]].map(([l,v,s]:any)=>(
                    <div key={l}><label style={lbl}>{l}</label><input type="password" value={v} onChange={e=>s(e.target.value)} required style={inp} onFocus={fi} onBlur={bl} placeholder="••••••••"/></div>
                  ))}
                  <div><button type="submit" disabled={saving} style={{ padding:'10px 24px',borderRadius:'50px',background:'var(--accent)',color:'#fff',border:'none',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',opacity:saving?0.7:1 }}>{saving?'Updating…':'Update password'}</button></div>
                </form>
              </motion.div>
            )}

            {tab==='notifications' && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <h2 style={{ fontSize:'17px',fontWeight:700,marginBottom:'4px',color:'var(--text)' }}>Notifications</h2>
                <p style={{ fontSize:'13px',color:'var(--text2)',marginBottom:'22px' }}>Choose how you want to be notified</p>
                {[
                  { label:'Email notifications',desc:'Daily digests and weekly insights via email',value:emailN,set:setEmailN },
                  { label:'Push notifications', desc:'Real-time alerts for anomalies and budget warnings',value:pushN,set:setPushN },
                ].map(({label,desc,value,set})=>(
                  <div key={label} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid var(--glass-border)' }}>
                    <div><p style={{ fontSize:'14px',fontWeight:500,margin:0,color:'var(--text)' }}>{label}</p><p style={{ fontSize:'12px',color:'var(--text3)',margin:'3px 0 0' }}>{desc}</p></div>
                    <button onClick={()=>set(!value)} style={{ width:'42px',height:'23px',borderRadius:'11px',border:'none',cursor:'pointer',background:value?'var(--accent)':'var(--glass-strong)',position:'relative',transition:'background 0.2s',flexShrink:0 }}>
                      <div style={{ width:'17px',height:'17px',borderRadius:'50%',background:'#fff',position:'absolute',top:'3px',left:value?'calc(100% - 20px)':'3px',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
                    </button>
                  </div>
                ))}
                <div style={{ marginTop:'18px' }}>
                  <button onClick={saveNotif} disabled={saving} style={{ padding:'10px 24px',borderRadius:'50px',background:'var(--accent)',color:'#fff',border:'none',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',opacity:saving?0.7:1 }}>{saving?'Saving…':'Save preferences'}</button>
                </div>
              </motion.div>
            )}

            {tab==='billing' && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <h2 style={{ fontSize:'17px',fontWeight:700,marginBottom:'4px',color:'var(--text)' }}>Billing</h2>
                <p style={{ fontSize:'13px',color:'var(--text2)',marginBottom:'22px' }}>Your current plan and usage</p>
                <div style={{ padding:'20px',background:'var(--accent-dim)',borderRadius:'16px',border:'1px solid var(--accent-dim)' }}>
                  <p style={{ fontSize:'11px',fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'0.5px',margin:'0 0 6px' }}>Current Plan</p>
                  <p style={{ fontSize:'22px',fontWeight:700,color:'var(--text)',margin:'0 0 4px' }}>Free Tier</p>
                  <p style={{ fontSize:'13px',color:'var(--text2)',margin:0 }}>All core features included. Upgrade for advanced ML predictions and unlimited history.</p>
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
