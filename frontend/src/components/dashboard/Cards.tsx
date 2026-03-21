'use client';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, CreditCard, Building2, Shield, X, CheckCircle } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

const DONUT_COLORS = ['#0f766e','#22c55e','#14b8a6','#f59e0b','#ef4444','#8b5cf6','#64748b','#06b6d4'];

function Skeleton({ h = 20, w = '100%' }: { h?: number; w?: string }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: 8 }} />;
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
      <div className="card-label">Monthly income</div>
      {loading ? <Skeleton h={40} /> : (
        <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-1px', margin: '4px 0 2px', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(summary?.monthlyIncome || 0)}
        </div>
      )}
      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>vs last month</div>
      {!loading && trend && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: trend.direction === 'up' ? 'var(--green-light)' : 'var(--red-light)', color: trend.direction === 'up' ? '#16a34a' : 'var(--red)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, marginTop: '10px' }}>
          {trend.direction === 'up' ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
          {trend.direction === 'up' ? '+' : '-'}{trend.value}% from last month
        </div>
      )}
      <div style={{ marginTop: '16px', height: '80px' }}>
        {sparkData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#0f766e" strokeWidth={2} fill="url(#incomeGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ── Expense Strategy Card ──────────────────────────────────────────────────
export function StrategyCard({ moneyFlow, loading }: any) {
  const data = moneyFlow?.map((m: any) => ({ label: m.label, budget: m.income, actual: m.expenses })) || [];
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} style={card}>
      <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Expense Strategy</div>
      <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text2)' }}><span style={{ width:8,height:8,borderRadius:'50%',background:'#d1d5db',display:'inline-block'}}/>Budget</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--teal)', fontWeight:600 }}><span style={{ width:8,height:8,borderRadius:'50%',background:'var(--teal)',display:'inline-block'}}/>Actual</span>
      </div>
      <div style={{ height: '140px' }}>
        {loading ? <Skeleton h={140}/> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="30%">
              <XAxis dataKey="label" tick={{ fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${v/1000}k`:v}/>
              <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}/>
              <Bar dataKey="budget" fill="#d1d5db" radius={[4,4,0,0]}/>
              <Bar dataKey="actual" fill="#0f766e" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ── Overview Donut Card ────────────────────────────────────────────────────
export function OverviewCard({ overview, summary, loading }: any) {
  const cats = overview?.categories || [];
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={card}>
      <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Overview</div>
      <div style={{ position:'relative', height:'200px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {loading ? <Skeleton h={180} w="180px" /> : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cats} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="amount">
                  {cats.map((_: any, i: number) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
              <div style={{ fontSize:'12px', color:'var(--text2)' }}>Total balance</div>
              <div style={{ fontSize:'20px', fontWeight:700, letterSpacing:'-0.5px' }}>{fmt(summary?.totalBalance || 0)}</div>
            </div>
          </>
        )}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 16px', marginTop:'16px', paddingTop:'16px', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
        {cats.slice(0,4).map((c:any, i:number) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12.5px', color:'var(--text2)' }}>
            <div style={{ width:9,height:9,borderRadius:'50%',background:DONUT_COLORS[i % DONUT_COLORS.length]}}/>
            <span style={{ fontWeight:500, color:'var(--text)' }}>{c.name}</span>
            <span>{c.percentage}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Money Flow Card ────────────────────────────────────────────────────────
export function MoneyFlowCard({ moneyFlow, loading }: any) {
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} style={card}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <div style={{ fontSize:'16px', fontWeight:700 }}>Money Flow</div>
        <div style={{ display:'flex', gap:'16px' }}>
          {[['#0f766e','Income'],['#22c55e','Expenses']].map(([c,l])=>(
            <span key={l} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'var(--text2)' }}>
              <span style={{ width:8,height:8,borderRadius:'50%',background:c,display:'inline-block'}}/>
              {l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ height:'130px' }}>
        {loading ? <Skeleton h={130}/> : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moneyFlow}>
              <defs>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f766e" stopOpacity={0.1}/><stop offset="95%" stopColor="#0f766e" stopOpacity={0}/></linearGradient>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₹${v/1000}k`:v}/>
              <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}/>
              <Area type="monotone" dataKey="income"   stroke="#0f766e" fill="url(#ig)" strokeWidth={2} dot={{r:3,fill:'#0f766e'}}/>
              <Area type="monotone" dataKey="expenses" stroke="#22c55e" fill="url(#eg)" strokeWidth={2} dot={{r:3,fill:'#22c55e'}}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ── My Finances (Bank Card) ────────────────────────────────────────────────
export function FinancesCard({ user }: any) {
  const initials = user?.name?.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2)||'U';
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={{ ...card, padding:'20px' }}>
      <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'14px' }}>My Finances</div>
      <div style={{ background:'linear-gradient(135deg,#0f4c3a,#0f766e 50%,#134e4a)', borderRadius:'16px', padding:'22px', color:'#fff', position:'relative', overflow:'hidden', minHeight:'160px' }}>
        <div style={{ position:'absolute',top:'-40px',right:'-40px',width:'150px',height:'150px',background:'rgba(255,255,255,0.05)',borderRadius:'50%'}}/>
        <div style={{ position:'absolute',bottom:'-50px',left:'-20px',width:'180px',height:'180px',background:'rgba(255,255,255,0.03)',borderRadius:'50%'}}/>
        <div style={{ fontSize:'11px',fontWeight:600,letterSpacing:'0.8px',opacity:0.7,textTransform:'uppercase' }}>Debit Card</div>
        <div style={{ position:'absolute',top:'18px',right:'20px',fontSize:'11px',fontWeight:700,background:'rgba(255,255,255,0.15)',padding:'4px 8px',borderRadius:'6px',lineHeight:1.3,textAlign:'right' }}>Premier<br/>Platinum</div>
        <div style={{ width:'32px',height:'24px',borderRadius:'5px',background:'linear-gradient(135deg,rgba(255,210,80,0.8),rgba(200,160,40,0.7))',margin:'14px 0 12px'}}/>
        <div style={{ fontFamily:'DM Mono,monospace',fontSize:'15px',letterSpacing:'2px',opacity:0.9 }}>**** **** **** 1234</div>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:'14px' }}>
          <div style={{ fontSize:'14px',fontWeight:600 }}>{user?.name || 'User'}</div>
          <div style={{ fontSize:'11px',opacity:0.7 }}>Exp: 12/28</div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Wealth Breakdown ───────────────────────────────────────────────────────
export function WealthCard({ wealth, loading }: any) {
  const accounts = wealth?.accounts || [];
  const icons: any = { upi: CreditCard, card: CreditCard, netbanking: Building2, cash: Shield };
  const colors = ['#f0fdf9','#eff6ff','#fefce8'];

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} style={card}>
      <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'14px' }}>Wealth Breakdown</div>
      {loading ? [1,2,3].map(i=><Skeleton key={i} h={50}/>) : accounts.length === 0 ? (
        <p style={{ color:'var(--text3)', fontSize:'13px', textAlign:'center', padding:'20px 0' }}>No account data yet. Add transactions to see your wealth breakdown.</p>
      ) : accounts.map((a:any, i:number) => {
        const Icon = icons[a.type] || CreditCard;
        return (
          <div key={i} style={{ display:'flex',alignItems:'center',gap:'12px',padding:'12px 0',borderBottom: i < accounts.length-1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
            <div style={{ width:38,height:38,borderRadius:'10px',background:colors[i%colors.length],display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <Icon size={18} color="#0f766e"/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'13px',fontWeight:500 }}>{a.name}</div>
              <div style={{ fontSize:'11.5px',color:'var(--text3)' }}>{a.type}</div>
            </div>
            <div style={{ fontSize:'14px',fontWeight:700,fontVariantNumeric:'tabular-nums' }}>{fmt(a.balance)}</div>
          </div>
        );
      })}
    </motion.div>
  );
}

// ── Insights Card ─────────────────────────────────────────────────────────
export function InsightsCard({ insights, loading, onDismiss }: any) {
  const severityColor: any = { alert:'var(--red)', warning:'var(--amber)', success:'var(--teal)', info:'#3b82f6' };
  const top = insights?.slice(0,4) || [];

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={card}>
      <div style={{ fontSize:'16px',fontWeight:700,marginBottom:'4px' }}>Insights</div>
      {loading ? [1,2,3].map(i=><Skeleton key={i} h={60}/>) : top.length === 0 ? (
        <div style={{ textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:'13px' }}>
          <Lightbulb size={28} style={{ margin:'0 auto 8px',display:'block',opacity:0.4 }}/>
          Add transactions to generate insights
        </div>
      ) : top.map((ins:any) => (
        <div key={ins.id} style={{ display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px',borderRadius:'10px',background:'var(--bg)',marginBottom:'8px',boxShadow:'var(--shadow-inset)' }}>
          <div style={{ width:32,height:32,borderRadius:'9px',background:ins.severity==='alert'?'var(--red-light)':ins.severity==='success'?'var(--teal-light)':'var(--amber-light)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'15px' }}>
            {ins.severity==='alert'?'💸':ins.severity==='success'?'💰':'💡'}
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:'12.5px',fontWeight:600,color:severityColor[ins.severity]||'var(--text)',lineHeight:1.3 }}>{ins.message}</div>
            <div style={{ fontSize:'11px',color:'var(--text3)',marginTop:'2px' }}>{ins.impact} impact</div>
          </div>
          <button onClick={()=>onDismiss(ins.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:'2px',flexShrink:0 }}>
            <X size={13}/>
          </button>
        </div>
      ))}
    </motion.div>
  );
}

// ── Anomaly Alert Card ─────────────────────────────────────────────────────
export function AnomalyCard({ anomalies, loading, onResolve }: any) {
  const top = anomalies?.[0];

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
      style={{ ...card, background:'linear-gradient(135deg,#fffbeb,#fef9f0)', border:'1px solid rgba(245,158,11,0.25)' }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px' }}>
        <div style={{ fontSize:'14px',fontWeight:700 }}>Anomaly Alert</div>
        <div style={{ width:28,height:28,background:'var(--amber-light)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px' }}>⚠️</div>
      </div>
      {loading ? <Skeleton h={60}/> : !top ? (
        <div style={{ display:'flex',alignItems:'center',gap:'8px',color:'var(--teal)',fontSize:'13px' }}>
          <CheckCircle size={16}/> No anomalies detected
        </div>
      ) : (
        <>
          <div style={{ fontSize:'13px',fontWeight:600,color:'var(--amber)',marginBottom:'6px' }}>{top.message}</div>
          <div style={{ fontSize:'12px',color:'var(--text2)',lineHeight:1.5,marginBottom:'12px' }}>
            Anomaly score: {(top.anomalyScore * 100).toFixed(0)}% · {top.type.replace(/_/g,' ')}
          </div>
          <div style={{ display:'flex',gap:'8px' }}>
            <button onClick={()=>onResolve(top.id)} style={{ padding:'6px 14px',borderRadius:'20px',background:'var(--amber-light)',color:'var(--amber)',border:'none',fontSize:'12px',cursor:'pointer',fontWeight:500,fontFamily:'inherit' }}>
              Resolve
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ── Prediction Card ────────────────────────────────────────────────────────
export function PredictionCard({ prediction, loading }: any) {
  const pct = prediction && prediction.projectedIncome > 0
    ? Math.min(100, (prediction.projectedExpense / prediction.projectedIncome) * 100)
    : 73;

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
      style={{ ...card, background:'linear-gradient(135deg,#f0fdf9,#f0fdfa)', border:'1px solid rgba(15,118,110,0.15)' }}>
      <div style={{ fontSize:'14px',fontWeight:700,marginBottom:'4px' }}>Prediction</div>
      <div style={{ fontSize:'12px',color:'var(--text2)' }}>Projected spending — {prediction?.nextMonthLabel || 'Next month'}</div>
      {loading ? <Skeleton h={30} w="60%"/> : (
        <div style={{ fontSize:'18px',fontWeight:700,color:'var(--teal)',margin:'6px 0' }}>
          {fmt(prediction?.projectedExpense || 0)}
        </div>
      )}
      <div style={{ height:'7px',background:'var(--bg2)',borderRadius:'10px',overflow:'hidden',margin:'10px 0 6px' }}>
        <div style={{ height:'100%',width:`${pct.toFixed(1)}%`,background:'linear-gradient(90deg,#0f766e,#14b8a6)',borderRadius:'10px',boxShadow:'0 0 8px rgba(15,118,110,0.3)',transition:'width 0.8s ease' }}/>
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',fontSize:'11px',color:'var(--text3)' }}>
        <span>₹0</span>
        <span style={{ color:'var(--teal)',fontWeight:500 }}>{pct.toFixed(0)}% of income</span>
        <span>{fmt(prediction?.projectedIncome || 0)}</span>
      </div>
      {prediction && (
        <div style={{ marginTop:'12px',padding:'10px',background:'rgba(15,118,110,0.06)',borderRadius:'10px',fontSize:'12px',color:'var(--text2)',lineHeight:1.5 }}>
          Expected savings: <span style={{ color:'var(--teal)',fontWeight:600 }}>{fmt(prediction.projectedSavings)}</span>
          {prediction.budgetWarning && <span style={{ color:'var(--red)',fontWeight:600,display:'block',marginTop:'4px' }}>⚠️ Expenses may exceed income</span>}
        </div>
      )}
    </motion.div>
  );
}
