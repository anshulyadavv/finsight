'use client';
import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { txApi, categoriesApi } from '@/lib/api';

interface Props { onClose: () => void; onSuccess: () => void; }

export default function AddExpenseModal({ onClose, onSuccess }: Props) {
  const [desc,       setDesc]       = useState('');
  const [amount,     setAmount]     = useState('');
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [type,       setType]       = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [payment,    setPayment]    = useState('upi');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    categoriesApi.list().then(r => setCategories(r.data.data || [])).catch(()=>{});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return; }
    setLoading(true); setError('');
    try {
      await txApi.create({ description: desc, amount: parseFloat(amount), date, type, categoryId: categoryId || undefined, paymentMethod: payment });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = { width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid rgba(0,0,0,0.1)', background:'var(--bg)', fontSize:'14px', outline:'none', fontFamily:'inherit', color:'var(--text)' };
  const labelStyle: React.CSSProperties = { fontSize:'13px', fontWeight:500, color:'var(--text2)', display:'block', marginBottom:'6px' };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale:0.95,opacity:0,y:16 }} animate={{ scale:1,opacity:1,y:0 }} exit={{ scale:0.95,opacity:0 }}
          style={{ background:'#fff',borderRadius:'24px',padding:'28px',width:'100%',maxWidth:'480px',boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}
        >
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px' }}>
            <h2 style={{ fontSize:'20px',fontWeight:700 }}>Add Transaction</h2>
            <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text2)',padding:'4px' }}><X size={20}/></button>
          </div>

          {error && <div style={{ background:'var(--red-light)',color:'var(--red)',borderRadius:'10px',padding:'10px 14px',fontSize:'13px',marginBottom:'16px' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
            {/* Type toggle */}
            <div style={{ display:'flex',gap:'8px' }}>
              {['expense','income'].map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  style={{ flex:1,padding:'9px',borderRadius:'10px',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'14px',fontWeight:500,transition:'all 0.2s',
                    background: type===t ? (t==='expense'?'var(--red-light)':'var(--green-light)') : 'var(--bg)',
                    color: type===t ? (t==='expense'?'var(--red)':'#16a34a') : 'var(--text2)',
                  }}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
              <div>
                <label style={labelStyle}>Amount (₹)</label>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" required style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} required style={inputStyle}/>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description / Merchant</label>
              <input type="text" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Swiggy, Uber, Rent" style={inputStyle}/>
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} style={inputStyle}>
                  <option value="">Auto-detect</option>
                  {categories.map((c:any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Payment</label>
                <select value={payment} onChange={e=>setPayment(e.target.value)} style={inputStyle}>
                  {['upi','card','netbanking','cash','wallet','other'].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
              style={{ background:'var(--teal)',color:'#fff',border:'none',borderRadius:'50px',padding:'12px',fontSize:'15px',fontWeight:600,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,marginTop:'4px',fontFamily:'inherit' }}
            >
              {loading ? 'Saving...' : `Add ${type.charAt(0).toUpperCase()+type.slice(1)}`}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
