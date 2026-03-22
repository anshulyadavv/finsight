'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, X, RefreshCw, DollarSign, Zap, ShieldAlert } from 'lucide-react';
import { insightsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  spending_pattern: { label: 'Spending Pattern', icon: TrendingUp,    color: '#3b82f6', bg: '#eff6ff' },
  waste_detection:  { label: 'Waste Detected',   icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' },
  optimization:     { label: 'Optimization',     icon: Zap,           color: '#8b5cf6', bg: '#f5f3ff' },
  saving_tip:       { label: 'Saving Tip',       icon: DollarSign,    color: '#0f766e', bg: '#f0fdf9' },
  budget_warning:   { label: 'Budget Warning',   icon: ShieldAlert,   color: '#ef4444', bg: '#fef2f2' },
  peer_comparison:  { label: 'Peer Comparison',  icon: TrendingDown,  color: '#6b7280', bg: '#f1f5f9' },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  alert:   { label: 'Alert',   color: '#ef4444', bg: '#fef2f2' },
  warning: { label: 'Warning', color: '#f59e0b', bg: '#fef3c7' },
  info:    { label: 'Info',    color: '#3b82f6', bg: '#eff6ff' },
  success: { label: 'Success', color: '#0f766e', bg: '#f0fdf9' },
};

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const router  = useRouter();
  const [insights,    setInsights]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [filterType,  setFilterType]  = useState('all');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data } = await insightsApi.list();
      setInsights(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInsights(); }, []);

  const handleDismiss = async (id: string) => {
    await insightsApi.dismiss(id);
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  };

  const filtered = filterType === 'all' ? insights : insights.filter(i => i.severity === filterType || i.type === filterType);

  const counts = {
    alert:   insights.filter(i => i.severity === 'alert').length,
    warning: insights.filter(i => i.severity === 'warning').length,
    success: insights.filter(i => i.severity === 'success').length,
    info:    insights.filter(i => i.severity === 'info').length,
  };

  if (authLoading || !user) return null;

  return (
    <AppShell>
      <div style={{ padding:'8px 24px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <div>
            <h1 style={{ fontSize:'26px', fontWeight:700, letterSpacing:'-0.5px' }}>Insights</h1>
            <p style={{ fontSize:'13px', color:'var(--text2)', marginTop:'3px' }}>AI-powered analysis of your spending behaviour</p>
          </div>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={handleRefresh}
            style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', borderRadius:'50px', background:'#fff', color:'var(--text)', border:'1px solid rgba(0,0,0,0.08)', fontSize:'13.5px', fontWeight:500, cursor:'pointer', fontFamily:'inherit', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)' }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}/> Refresh
          </motion.button>
        </motion.div>

        {/* Summary badges */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }}
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
          {Object.entries(counts).map(([sev, count]) => {
            const cfg = SEVERITY_CONFIG[sev];
            return (
              <div key={sev} style={{ background:'#fff', borderRadius:'16px', padding:'16px 20px', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)', cursor:'pointer', border: filterType===sev ? `2px solid ${cfg.color}` : '2px solid transparent', transition:'all 0.2s' }}
                onClick={() => setFilterType(filterType === sev ? 'all' : sev)}>
                <div style={{ fontSize:'28px', fontWeight:700, color:cfg.color }}>{count}</div>
                <div style={{ fontSize:'13px', color:'var(--text2)', marginTop:'2px', fontWeight:500 }}>{cfg.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Filter tabs */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.08 }}
          style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
          {[
            { key:'all', label:'All insights' },
            { key:'spending_pattern', label:'Spending' },
            { key:'waste_detection',  label:'Waste' },
            { key:'saving_tip',       label:'Savings' },
            { key:'budget_warning',   label:'Budget' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilterType(f.key)}
              style={{ padding:'7px 16px', borderRadius:'50px', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'13px', fontWeight:500, transition:'all 0.2s',
                background: filterType===f.key ? 'var(--teal)' : '#fff',
                color:      filterType===f.key ? '#fff' : 'var(--text2)',
                boxShadow:  filterType===f.key ? '0 4px 12px rgba(15,118,110,0.3)' : '6px 6px 16px rgba(0,0,0,0.05)',
              }}>
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Insights grid */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px' }}>
            {Array.from({length:6}).map((_,i) => (
              <div key={i} style={{ background:'#fff', borderRadius:'20px', padding:'24px', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)' }}>
                <div className="skeleton" style={{ height:20, width:'60%', marginBottom:12 }}/>
                <div className="skeleton" style={{ height:14, width:'90%', marginBottom:8 }}/>
                <div className="skeleton" style={{ height:14, width:'70%' }}/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ background:'#fff', borderRadius:'20px', padding:'60px 24px', textAlign:'center', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)' }}>
            <Lightbulb size={48} style={{ margin:'0 auto 16px', display:'block', color:'var(--text3)' }}/>
            <h3 style={{ fontSize:'18px', fontWeight:600, marginBottom:'8px' }}>No insights yet</h3>
            <p style={{ fontSize:'14px', color:'var(--text2)' }}>Add more transactions and insights will be generated automatically.</p>
          </motion.div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px' }}>
            <AnimatePresence>
              {filtered.map((ins, i) => {
                const typeCfg = TYPE_CONFIG[ins.type] || TYPE_CONFIG['spending_pattern'];
                const sevCfg  = SEVERITY_CONFIG[ins.severity] || SEVERITY_CONFIG['info'];
                const Icon    = typeCfg.icon;
                return (
                  <motion.div key={ins.id}
                    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ background:'#fff', borderRadius:'20px', padding:'22px', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)', position:'relative', borderLeft:`4px solid ${sevCfg.color}` }}>

                    {/* Dismiss button */}
                    <button onClick={() => handleDismiss(ins.id)}
                      style={{ position:'absolute', top:16, right:16, background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:'4px', borderRadius:'6px' }}>
                      <X size={15}/>
                    </button>

                    {/* Type badge + severity */}
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                      <div style={{ width:36,height:36,borderRadius:'10px',background:typeCfg.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                        <Icon size={17} color={typeCfg.color}/>
                      </div>
                      <div>
                        <span style={{ fontSize:'11px',fontWeight:600,color:typeCfg.color,display:'block' }}>{typeCfg.label}</span>
                        <span style={{ fontSize:'11px',padding:'1px 8px',borderRadius:'20px',background:sevCfg.bg,color:sevCfg.color,fontWeight:600 }}>{sevCfg.label}</span>
                      </div>
                    </div>

                    {/* Message */}
                    <p style={{ fontSize:'14px',fontWeight:500,color:'var(--text)',lineHeight:1.5,marginBottom:'10px',paddingRight:'20px' }}>{ins.message}</p>

                    {/* Meta */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'12px' }}>
                      <span style={{ fontSize:'12px',color:'var(--text3)' }}>
                        {new Date(ins.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                      </span>
                      {ins.impact && (
                        <span style={{ fontSize:'11px',padding:'2px 10px',borderRadius:'20px',fontWeight:600,
                          background: ins.impact==='high'?'#fef2f2':ins.impact==='medium'?'#fef3c7':'#f0fdf9',
                          color: ins.impact==='high'?'var(--red)':ins.impact==='medium'?'var(--amber)':'var(--teal)' }}>
                          {ins.impact} impact
                        </span>
                      )}
                    </div>

                    {/* Data breakdown if available */}
                    {ins.data && ins.data.changePct && (
                      <div style={{ marginTop:'12px',padding:'10px',background:'var(--bg)',borderRadius:'10px',fontSize:'12px',color:'var(--text2)' }}>
                        {ins.data.category && <span style={{ fontWeight:500,color:'var(--text)' }}>{ins.data.category}: </span>}
                        {ins.data.currentSpend && <span>₹{Math.round(Number(ins.data.currentSpend)).toLocaleString('en-IN')} this month</span>}
                        {ins.data.changePct && <span style={{ color: Number(ins.data.changePct) > 0 ? 'var(--red)' : 'var(--teal)', fontWeight:600, marginLeft:6 }}>
                          {Number(ins.data.changePct) > 0 ? '+' : ''}{ins.data.changePct}%
                        </span>}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  );
}
