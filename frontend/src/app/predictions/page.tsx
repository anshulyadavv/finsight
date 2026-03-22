'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, RefreshCw, Brain, Target, PiggyBank, Wallet } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { predictionsApi, dashboardApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

const fmt  = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const BAR_COLORS = ['#0f766e','#14b8a6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#64748b','#06b6d4'];

export default function PredictionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [prediction,  setPrediction]  = useState<any>(null);
  const [moneyFlow,   setMoneyFlow]   = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, mf] = await Promise.allSettled([
        predictionsApi.get(),
        dashboardApi.moneyFlow(6),
      ]);
      if (p.status  === 'fulfilled') setPrediction(p.value.data.data);
      if (mf.status === 'fulfilled') setMoneyFlow(mf.value.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const savingsRate = prediction && prediction.projectedIncome > 0
    ? ((prediction.projectedSavings / prediction.projectedIncome) * 100).toFixed(1)
    : '0.0';

  const expensePct = prediction && prediction.projectedIncome > 0
    ? Math.min(100, (prediction.projectedExpense / prediction.projectedIncome) * 100)
    : 0;

  if (authLoading || !user) return null;

  return (
    <AppShell>
      <div style={{ padding:'8px 24px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <div>
            <h1 style={{ fontSize:'26px', fontWeight:700, letterSpacing:'-0.5px' }}>Predictions</h1>
            <p style={{ fontSize:'13px', color:'var(--text2)', marginTop:'3px' }}>
              AI forecast for {prediction?.nextMonthLabel || 'next month'} · Method: <span style={{ color:'var(--teal)', fontWeight:600 }}>{prediction?.method?.replace(/_/g,' ') || '—'}</span>
            </p>
          </div>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={handleRefresh}
            style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', borderRadius:'50px', background:'#fff', color:'var(--text)', border:'1px solid rgba(0,0,0,0.08)', fontSize:'13.5px', fontWeight:500, cursor:'pointer', fontFamily:'inherit', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)' }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}/> Recalculate
          </motion.button>
        </motion.div>

        {/* Budget warning banner */}
        {prediction?.budgetWarning && (
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
            style={{ background:'#fef2f2', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'16px', padding:'14px 20px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px' }}>
            <AlertCircle size={20} color="#ef4444"/>
            <div>
              <span style={{ fontSize:'14px', fontWeight:600, color:'var(--red)' }}>Overspending risk detected</span>
              <span style={{ fontSize:'13px', color:'#dc2626', marginLeft:'8px' }}>Projected expenses exceed projected income for {prediction.nextMonthLabel}</span>
            </div>
          </motion.div>
        )}

        {/* Top stat cards */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }}
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'20px' }}>
          {[
            { label:'Projected Income',   value: prediction ? fmt(prediction.projectedIncome)  : '—', icon: <Wallet size={18} color="#0f766e"/>,   bg:'#f0fdf9', color:'var(--teal)' },
            { label:'Projected Expenses', value: prediction ? fmt(prediction.projectedExpense) : '—', icon: <TrendingDown size={18} color="#ef4444"/>, bg:'#fef2f2', color:'var(--red)' },
            { label:'Projected Savings',  value: prediction ? fmt(prediction.projectedSavings) : '—', icon: <PiggyBank size={18} color="#0f766e"/>,  bg:'#f0fdf9', color: prediction?.projectedSavings >= 0 ? 'var(--teal)' : 'var(--red)' },
            { label:'Savings Rate',       value: `${savingsRate}%`,                                    icon: <Target size={18} color="#8b5cf6"/>,     bg:'#f5f3ff', color:'#8b5cf6' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay: 0.05 + i*0.05 }}
              style={{ background:'#fff', borderRadius:'20px', padding:'20px', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                <div style={{ width:36,height:36,borderRadius:'10px',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center' }}>{s.icon}</div>
                <span style={{ fontSize:'12px', color:'var(--text2)', fontWeight:500 }}>{s.label}</span>
              </div>
              {loading ? <div className="skeleton" style={{ height:28, width:'80%' }}/> : (
                <div style={{ fontSize:'24px', fontWeight:700, color:s.color, letterSpacing:'-0.5px' }}>{s.value}</div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Confidence + progress bar */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
          style={{ background:'#fff', borderRadius:'20px', padding:'24px', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)', marginBottom:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <Brain size={20} color="var(--teal)"/>
              <span style={{ fontSize:'16px', fontWeight:700 }}>Expense Budget Utilization</span>
            </div>
            {prediction && (
              <span style={{ fontSize:'13px', color:'var(--text2)' }}>
                Confidence: <span style={{ fontWeight:600, color: Number(prediction.confidenceScore) > 0.75 ? 'var(--teal)' : 'var(--amber)' }}>
                  {(Number(prediction.confidenceScore)*100).toFixed(0)}%
                </span>
              </span>
            )}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'8px' }}>
            <span style={{ fontSize:'13px', color:'var(--text2)', whiteSpace:'nowrap' }}>{fmt(0)}</span>
            <div style={{ flex:1, height:'12px', background:'var(--bg)', borderRadius:'10px', overflow:'hidden' }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${expensePct.toFixed(1)}%` }} transition={{ delay:0.3, duration:0.8, ease:'easeOut' }}
                style={{ height:'100%', background: expensePct > 90 ? 'linear-gradient(90deg,#ef4444,#f87171)' : expensePct > 70 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#0f766e,#14b8a6)', borderRadius:'10px', boxShadow:'0 0 10px rgba(15,118,110,0.3)' }}/>
            </div>
            <span style={{ fontSize:'13px', color:'var(--text2)', whiteSpace:'nowrap' }}>{prediction ? fmt(prediction.projectedIncome) : '—'}</span>
          </div>
          <div style={{ textAlign:'center', fontSize:'13px', color:'var(--text2)' }}>
            <span style={{ fontWeight:600, color: expensePct > 90 ? 'var(--red)' : expensePct > 70 ? 'var(--amber)' : 'var(--teal)' }}>
              {expensePct.toFixed(1)}%
            </span> of projected income will be spent
          </div>
        </motion.div>

        {/* Two column charts */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>

          {/* Category forecast bar chart */}
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.12 }}
            style={{ background:'#fff', borderRadius:'20px', padding:'24px', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'16px' }}>Category Forecast</div>
            {loading ? <div className="skeleton" style={{ height:220 }}/> : !prediction?.categoryForecasts?.length ? (
              <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontSize:'14px' }}>Not enough data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={prediction.categoryForecasts} layout="vertical" margin={{ left:16 }}>
                  <XAxis type="number" tick={{ fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₹${v/1000}k`:`₹${v}`}/>
                  <YAxis type="category" dataKey="category" tick={{ fontSize:12 }} axisLine={false} tickLine={false} width={90}/>
                  <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}/>
                  <Bar dataKey="projectedAmount" radius={[0,6,6,0]}>
                    {prediction.categoryForecasts.map((_:any, i:number) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Historical money flow line chart */}
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.14 }}
            style={{ background:'#fff', borderRadius:'20px', padding:'24px', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'16px' }}>6-Month History</div>
            {loading ? <div className="skeleton" style={{ height:220 }}/> : !moneyFlow.length ? (
              <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontSize:'14px' }}>Not enough data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={moneyFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
                  <XAxis dataKey="label" tick={{ fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₹${v/1000}k`:v}/>
                  <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}/>
                  <Legend iconType="circle" iconSize={8}/>
                  <Line type="monotone" dataKey="income"   stroke="#0f766e" strokeWidth={2.5} dot={{ r:4, fill:'#0f766e' }} name="Income"/>
                  <Line type="monotone" dataKey="expenses" stroke="#22c55e" strokeWidth={2.5} dot={{ r:4, fill:'#22c55e' }} name="Expenses"/>
                  <Line type="monotone" dataKey="net"      stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Net"/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Category detail table */}
        {prediction?.categoryForecasts?.length > 0 && (
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.16 }}
            style={{ background:'#fff', borderRadius:'20px', overflow:'hidden', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(0,0,0,0.06)', fontSize:'16px', fontWeight:700 }}>
              Detailed Category Breakdown
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0', padding:'12px 24px 4px', fontSize:'12px', fontWeight:600, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
              <span>Category</span><span style={{ textAlign:'center' }}>Projected</span><span style={{ textAlign:'right' }}>% of expenses</span>
            </div>
            {prediction.categoryForecasts.map((cf: any, i: number) => {
              const pct = prediction.projectedExpense > 0
                ? ((cf.projectedAmount / prediction.projectedExpense) * 100).toFixed(1)
                : '0.0';
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0', padding:'14px 24px', borderBottom: i < prediction.categoryForecasts.length-1 ? '1px solid rgba(0,0,0,0.04)' : 'none', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:10,height:10,borderRadius:'50%',background:BAR_COLORS[i%BAR_COLORS.length]}}/>
                    <span style={{ fontSize:'14px', fontWeight:500 }}>{cf.category}</span>
                  </div>
                  <div style={{ textAlign:'center', fontSize:'14px', fontWeight:700, color:'var(--text)' }}>{fmt(cf.projectedAmount)}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', justifyContent:'flex-end' }}>
                    <div style={{ flex:1, maxWidth:80, height:6, background:'var(--bg)', borderRadius:'10px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:BAR_COLORS[i%BAR_COLORS.length], borderRadius:'10px' }}/>
                    </div>
                    <span style={{ fontSize:'13px', color:'var(--text2)', minWidth:36, textAlign:'right' }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  );
}
