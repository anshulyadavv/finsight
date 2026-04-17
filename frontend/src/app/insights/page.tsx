'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Zap, DollarSign, ShieldAlert, X, RefreshCw, Layers } from 'lucide-react';
import { insightsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import AppShell from '@/components/layout/AppShell';

const TYPE_CFG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  spending_pattern: { label: 'Spending', icon: TrendingUp, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
  waste_detection: { label: 'Waste', icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  optimization: { label: 'Optimize', icon: Zap, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  saving_tip: { label: 'Savings', icon: DollarSign, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  budget_warning: { label: 'Budget', icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  peer_comparison: { label: 'Peers', icon: TrendingDown, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
};

const SEV_CFG: Record<string, { color: string; bg: string }> = {
  alert: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  warning: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  info: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  success: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
};

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const STALE_PATTERNS = ['Infinity%', 'higher than weekday', 'Excellent! You\'re saving', 'Budget Exceeded:'];
  const isStale = (msg: string) => STALE_PATTERNS.some(p => msg.includes(p));

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await insightsApi.list();
      const raw: any[] = data.data || data || [];
      // Client-side safety net: strip any stale records that slipped through
      setInsights(raw.filter(i => !isStale(i.message)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const dismiss = async (id: string) => {
    await insightsApi.dismiss(id);
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      // Purge old broken records from DB, then reload fresh insights
      await insightsApi.purgeStale().catch(() => {}); // non-blocking if fails
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = filter === 'all' ? insights : insights.filter(i => i.severity === filter || i.type === filter);
  const counts = { alert: 0, warning: 0, success: 0, info: 0 } as Record<string, number>;
  insights.forEach(i => { if (counts[i.severity] !== undefined) counts[i.severity]++; });

  if (authLoading || !user) return null;

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-6 bg-purple-500 rounded-full" />
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Insights</h1>
            </div>
            <p className="text-gray-500 dark:text-ethereal-textMuted font-medium">AI-powered analysis of your spending behavior and financial health</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refresh}
            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-sm shadow-xl shadow-black/10 dark:shadow-white/5 transition-all"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? 'Refreshing...' : 'Regenerate Insights'}
          </motion.button>
        </div>

        {/* Categories / Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {(['alert', 'warning', 'success', 'info'] as const).map(sev => {
            const cfg = SEV_CFG[sev];
            const active = filter === sev;
            return (
              <motion.div
                key={sev}
                onClick={() => setFilter(filter === sev ? 'all' : sev)}
                whileHover={{ y: -4 }}
                className={`p-6 rounded-[32px] cursor-pointer transition-all duration-300 border-2 ${
                  active 
                    ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/10 shadow-lg shadow-purple-500/10' 
                    : 'border-transparent bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="text-3xl font-black mb-1" style={{ color: cfg.color }}>{counts[sev]}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sev}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'all' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-ethereal-textMuted'
            }`}
          >
            All Insights
          </button>
          {[
            { k: 'spending_pattern', l: 'Spending' },
            { k: 'waste_detection', l: 'Waste' },
            { k: 'saving_tip', l: 'Savings' },
            { k: 'budget_warning', l: 'Budget' }
          ].map(f => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === f.k ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-ethereal-textMuted'
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-50 dark:bg-white/5 rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[40px]">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <Lightbulb size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Clear Skies</h3>
            <p className="text-gray-500 dark:text-ethereal-textMuted max-w-xs text-center text-sm">No insights found in this category. We'll update you as soon as our AI detects something interesting.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <AnimatePresence mode="popLayout">
              {filtered.map((ins, i) => {
                const tc = TYPE_CFG[ins.type] || TYPE_CFG['spending_pattern'];
                const sc = SEV_CFG[ins.severity] || SEV_CFG['info'];
                const Icon = tc.icon;
                return (
                  <motion.div
                    key={ins.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    whileHover={{ y: -8, scale: 1.01 }}
                    className="group bg-white dark:bg-[#131823]/80 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[40px] p-8 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] hover:shadow-2xl dark:hover:shadow-[0_20px_60px_-12px_rgba(139,92,246,0.15)] transition-all duration-500 relative overflow-hidden self-start"
                  >
                    {/* Background Decorative Gradient */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    {/* Glass Accent */}
                    <div 
                      className="absolute top-0 left-0 w-2 h-full opacity-60" 
                      style={{ background: sc.color }} 
                    />

                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(ins.id); }}
                      className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>

                    <div className="flex items-start gap-5 mb-6">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" 
                        style={{ backgroundColor: tc.bg, color: tc.color }}
                      >
                        <Icon size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{tc.label}</span>
                          <span 
                            className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider" 
                            style={{ backgroundColor: sc.bg, color: sc.color }}
                          >
                            {ins.severity}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight pr-8">{ins.message}</h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {ins.data?.changePct && (
                        <div className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5">
                           <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                               <Layers size={14} className="text-purple-500" />
                               <span className="text-xs font-bold text-gray-500 dark:text-ethereal-textMuted uppercase">{ins.data.category || 'Weekend vs Weekday'}</span>
                             </div>
                             <span className={`text-sm font-black ${Number(ins.data.changePct) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                               {Number(ins.data.changePct) > 0 ? '+' : ''}{ins.data.changePct}%
                             </span>
                           </div>
                           <div className="w-full h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, Math.abs(Number(ins.data.changePct)))}%` }}
                                className={`h-full rounded-full ${Number(ins.data.changePct) > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                              />
                           </div>
                        </div>
                      )}

                      {ins.data?.suggestion && (
                        <div className="p-4 bg-purple-50/50 dark:bg-purple-500/[0.04] rounded-2xl border border-purple-100 dark:border-purple-500/10">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Lightbulb size={12} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
                              {ins.data.suggestion}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                             <TrendingUp size={14} />
                          </div>
                          <span className="text-xs font-bold text-gray-400 dark:text-ethereal-textMuted">
                            {new Date(ins.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {ins.impact && (
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            ins.impact === 'high' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 
                            ins.impact === 'medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 
                            'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          }`}>
                            {ins.impact} Impact
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppShell>
  );
}
