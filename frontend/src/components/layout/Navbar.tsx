'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const TABS = ['Dashboard', 'Transactions', 'Insights', 'Predictions'];

export default function Navbar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <nav style={{ background:'#fff', borderRadius:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 24px', margin:'16px 24px 0', position:'sticky', top:'16px', zIndex:40 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'28px' }}>
        <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:'9px', textDecoration:'none' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#0f766e" opacity="0.1"/>
            <rect x="5" y="16" width="4" height="8" rx="2" fill="#0f766e"/>
            <rect x="12" y="10" width="4" height="14" rx="2" fill="#14b8a6"/>
            <rect x="19" y="4" width="4" height="20" rx="2" fill="#22c55e"/>
          </svg>
          <span style={{ fontSize:'17px', fontWeight:700, color:'var(--teal)', letterSpacing:'-0.3px' }}>FinSight</span>
        </Link>
        <div style={{ display:'flex', gap:'2px' }}>
          {TABS.map(label => (
            <button key={label} onClick={() => onTabChange(label)}
              style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'13.5px', fontWeight: activeTab===label ? 600 : 400, border:'none', cursor:'pointer', fontFamily:'inherit', transition:'background 0.15s, color 0.15s', background: activeTab===label ? '#f0fdf9' : 'transparent', color: activeTab===label ? 'var(--teal)' : 'var(--text2)', borderBottom: activeTab===label ? '2px solid var(--teal)' : '2px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--bg)', borderRadius:'9px', padding:'7px 14px', width:'200px' }}>
          <Search size={13} color="var(--text3)" strokeWidth={2}/>
          <input placeholder="Search…" style={{ background:'none', border:'none', outline:'none', fontFamily:'inherit', fontSize:'13px', color:'var(--text)', width:'100%' }}/>
        </div>

        <button style={{ width:'36px', height:'36px', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', border:'none', cursor:'pointer', color:'var(--text2)' }}>
          <Bell size={16} strokeWidth={2}/>
        </button>

        <div ref={menuRef} style={{ position:'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)}
            style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--bg)', borderRadius:'9px', padding:'6px 10px 6px 6px', border:'none', cursor:'pointer' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'linear-gradient(135deg,#0f766e,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'#fff' }}>{initials}</div>
            <span style={{ fontSize:'13px', fontWeight:500, color:'var(--text)' }}>{user?.name?.split(' ')[0]}</span>
            <ChevronDown size={13} color="var(--text3)" style={{ transform: showMenu ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}/>
          </button>

          {showMenu && (
            <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)', background:'#fff', borderRadius:'14px', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', padding:'6px', zIndex:50, minWidth:'200px', border:'1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ padding:'10px 12px', borderBottom:'1px solid rgba(0,0,0,0.06)', marginBottom:'4px' }}>
                <p style={{ fontSize:'13px', fontWeight:600, color:'var(--text)', margin:0 }}>{user?.name}</p>
                <p style={{ fontSize:'12px', color:'var(--text3)', margin:'2px 0 0' }}>{user?.email}</p>
              </div>
              {[
                { icon: User,     label:'Profile',  fn: () => { router.push('/settings?tab=profile');  setShowMenu(false); } },
                { icon: Settings, label:'Settings', fn: () => { router.push('/settings');              setShowMenu(false); } },
              ].map(({ icon: Icon, label, fn }) => (
                <button key={label} onClick={fn}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', fontSize:'13.5px', color:'var(--text)', background:'none', border:'none', cursor:'pointer', borderRadius:'9px', fontFamily:'inherit', textAlign:'left' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--bg)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  <Icon size={15} strokeWidth={2} color="var(--text2)"/> {label}
                </button>
              ))}
              <div style={{ borderTop:'1px solid rgba(0,0,0,0.06)', marginTop:'4px', paddingTop:'4px' }}>
                <button onClick={() => { logout(); setShowMenu(false); }}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', fontSize:'13.5px', color:'var(--red)', background:'none', border:'none', cursor:'pointer', borderRadius:'9px', fontFamily:'inherit', textAlign:'left' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--red-light)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  <LogOut size={15} strokeWidth={2}/> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
