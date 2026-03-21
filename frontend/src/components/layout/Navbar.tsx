'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, LayoutDashboard, ArrowLeftRight, Lightbulb, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const TABS = [
  { label: 'Dashboard',    icon: LayoutDashboard },
  { label: 'Transactions', icon: ArrowLeftRight },
  { label: 'Insights',     icon: Lightbulb },
  { label: 'Predictions',  icon: TrendingUp },
];

export default function Navbar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      style={{ background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', margin: '16px 24px' }}
    >
      {/* Left: Logo + Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '18px', fontWeight: 700, color: 'var(--teal)' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#0f766e" opacity="0.1"/>
            <rect x="5" y="16" width="4" height="8" rx="2" fill="#0f766e"/>
            <rect x="12" y="10" width="4" height="14" rx="2" fill="#14b8a6"/>
            <rect x="19" y="4" width="4" height="20" rx="2" fill="#22c55e"/>
          </svg>
          FinSight
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {TABS.map(({ label }) => (
            <button
              key={label}
              onClick={() => onTabChange(label)}
              style={{
                padding: '7px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 500,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                background: activeTab === label ? 'var(--teal)' : 'transparent',
                color:      activeTab === label ? '#fff' : 'var(--text2)',
                boxShadow:  activeTab === label ? '0 4px 12px rgba(15,118,110,0.3)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Search + Bell + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg)', borderRadius: '10px', padding: '8px 14px', boxShadow: 'var(--shadow-inset)', width: '200px' }}>
          <Search size={14} color="var(--text3)" />
          <input placeholder="Search transactions…" style={{ background: 'none', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '13px', color: 'var(--text)', width: '100%' }} />
        </div>

        <button style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-inset)', color: 'var(--text2)', position: 'relative' }}>
          <Bell size={17} />
        </button>

        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg)', borderRadius: '10px', padding: '6px 12px 6px 6px', boxShadow: 'var(--shadow-inset)', cursor: 'pointer' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
              {initials}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{user?.name?.split(' ')[0]}</span>
          </div>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: '48px', background: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-hover)', padding: '8px', zIndex: 50, minWidth: '160px' }}>
              <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text2)' }}>{user?.email}</div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)', margin: '4px 0' }} />
              <button onClick={logout} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: '13px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', fontFamily: 'inherit' }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
