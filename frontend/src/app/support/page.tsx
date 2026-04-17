'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Mail, MessageCircle, BookOpen, Zap, ArrowLeft, ChevronUp } from 'lucide-react';
import Logo from '@/components/ui/Logo';

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

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group transition-all"
      >
        <span className="text-[16px] font-bold text-gray-900 group-hover:text-violet-600 transition-colors tracking-tight leading-snug pr-8">
          {q}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-180 bg-violet-50 text-violet-600' : 'text-gray-400'}`}>
          <ChevronDown size={18} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[15px] text-gray-500 font-medium leading-relaxed pb-6 tracking-tight">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SupportPage() {
  const CARDS = [
    { icon: Mail,          title: 'Email Support',   desc: 'Get help from our team within 24 hours',       action: 'support@finsight.app',    href: 'mailto:support@finsight.app', color: 'bg-violet-50 text-violet-600' },
    { icon: BookOpen,      title: 'Documentation',   desc: 'API docs, guides, and integration examples',   action: 'View API Docs',          href: '#', color: 'bg-blue-50 text-blue-600' },
    { icon: MessageCircle, title: 'Bug Reports',     desc: 'Found a bug? Report it and help us improve',   action: 'bugs@finsight.app',        href: 'mailto:bugs@finsight.app', color: 'bg-emerald-50 text-emerald-600' },
    { icon: Zap,           title: 'Feature Requests',desc: 'Suggest new features or improvements',         action: 'feedback@finsight.app',    href: 'mailto:feedback@finsight.app', color: 'bg-amber-50 text-amber-600' },
  ];

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

      <main className="relative z-10 max-w-[900px] mx-auto pt-24 pb-32 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-16 text-center">
            <p className="text-[12px] font-black text-violet-600 uppercase tracking-[0.2em] mb-4">Help Center</p>
            <h1 className="text-[48px] md:text-[72px] font-black tracking-tight leading-none text-gray-900 mb-6">
              How can we help?
            </h1>
            <p className="text-[18px] font-medium text-gray-500 tracking-tight max-w-[500px] mx-auto leading-relaxed">
              Find answers to common questions about our AI engine, sync logic, and security stack.
            </p>
          </div>

          {/* Contact cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
            {CARDS.map(({ icon: Icon, title, desc, action, href, color }) => (
              <Link 
                key={title} 
                href={href}
                className="group p-8 bg-white rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-6 shadow-sm ${color}`}>
                    <Icon size={22} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[20px] font-black text-gray-900 tracking-tight mb-2">{title}</h3>
                  <p className="text-[14px] text-gray-500 font-medium leading-relaxed tracking-tight mb-6">{desc}</p>
                </div>
                <div className="flex items-center gap-2 text-[14px] font-bold text-gray-900 group-hover:gap-3 transition-all">
                  {action} <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-900" strokeWidth={3} />
                </div>
                {/* Subtle Decorative Orb */}
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700 ${color.split(' ')[0]}`} />
              </Link>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100 shadow-sm mb-16 relative overflow-hidden">
            <div className="mb-10">
              <h2 className="text-[28px] font-black text-gray-900 tracking-tight mb-2">Frequently Asked Questions</h2>
              <p className="text-[15px] text-gray-500 font-medium tracking-tight">The technical details behind FinSight’s intelligence.</p>
            </div>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} {...faq} index={i} />
              ))}
            </div>
          </div>

          {/* Still need help CTA */}
          <div className="text-center p-12 bg-gray-900 rounded-[32px] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <p className="text-[14px] font-black text-white/50 uppercase tracking-[0.2em] mb-4 relative z-10">Still need help?</p>
            <h2 className="text-[28px] md:text-[36px] font-black text-white tracking-tight mb-2 relative z-10">Talk to our engineering team</h2>
            <p className="text-[16px] text-white/60 font-medium mb-10 relative z-10">Available Mon–Fri, 9am–6pm IST. We respond to all technical queries within 24h.</p>
            <a 
              href="mailto:support@finsight.app"
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-full text-[16px] font-bold hover:scale-105 active:scale-95 transition-all shadow-xl relative z-10"
            >
              <Mail size={18} strokeWidth={2.5} />
              Contact Support
            </a>
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
