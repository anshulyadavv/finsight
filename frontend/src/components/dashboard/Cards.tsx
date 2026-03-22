'use client';
import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CreditCard, Building2, Shield, X, CheckCircle, RotateCcw, Plus } from 'lucide-react';

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const DONUT_COLORS = ['#0f766e','#22c55e','#14b8a6','#f59e0b','#ef4444','#8b5cf6','#64748b','#06b6d4'];

function Skeleton({ h = 20, w = '100%' }: { h?: number; w?: string }) {
  return <div className="skeleton" style={{ height:h, width:w, borderRadius:8 }} />;
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: '24px',
  boxShadow: '6px 6px 16px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.85)',
  padding: '24px', transition: 'box-shadow 0.25s, transform 0.25s',
};

// ── Income Card ──────────────────────────────────────────────────────────────
export function IncomeCard({ summary, moneyFlow, loading }: any) {
  const sparkData = moneyFlow?.map((m: any) => ({ v: m.income })) || [];
  const trend = summary?.trends?.income;
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={card}>
      <div style={{ fontSize:'11px', fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Monthly income</div>
      {loading ? <Skeleton h={36} w="70%"/> : (
        <div style={{ fontSize:'30px', fontWeight:700, letterSpacing:'-1px', fontVariantNumeric:'tabular-nums', color:'var(--text)' }}>
          {fmt(summary?.monthlyIncome || 0)}
        </div>
      )}
      <div style={{ fontSize:'12px', color:'var(--text3)', marginTop:'2px' }}>vs last month</div>
      {!loading && trend && (
        <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', background: trend.direction==='up' ? '#dcfce7' : '#fee2e2', color: trend.direction==='up' ? '#16a34a' : '#ef4444', borderRadius:'20px', padding:'3px 10px', fontSize:'12px', fontWeight:600, marginTop:'10px' }}>
          {trend.direction==='up' ? <TrendingUp size={11} strokeWidth={2.5}/> : <TrendingDown size={11} strokeWidth={2.5}/>}
          {trend.direction==='up' ? '+' : '-'}{trend.value}% from last month
        </div>
      )}
      <div style={{ marginTop:'14px', height:'70px' }}>
        {sparkData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#0f766e" strokeWidth={2} fill="url(#ig)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ── Strategy Card ───────────────────────────────────────────────────────────
export function StrategyCard({ moneyFlow, loading }: any) {
  const data = moneyFlow?.map((m: any) => ({ label: m.label, budget: m.income, actual: m.expenses })) || [];
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} style={card}>
      <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'10px', color:'var(--text)' }}>Expense Strategy</div>
      <div style={{ display:'flex', gap:'16px', marginBottom:'14px' }}>
        {[['#d1d5db','Budget'],['var(--teal)','Actual']].map(([c,l]) => (
          <span key={l} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:l==='Actual'?'var(--teal)':'var(--text2)', fontWeight:l==='Actual'?600:400 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }}/>
            {l}
          </span>
        ))}
      </div>
      <div style={{ height:'130px' }}>
        {loading ? <Skeleton h={130}/> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="30%">
              <XAxis dataKey="label" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${v/1000}k`:v}/>
              <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', fontSize:12 }}/>
              <Bar dataKey="budget" fill="#e5e7eb" radius={[4,4,0,0]}/>
              <Bar dataKey="actual" fill="#0f766e" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ── Overview Donut ───────────────────────────────────────────────────────────
export function OverviewCard({ overview, summary, loading }: any) {
  const cats = overview?.categories || [];
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={card}>
      <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'4px', color:'var(--text)' }}>Overview</div>
      <div style={{ position:'relative', height:'200px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {loading ? <Skeleton h={180} w="180px"/> : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cats} cx="50%" cy="50%" innerRadius={65} outerRadius={88} paddingAngle={2} dataKey="amount">
                  {cats.map((_:any, i:number) => <Cell key={i} fill={DONUT_COLORS[i%DONUT_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', fontSize:12 }}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
              <div style={{ fontSize:'11px', color:'var(--text3)' }}>Total balance</div>
              <div style={{ fontSize:'18px', fontWeight:700, letterSpacing:'-0.5px', color:'var(--text)' }}>{fmt(summary?.totalBalance || 0)}</div>
            </div>
          </>
        )}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 16px', paddingTop:'14px', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
        {cats.slice(0,4).map((c:any, i:number) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'var(--text2)' }}>
            <div style={{ width:9, height:9, borderRadius:'50%', background:DONUT_COLORS[i%DONUT_COLORS.length] }}/>
            <span style={{ fontWeight:500, color:'var(--text)' }}>{c.name}</span>
            <span style={{ color:'var(--text3)' }}>{c.percentage}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Money Flow ───────────────────────────────────────────────────────────────
export function MoneyFlowCard({ moneyFlow, loading }: any) {
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} style={card}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <div style={{ fontSize:'15px', fontWeight:700, color:'var(--text)' }}>Money Flow</div>
        <div style={{ display:'flex', gap:'14px' }}>
          {[['#0f766e','Income'],['#22c55e','Expenses']].map(([c,l]) => (
            <span key={l} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'var(--text2)' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }}/>{l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ height:'130px' }}>
        {loading ? <Skeleton h={130}/> : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moneyFlow}>
              <defs>
                <linearGradient id="ig2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f766e" stopOpacity={0.1}/><stop offset="95%" stopColor="#0f766e" stopOpacity={0}/></linearGradient>
                <linearGradient id="eg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₹${v/1000}k`:v}/>
              <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', fontSize:12 }}/>
              <Area type="monotone" dataKey="income"   stroke="#0f766e" fill="url(#ig2)" strokeWidth={2} dot={{ r:3, fill:'#0f766e' }}/>
              <Area type="monotone" dataKey="expenses" stroke="#22c55e" fill="url(#eg2)" strokeWidth={2} dot={{ r:3, fill:'#22c55e' }}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ── Flippable Finance Card ────────────────────────────────────────────────────
export function FinancesCard({ user }: any) {
  const [flipped,    setFlipped]    = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cardName,   setCardName]   = useState(user?.name || '');
  const [saved,      setSaved]      = useState(false);
  const [cardData,   setCardData]   = useState<any>(null);

  const handleSave = () => {
    if (!cardNumber.replace(/\s/g,'').length) return;
    setCardData({ number: cardNumber, expiry, name: cardName });
    setSaved(true);
    setFlipped(false);
  };

  const masked = cardData
    ? `**** **** **** ${cardData.number.replace(/\s/g,'').slice(-4)}`
    : '**** **** **** ****';

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={{ ...card, padding:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <div style={{ fontSize:'15px', fontWeight:700, color:'var(--text)' }}>My Finances</div>
        <button onClick={() => setFlipped(!flipped)}
          style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'var(--teal)', background:'var(--teal-light)', border:'none', borderRadius:'20px', padding:'4px 10px', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>
          {flipped ? <X size={12}/> : <RotateCcw size={12}/>}
          {flipped ? 'Cancel' : saved ? 'Edit card' : 'Add card'}
        </button>
      </div>

      <div style={{ perspective:'1000px' }}>
        <div style={{ position:'relative', height:'160px', transformStyle:'preserve-3d', transition:'transform 0.55s ease', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

          {/* Front */}
          <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', background:'linear-gradient(135deg,#0f4c3a,#0f766e 50%,#134e4a)', borderRadius:'16px', padding:'20px', color:'#fff', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', background:'rgba(255,255,255,0.04)', borderRadius:'50%' }}/>
            <div style={{ position:'absolute', bottom:'-40px', left:'-10px', width:'150px', height:'150px', background:'rgba(255,255,255,0.03)', borderRadius:'50%' }}/>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ fontSize:'10px', fontWeight:600, letterSpacing:'0.8px', opacity:0.6, textTransform:'uppercase' }}>Debit Card</div>
              <div style={{ fontSize:'10px', fontWeight:700, background:'rgba(255,255,255,0.12)', padding:'3px 8px', borderRadius:'5px' }}>Premier Platinum</div>
            </div>
            <div style={{ width:'30px', height:'22px', borderRadius:'4px', background:'linear-gradient(135deg,rgba(255,210,80,0.8),rgba(200,160,40,0.7))', margin:'14px 0 10px' }}/>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:'14px', letterSpacing:'2px', opacity:0.9 }}>{masked}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:'12px' }}>
              <div style={{ fontSize:'13px', fontWeight:600 }}>{cardData?.name || user?.name || 'Cardholder'}</div>
              <div style={{ fontSize:'11px', opacity:0.7 }}>{cardData?.expiry || 'MM/YY'}</div>
            </div>
          </div>

          {/* Back - Add card form */}
          <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:'rotateY(180deg)', background:'#fff', borderRadius:'16px', padding:'18px', border:'1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', fontWeight:600, color:'var(--text3)', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.4px' }}>Card number</label>
                <input
                  value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/[^\d]/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19))}
                  placeholder="1234 5678 9012 3456" maxLength={19}
                  style={{ width:'100%', padding:'7px 10px', borderRadius:'8px', border:'1px solid rgba(0,0,0,0.1)', background:'var(--bg)', fontSize:'13px', fontFamily:'DM Mono,monospace', outline:'none', letterSpacing:'1px' }}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div>
                  <label style={{ fontSize:'11px', fontWeight:600, color:'var(--text3)', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.4px' }}>Expiry</label>
                  <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5}
                    style={{ width:'100%', padding:'7px 10px', borderRadius:'8px', border:'1px solid rgba(0,0,0,0.1)', background:'var(--bg)', fontSize:'13px', outline:'none', fontFamily:'inherit' }}/>
                </div>
                <div>
                  <label style={{ fontSize:'11px', fontWeight:600, color:'var(--text3)', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.4px' }}>Name on card</label>
                  <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Full name"
                    style={{ width:'100%', padding:'7px 10px', borderRadius:'8px', border:'1px solid rgba(0,0,0,0.1)', background:'var(--bg)', fontSize:'13px', outline:'none', fontFamily:'inherit' }}/>
                </div>
              </div>
              <button onClick={handleSave}
                style={{ background:'var(--teal)', color:'#fff', border:'none', borderRadius:'8px', padding:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginTop:'2px' }}>
                Save card
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Wealth Breakdown ─────────────────────────────────────────────────────────
export function WealthCard({ wealth, loading }: any) {
  const accounts = wealth?.accounts || [];
  const icons: any = { upi: CreditCard, card: CreditCard, netbanking: Building2, cash: Shield };
  const bgs = ['#f0fdf9','#eff6ff','#fefce8'];
  const iconColors = ['#0f766e','#3b82f6','#ca8a04'];

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} style={card}>
      <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'14px', color:'var(--text)' }}>Wealth Breakdown</div>
      {loading ? [1,2,3].map(i=><Skeleton key={i} h={48} />) : accounts.length === 0 ? (
        <p style={{ color:'var(--text3)', fontSize:'13px', textAlign:'center', padding:'20px 0', lineHeight:1.5 }}>No account data yet. Add transactions to see your breakdown.</p>
      ) : accounts.map((a:any, i:number) => {
        const Icon = icons[a.type] || CreditCard;
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 0', borderBottom: i<accounts.length-1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
            <div style={{ width:36, height:36, borderRadius:'10px', background:bgs[i%bgs.length], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={16} strokeWidth={2} color={iconColors[i%iconColors.length]}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'13px', fontWeight:500, color:'var(--text)' }}>{a.name}</div>
              <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'1px', textTransform:'capitalize' }}>{a.type}</div>
            </div>
            <div style={{ fontSize:'14px', fontWeight:700, fontVariantNumeric:'tabular-nums', color:'var(--text)' }}>{fmt(a.balance)}</div>
          </div>
        );
      })}
    </motion.div>
  );
}

// ── Insights ─────────────────────────────────────────────────────────────────
export function InsightsCard({ insights, loading, onDismiss }: any) {
  const sevColor: any = { alert:'#ef4444', warning:'#f59e0b', success:'#0f766e', info:'#3b82f6' };
  const sevBg:    any = { alert:'#fef2f2', warning:'#fef3c7', success:'#f0fdf9', info:'#eff6ff' };
  const top = insights?.slice(0,4) || [];

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={card}>
      <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'14px', color:'var(--text)' }}>Insights</div>
      {loading ? [1,2,3].map(i=><Skeleton key={i} h={56}/>) : top.length === 0 ? (
        <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text3)', fontSize:'13px', lineHeight:1.5 }}>
          Add transactions to generate insights
        </div>
      ) : top.map((ins:any) => (
        <div key={ins.id} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'10px', borderRadius:'10px', background:'var(--bg)', marginBottom:'8px' }}>
          <div style={{ width:30, height:30, borderRadius:'8px', background:sevBg[ins.severity]||'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:sevColor[ins.severity]||'#9ca3af' }}/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'12.5px', fontWeight:600, color:sevColor[ins.severity]||'var(--text)', lineHeight:1.4 }}>{ins.message}</div>
            <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px' }}>{ins.impact} impact</div>
          </div>
          <button onClick={()=>onDismiss(ins.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:'2px', flexShrink:0 }}>
            <X size={13} strokeWidth={2}/>
          </button>
        </div>
      ))}
    </motion.div>
  );
}

// ── Anomaly Alert ─────────────────────────────────────────────────────────────
export function AnomalyCard({ anomalies, loading, onResolve }: any) {
  const top = anomalies?.[0];
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
      style={{ ...card, background:'linear-gradient(135deg,#fffbeb,#fef9f0)', border:'1px solid rgba(245,158,11,0.2)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
        <div style={{ fontSize:'15px', fontWeight:700, color:'var(--text)' }}>Anomaly Alert</div>
        <div style={{ width:28, height:28, background:'#fef3c7', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <AlertTriangle size={14} strokeWidth={2} color="#f59e0b"/>
        </div>
      </div>
      {loading ? <Skeleton h={60}/> : !top ? (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'var(--teal)', fontSize:'13px' }}>
          <CheckCircle size={15} strokeWidth={2}/> No anomalies detected
        </div>
      ) : (
        <>
          <div style={{ fontSize:'13px', fontWeight:600, color:'#d97706', marginBottom:'6px' }}>{top.message}</div>
          <div style={{ fontSize:'12px', color:'var(--text2)', lineHeight:1.5, marginBottom:'12px' }}>
            Score: {(top.anomalyScore*100).toFixed(0)}% · {top.type.replace(/_/g,' ')}
          </div>
          <button onClick={()=>onResolve(top.id)}
            style={{ padding:'6px 14px', borderRadius:'20px', background:'#fef3c7', color:'#d97706', border:'none', fontSize:'12px', cursor:'pointer', fontWeight:500, fontFamily:'inherit' }}>
            Resolve
          </button>
        </>
      )}
    </motion.div>
  );
}

// ── Prediction Card ───────────────────────────────────────────────────────────
export function PredictionCard({ prediction, loading }: any) {
  const pct = prediction?.projectedIncome > 0
    ? Math.min(100, (prediction.projectedExpense / prediction.projectedIncome) * 100) : 73;
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
      style={{ ...card, background:'linear-gradient(135deg,#f0fdf9,#f0fdfa)', border:'1px solid rgba(15,118,110,0.12)' }}>
      <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'4px', color:'var(--text)' }}>Prediction</div>
      <div style={{ fontSize:'12px', color:'var(--text2)' }}>Projected spend — {prediction?.nextMonthLabel || 'Next month'}</div>
      {loading ? <Skeleton h={28} w="55%" /> : (
        <div style={{ fontSize:'20px', fontWeight:700, color:'var(--teal)', margin:'6px 0', letterSpacing:'-0.5px' }}>
          {fmt(prediction?.projectedExpense || 0)}
        </div>
      )}
      <div style={{ height:'6px', background:'rgba(15,118,110,0.1)', borderRadius:'10px', overflow:'hidden', margin:'10px 0 6px' }}>
        <div style={{ height:'100%', width:`${pct.toFixed(1)}%`, background:'linear-gradient(90deg,#0f766e,#14b8a6)', borderRadius:'10px', transition:'width 0.8s ease' }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'var(--text3)' }}>
        <span>₹0</span>
        <span style={{ color:'var(--teal)', fontWeight:500 }}>{pct.toFixed(0)}% of income</span>
        <span>{fmt(prediction?.projectedIncome || 0)}</span>
      </div>
      {prediction && (
        <div style={{ marginTop:'10px', padding:'10px', background:'rgba(15,118,110,0.06)', borderRadius:'10px', fontSize:'12px', color:'var(--text2)', lineHeight:1.5 }}>
          Expected savings: <span style={{ color:'var(--teal)', fontWeight:600 }}>{fmt(prediction.projectedSavings)}</span>
          {prediction.budgetWarning && <span style={{ color:'#ef4444', fontWeight:600, display:'block', marginTop:'2px' }}>Expenses may exceed income</span>}
        </div>
      )}
    </motion.div>
  );
}
