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

const P = ({ children }: { children: React.ReactNode }) => <p style={{ marginBottom: '12px' }}>{children}</p>;
const Ul = ({ items }: { items: string[] }) => (
  <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
    {items.map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
  </ul>
);

export default function TermsPage() {
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

      <main style={{ flex: 1, maxWidth: '760px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Legal</p>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text)', marginBottom: '8px' }}>Terms of Service</h1>
            <p style={{ fontSize: '14px', color: 'var(--text2)' }}>Last updated: March 23, 2026 · By using FinSight, you agree to these terms.</p>
          </div>

          <div className="glass-static" style={{ padding: '32px', borderRadius: '20px' }}>
            <Section title="1. Acceptance of Terms">
              <P>By accessing or using FinSight ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not access or use the Service.</P>
              <P>These terms apply to all visitors, users, and others who access or use the Service.</P>
            </Section>

            <Section title="2. Description of Service">
              <P>FinSight is a personal finance intelligence platform that provides:</P>
              <Ul items={[
                'Transaction tracking and categorization using AI/ML models',
                'Spending analytics, insights, and anomaly detection',
                'Monthly spending predictions and budget management tools',
                'Data visualization through charts and dashboards',
                'CSV export of your financial data',
              ]}/>
              <P>FinSight is a personal finance tool only. It does not provide financial advice, investment recommendations, tax advice, or any regulated financial services.</P>
            </Section>

            <Section title="3. User Accounts">
              <P>To use FinSight, you must create an account. You agree to:</P>
              <Ul items={[
                'Provide accurate, current, and complete information during registration',
                'Maintain the security of your password and promptly notify us of any unauthorized access',
                'Be responsible for all activity that occurs under your account',
                'Not share your account credentials with any third party',
                'Not create more than one account per person',
              ]}/>
              <P>We reserve the right to terminate accounts that violate these terms or that have been inactive for more than 24 months.</P>
            </Section>

            <Section title="4. Acceptable Use">
              <P>You agree not to:</P>
              <Ul items={[
                'Use the Service for any unlawful purpose or in violation of any regulations',
                'Attempt to gain unauthorized access to any portion of the Service',
                'Interfere with or disrupt the integrity or performance of the Service',
                'Reverse engineer, decompile, or disassemble any part of the Service',
                'Upload malicious code, viruses, or any software intended to damage the platform',
                'Impersonate any person or entity or misrepresent your affiliation',
                'Collect or harvest user data without authorization',
                'Use the Service to process data for persons other than yourself',
              ]}/>
            </Section>

            <Section title="5. Financial Data Disclaimer">
              <P><strong style={{ color: 'var(--text)' }}>Important:</strong> FinSight is not a financial advisor, bank, or regulated financial institution.</P>
              <Ul items={[
                'AI insights and predictions are for informational purposes only',
                'Spending predictions may not be accurate and should not be relied upon for financial decisions',
                'Anomaly detection may produce false positives or miss actual anomalies',
                'We are not responsible for financial decisions made based on data shown in the platform',
                'Always consult a qualified financial advisor for investment or tax decisions',
              ]}/>
            </Section>

            <Section title="6. Intellectual Property">
              <P>The Service and its original content, features, and functionality are owned by FinSight and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</P>
              <P>You retain ownership of all financial data you enter into the platform. By using the Service, you grant us a limited license to process and analyze your data solely to provide the Service to you.</P>
            </Section>

            <Section title="7. Data Accuracy">
              <P>You are responsible for the accuracy of data you enter into the platform. FinSight:</P>
              <Ul items={[
                'Does not verify the accuracy of transaction data you provide',
                'Cannot guarantee that AI categorization is 100% accurate',
                'Is not responsible for errors arising from inaccurate data entry',
                'Provides tools to correct categorizations and data (edit/delete transactions)',
              ]}/>
            </Section>

            <Section title="8. Limitation of Liability">
              <P>To the maximum extent permitted by applicable law, FinSight shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, goodwill, or other intangible losses, resulting from:</P>
              <Ul items={[
                'Your use of or inability to use the Service',
                'Any unauthorized access to or use of our servers and your data stored therein',
                'Any interruption or cessation of transmission to or from the Service',
                'Any financial decisions made based on insights or predictions shown in the platform',
              ]}/>
            </Section>

            <Section title="9. Service Availability">
              <P>We strive for high availability but do not guarantee uninterrupted access. We may:</P>
              <Ul items={[
                'Perform scheduled maintenance with reasonable advance notice',
                'Temporarily suspend access during emergency maintenance',
                'Modify or discontinue features with reasonable notice',
                'Terminate the Service with 30 days notice to registered users',
              ]}/>
            </Section>

            <Section title="10. Governing Law">
              <P>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Delhi, India.</P>
            </Section>

            <Section title="11. Changes to Terms">
              <P>We reserve the right to modify these terms at any time. We will provide at least 14 days notice of material changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the new terms.</P>
            </Section>

            <div style={{ padding: '16px', background: 'var(--accent-dim)', borderRadius: '12px', border: '1px solid var(--accent-dim)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0 }}>
                Questions about these terms? Contact us at <strong style={{ color: 'var(--accent)' }}>legal@finsight.app</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer/>
    </div>
  );
}
