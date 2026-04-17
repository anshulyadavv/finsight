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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFC] text-gray-900 font-sans overflow-x-hidden selection:bg-violet-200 selection:text-violet-900 relative">
      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')" }} />
      
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <motion.div 
           animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 blur-[120px] mix-blend-multiply" 
         />
         <motion.div 
           animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
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
            <p className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Legal</p>
            <h1 className="text-[48px] md:text-[64px] font-black tracking-tight leading-none text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-[15px] font-bold text-gray-400 tracking-tight italic">
              Last updated: March 23, 2026 · By using FinSight, you agree to these terms.
            </p>
          </div>

          <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-200 shadow-sm relative overflow-hidden">
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
              <P><strong className="text-gray-900 font-bold">Important:</strong> FinSight is not a financial advisor, bank, or regulated financial institution.</P>
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

            <div className="p-6 bg-emerald-50 rounded-[16px] border border-emerald-100">
              <p className="text-[14px] text-gray-700 font-medium">
                Questions about these terms? Contact us at <strong className="text-emerald-600 font-black">legal@finsight.app</strong>
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
