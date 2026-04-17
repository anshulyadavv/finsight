'use client';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import {
  ArrowRight, TrendingUp, TrendingDown, Sparkles,
  Brain, Shield, Zap, Activity, PieChart
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import {
  TotalBalanceCard, IncomeExpenseCard, RevenueFlowCard, ExpenseSplitCard
} from '@/components/dashboard/EtherealCards';

const mockSummary = {
  totalBalance: 284320,
  monthlyIncome: 68500,
  monthlyExpenses: 42180,
  trends: { income: { value: 12.4 }, expenses: { value: -5.2 } }
};

const mockMoneyFlow = [
  { label: 'Week 1', income: 15000, expenses: 8000 },
  { label: 'Week 2', income: 18000, expenses: 9500 },
  { label: 'Week 3', income: 20000, expenses: 14000 },
  { label: 'Week 4', income: 15500, expenses: 10680 }
];

const mockOverview = {
  categories: [
    { name: 'Amenities', percentage: 40, amount: 16872 },
    { name: 'Food', percentage: 25, amount: 10545 },
    { name: 'Utilities', percentage: 20, amount: 8436 },
    { name: 'Travel', percentage: 15, amount: 6327 }
  ]
};

/* ─────────────────────────────────────────────────────────────────
   Interactive 3D Card Content
   ───────────────────────────────────────────────────────────────── */
const CARDS = [
  {
    id: 1,
    style: { left: '2%', top: '12%' }, delay: 0,
    depth: 0.04,
    content: (
      <div className="w-[194px] rounded-[24px] bg-white/80 backdrop-blur-2xl border border-gray-200 p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] pointer-events-auto hover:-translate-y-1 transition-transform cursor-default">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Total Balance</p>
        <p className="text-[26px] font-black text-gray-900 tracking-tight leading-none mb-2">₹2,84,320</p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="text-[11px] font-bold text-emerald-600 tracking-tight">+12.4%</span>
        </div>
        <div className="mt-4 h-10 flex items-end gap-1">
          {[38, 55, 42, 70, 52, 80, 65, 90, 58, 84, 72, 96].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-violet-500/20" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    style: { left: '0.5%', top: '55%' }, delay: 0.2,
    depth: 0.08,
    content: (
      <div className="w-[190px] rounded-[24px] bg-white/80 backdrop-blur-2xl border border-gray-200 p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] pointer-events-auto hover:-translate-y-1 transition-transform cursor-default">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Recent</p>
        {[
          { name: 'YouTube', amt: '−₹199', type: 'neg' },
          { name: 'Salary', amt: '+₹68,500', type: 'pos' },
          { name: 'Netflix', amt: '−₹649', type: 'neg' },
        ].map(tx => (
          <div key={tx.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-[12px] text-gray-800 font-semibold tracking-tight">{tx.name}</span>
            <span className={`text-[11px] font-bold tracking-tight ${tx.type === 'pos' ? 'text-emerald-600' : 'text-gray-900'}`}>{tx.amt}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    style: { left: '4%', top: '88%' }, delay: 0.1,
    depth: 0.03,
    content: (
      <div className="w-[188px] rounded-[24px] bg-white/80 backdrop-blur-2xl border border-gray-200 p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] pointer-events-auto hover:-translate-y-1 transition-transform cursor-default">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <TrendingDown size={14} className="text-gray-900" />
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Expenses</span>
        </div>
        <p className="text-[22px] font-black text-gray-900 tracking-tight">₹42,180</p>
      </div>
    ),
  },
  {
    id: 4,
    style: { right: '3%', top: '8%' }, delay: 0.1,
    depth: 0.06,
    content: (
      <div className="w-[178px] rounded-[24px] bg-white/80 backdrop-blur-2xl border border-gray-200 p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] pointer-events-auto hover:-translate-y-1 transition-transform cursor-default">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
            <TrendingUp size={14} className="text-emerald-600" />
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Income</span>
        </div>
        <p className="text-[22px] font-black text-gray-900 tracking-tight">₹68,500</p>
        <div className="mt-4 h-[4px] w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-[78%] bg-emerald-500 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: 5,
    style: { right: '1%', top: '51%' }, delay: 0.3,
    depth: 0.09,
    content: (
      <div className="w-[168px] rounded-[24px] bg-gray-900/95 backdrop-blur-3xl border border-gray-700 p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)] pointer-events-auto hover:bg-black transition-colors cursor-default group">
        <Activity size={14} className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Forecast</p>
        <p className="text-[15px] font-bold text-white tracking-tight">Next Month</p>
        <p className="text-[13px] font-bold text-emerald-400 mt-1 tracking-tight">+₹9,200 est.</p>
      </div>
    ),
  },
  {
    id: 6,
    style: { right: '3%', top: '85%' }, delay: 0.2,
    depth: 0.04,
    content: (
      <div className="w-[180px] rounded-[24px] bg-white/80 backdrop-blur-2xl border border-gray-200 p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] pointer-events-auto hover:-translate-y-1 transition-transform cursor-default">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={12} className="text-violet-600" />
          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-[0.2em]">AI Insight</span>
        </div>
        <p className="text-[13px] font-medium text-gray-700 leading-snug tracking-tight">
          Cut dining by <span className="font-bold text-gray-900">₹2,400</span> to hit your goal.
        </p>
      </div>
    ),
  },
];

function InteractiveCard({ card, mouseX, mouseY }: any) {
  const x = useTransform(mouseX, (v: number) => v * card.depth);
  const y = useTransform(mouseY, (v: number) => v * card.depth);

  return (
    <motion.div
      className="absolute pointer-events-none select-none z-10 hidden lg:block"
      style={{ ...card.style, x, y }}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5 + card.delay, type: 'spring', stiffness: 100, damping: 20 }}
    >
      {card.content}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Navbar
   ───────────────────────────────────────────────────────────────── */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none"
    >
      <div className="relative flex items-center justify-between max-w-[1200px] mx-auto pointer-events-auto">
        <Link href="/" className="z-10 group focus:outline-none">
          <Logo variant="light" />
        </Link>

        {/* Center Pill */}
        <div className="absolute left-1/2 -translate-x-1/2 z-0 hidden md:block">
          <div className={`flex items-center rounded-full p-2 transition-all duration-500 bg-white/70 backdrop-blur-xl ${scrolled ? 'border border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.06)]' : 'border border-gray-200 shadow-sm'
            }`}>
            {['Pricing', 'Methodology', 'Enterprise'].map(link => (
              <Link key={link} href={`/${link.toLowerCase()}`} className="px-6 py-2 rounded-full text-[14px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors tracking-tight block">
                {link}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-5 z-10">
          <Link href="/login">
            <span className="text-[15px] font-semibold text-gray-600 hover:text-gray-900 transition-colors tracking-tight hidden sm:block">
              Log in
            </span>
          </Link>
          <Link href="/register">
            <button className="bg-gray-900 hover:bg-gray-800 text-white text-[14px] font-bold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-[1px] transition-all duration-300 tracking-tight">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Page Content
   ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], ['0px', '100px']);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 25, mass: 0.8 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 30, damping: 25, mass: 0.8 });

  const ambientX = useTransform(smoothMouseX, (v) => v * -0.15);
  const ambientY = useTransform(smoothMouseY, (v) => v * -0.15);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = clientX - window.innerWidth / 2;
    const y = clientY - window.innerHeight / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <div
      className="min-h-screen bg-[#FBFBFC] text-gray-900 font-sans overflow-x-hidden selection:bg-violet-200 selection:text-violet-900 relative"
      onMouseMove={handleMouseMove}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          background-size: 200% auto;
          animation: gradientShift 6s linear infinite;
        }
      `}</style>

      {/* High-Performance Noise Overlay (CSS Noise Pattern) */}
      <div
        className="fixed inset-0 pointer-events-none z-[100] opacity-[0.05] mix-blend-soft-light"
        style={{ 
          backgroundImage: `url("https://transparenttextures.com/patterns/pinstriped-suit.png")`,
          filter: 'contrast(120%) brightness(100%)'
        }}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ x: ambientX, y: ambientY, willChange: 'transform' }}
          className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 blur-[120px] mix-blend-multiply"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ x: useTransform(smoothMouseX, v => v * 0.1), y: useTransform(smoothMouseY, v => v * 0.1), willChange: 'transform' }}
          className="absolute top-[20%] right-[-5%] w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-emerald-300/20 to-teal-200/20 blur-[130px] mix-blend-multiply"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ willChange: 'transform' }}
          className="absolute bottom-[-10%] left-[20%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-blue-300/20 to-indigo-300/20 blur-[140px] mix-blend-multiply"
        />
      </div>

      <LandingNav />

      {/* ── Hero section ─────────────────────────────── */}
      <div ref={heroRef} className="relative min-h-[100svh] flex flex-col items-center justify-center z-10 overflow-hidden pt-32 pb-16">

        {/* Core Text Content safe from navbar with pt-32 */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
          className="flex flex-col items-center text-center w-full max-w-[840px] mx-auto px-6 z-40 pointer-events-auto relative mt-8 md:mt-0"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white/70 backdrop-blur-md mb-8 shadow-sm"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[12px] font-bold text-gray-700 tracking-[0.05em] uppercase">FinSight Beta 2.0 is live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[64px] sm:text-[88px] md:text-[104px] font-black leading-[0.95] tracking-tight text-gray-900 mb-8"
          >
            Money, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-700 to-gray-400 animate-gradient-text block mt-2">mastered.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[19px] sm:text-[22px] text-gray-600 max-w-[560px] leading-[1.5] tracking-tight mb-12 font-medium"
          >
            Track every transaction, forecast with precision, and grow your net worth. The premium standard for personal finance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            <Link href="/register">
              <button className="bg-gray-900 hover:bg-gray-800 text-white text-[16px] font-bold px-10 py-4 rounded-full shadow-[0_12px_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 tracking-tight flex items-center gap-2">
                Start for free
              </button>
            </Link>
            <Link href="#preview">
              <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 text-[16px] font-bold px-10 py-4 rounded-full transition-colors tracking-tight flex items-center gap-2 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]">
                Watch demo
                <ArrowRight size={18} className="text-gray-500" />
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* 3D Mouse Parallax Cards */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {CARDS.map(c => <InteractiveCard key={c.id} card={c} mouseX={smoothMouseX} mouseY={smoothMouseY} />)}
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#FBFBFC] to-transparent z-20 pointer-events-none" />
      </div>

      {/* ── High-Def Mockup Section ─────────────────────────────── */}
      <section id="preview" className="relative z-20 pt-32 pb-24 px-6 bg-gradient-to-b from-[#FBFBFC] to-white">
        <div className="max-w-[1200px] mx-auto text-center mb-16">
          <h2 className="text-[36px] md:text-[56px] font-black tracking-tight leading-loose text-gray-900 mb-4 inline-block relative py-2">
            The Dashboard
          </h2>
          <p className="text-[18px] text-gray-600 font-medium tracking-tight">Clarity at a singular glance.</p>
        </div>
        <div className="max-w-[1200px] mx-auto pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[32px] md:rounded-[40px] bg-white border border-gray-200 p-4 sm:p-6 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            {/* Mockup Header (macOS window style) */}
            <div className="flex items-center gap-2 mb-6 px-4">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-400 border border-gray-200" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-gray-200" />
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-gray-200" />
              </div>
            </div>

            {/* Real Dashboard Components Mounted as Mockup */}
            <div className="flex flex-col gap-6 bg-[#FBFBFC] rounded-[24px] p-6 lg:p-10 border border-gray-100 shadow-inner">

              {/* Top Row Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <TotalBalanceCard summary={mockSummary} loading={false} />
                </div>
                <div className="flex flex-col gap-6">
                  <IncomeExpenseCard type="income" summary={mockSummary} loading={false} />
                  <IncomeExpenseCard type="expense" summary={mockSummary} loading={false} />
                </div>
              </div>

              {/* Bottom Row Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[320px]">
                <RevenueFlowCard moneyFlow={mockMoneyFlow} loading={false} />
                <ExpenseSplitCard overview={mockOverview} summary={mockSummary} loading={false} />
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Interactive Bento Grid ────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] md:text-[56px] font-black tracking-tight leading-loose text-gray-900 mb-4 inline-block relative py-2">
              Intelligence, built in.
            </h2>
            <p className="text-[18px] text-gray-600 font-medium tracking-tight">Everything you need to master your net worth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-[minmax(280px,auto)]">

            {/* Large Horizontal Card */}
            <motion.div
              whileHover={{ y: -8 }}
              className="col-span-1 md:col-span-8 bg-white rounded-[32px] p-10 border border-gray-200 shadow-sm relative overflow-hidden group cursor-default"
            >
              <div className="relative z-10 max-w-[400px]">
                <div className="w-14 h-14 rounded-[16px] bg-violet-100 flex items-center justify-center mb-6">
                  <Brain size={24} className="text-violet-600" />
                </div>
                <h3 className="text-[28px] font-black text-gray-900 tracking-tight mb-4">Smart Organization</h3>
                <p className="text-[16px] text-gray-600 font-medium leading-relaxed tracking-tight">
                  Every transaction is parsed, cleaned, and categorized instantly using advanced local machine learning. Zero manual tagging required.
                </p>
              </div>
              {/* Decorative UI element sliding in on hover */}
              <div className="absolute right-[-20%] bottom-[-20%] w-[350px] h-[350px] bg-violet-50 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 opacity-50" />
            </motion.div>

            {/* Medium Vertical Card */}
            <motion.div
              whileHover={{ y: -8 }}
              className="col-span-1 md:col-span-4 bg-gray-900 rounded-[32px] p-10 border border-gray-800 shadow-xl relative overflow-hidden group cursor-default"
            >
              <div className="w-14 h-14 rounded-[16px] bg-gray-800 flex items-center justify-center mb-6 border border-gray-700">
                <Shield size={24} className="text-emerald-400" />
              </div>
              <h3 className="text-[28px] font-black text-white tracking-tight mb-4">Bank-Grade Encryption</h3>
              <p className="text-[16px] text-gray-400 font-medium leading-relaxed tracking-tight">
                End-to-end 256-bit AES encryption. Nobody accesses your financial data but you.
              </p>
              <div className="absolute right-[-10%] top-[-10%] w-[200px] h-[200px] bg-emerald-900/40 rounded-full blur-3xl group-hover:bg-emerald-800/40 transition-colors duration-700" />
            </motion.div>

            {/* Medium Horizontal Card 1 */}
            <motion.div
              whileHover={{ y: -8 }}
              className="col-span-1 md:col-span-6 bg-white rounded-[32px] p-10 border border-gray-200 shadow-sm relative overflow-hidden group cursor-default"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-14 h-14 rounded-[16px] bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Zap size={24} className="text-blue-500" />
                  </div>
                  <h3 className="text-[24px] font-black text-gray-900 tracking-tight">Real-time Sync</h3>
                </div>
                <p className="text-[16px] text-gray-600 font-medium leading-relaxed tracking-tight">
                  Instantly imports data across all your linked institutions so you are never flying blind. Updates automatically in the background.
                </p>
              </div>
              <div className="absolute right-[-20%] top-[0%] w-[300px] h-[300px] bg-blue-50 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 opacity-50" />
            </motion.div>

            {/* Medium Horizontal Card 2 */}
            <motion.div
              whileHover={{ y: -8 }}
              className="col-span-1 md:col-span-6 bg-white rounded-[32px] p-10 border border-gray-200 shadow-sm relative overflow-hidden group cursor-default"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-14 h-14 rounded-[16px] bg-amber-50 flex items-center justify-center border border-amber-100">
                    <PieChart size={24} className="text-amber-500" />
                  </div>
                  <h3 className="text-[24px] font-black text-gray-900 tracking-tight">Goal Tracking</h3>
                </div>
                <p className="text-[16px] text-gray-600 font-medium leading-relaxed tracking-tight">
                  Set personalized savings targets and watch your net worth grow toward them with satisfying, granular visual feedback.
                </p>
              </div>
              <div className="absolute left-[-20%] bottom-[-10%] w-[300px] h-[300px] bg-amber-50 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 opacity-50" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="pt-24 pb-32 px-6 bg-gradient-to-b from-white to-[#FBFBFC] z-10 relative">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="flex justify-center mb-10 shadow-2xl rounded-[20px] w-max mx-auto">
            <Logo size="lg" iconOnly variant="light" />
          </div>
          <h2 className="text-[48px] md:text-[72px] font-black tracking-tight leading-[0.95] text-gray-900 mb-10">
            Ready to take <br className="md:hidden" />control?
          </h2>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <button className="bg-gray-900 hover:bg-gray-800 text-white text-[16px] font-bold px-10 py-4 flex items-center gap-2 rounded-full shadow-[0_12px_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 tracking-tight">
                Create free account
                <ArrowRight size={18} className="text-gray-400" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative bg-[#FBFBFC] pt-12 pb-12 px-6 overflow-hidden z-0">
        {/* Animated Gradient Mesh for Footer */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-50%] left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-300/40 to-fuchsia-300/40 blur-[120px] mix-blend-multiply"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[-20%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-emerald-300/40 to-teal-200/40 blur-[130px] mix-blend-multiply"
          />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Logo variant="light" />
          </div>
          <div className="flex gap-10 text-[14px] font-bold text-gray-600 tracking-tight">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link href="/support" className="hover:text-gray-900 transition-colors">Support</Link>
          </div>
          <p className="text-[14px] font-bold text-gray-500 tracking-tight">© 2026 FinSight Inc.</p>
        </div>
      </footer>

    </div>
  );
}
