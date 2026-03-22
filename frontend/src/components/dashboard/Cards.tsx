'use client';
import { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, CreditCard,
  Building2, Shield, X, CheckCircle, Plus, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const DONUT_COLORS = ['#2dd4bf','#4ade80','#60a5fa','#fbbf24','#f87171','#a78bfa','#94a3b8','#34d399'];

const G: React.CSSProperties = {
  background: 'var(--glass)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  padding: '22px',
  transition: 'background 0.2s, transform 0.2s',
};

function Sk({ h=18, w='100%' }: { h?: number; w?: string }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: 8 }}/>;
}

const TIP: React.CSSProperties = {
  borderRadius: 12, border: '1px solid var(--glass-border)',
  boxShadow: 'var(--shadow)',
  background: 'var(--surface)', fontSize: 12,
  color: 'var(--text)',
};

// ── Income ───────────────────────────────────────────────────────────────────
export function IncomeCard({ summary, moneyFlow, loading }: any) {
  const sparkData = moneyFlow?.map((m: any) => ({ v: m.income })) || [];
  const trend = summary?.trends?.income;
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={G}
      onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
      onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
      <p style={{ fontSize:'11px',fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'8px' }}>Monthly Income</p>
      {loading ? <Sk h={34} w="60%"/> : (
        <p style={{ fontSize:'28px',fontWeight:700,letterSpacing:'-1px',color:'var(--text)',fontVariantNumeric:'tabular-nums' }}>
          {fmt(summary?.monthlyIncome || 0)}
        </p>
      )}
      <p style={{ fontSize:'12px',color:'var(--text3)',marginTop:'2px' }}>vs last month</p>
      {!loading && trend && (
        <div style={{ display:'inline-flex',alignItems:'center',gap:'5px',background: trend.direction==='up'?'rgba(74,222,128,0.12)':'rgba(248,113,113,0.12)', color: trend.direction==='up'?'#4ade80':'#f87171', borderRadius:'20px',padding:'3px 10px',fontSize:'12px',fontWeight:600,marginTop:'10px' }}>
          {trend.direction==='up' ? <TrendingUp size={11} strokeWidth={2.5}/> : <TrendingDown size={11} strokeWidth={2.5}/>}
          {trend.direction==='up'?'+':'-'}{trend.value}% from last month
        </div>
      )}
      <div style={{ marginTop:'14px',height:'64px' }}>
        {sparkData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2dd4bf" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#2dd4bf" strokeWidth={2} fill="url(#ig)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ── Strategy ──────────────────────────────────────────────────────────────────
export function StrategyCard({ moneyFlow, loading }: any) {
  const data = moneyFlow?.map((m:any) => ({ label:m.label, budget:m.income, actual:m.expenses })) || [];
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} style={G}
      onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
      onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
      <p style={{ fontSize:'15px',fontWeight:700,marginBottom:'10px',color:'var(--text)' }}>Expense Strategy</p>
      <div style={{ display:'flex',gap:'16px',marginBottom:'12px' }}>
        {[['rgba(255,255,255,0.2)','Budget'],['#2dd4bf','Actual']].map(([c,l]) => (
          <span key={l} style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'12px',color: l==='Actual'?'#2dd4bf':'var(--text3)',fontWeight: l==='Actual'?600:400 }}>
            <span style={{ width:8,height:8,borderRadius:'50%',background:c,display:'inline-block' }}/>{l}
          </span>
        ))}
      </div>
      <div style={{ height:'120px' }}>
        {loading ? <Sk h={120}/> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="30%">
              <XAxis dataKey="label" tick={{ fontSize:11,fill:'var(--text3)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11,fill:'var(--text3)' }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${v/1000}k`:v}/>
              <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={TIP} cursor={{ fill:'rgba(255,255,255,0.03)' }}/>
              <Bar dataKey="budget" fill="rgba(255,255,255,0.1)" radius={[4,4,0,0]}/>
              <Bar dataKey="actual" fill="#2dd4bf" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ── Overview Donut ────────────────────────────────────────────────────────────
export function OverviewCard({ overview, summary, loading }: any) {
  const cats = overview?.categories || [];
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={G}
      onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
      onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
      <p style={{ fontSize:'15px',fontWeight:700,marginBottom:'4px',color:'var(--text)' }}>Overview</p>
      <div style={{ position:'relative',height:'200px',display:'flex',alignItems:'center',justifyContent:'center' }}>
        {loading ? <Sk h={180} w="180px"/> : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cats.length ? cats : [{ name:'Empty',amount:1 }]} cx="50%" cy="50%" innerRadius={62} outerRadius={85} paddingAngle={2} dataKey="amount">
                  {(cats.length ? cats : [{}]).map((_:any,i:number) => (
                    <Cell key={i} fill={cats.length ? DONUT_COLORS[i%DONUT_COLORS.length] : 'rgba(255,255,255,0.06)'}/>
                  ))}
                </Pie>
                {cats.length > 0 && <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={TIP}/>}
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center',pointerEvents:'none' }}>
              <p style={{ fontSize:'11px',color:'var(--text3)',marginBottom:'2px' }}>Total balance</p>
              <p style={{ fontSize:'18px',fontWeight:700,letterSpacing:'-0.5px',color:'var(--text)' }}>{fmt(summary?.totalBalance||0)}</p>
            </div>
          </>
        )}
      </div>
      <div style={{ display:'flex',flexWrap:'wrap',gap:'8px 14px',paddingTop:'12px',borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        {cats.slice(0,4).map((c:any,i:number) => (
          <div key={i} style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'12px',color:'var(--text3)' }}>
            <div style={{ width:8,height:8,borderRadius:'50%',background:DONUT_COLORS[i%DONUT_COLORS.length] }}/>
            <span style={{ color:'var(--text)' }}>{c.name}</span> {c.percentage}%
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Money Flow ────────────────────────────────────────────────────────────────
export function MoneyFlowCard({ moneyFlow, loading }: any) {
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} style={G}
      onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
      onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px' }}>
        <p style={{ fontSize:'15px',fontWeight:700,color:'var(--text)' }}>Money Flow</p>
        <div style={{ display:'flex',gap:'14px' }}>
          {[['#2dd4bf','Income'],['#4ade80','Expenses']].map(([c,l]) => (
            <span key={l} style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'12px',color:'var(--text3)' }}>
              <span style={{ width:8,height:8,borderRadius:'50%',background:c,display:'inline-block' }}/>{l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ height:'120px' }}>
        {loading ? <Sk h={120}/> : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moneyFlow}>
              <defs>
                <linearGradient id="ig2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/><stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/></linearGradient>
                <linearGradient id="eg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ade80" stopOpacity={0.15}/><stop offset="95%" stopColor="#4ade80" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize:11,fill:'var(--text3)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11,fill:'var(--text3)' }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₹${v/1000}k`:v}/>
              <Tooltip formatter={(v:any)=>fmt(v)} contentStyle={TIP} cursor={{ stroke:'rgba(255,255,255,0.05)' }}/>
              <Area type="monotone" dataKey="income"   stroke="#2dd4bf" fill="url(#ig2)" strokeWidth={2} dot={{ r:3,fill:'#2dd4bf' }}/>
              <Area type="monotone" dataKey="expenses" stroke="#4ade80" fill="url(#eg2)" strokeWidth={2} dot={{ r:3,fill:'#4ade80' }}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ── Multi-card Wallet ─────────────────────────────────────────────────────────

interface CardData {
  id: string;
  number: string;
  expiry: string;
  name: string;
  type: 'visa' | 'mastercard' | 'rupay' | 'amex';
  color: [string, string];
}

const CARD_GRADIENTS: Record<string, [string,string]> = {
  visa:       ['#0f4c3a','#0f766e'],
  mastercard: ['#1a1a2e','#16213e'],
  rupay:      ['#1e3a5f','#0f2d4e'],
  amex:       ['#2d1b69','#11998e'],
};

function SingleCard({ card, onDelete }: { card: CardData; onDelete: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const masked = `**** **** **** ${card.number.replace(/\s/g,'').slice(-4)}`;

  return (
    <div style={{ perspective:'1000px', height:'164px', position:'relative' }}>
      {/* Delete btn */}
      <button onClick={onDelete}
        style={{ position:'absolute',top:8,right:8,zIndex:10,width:24,height:24,borderRadius:'50%',background:'rgba(248,113,113,0.15)',border:'1px solid rgba(248,113,113,0.3)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#f87171',transition:'all 0.15s' }}
        onMouseEnter={e=>(e.currentTarget.style.background='rgba(248,113,113,0.3)')}
        onMouseLeave={e=>(e.currentTarget.style.background='rgba(248,113,113,0.15)')}>
        <X size={11} strokeWidth={2.5}/>
      </button>

      <div onClick={() => setFlipped(!flipped)}
        style={{ width:'100%',height:'100%',position:'relative',transformStyle:'preserve-3d',transition:'transform 0.55s cubic-bezier(0.4,0,0.2,1)',transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',cursor:'pointer' }}>

        {/* Front */}
        <div style={{ position:'absolute',inset:0,backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',background:`linear-gradient(135deg,${card.color[0]},${card.color[1]})`,borderRadius:'14px',padding:'18px',color:'#fff',overflow:'hidden',zIndex:2 }}>
          <div style={{ position:'absolute',top:'-40px',right:'-40px',width:'130px',height:'130px',background:'rgba(255,255,255,0.04)',borderRadius:'50%' }}/>
          <div style={{ position:'absolute',bottom:'-50px',left:'-20px',width:'160px',height:'160px',background:'rgba(255,255,255,0.03)',borderRadius:'50%' }}/>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px' }}>
            <span style={{ fontSize:'10px',fontWeight:600,letterSpacing:'0.8px',opacity:0.6,textTransform:'uppercase' }}>{card.type.toUpperCase()}</span>
            <span style={{ fontSize:'9px',background:'rgba(255,255,255,0.12)',padding:'3px 8px',borderRadius:'5px',fontWeight:700,letterSpacing:'0.3px' }}>Premier</span>
          </div>
          <div style={{ width:'28px',height:'20px',borderRadius:'4px',background:'linear-gradient(135deg,rgba(255,210,80,0.8),rgba(200,160,40,0.6))',marginBottom:'10px' }}/>
          <div style={{ fontFamily:'DM Mono,monospace',fontSize:'13px',letterSpacing:'2px',opacity:0.9,marginBottom:'10px' }}>{masked}</div>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end' }}>
            <span style={{ fontSize:'12px',fontWeight:600 }}>{card.name}</span>
            <span style={{ fontSize:'10px',opacity:0.6 }}>{card.expiry}</span>
          </div>
          <div style={{ position:'absolute',bottom:8,right:12,fontSize:'9px',opacity:0.3,letterSpacing:'0.5px' }}>tap to flip</div>
        </div>

        {/* Back - CVV strip */}
        <div style={{ position:'absolute',inset:0,backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',background:`linear-gradient(135deg,${card.color[0]},${card.color[1]})`,borderRadius:'14px',overflow:'hidden',zIndex:1 }}>
          <div style={{ background:'rgba(0,0,0,0.4)',height:'38px',margin:'24px 0 16px' }}/>
          <div style={{ padding:'0 16px' }}>
            <div style={{ background:'rgba(255,255,255,0.9)',borderRadius:'6px',height:'32px',display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:'14px',marginBottom:'8px' }}>
              <span style={{ fontFamily:'DM Mono,monospace',fontSize:'14px',color:'#1a1a1a',letterSpacing:'3px' }}>•••</span>
            </div>
            <p style={{ fontSize:'9px',color:'rgba(255,255,255,0.4)',textAlign:'right',letterSpacing:'0.3px' }}>CVV</p>
          </div>
          <div style={{ position:'absolute',bottom:8,right:12,fontSize:'9px',opacity:0.3,letterSpacing:'0.5px',color:'#fff' }}>tap to flip</div>
        </div>
      </div>
    </div>
  );
}

export function FinancesCard({ user }: any) {
  const [cards, setCards]   = useState<CardData[]>([]);
  const [active, setActive] = useState(0);
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ number:'', expiry:'', name: user?.name||'', type:'visa' as const });

  const addCard = () => {
    if (!form.number.replace(/\s/g,'').length) return;
    const newCard: CardData = {
      id: Date.now().toString(),
      number: form.number,
      expiry: form.expiry,
      name:   form.name,
      type:   form.type as 'visa',
      color:  CARD_GRADIENTS[form.type] as [string,string],
    };
    const updated = [...cards, newCard];
    setCards(updated);
    setActive(updated.length - 1);
    setAdding(false);
    setForm({ number:'', expiry:'', name: user?.name||'', type:'visa' });
  };

  const deleteCard = (id: string) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    setActive(Math.min(active, updated.length - 1));
  };

  const inp: React.CSSProperties = { width:'100%', padding:'8px 12px', borderRadius:'9px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.06)', fontSize:'13px', color:'var(--text)', fontFamily:'inherit', outline:'none' };
  const lbl: React.CSSProperties = { fontSize:'11px', fontWeight:600, color:'var(--text3)', display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.4px' };

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={G}
      onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
      onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>

      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px' }}>
        <p style={{ fontSize:'15px',fontWeight:700,color:'var(--text)' }}>My Cards</p>
        <button onClick={() => setAdding(!adding)}
          style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'12px',color:'#2dd4bf',background:'rgba(45,212,191,0.1)',border:'1px solid rgba(45,212,191,0.2)',borderRadius:'20px',padding:'4px 10px',cursor:'pointer',fontFamily:'inherit',fontWeight:500,transition:'all 0.15s' }}
          onMouseEnter={e=>(e.currentTarget.style.background='rgba(45,212,191,0.18)')}
          onMouseLeave={e=>(e.currentTarget.style.background='rgba(45,212,191,0.1)')}>
          {adding ? <X size={12}/> : <Plus size={12}/>}
          {adding ? 'Cancel' : 'Add card'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {adding ? (
          <motion.div key="form" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
            style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
            <div>
              <label style={lbl}>Card number</label>
              <input value={form.number}
                onChange={e => setForm(f => ({ ...f, number: e.target.value.replace(/[^\d]/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19) }))}
                placeholder="1234 5678 9012 3456" style={{ ...inp, fontFamily:'DM Mono,monospace', letterSpacing:'1.5px' }}/>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px' }}>
              <div>
                <label style={lbl}>Expiry</label>
                <input value={form.expiry} onChange={e=>setForm(f=>({...f,expiry:e.target.value}))} placeholder="MM/YY" maxLength={5} style={inp}/>
              </div>
              <div>
                <label style={lbl}>Network</label>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value as 'visa'}))} style={inp}>
                  {['visa','mastercard','rupay','amex'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Name on card</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full name" style={inp}/>
            </div>
            <button onClick={addCard}
              style={{ background:'#2dd4bf',color:'#0d1117',border:'none',borderRadius:'9px',padding:'9px',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'filter 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.filter='brightness(1.1)')}
              onMouseLeave={e=>(e.currentTarget.style.filter='none')}>
              Save card
            </button>
          </motion.div>
        ) : cards.length === 0 ? (
          <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ textAlign:'center',padding:'28px 0',border:'2px dashed rgba(255,255,255,0.08)',borderRadius:'14px' }}>
            <CreditCard size={28} color="rgba(255,255,255,0.15)" style={{ margin:'0 auto 10px',display:'block' }}/>
            <p style={{ fontSize:'13px',color:'var(--text3)',lineHeight:1.5 }}>No cards added yet.<br/>Click "Add card" to get started.</p>
          </motion.div>
        ) : (
          <motion.div key="cards" initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <SingleCard card={cards[active]} onDelete={() => deleteCard(cards[active].id)}/>
            {cards.length > 1 && (
              <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'12px' }}>
                <button onClick={() => setActive(a => Math.max(0,a-1))} disabled={active===0}
                  style={{ width:24,height:24,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.06)',cursor:active===0?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.4)',opacity:active===0?0.3:1 }}>
                  <ChevronLeft size={13}/>
                </button>
                {cards.map((_,i)=>(
                  <button key={i} onClick={()=>setActive(i)}
                    style={{ width:6,height:6,borderRadius:'50%',border:'none',cursor:'pointer',transition:'all 0.2s',
                      background: i===active?'#2dd4bf':'rgba(255,255,255,0.2)',
                      transform: i===active?'scale(1.3)':'scale(1)' }}/>
                ))}
                <button onClick={() => setActive(a => Math.min(cards.length-1,a+1))} disabled={active===cards.length-1}
                  style={{ width:24,height:24,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.06)',cursor:active===cards.length-1?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.4)',opacity:active===cards.length-1?0.3:1 }}>
                  <ChevronRight size={13}/>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Wealth ────────────────────────────────────────────────────────────────────
export function WealthCard({ wealth, loading }: any) {
  const accounts = wealth?.accounts || [];
  const icons: any = { upi: CreditCard, card: CreditCard, netbanking: Building2, cash: Shield };
  const colors = ['rgba(45,212,191,0.15)','rgba(96,165,250,0.15)','rgba(251,191,36,0.15)'];
  const tints  = ['#2dd4bf','#60a5fa','#fbbf24'];

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} style={G}
      onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
      onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
      <p style={{ fontSize:'15px',fontWeight:700,marginBottom:'14px',color:'var(--text)' }}>Wealth Breakdown</p>
      {loading ? [1,2,3].map(i=><Sk key={i} h={46}/>) : accounts.length === 0 ? (
        <p style={{ color:'var(--text3)',fontSize:'13px',textAlign:'center',padding:'16px 0',lineHeight:1.5 }}>Add transactions to see your breakdown.</p>
      ) : accounts.map((a:any,i:number) => {
        const Icon = icons[a.type] || CreditCard;
        return (
          <div key={i} style={{ display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom: i<accounts.length-1?'1px solid rgba(255,255,255,0.05)':'none' }}>
            <div style={{ width:34,height:34,borderRadius:'9px',background:colors[i%colors.length],display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <Icon size={15} strokeWidth={2} color={tints[i%tints.length]}/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:'13px',fontWeight:500,color:'var(--text)',margin:0 }}>{a.name}</p>
              <p style={{ fontSize:'11px',color:'var(--text3)',margin:'1px 0 0',textTransform:'capitalize' }}>{a.type}</p>
            </div>
            <p style={{ fontSize:'14px',fontWeight:700,fontVariantNumeric:'tabular-nums',color:'var(--text)',margin:0 }}>{fmt(a.balance)}</p>
          </div>
        );
      })}
    </motion.div>
  );
}

// ── Insights ──────────────────────────────────────────────────────────────────
export function InsightsCard({ insights, loading, onDismiss }: any) {
  const sevColor: any = { alert:'#f87171',warning:'#fbbf24',success:'#2dd4bf',info:'#60a5fa' };
  const sevBg:    any = { alert:'rgba(248,113,113,0.1)',warning:'rgba(251,191,36,0.1)',success:'rgba(45,212,191,0.1)',info:'rgba(96,165,250,0.1)' };
  const top = insights?.slice(0,4) || [];

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }} style={G}
      onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
      onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
      <p style={{ fontSize:'15px',fontWeight:700,marginBottom:'14px',color:'var(--text)' }}>Insights</p>
      {loading ? [1,2,3].map(i=><Sk key={i} h={54}/>) : top.length === 0 ? (
        <p style={{ color:'var(--text3)',fontSize:'13px',textAlign:'center',padding:'16px 0',lineHeight:1.5 }}>Add transactions to generate insights.</p>
      ) : top.map((ins:any) => (
        <div key={ins.id} style={{ display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px',borderRadius:'10px',background:'rgba(255,255,255,0.03)',marginBottom:'7px',border:'1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width:28,height:28,borderRadius:'8px',background:sevBg[ins.severity]||'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
            <div style={{ width:7,height:7,borderRadius:'50%',background:sevColor[ins.severity]||'var(--text3)' }}/>
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <p style={{ fontSize:'12px',fontWeight:600,color:sevColor[ins.severity]||'var(--text)',lineHeight:1.4,margin:0 }}>{ins.message}</p>
            <p style={{ fontSize:'11px',color:'var(--text3)',marginTop:'2px' }}>{ins.impact} impact</p>
          </div>
          <button onClick={()=>onDismiss(ins.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:'2px',flexShrink:0,transition:'color 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')}
            onMouseLeave={e=>(e.currentTarget.style.color='var(--text3)')}>
            <X size={12} strokeWidth={2}/>
          </button>
        </div>
      ))}
    </motion.div>
  );
}

// ── Anomaly ───────────────────────────────────────────────────────────────────
export function AnomalyCard({ anomalies, loading, onResolve }: any) {
  const top = anomalies?.[0];
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
      style={{ ...G, background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.12)' }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px' }}>
        <p style={{ fontSize:'15px',fontWeight:700,color:'var(--text)',margin:0 }}>Anomaly Alert</p>
        <div style={{ width:28,height:28,background:'rgba(251,191,36,0.12)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <AlertTriangle size={13} strokeWidth={2} color="#fbbf24"/>
        </div>
      </div>
      {loading ? <Sk h={60}/> : !top ? (
        <div style={{ display:'flex',alignItems:'center',gap:'8px',color:'#2dd4bf',fontSize:'13px' }}>
          <CheckCircle size={14} strokeWidth={2}/> No anomalies detected
        </div>
      ) : (
        <>
          <p style={{ fontSize:'13px',fontWeight:600,color:'#fbbf24',marginBottom:'6px' }}>{top.message}</p>
          <p style={{ fontSize:'12px',color:'var(--text3)',lineHeight:1.5,marginBottom:'12px' }}>
            Score: {(top.anomalyScore*100).toFixed(0)}% · {top.type.replace(/_/g,' ')}
          </p>
          <button onClick={()=>onResolve(top.id)}
            style={{ padding:'6px 14px',borderRadius:'20px',background:'rgba(251,191,36,0.12)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.2)',fontSize:'12px',cursor:'pointer',fontWeight:500,fontFamily:'inherit',transition:'background 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(251,191,36,0.2)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(251,191,36,0.12)')}>
            Resolve
          </button>
        </>
      )}
    </motion.div>
  );
}

// ── Prediction ────────────────────────────────────────────────────────────────
export function PredictionCard({ prediction, loading }: any) {
  const pct = prediction?.projectedIncome > 0
    ? Math.min(100,(prediction.projectedExpense/prediction.projectedIncome)*100) : 0;
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
      style={{ ...G, background:'rgba(45,212,191,0.04)', border:'1px solid rgba(45,212,191,0.1)' }}>
      <p style={{ fontSize:'15px',fontWeight:700,color:'var(--text)',marginBottom:'4px' }}>Prediction</p>
      <p style={{ fontSize:'12px',color:'var(--text3)' }}>Projected spend — {prediction?.nextMonthLabel||'Next month'}</p>
      {loading ? <Sk h={28} w="55%"/> : (
        <p style={{ fontSize:'20px',fontWeight:700,color:'#2dd4bf',margin:'6px 0',letterSpacing:'-0.5px' }}>
          {fmt(prediction?.projectedExpense||0)}
        </p>
      )}
      <div style={{ height:'6px',background:'rgba(255,255,255,0.06)',borderRadius:'10px',overflow:'hidden',margin:'10px 0 6px' }}>
        <div style={{ height:'100%',width:`${pct.toFixed(1)}%`,background:'linear-gradient(90deg,#2dd4bf,#4ade80)',borderRadius:'10px',transition:'width 0.8s ease',boxShadow:'0 0 12px rgba(45,212,191,0.4)' }}/>
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',fontSize:'11px',color:'var(--text3)' }}>
        <span>₹0</span>
        <span style={{ color:'#2dd4bf',fontWeight:500 }}>{pct.toFixed(0)}% of income</span>
        <span>{fmt(prediction?.projectedIncome||0)}</span>
      </div>
      {prediction && (
        <div style={{ marginTop:'10px',padding:'10px',background:'rgba(45,212,191,0.06)',borderRadius:'10px',fontSize:'12px',color:'var(--text3)',lineHeight:1.5 }}>
          Expected savings: <span style={{ color:'#2dd4bf',fontWeight:600 }}>{fmt(prediction.projectedSavings)}</span>
          {prediction.budgetWarning && <span style={{ color:'#f87171',fontWeight:600,display:'block',marginTop:'2px' }}>Expenses may exceed income</span>}
        </div>
      )}
    </motion.div>
  );
}
