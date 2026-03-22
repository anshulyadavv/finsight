'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Zap, DollarSign, ShieldAlert, X, RefreshCw } from 'lucide-react';
import { insightsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import AppShell from '@/components/layout/AppShell';

const TYPE_CFG: Record<string,{label:string;icon:any;color:string;bg:string}> = {
  spending_pattern: { label:'Spending',  icon:TrendingUp,   color:'var(--accent)',  bg:'var(--accent-dim)'  },
  waste_detection:  { label:'Waste',     icon:AlertTriangle,color:'var(--amber)',   bg:'var(--amber-dim)'   },
  optimization:     { label:'Optimize', icon:Zap,           color:'var(--accent)',  bg:'var(--accent-dim)'  },
  saving_tip:       { label:'Savings',   icon:DollarSign,   color:'var(--accent2)', bg:'var(--accent2-dim)' },
  budget_warning:   { label:'Budget',    icon:ShieldAlert,  color:'var(--accent3)', bg:'var(--accent3-dim)' },
  peer_comparison:  { label:'Peers',     icon:TrendingDown, color:'var(--text2)',   bg:'var(--glass-strong)' },
};
const SEV_CFG: Record<string,{color:string;bg:string}> = {
  alert:   { color:'var(--accent3)', bg:'var(--accent3-dim)' },
  warning: { color:'var(--amber)',   bg:'var(--amber-dim)'   },
  info:    { color:'var(--accent)',  bg:'var(--accent-dim)'  },
  success: { color:'var(--accent2)', bg:'var(--accent2-dim)' },
};

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const [insights,   setInsights]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState('all');

  const load = async () => {
    setLoading(true);
    try { const { data } = await insightsApi.list(); setInsights(data.data||[]); }
    catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const dismiss = async (id: string) => {
    await insightsApi.dismiss(id);
    setInsights(prev=>prev.filter(i=>i.id!==id));
  };

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = filter==='all' ? insights : insights.filter(i=>i.severity===filter||i.type===filter);
  const counts = { alert:0,warning:0,success:0,info:0 } as Record<string,number>;
  insights.forEach(i=>{ if(counts[i.severity]!==undefined) counts[i.severity]++; });

  if (authLoading||!user) return null;

  return (
    <AppShell>
      <div style={{ padding:'20px 24px 0' }}>
        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px' }}>
          <div>
            <h1 style={{ fontSize:'26px',fontWeight:700,letterSpacing:'-0.5px',color:'var(--text)',margin:0 }}>Insights</h1>
            <p style={{ fontSize:'13px',color:'var(--text2)',marginTop:'3px' }}>AI-powered analysis of your spending behaviour</p>
          </div>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={refresh}
            style={{ display:'flex',alignItems:'center',gap:'7px',padding:'9px 18px',borderRadius:'50px',background:'var(--glass)',color:'var(--text)',border:'1px solid var(--glass-border)',fontSize:'13.5px',fontWeight:500,cursor:'pointer',fontFamily:'inherit' }}>
            <RefreshCw size={13} strokeWidth={2} style={{ animation:refreshing?'spin 1s linear infinite':'none' }}/> Refresh
          </motion.button>
        </div>

        {/* Stat cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'18px' }}>
          {(['alert','warning','success','info'] as const).map(sev=>{
            const cfg=SEV_CFG[sev]; const active=filter===sev;
            return (
              <div key={sev} className="glass" onClick={()=>setFilter(filter===sev?'all':sev)}
                style={{ padding:'16px 18px',cursor:'pointer',border:active?`1px solid ${cfg.color}`:'1px solid var(--glass-border)',transition:'all 0.15s' }}>
                <div style={{ fontSize:'26px',fontWeight:700,color:cfg.color }}>{counts[sev]}</div>
                <div style={{ fontSize:'12.5px',color:'var(--text2)',marginTop:'3px',fontWeight:500,textTransform:'capitalize' }}>{sev}</div>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex',gap:'7px',marginBottom:'16px',flexWrap:'wrap' }}>
          {[{k:'all',l:'All insights'},{k:'spending_pattern',l:'Spending'},{k:'waste_detection',l:'Waste'},{k:'saving_tip',l:'Savings'},{k:'budget_warning',l:'Budget'}].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k)}
              style={{ padding:'7px 16px',borderRadius:'50px',border:'1px solid',fontSize:'13px',fontWeight:500,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s',
                background:filter===f.k?'var(--accent)':'var(--glass)',
                color:filter===f.k?'#fff':'var(--text2)',
                borderColor:filter===f.k?'var(--accent)':'var(--glass-border)' }}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px',marginBottom:'24px' }}>
            {Array.from({length:4}).map((_,i)=>(
              <div key={i} className="glass" style={{ padding:'22px' }}>
                <div className="skeleton" style={{ height:18,width:'50%',marginBottom:12 }}/>
                <div className="skeleton" style={{ height:14,width:'90%',marginBottom:8 }}/>
                <div className="skeleton" style={{ height:14,width:'70%' }}/>
              </div>
            ))}
          </div>
        ) : filtered.length===0 ? (
          <div className="glass" style={{ padding:'60px 24px',textAlign:'center',marginBottom:'24px' }}>
            <Lightbulb size={44} color="var(--text3)" style={{ margin:'0 auto 14px',display:'block' }}/>
            <h3 style={{ fontSize:'17px',fontWeight:600,color:'var(--text2)',marginBottom:'8px' }}>No insights yet</h3>
            <p style={{ fontSize:'14px',color:'var(--text3)' }}>Add more transactions and insights will be generated automatically.</p>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px',marginBottom:'24px' }}>
            <AnimatePresence>
              {filtered.map((ins,i)=>{
                const tc=TYPE_CFG[ins.type]||TYPE_CFG['spending_pattern'];
                const sc=SEV_CFG[ins.severity]||SEV_CFG['info'];
                const Icon=tc.icon;
                return (
                  <motion.div key={ins.id} initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,scale:0.96 }} transition={{ delay:i*0.04 }}
                    className="glass" style={{ padding:'20px',borderLeft:`3px solid ${sc.color}`,position:'relative' }}>
                    <button onClick={()=>dismiss(ins.id)}
                      style={{ position:'absolute',top:14,right:14,background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:'3px',borderRadius:'6px',transition:'color 0.15s' }}
                      onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--text3)')}>
                      <X size={14} strokeWidth={2}/>
                    </button>
                    <div style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px' }}>
                      <div style={{ width:34,height:34,borderRadius:'9px',background:tc.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                        <Icon size={16} color={tc.color} strokeWidth={2}/>
                      </div>
                      <div>
                        <span style={{ fontSize:'10.5px',fontWeight:700,color:tc.color,display:'block',textTransform:'uppercase',letterSpacing:'0.5px' }}>{tc.label}</span>
                        <span style={{ fontSize:'11px',padding:'1px 8px',borderRadius:'20px',background:sc.bg,color:sc.color,fontWeight:600 }}>{ins.severity}</span>
                      </div>
                    </div>
                    <p style={{ fontSize:'13.5px',fontWeight:500,color:'var(--text)',lineHeight:1.5,marginBottom:'10px',paddingRight:'20px' }}>{ins.message}</p>
                    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'10px' }}>
                      <span style={{ fontSize:'11.5px',color:'var(--text3)' }}>{new Date(ins.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                      {ins.impact && (
                        <span style={{ fontSize:'11px',padding:'2px 9px',borderRadius:'20px',fontWeight:600,
                          background:ins.impact==='high'?'var(--accent3-dim)':ins.impact==='medium'?'var(--amber-dim)':'var(--accent2-dim)',
                          color:ins.impact==='high'?'var(--accent3)':ins.impact==='medium'?'var(--amber)':'var(--accent2)' }}>
                          {ins.impact} impact
                        </span>
                      )}
                    </div>
                    {ins.data?.changePct && (
                      <div style={{ marginTop:'10px',padding:'8px 12px',background:'var(--glass)',borderRadius:'8px',fontSize:'12px',color:'var(--text2)' }}>
                        {ins.data.category&&<span style={{ fontWeight:500,color:'var(--text)' }}>{ins.data.category}: </span>}
                        {ins.data.currentSpend&&<span>₹{Math.round(Number(ins.data.currentSpend)).toLocaleString('en-IN')}</span>}
                        {ins.data.changePct&&<span style={{ color:Number(ins.data.changePct)>0?'var(--accent3)':'var(--accent2)',fontWeight:600,marginLeft:6 }}>{Number(ins.data.changePct)>0?'+':''}{ins.data.changePct}%</span>}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </AppShell>
  );
}
