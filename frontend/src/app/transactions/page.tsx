'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Search, ArrowUpCircle, ArrowDownCircle, X, TrendingUp } from 'lucide-react';
import { txApi, categoriesApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import AppShell from '@/components/layout/AppShell';
import AddExpenseModal from '@/components/dashboard/AddExpenseModal';
import { MonthPicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';

const PAY: Record<string,string> = { upi:'UPI',card:'Card',netbanking:'Net Banking',cash:'Cash',wallet:'Wallet',other:'Other' };
const fmt = (n: number) => '₹' + Math.abs(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [txs,        setTxs]        = useState<any[]>([]);
  const [cats,       setCats]       = useState<any[]>([]);
  const [meta,       setMeta]       = useState({ total:0,page:1,totalPages:1 });
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editTx,     setEditTx]     = useState<any>(null);
  const [deleteId,   setDeleteId]   = useState<string|null>(null);
  const [search,     setSearch]     = useState('');
  const [typeFilt,   setTypeFilt]   = useState('');
  const [catFilt,    setCatFilt]    = useState('');
  const [month,      setMonth]      = useState<string|undefined>(new Date().toISOString().slice(0, 7));
  const [page,       setPage]       = useState(1);
  const [summary,    setSummary]    = useState({ income: 0, expense: 0 });

  useEffect(() => { categoriesApi.list().then(r=>setCats(r.data.data||[])).catch(()=>{}); }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p: any = { page,limit:15,sortBy:'date',sortOrder:'DESC' };
      if (search)   p.search     = search;
      if (typeFilt) p.type       = typeFilt;
      if (catFilt)  p.categoryId = catFilt;
      if (month)    p.month      = month;
      const { data } = await txApi.list(p);
      setTxs(data.data.items||[]);
      setMeta(data.data.meta||{total:0,page:1,totalPages:1});
      setSummary(data.data.summary || { income: 0, expense: 0 });
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, [page,search,typeFilt,catFilt,month]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => { await txApi.remove(id); setDeleteId(null); fetch(); };

  const income  = summary.income;
  const expense = summary.expense;


  if (authLoading||!user) return null;

  return (
    <AppShell>
      <div style={{ padding:'20px 24px 0' }}>
        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px' }}>
          <div>
            <h1 style={{ fontSize:'26px',fontWeight:700,letterSpacing:'-0.5px',color:'var(--text)',margin:0 }}>Transactions</h1>
            <p style={{ fontSize:'13px',color:'var(--text2)',marginTop:'3px' }}>{meta.total} total transactions</p>
          </div>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={()=>setShowModal(true)}
            style={{ display:'flex',alignItems:'center',gap:'7px',padding:'9px 20px',borderRadius:'50px',background:'var(--accent)',color:'#fff',border:'none',fontSize:'13.5px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px var(--accent-dim)' }}>
            <Plus size={14} strokeWidth={2.5}/> Add Transaction
          </motion.button>
        </div>

        {/* Summary cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'16px' }}>
          {[
            { label: month ? 'Monthly Income' : 'Total Income',   val:fmt(income),          color:'var(--accent2)',  bg:'var(--accent2-dim)', icon:<ArrowUpCircle size={17} color="var(--accent2)"/> },
            { label: month ? 'Monthly Expenses' : 'Total Expenses', val:fmt(expense),         color:'var(--accent3)',  bg:'var(--accent3-dim)', icon:<ArrowDownCircle size={17} color="var(--accent3)"/> },
            { label: month ? 'Monthly Savings' : 'Net Savings',    val:fmt(income-expense),  color: income-expense>=0?'var(--accent2)':'var(--accent3)', bg:'var(--accent2-dim)', icon:<TrendingUp size={17} color="var(--accent2)"/> },
          ].map(s=>(
            <div key={s.label} className="glass" style={{ padding:'18px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px' }}>
                <div style={{ width:34,height:34,borderRadius:'9px',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center' }}>{s.icon}</div>
                <span style={{ fontSize:'13px',color:'var(--text2)',fontWeight:500 }}>{s.label}</span>
              </div>
              <div style={{ fontSize:'22px',fontWeight:700,color:s.color,letterSpacing:'-0.5px' }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-static" style={{ padding:'14px 16px',marginBottom:'14px',display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center',position:'relative',zIndex:20 }}>
          <div style={{ 
            display:'flex',
            alignItems:'center',
            gap:'12px',
            background:'var(--glass)',
            border:'1px solid var(--glass-border)',
            borderRadius:'50px',
            padding:'10px 18px',
            flex:1,
            minWidth:'240px',
            transition:'all 0.2s ease',
          }}
          className="focus-within:border-accent focus-within:bg-glass-hover focus-within:shadow-sm"
          >
            <Search size={16} className="text-gray-400 dark:text-gray-500" />
            <input 
              value={search} 
              onChange={e=>{setSearch(e.target.value);setPage(1);}} 
              placeholder="Search merchant or description…"
              style={{ 
                background:'none',
                border:'none',
                outline:'none',
                fontFamily:'inherit',
                fontSize:'15px',
                lineHeight:'1.2',
                color:'var(--text)',
                width:'100%',
                height:'24px',
                padding:0,
                boxShadow:'none',
                appearance:'none'
              }}
            />
            {search && (
              <button 
                onClick={()=>setSearch('')} 
                className="hover:text-accent transition-colors"
                style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:0, display:'flex', alignItems:'center' }}
              >
                <X size={16}/>
              </button>
            )}
          </div>
          <Select value={typeFilt} onChange={v=>{setTypeFilt(v);setPage(1);}}
            options={[{value:'',label:'All types'},{value:'expense',label:'Expense'},{value:'income',label:'Income'},{value:'transfer',label:'Transfer'}]}/>
          <Select value={catFilt} onChange={v=>{setCatFilt(v);setPage(1);}}
            options={[{value:'',label:'All categories'},...cats.map((c:any)=>({value:c.id,label:c.name}))]}/>
          <MonthPicker value={month} onChange={v=>{setMonth(v);setPage(1);}}/>
          
          <button 
            onClick={() => { setMonth(month ? undefined : new Date().toISOString().slice(0, 7)); setPage(1); }}
            style={{ 
              padding:'8px 14px', 
              borderRadius:'10px', 
              background: !month ? 'var(--accent)' : 'var(--glass)', 
              color: !month ? '#fff' : 'var(--text2)', 
              border:'1px solid var(--glass-border)', 
              fontSize:'13px', 
              cursor:'pointer', 
              fontFamily:'inherit', 
              fontWeight:600,
              transition: 'all 0.2s'
            }}
          >
            {!month ? 'Viewing All Time' : 'Show All Time'}
          </button>

          {(search||typeFilt||catFilt||(month !== new Date().toISOString().slice(0, 7))) && (
            <button onClick={()=>{setSearch('');setTypeFilt('');setCatFilt('');setMonth(new Date().toISOString().slice(0, 7));setPage(1);}}
              style={{ padding:'8px 14px',borderRadius:'10px',background:'var(--accent3-dim)',color:'var(--accent3)',border:'1px solid var(--accent3-dim)',fontSize:'13px',cursor:'pointer',fontFamily:'inherit',fontWeight:500 }}>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="glass-static" style={{ marginBottom:'24px',overflow:'visible' }}>
          <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px',gap:'16px',padding:'12px 20px',borderBottom:'1px solid var(--glass-border)',fontSize:'11px',fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.5px',position:'sticky',top:0,background:'var(--glass)',backdropFilter:'blur(12px)',borderRadius:'18px 18px 0 0',zIndex:5 }}>
            <span>Description</span><span>Category</span><span>Date</span><span>Payment</span><span style={{textAlign:'right'}}>Amount</span><span style={{textAlign:'center'}}>Actions</span>
          </div>

          {loading ? (
            Array.from({length:6}).map((_,i)=>(
              <div key={i} style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px',gap:'16px',padding:'14px 20px',borderBottom:'1px solid var(--glass-border)',alignItems:'center' }}>
                {[200,100,80,80,80,60].map((w,j)=><div key={j} className="skeleton" style={{height:14,width:w}}/>)}
              </div>
            ))
          ) : txs.length===0 ? (
            <div style={{ padding:'60px 20px',textAlign:'center',color:'var(--text3)' }}>
              <ArrowUpCircle size={36} style={{ margin:'0 auto 12px',display:'block',opacity:0.3 }}/>
              <p style={{ fontSize:'15px',fontWeight:500,color:'var(--text2)',margin:0 }}>No transactions found</p>
              <p style={{ fontSize:'13px',marginTop:'4px' }}>Add your first transaction to get started</p>
            </div>
          ) : txs.map((tx,i)=>(
            <div key={tx.id} style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px',gap:'16px',padding:'13px 20px',borderBottom:'1px solid var(--glass-border)',alignItems:'center',transition:'background 0.15s',cursor:'default' }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                <div style={{ width:34,height:34,borderRadius:'9px',background:tx.type==='income'?'var(--accent2-dim)':'var(--accent3-dim)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'14px' }}>
                  {tx.type==='income' ? <ArrowUpCircle size={15} color="var(--accent2)"/> : <ArrowDownCircle size={15} color="var(--accent3)"/>}
                </div>
                <div>
                  <div style={{ fontSize:'13.5px',fontWeight:500,color:'var(--text)' }}>{tx.merchant||tx.description||'Transaction'}</div>
                  {tx.description&&tx.merchant&&<div style={{ fontSize:'11.5px',color:'var(--text3)',marginTop:'1px' }}>{tx.description}</div>}
                </div>
              </div>
              <div>
                {tx.category ? (
                  <span style={{ display:'inline-flex',alignItems:'center',gap:'4px',background:'var(--glass-strong)',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:500,color:'var(--text2)' }}>
                    {tx.category.name}
                  </span>
                ) : <span style={{ fontSize:'12px',color:'var(--text3)' }}>—</span>}
              </div>
              <div style={{ fontSize:'13px',color:'var(--text2)' }}>{new Date(tx.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
              <div style={{ fontSize:'12px',color:'var(--text2)' }}>{PAY[tx.paymentMethod]||tx.paymentMethod}</div>
              <div style={{ textAlign:'right',fontSize:'14px',fontWeight:700,color:tx.type==='income'?'var(--accent2)':'var(--accent3)',fontVariantNumeric:'tabular-nums' }}>
                {tx.type==='income'?'+':'-'}{fmt(Number(tx.amount))}
              </div>
              <div style={{ display:'flex',gap:'6px',justifyContent:'center' }}>
                {[
                  { icon:Pencil,  fn:()=>{setEditTx(tx);setShowModal(true);}, hc:'var(--accent)', hb:'var(--accent-dim)' },
                  { icon:Trash2,  fn:()=>setDeleteId(tx.id), hc:'var(--accent3)', hb:'var(--accent3-dim)' },
                ].map(({icon:Icon,fn,hc,hb},k)=>(
                  <button key={k} onClick={fn}
                    style={{ width:30,height:30,borderRadius:'8px',background:'var(--glass)',border:'1px solid var(--glass-border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background=hb;e.currentTarget.style.color=hc;(e.currentTarget.style as any).borderColor=hb;}}
                    onMouseLeave={e=>{e.currentTarget.style.background='var(--glass)';e.currentTarget.style.color='var(--text3)';e.currentTarget.style.borderColor='var(--glass-border)';}}>
                    <Icon size={13}/>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {meta.totalPages>1 && (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderTop:'1px solid var(--glass-border)' }}>
              <span style={{ fontSize:'13px',color:'var(--text2)' }}>Showing {((meta.page-1)*15)+1}–{Math.min(meta.page*15,meta.total)} of {meta.total}</span>
              <div style={{ display:'flex',gap:'5px' }}>
                {Array.from({length:meta.totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)}
                    style={{ width:30,height:30,borderRadius:'8px',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'13px',fontWeight:p===page?600:400,background:p===page?'var(--accent)':'var(--glass)',color:p===page?'#fff':'var(--text2)',transition:'all 0.15s' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)' }}>
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
              style={{ background:'var(--surface)',border:'1px solid var(--glass-border)',borderRadius:'20px',padding:'28px',maxWidth:'380px',width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
              <h3 style={{ fontSize:'17px',fontWeight:700,marginBottom:'8px',color:'var(--text)' }}>Delete transaction?</h3>
              <p style={{ fontSize:'14px',color:'var(--text2)',marginBottom:'20px' }}>This action cannot be undone.</p>
              <div style={{ display:'flex',gap:'10px' }}>
                <button onClick={()=>setDeleteId(null)} style={{ flex:1,padding:'10px',borderRadius:'50px',border:'1px solid var(--glass-border)',background:'var(--glass)',fontSize:'14px',cursor:'pointer',fontFamily:'inherit',color:'var(--text)' }}>Cancel</button>
                <button onClick={()=>handleDelete(deleteId)} style={{ flex:1,padding:'10px',borderRadius:'50px',border:'none',background:'var(--accent3)',color:'#fff',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && <AddExpenseModal onClose={()=>{setShowModal(false);setEditTx(null);}} onSuccess={fetch} editData={editTx}/>}
    </AppShell>
  );
}
