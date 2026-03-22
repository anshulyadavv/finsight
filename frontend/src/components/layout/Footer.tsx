export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '40px', padding: '20px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#2dd4bf" opacity="0.15"/>
            <rect x="5" y="16" width="4" height="8" rx="2" fill="#2dd4bf"/>
            <rect x="12" y="10" width="4" height="14" rx="2" fill="#5eead4"/>
            <rect x="19" y="4" width="4" height="20" rx="2" fill="#4ade80"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>FinSight</span>
          <span style={{ fontSize: '13px', color: 'var(--text3)' }}>— Personal Finance Intelligence</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {['Privacy', 'Terms', 'Support'].map(l => (
            <span key={l} style={{ fontSize: '12px', color: 'var(--text3)', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#2dd4bf')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}>
              {l}
            </span>
          ))}
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>© {year} FinSight</span>
        </div>
      </div>
    </footer>
  );
}
