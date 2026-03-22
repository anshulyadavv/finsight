import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  const links = [
    { label: 'Privacy',  href: '/privacy' },
    { label: 'Terms',    href: '/terms'   },
    { label: 'Support',  href: '/support' },
  ];
  return (
    <footer style={{ borderTop: '1px solid var(--glass-border)', marginTop: '40px', padding: '20px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#818cf8" opacity="0.15"/>
            <rect x="5" y="16" width="4" height="8" rx="2" fill="#818cf8"/>
            <rect x="12" y="10" width="4" height="14" rx="2" fill="#34d399"/>
            <rect x="19" y="4" width="4" height="20" rx="2" fill="#fb7185"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>FinSight</span>
          <span style={{ fontSize: '13px', color: 'var(--text3)' }}>— Personal Finance Intelligence</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {links.map(({ label, href }) => (
            <Link key={label} href={href}
              style={{ fontSize: '12px', color: 'var(--text3)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={undefined}
            >
              {label}
            </Link>
          ))}
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>© {year} FinSight</span>
        </div>
      </div>
    </footer>
  );
}
