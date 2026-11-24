'use client';
import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import { goalsApi } from '@/lib/api';

interface Props { onClose: () => void; onSuccess: () => void; goalId: string; }

export default function AddContributionModal({ onClose, onSuccess, goalId }: Props) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        amount: parseFloat(amount),
        date
      };
      
      await goalsApi.contribute(goalId, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add contribution');
    } finally {
      setLoading(false);
    }
  };

  const inpStyles: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid var(--glass-border)', background: 'var(--glass)',
    fontSize: '14px', color: 'var(--text)', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
  };
  
  const lblStyles: React.CSSProperties = { fontSize: '13px', fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: '6px' };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, 
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start', 
          padding: '40px 24px', overflowY: 'auto', 
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' 
        }}
        onClick={e => { if(e.target === e.currentTarget) onClose(); }}>
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ 
            background: 'var(--surface)', border: '1px solid var(--glass-border)', 
            borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '400px', 
            boxShadow: 'var(--shadow)', backdropFilter: 'blur(24px)', 
            WebkitBackdropFilter: 'blur(24px)', marginBottom: '40px'
          }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Add Contribution</h2>
              <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '2px', margin: '2px 0 0' }}>Save more towards your target</p>
            </div>
            <button onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--glass)', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', transition: 'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--glass)')}>
              <X size={15} strokeWidth={2} />
            </button>
          </div>

          {error && (
            <div style={{ background: 'var(--accent3-dim)', color: 'var(--accent3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px', border: '1px solid var(--accent3-dim)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div>
              <label style={lblStyles}>Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" min="0" step="any" required style={inpStyles}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass)'; }} />
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
              <DatePicker value={date} onChange={setDate} label="Date" allowFuture={true} forceDown={true} />
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{ 
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                padding: '13px',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'inherit',
                boxShadow: '0 8px 20px var(--accent-dim)',
                transition: 'all 0.2s',
                marginTop: '10px'
              }}>
              {loading ? 'Adding…' : 'Add Contribution'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
