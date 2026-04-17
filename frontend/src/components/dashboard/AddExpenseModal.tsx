'use client';
import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { txApi, categoriesApi } from '@/lib/api';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';

interface Props { onClose: () => void; onSuccess: () => void; editData?: any; }

const PAYMENT_OPTIONS = [
  { value:'upi',        label:'UPI' },
  { value:'card',       label:'Card' },
  { value:'netbanking', label:'Net Banking' },
  { value:'cash',       label:'Cash' },
  { value:'wallet',     label:'Wallet' },
  { value:'other',      label:'Other' },
];

export default function AddExpenseModal({ onClose, onSuccess, editData }: Props) {
  const [desc,       setDesc]       = useState(editData?.description||editData?.merchant||'');
  const [amount,     setAmount]     = useState(editData?.amount?.toString()||'');
  const [date,       setDate]       = useState(editData?.date?editData.date.split('T')[0]:new Date().toISOString().split('T')[0]);
  const [type,       setType]       = useState(editData?.type||'expense');
  const [categoryId, setCategoryId] = useState(editData?.categoryId||'');
  const [payment,    setPayment]    = useState(editData?.paymentMethod||'upi');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    categoriesApi.list().then(r => setCategories(r.data.data||[])).catch(()=>{});
  }, []);

  const catOptions = [
    { value:'', label:'Auto-detect' },
    ...categories.map((c:any) => ({ value: c.id, label: c.name })),
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount||parseFloat(amount)<=0) { setError('Enter a valid amount'); return; }
    setLoading(true); setError('');
    try {
      const payload = { description:desc, merchant:desc, amount:parseFloat(amount), date, type, categoryId:categoryId||undefined, paymentMethod:payment };
      editData?.id ? await txApi.update(editData.id,payload) : await txApi.create(payload);
      onSuccess(); onClose();
    } catch(err:any) {
      setError(err.response?.data?.message||'Failed to save transaction');
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width:'100%', padding:'10px 14px', borderRadius:'10px',
    border:'1px solid var(--glass-border)', background:'var(--glass)',
    fontSize:'14px', color:'var(--text)', fontFamily:'inherit', outline:'none',
    transition:'border-color 0.15s, background 0.15s',
  };
  const lbl: React.CSSProperties = { fontSize:'13px', fontWeight:500, color:'var(--text2)', display:'block', marginBottom:'6px' };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        style={{ 
          position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:100, 
          display:'flex', justifyContent:'center', alignItems:'flex-start', 
          padding:'40px 24px', overflowY:'auto', 
          backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' 
        }}
        onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
        <motion.div
          initial={{ scale:0.96, opacity:0, y:16 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.96, opacity:0 }}
          transition={{ duration:0.2, ease:'easeOut' }}
          style={{ 
            background:'var(--surface)', border:'1px solid var(--glass-border)', 
            borderRadius:'24px', padding:'28px', width:'100%', maxWidth:'480px', 
            boxShadow:'var(--shadow)', backdropFilter:'blur(24px)', 
            WebkitBackdropFilter:'blur(24px)', marginBottom: '40px'
          }}>

          {/* Header */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'22px' }}>
            <div>
              <h2 style={{ fontSize:'19px',fontWeight:700,color:'var(--text)',margin:0 }}>{editData?'Edit Transaction':'Add Transaction'}</h2>
              <p style={{ fontSize:'13px',color:'var(--text2)',marginTop:'2px',margin:'2px 0 0' }}>Fill in the details below</p>
            </div>
            <button onClick={onClose}
              style={{ width:32,height:32,borderRadius:'50%',background:'var(--glass)',border:'1px solid var(--glass-border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',transition:'all 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
              onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
              <X size={15} strokeWidth={2}/>
            </button>
          </div>

          {error && (
            <div style={{ background:'var(--accent3-dim)',color:'var(--accent3)',borderRadius:'10px',padding:'10px 14px',fontSize:'13px',marginBottom:'16px',border:'1px solid var(--accent3-dim)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
            {/* Type toggle */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',background:'var(--surface2)',padding:'4px',borderRadius:'12px',border:'1px solid var(--glass-border)' }}>
              {(['expense','income'] as const).map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  style={{
                    padding:'9px', borderRadius:'9px', border:'none', cursor:'pointer',
                    fontFamily:'inherit', fontSize:'13.5px', fontWeight:600, transition:'all 0.15s',
                    background: type===t ? (t==='expense' ? 'var(--accent3-dim)' : 'var(--accent2-dim)') : 'transparent',
                    color: type===t ? (t==='expense' ? 'var(--accent3)' : 'var(--accent2)') : 'var(--text2)',
                    boxShadow: type===t ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  }}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div>
              <label style={lbl}>Amount (₹)</label>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
                placeholder="0.00" min="0.01" step="0.01" required style={inp}
                onFocus={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='var(--bg)';}}
                onBlur={e=>{e.currentTarget.style.borderColor='var(--glass-border)';e.currentTarget.style.background='var(--glass)';}}/>
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>Description / Merchant</label>
              <input type="text" value={desc} onChange={e=>setDesc(e.target.value)}
                placeholder="e.g. Swiggy, Uber, Rent" style={inp}
                onFocus={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='var(--bg)';}}
                onBlur={e=>{e.currentTarget.style.borderColor='var(--glass-border)';e.currentTarget.style.background='var(--glass)';}}/>
            </div>

            {/* Date */}
            <div style={{ position:'relative', zIndex:10 }}>
              <DatePicker value={date} onChange={setDate} label="Date"/>
            </div>

            {/* Category + Payment */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
              <Select value={categoryId} onChange={setCategoryId} options={catOptions} label="Category"/>
              <Select value={payment} onChange={setPayment} options={PAYMENT_OPTIONS} label="Payment"/>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
              style={{ 
                background: type === 'income' ? 'var(--accent2)' : 'var(--accent3)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                padding: '13px',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'inherit',
                boxShadow: `0 8px 20px ${type === 'income' ? 'var(--accent2-dim)' : 'var(--accent3-dim)'}`,
                transition: 'all 0.2s'
              }}>
              {loading?'Saving…':editData?'Update Transaction':`Add ${type.charAt(0).toUpperCase()+type.slice(1)}`}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
