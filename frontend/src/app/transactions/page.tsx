'use client';
import AppShell from '@/components/layout/AppShell';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Search, Filter, Upload, ArrowUpCircle, ArrowDownCircle, X, Check } from 'lucide-react';
import { txApi, categoriesApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

import AddExpenseModal from '@/components/dashboard/AddExpenseModal';
import { MonthPicker } from '@/components/ui/DatePicker';

const PAYMENT_LABELS: Record<string, string> = {
  upi: 'UPI', card: 'Card', netbanking: 'Net Banking',
  cash: 'Cash', wallet: 'Wallet', other: 'Other',
};

const fmt = (n: number) => '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories,   setCategories]   = useState<any[]>([]);
  const [meta,         setMeta]         = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editTx,       setEditTx]       = useState<any>(null);
  const [deleteId,     setDeleteId]     = useState<string | null>(null);

  // Filters
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [month,      setMonth]      = useState('');
  const [page,       setPage]       = useState(1);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    categoriesApi.list().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const fetchTx = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15, sortBy: 'date', sortOrder: 'DESC' };
      if (search)     params.search     = search;
      if (typeFilter) params.type       = typeFilter;
      if (catFilter)  params.categoryId = catFilter;
      if (month)      params.month      = month;
      const { data } = await txApi.list(params);
      setTransactions(data.data.items || []);
      setMeta(data.data.meta || { total: 0, page: 1, totalPages: 1 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, catFilter, month]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const handleDelete = async (id: string) => {
    await txApi.remove(id);
    setDeleteId(null);
    fetchTx();
  };

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  const inputStyle: React.CSSProperties = {
    padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)',
    background: '#fff', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
    boxShadow: '6px 6px 16px rgba(0,0,0,0.04)', color: 'var(--text)',
  };

  if (authLoading || !user) return null;

  return (
    <AppShell>
      <div style={{ padding: '8px 24px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <div>
            <h1 style={{ fontSize:'26px', fontWeight:700, letterSpacing:'-0.5px' }}>Transactions</h1>
            <p style={{ fontSize:'13px', color:'var(--text2)', marginTop:'3px' }}>{meta.total} total transactions</p>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
              onClick={() => setShowModal(true)}
              style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 20px', borderRadius:'50px', background:'var(--teal)', color:'#fff', border:'none', fontSize:'13.5px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(15,118,110,0.3)' }}>
              <Plus size={14}/> Add Transaction
            </motion.button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }}
          style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
          {[
            { label:'Total Income',   value: fmt(totalIncome),  color:'var(--teal)',  bg:'#f0fdf9', icon: <ArrowUpCircle size={18} color="#0f766e"/> },
            { label:'Total Expenses', value: fmt(totalExpense), color:'var(--red)',   bg:'#fef2f2', icon: <ArrowDownCircle size={18} color="#ef4444"/> },
            { label:'Net Savings',    value: fmt(totalIncome - totalExpense), color: totalIncome-totalExpense >= 0 ? 'var(--teal)' : 'var(--red)', bg:'#f0fdf9', icon: <Check size={18} color="#0f766e"/> },
          ].map((s) => (
            <div key={s.label} style={{ background:'#fff', borderRadius:'20px', padding:'20px', boxShadow:'6px 6px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:36,height:36,borderRadius:'10px',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center' }}>{s.icon}</div>
                <span style={{ fontSize:'13px', color:'var(--text2)', fontWeight:500 }}>{s.label}</span>
              </div>
              <div style={{ fontSize:'24px', fontWeight:700, color:s.color, letterSpacing:'-0.5px' }}>{s.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.08 }}
          style={{ background:'#fff', borderRadius:'16px', padding:'16px 20px', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)', marginBottom:'16px', display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--bg)', borderRadius:'10px', padding:'8px 14px', flex:1, minWidth:'200px' }}>
            <Search size={14} color="var(--text3)"/>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search merchant or description…"
              style={{ background:'none', border:'none', outline:'none', fontFamily:'inherit', fontSize:'13px', width:'100%', color:'var(--text)' }}/>
            {search && <button onClick={() => setSearch('')} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:0 }}><X size={13}/></button>}
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} style={inputStyle}>
            <option value="">All types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
          <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} style={inputStyle}>
            <option value="">All categories</option>
            {categories.map((c:any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <MonthPicker value={month || undefined} onChange={(v) => { setMonth(v || ''); setPage(1); }}/>
          {(search || typeFilter || catFilter || month) && (
            <button onClick={() => { setSearch(''); setTypeFilter(''); setCatFilter(''); setMonth(''); setPage(1); }}
              style={{ padding:'8px 14px', borderRadius:'10px', background:'var(--red-light)', color:'var(--red)', border:'none', fontSize:'13px', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>
              Clear filters
            </button>
          )}
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
          style={{ background:'#fff', borderRadius:'20px', boxShadow:'6px 6px 16px rgba(0,0,0,0.05)', overflow:'hidden' }}>
          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', gap:'16px', padding:'14px 20px', borderBottom:'1px solid rgba(0,0,0,0.06)', fontSize:'12px', fontWeight:600, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            <span>Description</span><span>Category</span><span>Date</span><span>Payment</span><span style={{textAlign:'right'}}>Amount</span><span style={{textAlign:'center'}}>Actions</span>
          </div>

          {loading ? (
            Array.from({length:8}).map((_,i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', gap:'16px', padding:'16px 20px', borderBottom:'1px solid rgba(0,0,0,0.04)', alignItems:'center' }}>
                {[200,100,80,80,80,60].map((w,j) => <div key={j} className="skeleton" style={{height:16,width:w,borderRadius:6}}/>)}
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div style={{ padding:'60px 20px', textAlign:'center', color:'var(--text3)' }}>
              <ArrowUpCircle size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }}/>
              <p style={{ fontSize:'15px', fontWeight:500 }}>No transactions found</p>
              <p style={{ fontSize:'13px', marginTop:'4px' }}>Add your first transaction to get started</p>
            </div>
          ) : transactions.map((tx, i) => (
            <motion.div key={tx.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i * 0.02 }}
              style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', gap:'16px', padding:'14px 20px', borderBottom:'1px solid rgba(0,0,0,0.04)', alignItems:'center', transition:'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background='#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background='transparent')}>

              {/* Description */}
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:36,height:36,borderRadius:'10px',background:tx.type==='income'?'#f0fdf9':'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'16px' }}>
                  {tx.category?.icon || (tx.type==='income'?'💰':'💸')}
                </div>
                <div>
                  <div style={{ fontSize:'14px',fontWeight:500,color:'var(--text)' }}>{tx.merchant || tx.description || 'Transaction'}</div>
                  {tx.description && tx.merchant && <div style={{ fontSize:'12px',color:'var(--text3)',marginTop:'1px' }}>{tx.description}</div>}
                </div>
              </div>

              {/* Category */}
              <div>
                {tx.category ? (
                  <span style={{ display:'inline-flex',alignItems:'center',gap:'4px',background:tx.type==='income'?'#f0fdf9':'var(--bg)',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:500,color:tx.type==='income'?'var(--teal)':'var(--text2)' }}>
                    {tx.category.name}
                  </span>
                ) : <span style={{ fontSize:'12px',color:'var(--text3)' }}>—</span>}
              </div>

              {/* Date */}
              <div style={{ fontSize:'13px',color:'var(--text2)' }}>
                {new Date(tx.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
              </div>

              {/* Payment */}
              <div style={{ fontSize:'12px',color:'var(--text2)' }}>{PAYMENT_LABELS[tx.paymentMethod] || tx.paymentMethod}</div>

              {/* Amount */}
              <div style={{ textAlign:'right',fontSize:'15px',fontWeight:700,color:tx.type==='income'?'var(--teal)':'var(--text)',fontVariantNumeric:'tabular-nums' }}>
                {tx.type==='income'?'+':'-'}{fmt(Number(tx.amount))}
              </div>

              {/* Actions */}
              <div style={{ display:'flex',gap:'6px',justifyContent:'center' }}>
                <button onClick={() => { setEditTx(tx); setShowModal(true); }}
                  style={{ width:30,height:30,borderRadius:'8px',background:'var(--bg)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',transition:'all 0.15s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='#e0f2fe';(e.currentTarget as HTMLButtonElement).style.color='#0284c7'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='var(--bg)';(e.currentTarget as HTMLButtonElement).style.color='var(--text2)'}}>
                  <Pencil size={13}/>
                </button>
                <button onClick={() => setDeleteId(tx.id)}
                  style={{ width:30,height:30,borderRadius:'8px',background:'var(--bg)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',transition:'all 0.15s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='var(--red-light)';(e.currentTarget as HTMLButtonElement).style.color='var(--red)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='var(--bg)';(e.currentTarget as HTMLButtonElement).style.color='var(--text2)'}}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',borderTop:'1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize:'13px',color:'var(--text2)' }}>
                Showing {((meta.page-1)*15)+1}–{Math.min(meta.page*15,meta.total)} of {meta.total}
              </span>
              <div style={{ display:'flex',gap:'6px' }}>
                {Array.from({length:meta.totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)}
                    style={{ width:32,height:32,borderRadius:'8px',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'13px',fontWeight:p===page?600:400,background:p===page?'var(--teal)':'var(--bg)',color:p===page?'#fff':'var(--text2)',transition:'all 0.15s' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
              style={{ background:'#fff',borderRadius:'20px',padding:'28px',maxWidth:'380px',width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
              <h3 style={{ fontSize:'18px',fontWeight:700,marginBottom:'8px' }}>Delete transaction?</h3>
              <p style={{ fontSize:'14px',color:'var(--text2)',marginBottom:'20px' }}>This action cannot be undone.</p>
              <div style={{ display:'flex',gap:'10px' }}>
                <button onClick={()=>setDeleteId(null)} style={{ flex:1,padding:'10px',borderRadius:'50px',border:'1px solid rgba(0,0,0,0.1)',background:'#fff',fontSize:'14px',cursor:'pointer',fontFamily:'inherit' }}>Cancel</button>
                <button onClick={()=>handleDelete(deleteId)} style={{ flex:1,padding:'10px',borderRadius:'50px',border:'none',background:'var(--red)',color:'#fff',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && <AddExpenseModal onClose={()=>{setShowModal(false);setEditTx(null);}} onSuccess={fetchTx} editData={editTx}/>}
    </AppShell>
  );
}
