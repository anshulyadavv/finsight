'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, ArrowUpRight, ArrowDownRight, RefreshCcw, MoreVertical, CreditCard, X, Music, Tv, Youtube, Package, Sparkles, Cloud, Trash2, Edit2, Check, ExternalLink } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Select } from '@/components/ui/Select';

export function TotalBalanceCard({ summary, loading }: any) {
  const { fmt } = useCurrency();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-[#b4f68c] dark:to-[#d9f99d] rounded-[32px] p-8 h-full min-h-[240px] flex flex-col justify-between text-white dark:text-[#0A0E17] shadow-[0_20px_50px_-15px_rgba(99,102,241,0.2)] dark:shadow-[0_20px_50px_-15px_rgba(180,246,140,0.15)] relative overflow-hidden transition-all duration-500"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

      <div>
        <p className="text-sm font-medium mb-1 opacity-80">Total balance</p>
        <p className="text-5xl md:text-6xl font-extrabold tracking-tighter">
          {loading ? '---' : fmt(summary?.totalBalance || 0)}
        </p>
        <p className="text-xs font-semibold mt-3 opacity-80 flex items-center gap-1.5">
          <ArrowUpRight size={14} /> {fmt(summary?.trends?.income?.value || 0)} revenue from last month
        </p>
      </div>

      <div className="flex items-center gap-3 mt-8 relative z-10">
        <button className="bg-white/20 dark:bg-black/20 text-white backdrop-blur-md border border-white/20 dark:border-white/10 px-6 py-3 rounded-full text-sm font-bold hover:brightness-110 transition shadow-lg">
          Transfer
        </button>
        <button className="bg-white text-[#0A0E17] px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-50 transition shadow-lg flex items-center gap-2">
          Top Up
        </button>
        <button className="w-11 h-11 bg-white/20 text-white backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition shadow-lg ml-auto">
          <RefreshCcw size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export function IncomeExpenseCard({ type, summary, loading }: any) {
  const { fmt } = useCurrency();
  const isInc = type === 'income';
  const val = isInc ? summary?.monthlyIncome || 0 : summary?.monthlyExpenses || 0;
  const trend = isInc ? summary?.trends?.income?.value || 0 : summary?.trends?.expenses?.value || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#131823] border border-black/5 dark:border-white/5 rounded-[28px] p-6 h-[140px] flex flex-col justify-between relative shadow-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition group"
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{type}</p>
        <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${trend >= 0 ? 'bg-[#b4f68c]/20 text-[#22c55e] dark:text-[#b4f68c]' : 'bg-[#f43f5e]/20 text-[#f43f5e]'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {isInc ? '+' : '-'}{loading ? '---' : fmt(val)}
        </p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 group-hover:text-gray-700 dark:group-hover:text-white/60 transition">This month&apos;s {type}</p>
      </div>
    </motion.div>
  );
}

export function RevenueFlowCard({ moneyFlow, loading }: any) {
  const { fmt } = useCurrency();
  const data = moneyFlow?.length ? moneyFlow : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#131823] border border-black/5 dark:border-white/5 rounded-[32px] p-7 shadow-xl hover:shadow-[0_8px_30px_rgba(192,132,252,0.05)] transition"
    >
      <div className="flex items-center justify-between mb-8">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">Revenue flow</p>
        <div className="flex gap-2">
          <div className="bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 dark:text-white">Monthly</div>
        </div>
      </div>

      <div className="h-[180px] w-full">
        {loading || data.length === 0 ? <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No data</div> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Bar dataKey="income" fill="url(#purpleGradient)" radius={[6, 6, 6, 6]} barSize={25} />
              <Bar dataKey="expenses" fill="url(#greenGradient)" radius={[6, 6, 6, 6]} barSize={25} />
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b4f68c" stopOpacity={1} />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

export function ExpenseSplitCard({ overview, summary, loading }: any) {
  const { fmt } = useCurrency();
  const cats = overview?.categories || [];
  const COLS = ['#c084fc', '#b4f68c', '#fcd34d', '#f472b6', '#60a5fa', '#34d399'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#131823] border border-black/5 dark:border-white/5 rounded-[32px] p-7 shadow-xl flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">Expense split</p>
        <div className="bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400">This Month</div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
        <div className="w-[140px] h-[140px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={cats.length ? cats : [{ amount: 1 }]} cx="50%" cy="50%" innerRadius={48} outerRadius={68} stroke="none" dataKey="amount" paddingAngle={2}>
                {cats.length ? cats.map((_: any, i: number) => <Cell key={i} fill={COLS[i % COLS.length]} />) : <Cell fill="rgba(139,92,246,0.05)" />}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Total</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {fmt(summary?.monthlyExpenses || 0)}
            </span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-2">
          {cats.slice(0, 6).map((c: any, i: number) => (
            <div key={i} className="flex flex-col">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{c.name}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: COLS[i % COLS.length] }} />
                <span className="text-xs font-bold text-gray-900 dark:text-white">{c.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── MY CARDS LIST ────────────────────────────────────────────────────────
export function MyCardsList() {
  const [cards, setCards] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [fNum, setFNum] = useState('');
  const [fExp, setFExp] = useState('');
  const [fName, setFName] = useState('');
  const [fBrand, setFBrand] = useState('visa');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  useEffect(() => { fetchCards(); }, []);

  const fetchCards = async () => {
    try {
      const r: any = await api.get('/cards');
      const data = r.data.data || r.data;
      setCards(Array.isArray(data) ? data : []);
    } catch (e) {
      setCards([]);
    }
  };

  const handleDeleteCard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this card?')) return;
    try {
      await api.delete(`/cards/${id}`);
      setIsExpanded(false);
      setSelectedIdx(null);
      setShowFullDetails(false);
      fetchCards();
    } catch (error) {
      alert('Failed to remove card. Please try again.');
    }
  };


  const validateLuhn = (num: string) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i));
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const handleExpChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 2) {
      clean = clean.slice(0, 2) + '/' + clean.slice(2, 4);
    }
    setFExp(clean);
  };

  const isExpired = (exp: string) => {
    if (exp.length < 5) return false;
    const [m, y] = exp.split('/').map(Number);
    const now = new Date();
    const curM = now.getMonth() + 1;
    const curY = parseInt(now.getFullYear().toString().slice(-2));
    if (y < curY) return true;
    if (y === curY && m < curM) return true;
    return false;
  };

  const handleAdd = async () => {
    const minLen = fBrand === 'amex' ? 15 : 16;
    if (fNum.length !== minLen) {
      alert(`Invalid card length for ${fBrand}. Expected ${minLen} digits.`);
      return;
    }
    if (!validateLuhn(fNum)) {
      alert("Invalid card number. Please check your entry.");
      return;
    }
    if (isExpired(fExp)) {
      alert("This card is expired and cannot be added.");
      return;
    }

    const gradients: any = {
      visa: 'from-[#2563eb] to-[#1e40af]',
      mastercard: 'from-[#ea580c] to-[#9a3412]',
      amex: 'from-[#0891b2] to-[#155e75]',
      rupay: 'from-[#1e1b4b] to-[#312e81]'
    };

    try {
      await api.post('/cards', {
        brand: fBrand,
        last4: fNum.slice(-4),
        expiry: fExp,
        nameOnCard: fName || 'Name',
        gradientStart: gradients[fBrand]?.split(' ')[0] || 'from-gray-700',
        gradientEnd: gradients[fBrand]?.split(' ')[1] || 'to-gray-900'
      });
      setAdding(false); setFNum(''); setFExp(''); setSelectedIdx(null);
      fetchCards();
    } catch (e) {
      alert('Failed to save card. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-5 relative">
      <div className="flex items-center justify-between">
        <p className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">My Wallet <span className="text-gray-400 dark:text-gray-500 text-sm ml-1 font-medium">{Array.isArray(cards) ? cards.length : 0} cards</span></p>
        <button onClick={() => setAdding(!adding)} className="group bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-xl hover:scale-105 transition-all active:scale-95 cursor-pointer uppercase tracking-widest">
          {adding ? 'Cancel' : 'New Card'} <Plus size={14} className={adding ? "rotate-45 transition duration-500" : "transition duration-500 group-hover:rotate-90"} />
        </button>
      </div>

      <AnimatePresence>
        {adding ? (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="flex flex-col gap-4 bg-gray-50/50 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-[32px] p-6 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Select
                  label="Brand"
                  value={fBrand}
                  onChange={setFBrand}
                  options={[
                    { value: 'visa', label: 'Visa' },
                    { value: 'mastercard', label: 'Mastercard' },
                    { value: 'rupay', label: 'Rupay' },
                    { value: 'amex', label: 'Amex' },
                  ]}
                />
              </div>
              <div className="flex flex-col gap-1.5 pt-[22px]">
                <input
                  placeholder="Card Number"
                  className="bg-white/5 dark:bg-[#1e2432] border border-black/10 dark:border-white/10 rounded-2xl p-3 text-sm outline-none text-gray-900 dark:text-white shadow-sm focus:border-purple-500/50 transition-colors backdrop-blur-sm"
                  maxLength={fBrand === 'amex' ? 15 : 16}
                  value={fNum}
                  onChange={e => setFNum(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Expiry Date</label>
                <input placeholder="MM / YY" className="bg-white/5 dark:bg-[#131823] border border-black/10 dark:border-white/10 rounded-2xl p-3 text-sm outline-none text-gray-900 dark:text-white shadow-sm focus:border-purple-500/50 transition-colors backdrop-blur-sm" maxLength={5} value={fExp} onChange={e => handleExpChange(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Holder Name</label>
                <input placeholder="Name on Card" className="bg-white/5 dark:bg-[#131823] border border-black/10 dark:border-white/10 rounded-2xl p-3 text-sm outline-none text-gray-900 dark:text-white shadow-sm focus:border-purple-500/50 transition-colors backdrop-blur-sm" value={fName} onChange={e => setFName(e.target.value)} />
              </div>
            </div>

            <button onClick={handleAdd} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black uppercase tracking-widest rounded-[20px] py-4 mt-2 shadow-xl hover:shadow-purple-500/20 hover:brightness-110 active:scale-95 transition-all">Save Card</button>
          </motion.div>
        ) : (
          <LayoutGroup>
            <div className="relative w-full">
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key="backdrop"
                    className="fixed inset-0 z-0 cursor-default bg-black/5 dark:bg-black/20 backdrop-blur-[2px]"
                    onClick={() => { setIsExpanded(false); setSelectedIdx(null); setShowFullDetails(false); }}
                  />
                )}
              </AnimatePresence>

              <div className={`relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isExpanded ? 'h-[480px]' : 'h-[220px]'}`}>
                {(!Array.isArray(cards) || cards.length === 0) && <div className="text-center py-10 bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 rounded-[32px] text-gray-400 dark:text-white/30 text-sm">Your wallet is empty. Add a card to get started.</div>}
                {Array.isArray(cards) && cards.map((card, idx) => {
                  const isSelected = selectedIdx === idx;

                  // Variants for smooth orchestration
                  const translateY = isExpanded ? idx * 85 : (isSelected ? -10 : idx * 12);
                  const scale = isExpanded ? (isSelected ? 1.05 : 1) : (isSelected ? 1.05 : 1 - (cards.length - 1 - idx) * 0.04);
                  const zIndex = isSelected ? 50 : idx;
                  const rotateX = isExpanded ? 0 : (isSelected ? 0 : -5 * (cards.length - 1 - idx));

                  // Fail-safe gradient application
                  const bgClass = card.gradientStart && card.gradientEnd
                    ? `from-${card.gradientStart.replace('from-', '')} to-${card.gradientEnd.replace('to-', '')}`
                    : 'from-gray-700 to-gray-900';

                  return (
                    <motion.div
                      key={card.id}
                      layoutId={`card-${card.id}`}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{
                        y: translateY,
                        opacity: 1,
                        scale,
                        zIndex,
                        rotateX,
                        filter: !isSelected && (isExpanded || selectedIdx !== null) ? 'brightness(0.7) blur(1px)' : 'brightness(1) blur(0px)'
                      }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isExpanded) {
                          setIsExpanded(true);
                          setSelectedIdx(idx);
                        } else {
                          if (isSelected) {
                            setShowFullDetails(!showFullDetails);
                          } else {
                            setSelectedIdx(idx);
                            setShowFullDetails(false);
                          }
                        }
                      }}
                      className={`absolute top-0 left-0 w-full h-[190px] rounded-[32px] bg-[#1a1c22] bg-gradient-to-br ${bgClass} shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-7 flex flex-col justify-between cursor-pointer border border-white/10 preserve-3d group overflow-hidden`}
                      style={{ transformOrigin: 'top center', perspective: '1000px' }}
                    >
                      {/* Glassy Overlay for depth */}
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                      <div className="relative z-10 flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white mb-1">Vault Platinum</span>
                          <span className="text-sm font-black uppercase tracking-[0.3em] text-white underline decoration-white/30 underline-offset-4">{card.brand}</span>
                        </div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center shadow-lg">
                          <CreditCard size={24} className="text-white" />
                        </div>
                      </div>

                      <div className="relative z-10 flex flex-col mt-4">
                        <div className={`text-xl md:text-2xl font-bold transition-all duration-500 tracking-[0.1em] text-white drop-shadow-xl ${showFullDetails && isSelected ? 'scale-105' : ''}`}>
                          {showFullDetails && isSelected
                            ? (card.brand === 'amex' ? `3782 82193 1${card.last4}` : `4532 8812 9903 ${card.last4}`)
                            : `•••• •••• •••• ${card.last4}`}
                        </div>
                        {isSelected && (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mt-2">
                            {showFullDetails ? 'Tap to mask' : 'Tap to reveal details'}
                          </motion.span>
                        )}
                      </div>

                      <div className="relative z-10 flex justify-between items-end text-white mt-auto">
                        <div className="flex flex-col max-w-[180px]">
                          <span className="text-[9px] font-black uppercase opacity-50 tracking-widest mb-1">Card Holder</span>
                          <span className="text-xs font-bold tracking-wider uppercase truncate block">{card.nameOnCard}</span>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-[9px] font-black uppercase opacity-50 tracking-widest mb-1">Expires</span>
                          <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded-lg border border-white/5 backdrop-blur-md">{card.expiry}</span>
                        </div>
                      </div>

                      {isExpanded && isSelected && (
                        <div className="absolute top-6 right-6 flex items-center gap-2">
                          <motion.button
                            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                            onClick={(e) => handleDeleteCard(card.id, e)}
                            className="w-9 h-9 rounded-full bg-rose-500/20 backdrop-blur-xl border border-rose-500/30 flex items-center justify-center hover:bg-rose-500/40 transition-all active:scale-90 shadow-lg"
                            title="Remove Card"
                          >
                            <Trash2 size={14} className="text-rose-100" />
                          </motion.button>
                          <motion.button
                            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); setSelectedIdx(null); setShowFullDetails(false); }}
                            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 shadow-lg"
                          >
                            <X size={16} className="text-white" />
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </LayoutGroup>
        )}
      </AnimatePresence>
    </div>
  );
}

const POPULAR_SUBS = [
  { name: 'Netflix', icon: Tv, color: '#E50914', prices: { USD: 19.99, INR: 199 } },
  { name: 'Spotify', icon: Music, color: '#1DB954', prices: { USD: 10.99, INR: 119 } },
  { name: 'Amazon Prime', icon: Package, color: '#00A8E1', prices: { USD: 14.99, INR: 1499 } },
  { name: 'YouTube Premium', icon: Youtube, color: '#FF0000', prices: { USD: 13.99, INR: 129 } },
  { name: 'Disney+', icon: Sparkles, color: '#113CCF', prices: { USD: 13.99, INR: 299 } },
  { name: 'iCloud+', icon: Cloud, color: '#007AFF', prices: { USD: 2.99, INR: 75 } }
];

export function SubscriptionsList() {
  const { user } = useAuth();
  const { fmt } = useCurrency();
  const [subs, setSubs] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fName, setFName] = useState('');
  const [fCost, setFCost] = useState('');
  const [fCycle, setFCycle] = useState('monthly');
  const [fBillingDay, setFBillingDay] = useState(new Date().getDate().toString());

  useEffect(() => { fetchSubs(); }, []);

  const fetchSubs = async () => {
    try {
      const r: any = await api.get('/subscriptions');
      const data = r.data.data || r.data;
      setSubs(Array.isArray(data) ? data : []);
    } catch (e) {
      setSubs([]);
    }
  };

  const resetForm = () => {
    setFName('');
    setFCost('');
    setFCycle('monthly');
    setFBillingDay(new Date().getDate().toString());
    setAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!fName || !fCost) return;
    const subData = {
      name: fName,
      cost: parseFloat(fCost),
      billingCycle: fCycle,
      billingDay: parseInt(fBillingDay),
      iconLabel: fName[0].toUpperCase()
    };

    try {
      if (editingId) {
        await api.patch(`/subscriptions/${editingId}`, subData);
      } else {
        await api.post('/subscriptions', subData);
      }
      resetForm();
      fetchSubs();
    } catch (e) {
      alert('Failed to save subscription');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      fetchSubs();
    } catch (e) {
      alert('Failed to delete subscription');
    }
  };

  const handleEdit = (sub: any) => {
    setEditingId(sub.id);
    setFName(sub.name);
    setFCost(sub.cost.toString());
    setFCycle(sub.billingCycle);
    setFBillingDay(sub.billingDay.toString());
    setAdding(true);
  };

  const selectPreset = (name: string) => {
    const preset = POPULAR_SUBS.find(p => p.name === name);
    if (!preset) return;
    const isINR = user?.currency === 'INR';
    setFName(preset.name);
    setFCost((isINR ? preset.prices.INR : preset.prices.USD).toString());
    if (preset.name === 'Amazon Prime' && isINR) setFCycle('yearly');
  };

  const getBrandIcon = (name: string) => {
    const preset = POPULAR_SUBS.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (preset) return <preset.icon size={20} />;
    return <CreditCard size={20} />;
  };

  return (
    <div className="flex flex-col gap-4 flex-1 mt-4 md:mt-0 max-h-[480px]">
      <div className="flex items-center justify-between">
        <p className="font-bold text-sm text-gray-900 dark:text-white tracking-widest uppercase opacity-60">Subscriptions</p>
        <button
          onClick={() => { if (adding) resetForm(); else setAdding(true); }}
          className="text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest hover:brightness-125 transition flex items-center gap-1"
        >
          {adding ? 'Cancel' : <><Plus size={12} /> Add</>}
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex flex-col gap-3 mb-2 bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-inner">
            {!editingId && (
              <div className="flex flex-col gap-1.5">
                <Select
                  label="Quick Add"
                  value=""
                  onChange={selectPreset}
                  options={[
                    { value: '', label: 'Select service...' },
                    ...POPULAR_SUBS.map(p => ({ value: p.name, label: p.name }))
                  ]}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              <input placeholder="Name" className="bg-white dark:bg-[#1e2432] border border-black/10 dark:border-white/10 rounded-xl p-2 text-xs outline-none text-gray-900 dark:text-white" value={fName} onChange={e => setFName(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Cost" type="number" className="bg-white dark:bg-[#1e2432] border border-black/10 dark:border-white/10 rounded-xl p-2 text-xs outline-none text-gray-900 dark:text-white" value={fCost} onChange={e => setFCost(e.target.value)} />
                <input type="number" min="1" max="31" className="bg-white dark:bg-[#1e2432] border border-black/10 dark:border-white/10 rounded-xl p-2 text-xs outline-none text-gray-900 dark:text-white" value={fBillingDay} onChange={e => setFBillingDay(e.target.value)} />
              </div>
              <Select
                value={fCycle}
                onChange={setFCycle}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'yearly', label: 'Yearly' },
                ]}
              />
            </div>

            <button
              onClick={handleSave}
              className="bg-purple-600 text-white font-black uppercase tracking-widest rounded-xl py-2 mt-1 shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 text-[10px]"
            >
              {editingId ? <><Check size={12} /> Update</> : <><Plus size={12} /> Add Subscription</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-none max-h-[220px]" data-lenis-prevent>
        {(!Array.isArray(subs) || subs.length === 0) && !adding && <div className="text-gray-400 dark:text-white/20 text-center py-6 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-[10px] italic">No active subscriptions.</div>}
        {Array.isArray(subs) && subs.map((sub, i) => (
          <motion.div
            key={sub.id}
            layout
            className="bg-white dark:bg-white/[0.01] border border-black/[0.03] dark:border-white/[0.03] rounded-2xl p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.03] transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-700 dark:text-white border border-black/5 dark:border-white/5">
                {getBrandIcon(sub.name)}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-1">{sub.name}</span>
                <span className="text-[9px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-tighter">Bills {sub.billingDay}th</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-900 dark:text-white">{fmt(sub.cost)}</span>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleEdit(sub)} className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition"><Edit2 size={10} /></button>
                <button onClick={() => handleDelete(sub.id)} className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition"><Trash2 size={10} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
