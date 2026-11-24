'use client';
import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import { goalsApi } from '@/lib/api';

interface Props { 
  onClose: () => void; 
  onSuccess: () => void; 
  editData?: any; 
  initialData?: any; 
}

export default function AddGoalModal({ onClose, onSuccess, editData, initialData }: Props) {
  const goalItem = editData || initialData;
  const isEditing = Boolean(goalItem?.id);
  
  const [title, setTitle] = useState(goalItem?.title || '');
  const [targetAmount, setTargetAmount] = useState(goalItem?.targetAmount?.toString() || '');
  const [deadline, setDeadline] = useState(
    goalItem?.deadline 
      ? new Date(goalItem.deadline).toISOString().split('T')[0]
      : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || parseFloat(targetAmount) <= 0) {
      setError('Please fill all required fields correctly');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        title,
        targetAmount: parseFloat(targetAmount),
        deadline,
        isShared: false // For simplicity, we create solo goals by default
      };
      
      if (isEditing) {
        await goalsApi.update(goalItem.id, payload);
      } else {
        await goalsApi.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || (isEditing ? 'Failed to update goal' : 'Failed to create goal'));
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
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{isEditing ? 'Edit Goal' : 'Create Goal'}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '2px', margin: '2px 0 0' }}>{isEditing ? 'Update your goal target' : 'Set your next financial target'}</p>
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
              <label style={lblStyles}>Goal Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Dream Home, Vacation" style={inpStyles}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass)'; }} />
            </div>

            <div>
              <label style={lblStyles}>Target Amount (₹)</label>
              <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)}
                placeholder="0.00" min="0" step="1000" required style={inpStyles}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass)'; }} />
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
              <DatePicker value={deadline} onChange={setDeadline} label="Target Date" allowFuture={true} forceDown={true} />
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
              {loading ? (isEditing ? 'Saving…' : 'Creating…') : (isEditing ? 'Save Changes' : 'Create Goal')}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
