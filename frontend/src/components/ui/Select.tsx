'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
}

export function Select({ value, onChange, options, placeholder, label }: SelectProps) {
  const [open,   setOpen]   = useState(false);
  const ref      = useRef<HTMLDivElement>(null);
  const trigRef  = useRef<HTMLButtonElement>(null);
  const [above,  setAbove]  = useState(false);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (open && trigRef.current) {
      const r  = trigRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      setAbove(r.bottom + 260 > vh);
    }
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
          {label}
        </label>
      )}
      <button
        ref={trigRef}
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: '10px',
          border: '1px solid var(--glass-border)', background: 'var(--glass)',
          fontSize: '14px', color: selected ? 'var(--text)' : 'var(--text2)',
          cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', fontFamily: 'inherit',
          transition: 'border-color 0.15s, background 0.15s',
          outline: 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--glass-hover)'; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass)'; } }}
      >
        <span>{selected?.label || placeholder || 'Select…'}</span>
        <ChevronDown size={14} color="var(--text3)" strokeWidth={2} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}/>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: above ? -4 : 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            data-lenis-prevent
            style={{
              position: 'absolute',
              [above ? 'bottom' : 'top']: 'calc(100% + 6px)',
              left: 0, right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: 'var(--shadow)',
              zIndex: 400,
              maxHeight: '240px',
              overflowY: 'auto',
              padding: '4px',
            }}
          >
            {options.map(opt => {
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '9px',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '13.5px', textAlign: 'left', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    background: isActive ? 'var(--accent-dim)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text)',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--glass-hover)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {opt.label}
                  {isActive && <Check size={13} strokeWidth={2.5} color="var(--accent)"/>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
