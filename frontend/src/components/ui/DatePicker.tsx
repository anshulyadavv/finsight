'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Shared helpers ────────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Month Picker (for dashboard filter) ──────────────────────────────────────

interface MonthPickerProps {
  value?: string;       // 'YYYY-MM'
  onChange: (v: string | undefined) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const now     = new Date();
  const cur     = value ? new Date(value + '-01') : now;
  const curYear = cur.getFullYear();
  const curMon  = cur.getMonth();
  const [viewYear, setViewYear] = useState(curYear);

  const label = value
    ? `${MONTHS[curMon].slice(0,3)} ${curYear}`
    : `${MONTHS[now.getMonth()].slice(0,3)} ${now.getFullYear()}`;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const selectMonth = (month: number) => {
    const d    = new Date(viewYear, month, 1);
    const nowD = new Date(now.getFullYear(), now.getMonth(), 1);
    if (d > nowD) return;
    const str = `${viewYear}-${String(month + 1).padStart(2, '0')}`;
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    onChange(str === nowStr ? undefined : str);
    setOpen(false);
  };

  const isFuture = (month: number) => {
    const d    = new Date(viewYear, month, 1);
    const nowD = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return d >= nowD;
  };

  const isSelected = (month: number) => {
    if (!value) return month === now.getMonth() && viewYear === now.getFullYear();
    return month === curMon && viewYear === curYear;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display:'flex', alignItems:'center', gap:'8px', background:'#fff', borderRadius:'50px', padding:'8px 16px', border:'1px solid rgba(0,0,0,0.08)', cursor:'pointer', fontFamily:'inherit', fontSize:'13px', fontWeight:500, color:'var(--text)', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', transition:'box-shadow 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)')}
      >
        <Calendar size={14} strokeWidth={2} color="var(--teal)"/>
        {label}
        <ChevronRight size={12} color="var(--text3)" style={{ transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.2s' }}/>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:6, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:4, scale:0.97 }}
            transition={{ duration:0.15, ease:'easeOut' }}
            style={{ position:'absolute', top:'calc(100% + 8px)', left:0, background:'#fff', borderRadius:'18px', boxShadow:'0 12px 40px rgba(0,0,0,0.12)', border:'1px solid rgba(0,0,0,0.07)', padding:'16px', zIndex:100, minWidth:'260px' }}
          >
            {/* Year navigation */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <button onClick={() => setViewYear(v => v - 1)}
                style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'var(--bg)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)', transition:'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background='#e5e7eb')}
                onMouseLeave={e => (e.currentTarget.style.background='var(--bg)')}>
                <ChevronLeft size={14} strokeWidth={2}/>
              </button>
              <span style={{ fontSize:'14px', fontWeight:600, color:'var(--text)' }}>{viewYear}</span>
              <button onClick={() => setViewYear(v => v + 1)} disabled={viewYear >= now.getFullYear()}
                style={{ width:28, height:28, borderRadius:'50%', border:'none', background: viewYear >= now.getFullYear() ? 'transparent' : 'var(--bg)', cursor: viewYear >= now.getFullYear() ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: viewYear >= now.getFullYear() ? 'var(--text3)' : 'var(--text2)', transition:'background 0.15s' }}
                onMouseEnter={e => { if (viewYear < now.getFullYear()) e.currentTarget.style.background='#e5e7eb'; }}
                onMouseLeave={e => { if (viewYear < now.getFullYear()) e.currentTarget.style.background='var(--bg)'; }}>
                <ChevronRight size={14} strokeWidth={2}/>
              </button>
            </div>

            {/* Month grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
              {MONTHS.map((m, i) => {
                const future   = isFuture(i);
                const selected = isSelected(i);
                return (
                  <button key={m} onClick={() => !future && selectMonth(i)} disabled={future}
                    style={{ padding:'9px 6px', borderRadius:'10px', border:'none', cursor: future ? 'not-allowed' : 'pointer', fontFamily:'inherit', fontSize:'12.5px', fontWeight: selected ? 700 : 400, transition:'all 0.15s',
                      background: selected ? 'var(--teal)' : 'transparent',
                      color: selected ? '#fff' : future ? 'var(--text3)' : 'var(--text2)',
                    }}
                    onMouseEnter={e => { if (!future && !selected) e.currentTarget.style.background='var(--bg)'; }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.background='transparent'; }}>
                    {m.slice(0,3)}
                  </button>
                );
              })}
            </div>

            {/* Clear / This month */}
            {value && (
              <button onClick={() => { onChange(undefined); setOpen(false); }}
                style={{ width:'100%', marginTop:'10px', padding:'8px', borderRadius:'10px', border:'none', background:'var(--bg)', cursor:'pointer', fontFamily:'inherit', fontSize:'12.5px', color:'var(--text2)', fontWeight:500, transition:'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background='#e5e7eb')}
                onMouseLeave={e => (e.currentTarget.style.background='var(--bg)')}>
                Back to current month
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Full Date Picker (for transaction form) ────────────────────────────────────

interface DatePickerProps {
  value: string;        // 'YYYY-MM-DD'
  onChange: (v: string) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear,  setViewYear]  = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const today      = new Date();
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMon  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const displayLabel = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
    : 'Select date';

  const selectDay = (day: number) => {
    const str = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    onChange(str);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    if (next > today) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const d = new Date(value + 'T00:00:00');
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day;
  };

  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const isFutureDay = (day: number) => new Date(viewYear, viewMonth, day) > today;

  // Build calendar grid (6 rows × 7 cols)
  const cells: { day: number; type: 'prev' | 'cur' | 'next' }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, type: 'prev' });
  for (let d = 1; d <= daysInMon; d++)
    cells.push({ day: d, type: 'cur' });
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - daysInMon - firstDay + 1, type: 'next' });

  return (
    <div ref={ref} style={{ position:'relative' }}>
      {label && <label style={{ fontSize:'13px', fontWeight:500, color:'var(--text2)', display:'block', marginBottom:'6px' }}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid rgba(0,0,0,0.1)', background:'var(--bg)', fontSize:'14px', outline:'none', fontFamily:'inherit', color: value ? 'var(--text)' : 'var(--text3)', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'border-color 0.15s' }}
        onFocus={e => (e.currentTarget.style.borderColor='var(--teal)')}
        onBlur={e  => (e.currentTarget.style.borderColor='rgba(0,0,0,0.1)')}
      >
        {displayLabel}
        <Calendar size={14} strokeWidth={2} color="var(--text3)"/>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:6, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:4, scale:0.97 }}
            transition={{ duration:0.15 }}
            style={{ position:'absolute', top:'calc(100% + 8px)', left:0, background:'#fff', borderRadius:'20px', boxShadow:'0 16px 48px rgba(0,0,0,0.14)', border:'1px solid rgba(0,0,0,0.07)', padding:'18px', zIndex:200, width:'296px' }}
          >
            {/* Month navigation */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <button onClick={prevMonth} type="button"
                style={{ width:30, height:30, borderRadius:'50%', border:'none', background:'var(--bg)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)' }}
                onMouseEnter={e => (e.currentTarget.style.background='#e5e7eb')}
                onMouseLeave={e => (e.currentTarget.style.background='var(--bg)')}>
                <ChevronLeft size={15} strokeWidth={2}/>
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <span style={{ fontSize:'14px', fontWeight:700, color:'var(--text)' }}>
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <ChevronRight size={13} color="var(--teal)" strokeWidth={2.5}/>
              </div>
              <button onClick={nextMonth} type="button"
                style={{ width:30, height:30, borderRadius:'50%', border:'none', background: new Date(viewYear, viewMonth+1,1)>today ? 'transparent' : 'var(--bg)', cursor: new Date(viewYear, viewMonth+1,1)>today ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: new Date(viewYear, viewMonth+1,1)>today ? 'var(--text3)' : 'var(--text2)' }}
                onMouseEnter={e => { if (new Date(viewYear, viewMonth+1,1)<=today) e.currentTarget.style.background='#e5e7eb'; }}
                onMouseLeave={e => { if (new Date(viewYear, viewMonth+1,1)<=today) e.currentTarget.style.background='var(--bg)'; }}>
                <ChevronRight size={15} strokeWidth={2}/>
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px', marginBottom:'6px' }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:'11px', fontWeight:600, color:'var(--text3)', padding:'4px 0', textTransform:'uppercase', letterSpacing:'0.3px' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px' }}>
              {cells.map((cell, i) => {
                const isOther   = cell.type !== 'cur';
                const sel       = !isOther && isSelected(cell.day);
                const tod       = !isOther && isToday(cell.day);
                const future    = !isOther && isFutureDay(cell.day);
                return (
                  <button key={i} type="button"
                    onClick={() => !isOther && !future && selectDay(cell.day)}
                    disabled={isOther || future}
                    style={{ height:36, width:'100%', borderRadius:'50%', border:'none', cursor: isOther || future ? 'default' : 'pointer', fontFamily:'inherit', fontSize:'13px', fontWeight: sel || tod ? 600 : 400, transition:'all 0.12s',
                      background: sel ? 'var(--teal)' : 'transparent',
                      color: sel ? '#fff' : isOther ? 'var(--text3)' : future ? '#d1d5db' : tod ? 'var(--teal)' : 'var(--text)',
                      outline: tod && !sel ? '2px solid var(--teal)' : 'none',
                      outlineOffset: '-2px',
                    }}
                    onMouseEnter={e => { if (!isOther && !future && !sel) e.currentTarget.style.background = '#f0fdf9'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}>
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Today shortcut */}
            <button type="button" onClick={() => { const t = today; selectDay(t.getDate()); setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); }}
              style={{ width:'100%', marginTop:'12px', padding:'8px', borderRadius:'10px', border:'none', background:'var(--bg)', cursor:'pointer', fontFamily:'inherit', fontSize:'12.5px', color:'var(--teal)', fontWeight:600, transition:'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background='var(--teal-light)')}
              onMouseLeave={e => (e.currentTarget.style.background='var(--bg)')}>
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
