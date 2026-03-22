'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Mail, MessageCircle, BookOpen, Zap } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const FAQS = [
  {
    q: 'How does auto-categorization work?',
    a: 'FinSight uses a hybrid approach: first, a keyword rule engine checks merchant names against a curated database (e.g. "Swiggy" → Food, "Uber" → Transport). If no rule matches, the transaction is sent to our LightGBM ML model which classifies it based on the description text. You can always correct a category by editing the transaction, and corrections improve the model over time.',
  },
  {
    q: 'How accurate are the spending predictions?',
    a: 'Predictions improve significantly with more data. With 1–2 months of history, predictions use a weighted moving average (accuracy ~60–70%). After 3+ months, Facebook Prophet forecasting activates (accuracy ~75–85%). After 6+ months with consistent data, ARIMA models may also be used. The confidence score shown on the Predictions page reflects the model\'s certainty.',
  },
  {
    q: 'How do I connect my bank account?',
    a: 'FinSight does not directly connect to bank accounts for security reasons. You can add transactions manually, import them via CSV export from your bank, or paste Indian bank SMS messages using the SMS parser (POST /transactions/parse-sms via API). Direct bank integration is on our roadmap.',
  },
  {
    q: 'Is my financial data safe?',
    a: 'Yes. All passwords are hashed with bcrypt (12 rounds). Data is transmitted over HTTPS only. JWT tokens expire after 15 minutes. We use Redis for secure session management. Your data is never sold to third parties. See our Privacy Policy for full details.',
  },
  {
    q: 'How do insights get generated?',
    a: 'Every time you add or delete a transaction, a background job (BullMQ) runs the insights engine. It analyzes: category spend vs last month (flags >25% increase), weekend vs weekday spending patterns, recurring small charges (potential unused subscriptions), duplicate charges, savings rate, and budget threshold alerts. Insights appear on the Insights page and on your dashboard.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. Click the Export button on the Dashboard to download all transactions for the selected month as a CSV file. The CSV includes date, description, merchant, type, category, amount, and payment method. You can also filter by month before exporting.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Account deletion is available via the Settings page (coming soon) or by emailing support@finsight.app. Your data is permanently deleted within 30 days of the request, and backups are purged within 90 days.',
  },
  {
    q: 'What is the Anomaly Alert card?',
    a: 'The anomaly detector runs automatically after every expense transaction. It uses Z-score analysis (flags transactions more than 2.5 standard deviations above your category average) and checks for duplicate charges (same merchant + amount within 24 hours). High-confidence anomalies also go through an Isolation Forest ML model for validation.',
  },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--glass-border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', gap: '16px' }}
      >
        <span style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span>
        <ChevronDown size={16} color="var(--text3)" strokeWidth={2} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}/>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
          <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, paddingBottom: '16px', margin: 0 }}>{a}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const CARDS = [
    { icon: Mail,          title: 'Email Support',   desc: 'Get help from our team within 24 hours',       action: 'support@finsight.app',    href: 'mailto:support@finsight.app' },
    { icon: BookOpen,      title: 'Documentation',   desc: 'API docs, guides, and integration examples',   action: 'View API Docs →',          href: '/api/docs' },
    { icon: MessageCircle, title: 'Bug Reports',     desc: 'Found a bug? Report it and help us improve',   action: 'bugs@finsight.app',        href: 'mailto:bugs@finsight.app' },
    { icon: Zap,           title: 'Feature Requests',desc: 'Suggest new features or improvements',         action: 'feedback@finsight.app',    href: 'mailto:feedback@finsight.app' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
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

      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>Help Center</p>
            <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text)', marginBottom: '12px' }}>How can we help?</h1>
            <p style={{ fontSize: '15px', color: 'var(--text2)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
              Find answers to common questions, contact support, or browse our documentation.
            </p>
          </div>

          {/* Contact cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '48px' }}>
            {CARDS.map(({ icon: Icon, title, desc, action, href }) => (
              <a key={title} href={href}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '20px', textDecoration: 'none', borderRadius: '16px', background: 'var(--glass)', border: '1px solid var(--glass-border)', transition: 'all 0.15s', backdropFilter: 'blur(20px)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--glass-hover)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--glass)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                <div style={{ width: 40, height: 40, borderRadius: '11px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="var(--accent)" strokeWidth={2}/>
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>{title}</p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text2)', margin: '0 0 8px', lineHeight: 1.4 }}>{desc}</p>
                  <span style={{ fontSize: '12.5px', color: 'var(--accent)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {action} <ChevronRight size={12} strokeWidth={2.5}/>
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* FAQ */}
          <div className="glass-static" style={{ padding: '28px 32px', borderRadius: '20px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text2)', marginBottom: '24px' }}>Answers to the most common questions about FinSight</p>
            {FAQS.map((faq, i) => <FAQ key={i} {...faq}/>)}
          </div>

          {/* Still need help */}
          <div style={{ textAlign: 'center', padding: '28px', background: 'var(--accent-dim)', borderRadius: '16px', border: '1px solid var(--accent-dim)' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Still need help?</p>
            <p style={{ fontSize: '13.5px', color: 'var(--text2)', marginBottom: '16px' }}>Our support team is available Mon–Fri, 9am–6pm IST.</p>
            <a href="mailto:support@finsight.app"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '50px', background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'filter 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = 'none')}>
              <Mail size={15} strokeWidth={2}/> Email Support
            </a>
          </div>
        </motion.div>
      </main>
      <Footer/>
    </div>
  );
}
