'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, AlertCircle, RefreshCw, Brain, PiggyBank, Wallet, Target, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { predictionsApi, dashboardApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import AppShell from '@/components/layout/AppShell';

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const COLORS = ['#818cf8','#34d399','#60a5fa','#fbbf24','#fb7185','#a78bfa','#94a3b8','#4ade80'];
const TIP: React.CSSProperties = { borderRadius:12,border:'none',boxShadow:'0 8px 24px rgba(0,0,0,0.5)',background:'var(--surface)',fontSize:12,color:'var(--text)' };

export default function PredictionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [pred,       setPred]       = useState<any>(null);
  const [flow,       setFlow]       = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p,mf] = await Promise.allSettled([predictionsApi.get(), dashboardApi.moneyFlow(6)]);
      if(p.status==='fulfilled')  setPred(p.value.data.data);
      if(mf.status==='fulfilled') setFlow(mf.value.data.data||[]);
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const savingsRate = pred?.projectedIncome>0 ? ((pred.projectedSavings/pred.projectedIncome)*100).toFixed(1) : '0.0';
  const pct         = pred?.projectedIncome>0 ? Math.min(100,(pred.projectedExpense/pred.projectedIncome)*100) : 0;

  if (authLoading||!user) return null;

  return (
    <AppShell>
      <div style={{ padding:'20px 24px 0' }}>
        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px' }}>
          <div>
            <h1 style={{ fontSize:'26px',fontWeight:700,letterSpacing:'-0.5px',color:'var(--text)',margin:0 }}>Predictions</h1>
            <p style={{ fontSize:'13px',color:'var(--text2)',marginTop:'3px' }}>
              AI forecast for {pred?.nextMonthLabel||'next month'} · Method: <span style={{ color:'var(--accent)',fontWeight:600 }}>{pred?.method?.replace(/_/g,' ')||'—'}</span>
            </p>
          </div>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={refresh}
            style={{ display:'flex',alignItems:'center',gap:'7px',padding:'9px 18px',borderRadius:'50px',background:'var(--glass)',color:'var(--text)',border:'1px solid var(--glass-border)',fontSize:'13.5px',fontWeight:500,cursor:'pointer',fontFamily:'inherit' }}>
            <RefreshCw size={13} strokeWidth={2} style={{ animation:refreshing?'spin 1s linear infinite':'none' }}/> Recalculate
          </motion.button>
        </div>

        {/* Budget warning */}
        {pred?.budgetWarning && (
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
            style={{ background:'var(--accent3-dim)',border:'1px solid var(--accent3)',borderRadius:'14px',padding:'13px 18px',marginBottom:'18px',display:'flex',alignItems:'center',gap:'12px' }}>
            <AlertCircle size={18} color="var(--accent3)"/>
            <span style={{ fontSize:'14px',fontWeight:500,color:'var(--accent3)' }}>Overspending risk — Projected expenses exceed income for {pred.nextMonthLabel}</span>
          </motion.div>
        )}

        {/* Stat cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'16px' }}>
          {[
            { label:'Projected Income',   val:pred?fmt(pred.projectedIncome):'—',  icon:<Wallet size={16} color="var(--accent2)"/>,  bg:'var(--accent2-dim)', color:'var(--accent2)' },
            { label:'Projected Expenses', val:pred?fmt(pred.projectedExpense):'—', icon:<TrendingDown size={16} color="var(--accent3)"/>, bg:'var(--accent3-dim)', color:'var(--accent3)' },
            { label:'Projected Savings',  val:pred?fmt(pred.projectedSavings):'—', icon:<PiggyBank size={16} color="var(--accent)"/>,  bg:'var(--accent-dim)',  color: pred?.projectedSavings>=0?'var(--accent2)':'var(--accent3)' },
            { label:'Savings Rate',       val:`${savingsRate}%`,                   icon:<Target size={16} color="var(--accent)"/>,     bg:'var(--accent-dim)',  color:'var(--accent)' },
          ].map((s,i)=>(
            <motion.div key={s.label} initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }} className="glass" style={{ padding:'18px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px' }}>
                <div style={{ width:34,height:34,borderRadius:'9px',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center' }}>{s.icon}</div>
                <span style={{ fontSize:'12px',color:'var(--text2)',fontWeight:500 }}>{s.label}</span>
              </div>
              {loading ? <div className="skeleton" style={{ height:24,width:'70%' }}/> : (
                <div style={{ fontSize:'22px',fontWeight:700,color:s.color,letterSpacing:'-0.5px' }}>{s.val}</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} className="glass" style={{ padding:'22px',marginBottom:'16px' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
              <Brain size={18} color="var(--accent)"/>
              <span style={{ fontSize:'15px',fontWeight:700,color:'var(--text)' }}>Expense Budget Utilization</span>
            </div>
            {pred && (
              <span style={{ fontSize:'13px',color:'var(--text2)' }}>
                Confidence: <span style={{ fontWeight:600,color:Number(pred.confidenceScore)>0.75?'var(--accent2)':'var(--amber)' }}>{(Number(pred.confidenceScore)*100).toFixed(0)}%</span>
              </span>
            )}
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'14px',marginBottom:'8px' }}>
            <span style={{ fontSize:'12px',color:'var(--text3)',whiteSpace:'nowrap' }}>₹0</span>
            <div style={{ flex:1,height:'10px',background:'var(--glass-strong)',borderRadius:'10px',overflow:'hidden' }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${pct.toFixed(1)}%` }} transition={{ delay:0.3,duration:0.9,ease:'easeOut' }}
                style={{ height:'100%',background:pct>90?'linear-gradient(90deg,var(--accent3),#fca5a5)':pct>70?'linear-gradient(90deg,var(--amber),#fde68a)':'linear-gradient(90deg,var(--accent),var(--accent2))',borderRadius:'10px' }}/>
            </div>
            <span style={{ fontSize:'12px',color:'var(--text3)',whiteSpace:'nowrap' }}>{pred?fmt(pred.projectedIncome):'—'}</span>
          </div>
          <div style={{ textAlign:'center',fontSize:'13px',color:'var(--text2)' }}>
            <span style={{ fontWeight:600,color:pct>90?'var(--accent3)':pct>70?'var(--amber)':'var(--accent2)' }}>{pct.toFixed(1)}%</span> of projected income will be spent
          </div>
        </motion.div>

        {/* Charts row */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'16px' }}>
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.12 }} className="glass" style={{ padding:'22px' }}>
            <p style={{ fontSize:'15px',fontWeight:700,color:'var(--text)',marginBottom:'16px' }}>Category Forecast</p>
            {loading ? <div className="skeleton" style={{ height:220 }}/> : !pred?.categoryForecasts?.length ? (
              <div style={{ height:220,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:'14px' }}>Not enough data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pred.categoryForecasts} layout="vertical" margin={{ left:10 }}>
                  <XAxis type="number" tick={{ fontSize:11,fill:'var(--text3)' }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₹${v/1000}k`:`₹${v}`}/>
                  <YAxis type="category" dataKey="category" tick={{ fontSize:12,fill:'var(--text2)' }} axisLine={false} tickLine={false} width={80}/>
                  <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={TIP} cursor={{ fill:'var(--glass-hover)' }}/>
                  <Bar dataKey="projectedAmount" radius={[0,6,6,0]}>
                    {pred.categoryForecasts.map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.14 }} className="glass" style={{ padding:'22px' }}>
            <p style={{ fontSize:'15px',fontWeight:700,color:'var(--text)',marginBottom:'16px' }}>6-Month History</p>
            {loading ? <div className="skeleton" style={{ height:220 }}/> : !flow.length ? (
              <div style={{ height:220,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:'14px' }}>Not enough data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={flow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)"/>
                  <XAxis dataKey="label" tick={{ fontSize:11,fill:'var(--text3)' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11,fill:'var(--text3)' }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₹${v/1000}k`:v}/>
                  <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={TIP} cursor={{ stroke:'var(--glass-border)' }}/>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12,color:'var(--text2)' }}/>
                  <Line type="monotone" dataKey="income"   stroke="var(--accent2)" strokeWidth={2.5} dot={{ r:4,fill:'var(--accent2)' }} name="Income"/>
                  <Line type="monotone" dataKey="expenses" stroke="var(--accent3)" strokeWidth={2.5} dot={{ r:4,fill:'var(--accent3)' }} name="Expenses"/>
                  <Line type="monotone" dataKey="net"      stroke="var(--amber)"   strokeWidth={2} strokeDasharray="5 5" dot={false} name="Net"/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Category table */}
        {pred?.categoryForecasts?.length>0 && (
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.16 }} className="glass-static" style={{ overflow:'hidden',marginBottom:'24px' }}>
            <div style={{ padding:'16px 22px',borderBottom:'1px solid var(--glass-border)',fontSize:'14px',fontWeight:700,color:'var(--text)' }}>Detailed Category Breakdown</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0',padding:'10px 22px 4px',fontSize:'11px',fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.5px' }}>
              <span>Category</span><span style={{ textAlign:'center' }}>Projected</span><span style={{ textAlign:'right' }}>Share</span>
            </div>
            {pred.categoryForecasts.map((cf:any,i:number)=>{
              const pct2=pred.projectedExpense>0?((cf.projectedAmount/pred.projectedExpense)*100).toFixed(1):'0.0';
              return (
                <div key={i} style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0',padding:'12px 22px',borderTop:'1px solid var(--glass-border)',alignItems:'center' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                    <div style={{ width:10,height:10,borderRadius:'50%',background:COLORS[i%COLORS.length]}}/>
                    <span style={{ fontSize:'13.5px',fontWeight:500,color:'var(--text)' }}>{cf.category}</span>
                  </div>
                  <div style={{ textAlign:'center',fontSize:'13.5px',fontWeight:700,color:'var(--text)' }}>{fmt(cf.projectedAmount)}</div>
                  <div style={{ display:'flex',alignItems:'center',gap:'10px',justifyContent:'flex-end' }}>
                    <div style={{ flex:1,maxWidth:70,height:5,background:'var(--glass-strong)',borderRadius:'10px',overflow:'hidden' }}>
                      <div style={{ height:'100%',width:`${pct2}%`,background:COLORS[i%COLORS.length],borderRadius:'10px' }}/>
                    </div>
                    <span style={{ fontSize:'12px',color:'var(--text2)',minWidth:32,textAlign:'right' }}>{pct2}%</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </AppShell>
  );
}
