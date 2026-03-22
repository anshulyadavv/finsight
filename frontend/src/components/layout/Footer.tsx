export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop:'1px solid rgba(0,0,0,0.06)', marginTop:'40px', padding:'20px 24px', background:'transparent' }}>
      <div style={{ maxWidth:'1400px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#0f766e" opacity="0.1"/>
            <rect x="5" y="16" width="4" height="8" rx="2" fill="#0f766e"/>
            <rect x="12" y="10" width="4" height="14" rx="2" fill="#14b8a6"/>
            <rect x="19" y="4" width="4" height="20" rx="2" fill="#22c55e"/>
          </svg>
          <span style={{ fontSize:'13px', fontWeight:600, color:'var(--text2)' }}>FinSight</span>
          <span style={{ fontSize:'13px', color:'var(--text3)' }}>— Personal Finance Intelligence</span>
        </div>
        <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
          {['Privacy', 'Terms', 'Support'].map(label => (
            <span key={label} style={{ fontSize:'12px', color:'var(--text3)', cursor:'pointer' }}>
              {label}
            </span>
          ))}
          <span style={{ fontSize:'12px', color:'var(--text3)' }}>© {year} FinSight</span>
        </div>
      </div>
    </footer>
  );
}