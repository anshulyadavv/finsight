'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '32px' }}>
    <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--glass-border)' }}>
      {title}
    </h2>
    <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.75 }}>{children}</div>
  </div>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ marginBottom: '12px' }}>{children}</p>
);

const Ul = ({ items }: { items: string[] }) => (
  <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
    {items.map((item, i) => (
      <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
    ))}
  </ul>
);

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar bar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass)', backdropFilter: 'blur(20px)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#818cf8" opacity="0.15"/>
            <rect x="5" y="16" width="4" height="8" rx="2" fill="#818cf8"/>
            <rect x="12" y="10" width="4" height="14" rx="2" fill="#34d399"/>
            <rect x="19" y="4" width="4" height="20" rx="2" fill="#fb7185"/>
          </svg>
          <span style={{ fontSize: '16px', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FinSight</span>
        </Link>
        <Link href="/dashboard" style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>← Back to Dashboard</Link>
      </nav>

      <main style={{ flex: 1, maxWidth: '760px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Legal</p>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text)', marginBottom: '8px' }}>Privacy Policy</h1>
            <p style={{ fontSize: '14px', color: 'var(--text2)' }}>Last updated: March 23, 2026 · Effective immediately</p>
          </div>

          <div className="glass-static" style={{ padding: '32px', borderRadius: '20px' }}>
            <Section title="1. Introduction">
              <P>FinSight ("we", "our", or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our personal finance intelligence platform.</P>
              <P>Please read this policy carefully. If you disagree with its terms, please discontinue use of the platform.</P>
            </Section>

            <Section title="2. Information We Collect">
              <P><strong style={{ color: 'var(--text)' }}>Account Information</strong></P>
              <Ul items={[
                'Name and email address provided during registration',
                'Encrypted password (we never store plaintext passwords)',
                'Currency preference and notification settings',
              ]}/>
              <P><strong style={{ color: 'var(--text)' }}>Financial Data</strong></P>
              <Ul items={[
                'Transaction records you manually enter or import via CSV',
                'Merchant names, amounts, dates, and categories you assign',
                'Budget limits and spending goals you configure',
                'Bank card metadata (last 4 digits, expiry — never full card numbers)',
              ]}/>
              <P><strong style={{ color: 'var(--text)' }}>Usage Data</strong></P>
              <Ul items={[
                'Log data including IP address, browser type, pages visited',
                'Device information and operating system',
                'Feature usage patterns to improve the product',
              ]}/>
            </Section>

            <Section title="3. How We Use Your Information">
              <P>We use the information we collect to:</P>
              <Ul items={[
                'Provide, operate, and maintain the FinSight platform',
                'Generate AI-powered insights, anomaly alerts, and spending predictions',
                'Auto-categorize transactions using our ML models',
                'Send transactional emails (account verification, security alerts)',
                'Send optional weekly digest and insight notifications (opt-out available)',
                'Improve our categorization models through aggregate, anonymized data',
                'Comply with legal obligations',
              ]}/>
              <P>We do <strong style={{ color: 'var(--text)' }}>not</strong> sell your personal data to third parties. We do not use your financial data for advertising purposes.</P>
            </Section>

            <Section title="4. Data Storage and Security">
              <P>Your data is stored in encrypted PostgreSQL databases. We implement the following security measures:</P>
              <Ul items={[
                'Passwords hashed using bcrypt with salt rounds ≥ 12',
                'JWT tokens with short expiry (15 minutes access, 7 days refresh)',
                'All data transmitted over HTTPS/TLS 1.2+',
                'Database credentials rotated regularly',
                'Redis cache with authentication for session data',
                'Regular security audits and dependency updates',
              ]}/>
              <P>While we implement industry-standard security practices, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</P>
            </Section>

            <Section title="5. Data Retention">
              <P>We retain your data for as long as your account is active. Upon account deletion:</P>
              <Ul items={[
                'Your personal data is deleted within 30 days',
                'Transaction data is permanently removed from our servers',
                'Anonymized aggregate statistics may be retained for product improvement',
                'Backups are purged within 90 days of deletion',
              ]}/>
            </Section>

            <Section title="6. Third-Party Services">
              <P>FinSight integrates with the following third-party services:</P>
              <Ul items={[
                'Email delivery via SMTP (transactional emails only)',
                'Machine learning inference via our internal Python microservice',
                'No third-party analytics SDKs embedded in the frontend',
              ]}/>
            </Section>

            <Section title="7. Your Rights">
              <P>Depending on your jurisdiction, you may have the right to:</P>
              <Ul items={[
                'Access the personal data we hold about you',
                'Correct inaccurate data',
                'Request deletion of your data ("right to be forgotten")',
                'Export your data in a portable format (CSV export available in-app)',
                'Opt out of non-essential communications',
                'Lodge a complaint with your local data protection authority',
              ]}/>
              <P>To exercise these rights, contact us at <strong style={{ color: 'var(--accent)' }}>privacy@finsight.app</strong></P>
            </Section>

            <Section title="8. Cookies">
              <P>FinSight uses minimal cookies:</P>
              <Ul items={[
                'Authentication cookies (accessToken, refreshToken) — essential for login sessions',
                'Theme preference (localStorage) — stores light/dark mode preference',
                'No third-party tracking or advertising cookies',
              ]}/>
            </Section>

            <Section title="9. Children's Privacy">
              <P>FinSight is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you become aware that a child has provided us with personal information, please contact us immediately.</P>
            </Section>

            <Section title="10. Changes to This Policy">
              <P>We may update this Privacy Policy periodically. We will notify you of material changes by email or via an in-app notification at least 14 days before the changes take effect. Continued use of the platform after changes constitutes acceptance.</P>
            </Section>

            <div style={{ padding: '16px', background: 'var(--accent-dim)', borderRadius: '12px', border: '1px solid var(--accent-dim)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0 }}>
                Questions about this policy? Contact us at <strong style={{ color: 'var(--accent)' }}>privacy@finsight.app</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer/>
    </div>
  );
}
