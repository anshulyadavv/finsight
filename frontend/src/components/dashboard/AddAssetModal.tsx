'use client';
import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { assetsApi } from '@/lib/api';

interface Props { 
  onClose: () => void; 
  onSuccess: () => void; 
  editData?: any; 
  initialData?: any; 
  type?: 'income' | 'asset' | 'liability' | null; 
}

const TYPE_OPTIONS = [
  { value:'BANK', label:'Bank Account' },
  { value:'STOCK', label:'Stock' },
  { value:'ETF', label:'ETF' },
  { value:'GOLD', label:'Gold' },
  { value:'PROPERTY', label:'Property' },
  { value:'FD', label:'Fixed Deposit' },
  { value:'RSU', label:'RSUs' },
  { value:'INSURANCE', label:'Insurance' },
];

export default function AddAssetModal({ onClose, onSuccess, editData, initialData, type: modalType }: Props) {
  const data = editData || initialData;
  const [name, setName] = useState(data?.name || data?.source || '');
  const [type, setType] = useState(data?.type || 'BANK');
  const [value, setValue] = useState((data?.value ?? data?.amount)?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !value || parseFloat(value) < 0) {
      setError('Please fill all required fields correctly');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        name,
        type,
        value: parseFloat(value),
        currency: 'INR'
      };
      
      if (data?.id) {
        await assetsApi.updateAsset(data.id, payload);
      } else {
        await assetsApi.createAsset(payload);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save asset');
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
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{editData ? 'Edit Asset' : 'Add Asset'}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '2px', margin: '2px 0 0' }}>Track your wealth</p>
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
              <label style={lblStyles}>Asset Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. HDFC Savings, AAPL Shares" style={inpStyles}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass)'; }} />
            </div>

            <Select value={type} onChange={setType} options={TYPE_OPTIONS} label="Asset Type" forceDown={true} />

            <div>
              <label style={lblStyles}>Current Value (₹)</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)}
                placeholder="0.00" min="0" step="0.01" required style={inpStyles}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass)'; }} />
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
              {loading ? 'Saving…' : editData ? 'Update Asset' : 'Add Asset'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
