'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, Settings, LogOut, User, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const TABS = ['Dashboard', 'Transactions', 'Insights', 'Predictions'];

export default function Navbar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router  = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';
  const dark = theme === 'dark';

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const navBg  = dark ? 'rgba(22,27,34,0.85)'    : 'rgba(255,255,255,0.85)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const menuBg = dark ? '#161b22' : '#fff';
  const divider= dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';

  const itemHover = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) => {
    e.currentTarget.style.background = enter
      ? dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
      : 'none';
  };
  const dangerHover = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) => {
    e.currentTarget.style.background = enter
      ? dark ? 'rgba(251,113,133,0.08)' : 'rgba(225,29,72,0.06)'
      : 'none';
  };

  return (
    <nav style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 24px',margin:'16px 24px 0',background:navBg,border:`1px solid ${border}`,borderRadius:'18px',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',position:'sticky',top:'16px',zIndex:40,boxShadow:dark?'0 4px 24px rgba(0,0,0,0.3)':'0 4px 16px rgba(0,0,0,0.06)',transition:'background 0.3s,border-color 0.3s' }}>

      <div style={{ display:'flex',alignItems:'center',gap:'28px' }}>
        <Link href="/dashboard" style={{ display:'flex',alignItems:'center',gap:'9px',textDecoration:'none' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#818cf8" opacity="0.15"/>
            <rect x="5" y="16" width="4" height="8" rx="2" fill="#818cf8"/>
            <rect x="12" y="10" width="4" height="14" rx="2" fill="#34d399"/>
            <rect x="19" y="4" width="4" height="20" rx="2" fill="#fb7185"/>
          </svg>
          <span style={{ fontSize:'17px',fontWeight:700,background:'linear-gradient(135deg,#818cf8,#34d399)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:'-0.3px' }}>FinSight</span>
        </Link>

        <div style={{ display:'flex',gap:'2px' }}>
          {TABS.map(label => (
            <button key={label} onClick={() => onTabChange(label)}
              style={{ padding:'7px 16px',borderRadius:'9px',fontSize:'13.5px',fontWeight: activeTab===label?600:400,border:'none',cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s',
                background: activeTab===label ? 'var(--accent-dim)' : 'transparent',
                color: activeTab===label ? 'var(--accent)' : 'var(--text2)',
                borderBottom: activeTab===label ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'8px',background:'var(--glass)',border:`1px solid ${border}`,borderRadius:'10px',padding:'7px 14px',width:'190px' }}>
          <Search size={13} color="var(--text3)" strokeWidth={2}/>
          <input placeholder="Search…" style={{ background:'none',border:'none',outline:'none',fontFamily:'inherit',fontSize:'13px',color:'var(--text)',width:'100%' }}/>
        </div>

        {/* Theme toggle */}
        <button onClick={toggle} title={dark?'Switch to light mode':'Switch to dark mode'}
          style={{ width:'36px',height:'36px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--glass)',border:`1px solid ${border}`,cursor:'pointer',color:'var(--text2)',transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--glass-hover)';e.currentTarget.style.color='var(--accent)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='var(--glass)';e.currentTarget.style.color='var(--text2)';}}>
          {dark ? <Sun size={15} strokeWidth={2}/> : <Moon size={15} strokeWidth={2}/>}
        </button>

        <button style={{ width:'36px',height:'36px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--glass)',border:`1px solid ${border}`,cursor:'pointer',color:'var(--text2)',transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--glass-hover)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='var(--glass)';}}>
          <Bell size={15} strokeWidth={2}/>
        </button>

        <div ref={menuRef} style={{ position:'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)}
            style={{ display:'flex',alignItems:'center',gap:'8px',background:'var(--glass)',border:`1px solid ${border}`,borderRadius:'10px',padding:'6px 10px 6px 6px',cursor:'pointer',transition:'background 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
            onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
            <div style={{ width:'28px',height:'28px',borderRadius:'8px',background:'linear-gradient(135deg,#818cf8,#34d399)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff' }}>{initials}</div>
            <span style={{ fontSize:'13px',fontWeight:500,color:'var(--text)' }}>{user?.name?.split(' ')[0]}</span>
            <ChevronDown size={12} color="var(--text3)" style={{ transform:showMenu?'rotate(180deg)':'none',transition:'transform 0.2s' }}/>
          </button>

          {showMenu && (
            <div style={{ position:'absolute',right:0,top:'calc(100% + 8px)',background:menuBg,border:`1px solid ${border}`,borderRadius:'16px',padding:'6px',zIndex:50,minWidth:'210px',boxShadow:dark?'0 12px 40px rgba(0,0,0,0.6)':'0 8px 32px rgba(0,0,0,0.12)',backdropFilter:'blur(20px)' }}>
              <div style={{ padding:'10px 12px',borderBottom:`1px solid ${divider}`,marginBottom:'4px' }}>
                <p style={{ fontSize:'13px',fontWeight:600,color:'var(--text)',margin:0 }}>{user?.name}</p>
                <p style={{ fontSize:'12px',color:'var(--text2)',margin:'2px 0 0' }}>{user?.email}</p>
              </div>

              {/* Theme row inside menu */}
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',marginBottom:'2px' }}>
                <span style={{ fontSize:'13.5px',color:'var(--text)',display:'flex',alignItems:'center',gap:'10px' }}>
                  {dark ? <Sun size={15} strokeWidth={2} color="var(--text2)"/> : <Moon size={15} strokeWidth={2} color="var(--text2)"/>}
                  {dark ? 'Light mode' : 'Dark mode'}
                </span>
                <button onClick={toggle}
                  style={{ width:'38px',height:'22px',borderRadius:'11px',border:'none',cursor:'pointer',position:'relative',transition:'background 0.2s',background:dark?'rgba(255,255,255,0.12)':'var(--accent)' }}>
                  <div style={{ width:'16px',height:'16px',borderRadius:'50%',background:'#fff',position:'absolute',top:'3px',left:dark?'3px':'calc(100% - 19px)',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
                </button>
              </div>

              <div style={{ borderBottom:`1px solid ${divider}`,marginBottom:'4px' }}/>

              {[
                { icon:User,     label:'Profile',  fn:()=>{router.push('/settings?tab=profile');setShowMenu(false);} },
                { icon:Settings, label:'Settings', fn:()=>{router.push('/settings');setShowMenu(false);} },
              ].map(({ icon:Icon, label, fn }) => (
                <button key={label} onClick={fn}
                  style={{ width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',fontSize:'13.5px',color:'var(--text)',background:'none',border:'none',cursor:'pointer',borderRadius:'10px',fontFamily:'inherit',textAlign:'left',transition:'background 0.15s' }}
                  onMouseEnter={e=>itemHover(e,true)} onMouseLeave={e=>itemHover(e,false)}>
                  <Icon size={15} strokeWidth={2} color="var(--text2)"/> {label}
                </button>
              ))}
              <div style={{ borderTop:`1px solid ${divider}`,marginTop:'4px',paddingTop:'4px' }}>
                <button onClick={()=>{logout();setShowMenu(false);}}
                  style={{ width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',fontSize:'13.5px',color:'var(--accent3)',background:'none',border:'none',cursor:'pointer',borderRadius:'10px',fontFamily:'inherit',textAlign:'left',transition:'background 0.15s' }}
                  onMouseEnter={e=>dangerHover(e,true)} onMouseLeave={e=>dangerHover(e,false)}>
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
