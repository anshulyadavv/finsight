'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ChevronUp } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-[18px] font-black text-gray-900 mb-4 pb-3 border-b border-gray-100 tracking-tight">
      {title}
    </h2>
    <div className="text-[15px] text-gray-600 font-medium leading-relaxed tracking-tight">{children}</div>
  </div>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-4">{children}</p>
);

const Ul = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-5 mb-4 space-y-2">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFC] text-gray-900 font-sans overflow-x-hidden selection:bg-violet-200 selection:text-violet-900 relative">
      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')" }} />
      
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <motion.div 
           animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 blur-[120px] mix-blend-multiply" 
         />
         <motion.div 
           animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
           transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           className="absolute top-[20%] right-[-5%] w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-emerald-300/20 to-teal-200/20 blur-[130px] mix-blend-multiply" 
         />
      </div>

      <header className="relative z-50 pt-8 px-6">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto pointer-events-auto">
          <Link href="/" className="z-10 group focus:outline-none">
            <Logo />
          </Link>
          <div className="flex items-center gap-8 z-10">
            <Link href="/" className="text-[14px] font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[800px] mx-auto pt-24 pb-32 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-12">
            <p className="text-[12px] font-black text-violet-600 uppercase tracking-[0.2em] mb-4">Legal</p>
            <h1 className="text-[48px] md:text-[64px] font-black tracking-tight leading-none text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-[15px] font-bold text-gray-400 tracking-tight italic">
              Last updated: March 23, 2026 · Effective immediately
            </p>
          </div>

          <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-200 shadow-sm relative overflow-hidden">
            <Section title="1. Introduction">
              <P>FinSight ({'"'}we{'"'}, {'"'}our{'"'}, or {'"'}us{'"'}) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our personal finance intelligence platform.</P>
              <P>Please read this policy carefully. If you disagree with its terms, please discontinue use of the platform.</P>
            </Section>

            <Section title="2. Information We Collect">
              <P><strong className="text-gray-900">Account Information</strong></P>
              <Ul items={[
                'Name and email address provided during registration',
                'Encrypted password (we never store plaintext passwords)',
                'Currency preference and notification settings',
              ]}/>
              <P><strong className="text-gray-900">Financial Data</strong></P>
              <Ul items={[
                'Transaction records you manually enter or import via CSV',
                'Merchant names, amounts, dates, and categories you assign',
                'Budget limits and spending goals you configure',
                'Bank card metadata (last 4 digits, expiry — never full card numbers)',
              ]}/>
              <P><strong className="text-gray-900">Usage Data</strong></P>
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
              <P>We do <strong className="text-gray-900 font-black">not</strong> sell your personal data to third parties. We do not use your financial data for advertising purposes.</P>
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
              <P>To exercise these rights, contact us at <strong className="text-violet-600">privacy@finsight.app</strong></P>
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

            <div className="p-6 bg-violet-50 rounded-[16px] border border-violet-100">
              <p className="text-[14px] text-gray-700 font-medium">
                Questions about this policy? Contact us at <strong className="text-violet-600 font-black">privacy@finsight.app</strong>
              </p>
            </div>
          </div>
          {/* Minimalist White Circle Back to Top Arrow */}
          <div className="flex justify-end pt-8 pb-12">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:border-gray-200 transition-all focus:outline-none"
              aria-label="Back to top"
            >
              <ChevronUp className="text-gray-400 group-hover:text-gray-900 transition-colors" size={20} strokeWidth={3} />
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
