'use client';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  const year = new Date().getFullYear();
  const links = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms',   href: '/terms'   },
    { label: 'Support', href: '/support' },
  ];

  return (
    <footer style={{ borderTop: '1px solid var(--glass-border)', marginTop: '40px', padding: '20px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }} className="focus:outline-none">
          <Logo size="xs" />
          <span style={{ fontSize: '13px', color: 'var(--text3)' }}>— Personal Finance Intelligence</span>
        </Link>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {links.map(({ label, href }) => (
            <Link key={label} href={href}
              style={{
                fontSize: '12.5px', color: 'var(--text3)', textDecoration: 'none',
                padding: '5px 12px', borderRadius: '20px',
                transition: 'color 0.15s, background 0.15s',
                display: 'inline-block',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'var(--accent)';
                el.style.background = 'var(--accent-dim)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'var(--text3)';
                el.style.background = 'transparent';
              }}
            >
              {label}
            </Link>
          ))}
          <span style={{ fontSize: '12px', color: 'var(--text3)', marginLeft: '8px' }}>© {year} FinSight</span>
        </div>
      </div>
    </footer>
  );
}
