'use client';
import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { txApi, categoriesApi } from '@/lib/api';
import { DatePicker } from '@/components/ui/DatePicker';

interface Props { onClose: () => void; onSuccess: () => void; editData?: any; }

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
    categoriesApi.list().then(r=>setCategories(r.data.data||[])).catch(()=>{});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount||parseFloat(amount)<=0) { setError('Enter a valid amount'); return; }
    setLoading(true); setError('');
    try {
      const payload = { description:desc, merchant:desc, amount:parseFloat(amount), date, type, categoryId:categoryId||undefined, paymentMethod:payment };
      editData?.id ? await txApi.update(editData.id,payload) : await txApi.create(payload);
      onSuccess(); onClose();
    } catch (err:any) {
      setError(err.response?.data?.message||'Failed to save transaction');
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--glass-border)',background:'var(--glass)',fontSize:'14px',color:'var(--text)',fontFamily:'inherit',outline:'none',transition:'border-color 0.15s' };
  const lbl: React.CSSProperties = { fontSize:'13px',fontWeight:500,color:'var(--text2)',display:'block',marginBottom:'6px' };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)' }}
        onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
        <motion.div initial={{ scale:0.96,opacity:0,y:16 }} animate={{ scale:1,opacity:1,y:0 }} exit={{ scale:0.96,opacity:0 }} transition={{ duration:0.2,ease:'easeOut' }}
          style={{ background:'var(--surface)',border:'1px solid var(--glass-border)',borderRadius:'24px',padding:'28px',width:'100%',maxWidth:'480px',boxShadow:'var(--shadow)' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'22px' }}>
            <div>
              <h2 style={{ fontSize:'19px',fontWeight:700,color:'var(--text)',margin:0 }}>{editData?'Edit Transaction':'Add Transaction'}</h2>
              <p style={{ fontSize:'13px',color:'var(--text2)',marginTop:'2px' }}>Fill in the details below</p>
            </div>
            <button onClick={onClose} style={{ width:32,height:32,borderRadius:'50%',background:'var(--glass)',border:'1px solid var(--glass-border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',transition:'background 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
              onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
              <X size={15} strokeWidth={2}/>
            </button>
          </div>

          {error && <div style={{ background:'var(--accent3-dim)',color:'var(--accent3)',borderRadius:'10px',padding:'10px 14px',fontSize:'13px',marginBottom:'16px',border:'1px solid var(--accent3-dim)' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
            {/* Type toggle */}
            <div style={{ display:'flex',gap:'6px',background:'var(--glass)',padding:'4px',borderRadius:'12px',border:'1px solid var(--glass-border)' }}>
              {(['expense','income'] as const).map(t=>(
                <button key={t} type="button" onClick={()=>setType(t)}
                  style={{ flex:1,padding:'9px',borderRadius:'9px',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'13.5px',fontWeight:500,transition:'all 0.15s',
                    background: type===t?'rgba(255,255,255,0.08)':'transparent',
                    color: type===t?(t==='expense'?'#f87171':'#4ade80'):'rgba(255,255,255,0.35)',
                    boxShadow: type===t?'0 2px 8px rgba(0,0,0,0.2)':'none',
                  }}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            <div>
              <label style={lbl}>Amount (₹)</label>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" required style={inp}/>
            </div>

            <div>
              <label style={lbl}>Description / Merchant</label>
              <input type="text" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Swiggy, Uber, Rent" style={inp}/>
            </div>

            {/* DatePicker — positioned above in modal so it doesn't clip */}
            <div style={{ position:'relative', zIndex:10 }}>
              <DatePicker value={date} onChange={setDate} label="Date"/>
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
              <div>
                <label style={lbl}>Category</label>
                <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} style={inp}>
                  <option value="">Auto-detect</option>
                  {categories.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Payment</label>
                <select value={payment} onChange={e=>setPayment(e.target.value)} style={inp}>
                  {[['upi','UPI'],['card','Card'],['netbanking','Net Banking'],['cash','Cash'],['wallet','Wallet'],['other','Other']].map(([v,l])=>(
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
              style={{ background:'#2dd4bf',color:'#0d1117',border:'none',borderRadius:'50px',padding:'13px',fontSize:'14.5px',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,fontFamily:'inherit',boxShadow:'0 4px 20px rgba(45,212,191,0.3)',transition:'filter 0.15s' }}>
              {loading?'Saving…':editData?'Update Transaction':`Add ${type.charAt(0).toUpperCase()+type.slice(1)}`}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
