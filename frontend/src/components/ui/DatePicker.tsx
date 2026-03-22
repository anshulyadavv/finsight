'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS         = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function popupPosition(trigRef: React.RefObject<HTMLElement>, pw: number, ph: number): React.CSSProperties {
  if (typeof window === 'undefined' || !trigRef.current) return { top:'calc(100% + 8px)',left:0 };
  const r  = trigRef.current.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const goLeft  = r.left + pw > vw  ? { right: 0, left: 'auto' } : { left: 0, right: 'auto' };
  const goAbove = r.bottom + ph > vh ? { bottom:'calc(100% + 8px)',top:'auto' } : { top:'calc(100% + 8px)',bottom:'auto' };

  return { ...goLeft, ...goAbove };
}

const POPUP: React.CSSProperties = {
  position: 'absolute',
  background: 'var(--surface)',
  border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow: 'var(--shadow)',
  zIndex: 300,
};

const btnReset: React.CSSProperties = { border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' };

// ── Month Picker (dashboard filter) ──────────────────────────────────────────
export function MonthPicker({ value, onChange }: { value?: string; onChange: (v: string|undefined) => void }) {
  const [open,  setOpen]  = useState(false);
  const [mode,  setMode]  = useState<'months'|'years'>('months');
  const ref     = useRef<HTMLDivElement>(null);
  const trigRef = useRef<HTMLButtonElement>(null);

  const now  = new Date();
  const cur  = value ? new Date(value+'-01') : now;
  const [viewY, setViewY] = useState(cur.getFullYear());
  const [pos,   setPos]   = useState<React.CSSProperties>({});

  useEffect(() => {
    if (open && trigRef.current) setPos(popupPosition(trigRef, 260, 320));
  }, [open]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if(ref.current&&!ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const label = value
    ? `${MONTHS_SHORT[cur.getMonth()]} ${cur.getFullYear()}`
    : `${MONTHS_SHORT[now.getMonth()]} ${now.getFullYear()}`;

  const pickMonth = (m: number) => {
    if (new Date(viewY,m,1) >= new Date(now.getFullYear(),now.getMonth()+1,1)) return;
    const str = `${viewY}-${String(m+1).padStart(2,'0')}`;
    const ns  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    onChange(str===ns ? undefined : str);
    setOpen(false);
  };

  // Year range for quick-jump
  const startYear = Math.floor(viewY/10)*10;
  const years     = Array.from({length:12},(_,i)=>startYear+i).filter(y=>y<=now.getFullYear());

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button ref={trigRef} onClick={()=>setOpen(!open)}
        style={{ display:'flex',alignItems:'center',gap:'8px',background:'var(--glass)',border:'1px solid var(--glass-border)',borderRadius:'50px',padding:'8px 16px',cursor:'pointer',fontFamily:'inherit',fontSize:'13px',fontWeight:500,color:'var(--text)',transition:'background 0.15s' }}
        onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')}
        onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
        <Calendar size={13} strokeWidth={2} color="var(--accent)"/>
        {label}
        <ChevronRight size={11} color="var(--text3)" style={{ transform:open?'rotate(90deg)':'none',transition:'transform 0.2s' }}/>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0,y:5,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,scale:0.97 }} transition={{ duration:0.14 }}
            style={{ ...POPUP,...pos,borderRadius:'18px',padding:'14px',minWidth:'250px' }}>
            {/* Header */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px' }}>
              <button onClick={()=>setViewY(v=>v-1)} style={{ ...btnReset,width:28,height:28,borderRadius:'50%',background:'var(--glass)',color:'var(--text2)',display:'flex',alignItems:'center',justifyContent:'center' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')} onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
                <ChevronLeft size={13}/>
              </button>
              <button onClick={()=>setMode(m=>m==='months'?'years':'months')}
                style={{ ...btnReset,fontSize:'13px',fontWeight:700,color:'var(--text)',padding:'4px 10px',borderRadius:'8px',background:'var(--glass)' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')} onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
                {mode==='years' ? `${startYear}–${startYear+11}` : viewY}
                <ChevronRight size={11} style={{ marginLeft:4,transform:mode==='years'?'rotate(90deg)':'none',transition:'transform 0.2s',display:'inline' }}/>
              </button>
              <button onClick={()=>setViewY(v=>Math.min(v+1,now.getFullYear()))} disabled={viewY>=now.getFullYear()}
                style={{ ...btnReset,width:28,height:28,borderRadius:'50%',background:viewY>=now.getFullYear()?'transparent':'var(--glass)',color:viewY>=now.getFullYear()?'var(--text3)':'var(--text2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:viewY>=now.getFullYear()?'not-allowed':'pointer' }}
                onMouseEnter={e=>{if(viewY<now.getFullYear())e.currentTarget.style.background='var(--glass-hover)';}} onMouseLeave={e=>{if(viewY<now.getFullYear())e.currentTarget.style.background='var(--glass)';}}>
                <ChevronRight size={13}/>
              </button>
            </div>

            {mode==='years' ? (
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'5px' }}>
                {years.map(y => (
                  <button key={y} onClick={()=>{setViewY(y);setMode('months');}}
                    style={{ ...btnReset,padding:'8px 4px',borderRadius:'9px',fontSize:'12.5px',fontWeight:y===viewY?700:400,
                      background:y===viewY?'var(--accent)':'transparent',
                      color:y===viewY?'#fff':'var(--text2)' }}
                    onMouseEnter={e=>{if(y!==viewY)e.currentTarget.style.background='var(--glass-hover)';}}
                    onMouseLeave={e=>{if(y!==viewY)e.currentTarget.style.background='transparent';}}>
                    {y}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'5px' }}>
                {MONTHS_SHORT.map((m,i) => {
                  const future = new Date(viewY,i,1)>=new Date(now.getFullYear(),now.getMonth()+1,1);
                  const sel    = !future && value && parseInt(value.split('-')[1])-1===i && parseInt(value.split('-')[0])===viewY;
                  const isNow  = !value && i===now.getMonth() && viewY===now.getFullYear();
                  const active = sel || isNow;
                  return (
                    <button key={m} onClick={()=>!future&&pickMonth(i)} disabled={!!future}
                      style={{ ...btnReset,padding:'8px 4px',borderRadius:'9px',fontSize:'12.5px',fontWeight:active?700:400,
                        background:active?'var(--accent)':'transparent',
                        color:active?'#fff':future?'var(--text3)':'var(--text2)',cursor:future?'not-allowed':'pointer' }}
                      onMouseEnter={e=>{if(!future&&!active)e.currentTarget.style.background='var(--glass-hover)';}}
                      onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent';}}>
                      {m}
                    </button>
                  );
                })}
              </div>
            )}
            {value && (
              <button onClick={()=>{onChange(undefined);setOpen(false);}}
                style={{ ...btnReset,width:'100%',marginTop:'10px',padding:'7px',borderRadius:'9px',background:'var(--glass)',color:'var(--text2)',fontSize:'12px' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')} onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
                Reset to current month
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Full Date Picker ──────────────────────────────────────────────────────────
export function DatePicker({ value, onChange, label }: { value: string; onChange: (v:string)=>void; label?: string }) {
  const [open,  setOpen]  = useState(false);
  const [mode,  setMode]  = useState<'days'|'months'|'years'>('days');
  const ref     = useRef<HTMLDivElement>(null);
  const trigRef = useRef<HTMLButtonElement>(null);

  const sel   = value ? new Date(value+'T00:00:00') : new Date();
  const today = new Date();
  const [viewY, setViewY] = useState(sel.getFullYear());
  const [viewM, setViewM] = useState(sel.getMonth());
  const [pos,   setPos]   = useState<React.CSSProperties>({});

  useEffect(() => {
    if (open && trigRef.current) setPos(popupPosition(trigRef, 294, 380));
  }, [open]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if(ref.current&&!ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const displayLabel = value
    ? new Date(value+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
    : 'Select date';

  const firstDay  = new Date(viewY,viewM,1).getDay();
  const daysInMon = new Date(viewY,viewM+1,0).getDate();
  const daysInPrv = new Date(viewY,viewM,0).getDate();

  const cells: { day:number; type:'prev'|'cur'|'next' }[] = [];
  for (let i=firstDay-1;i>=0;i--) cells.push({day:daysInPrv-i,type:'prev'});
  for (let d=1;d<=daysInMon;d++)   cells.push({day:d,type:'cur'});
  while (cells.length%7!==0)       cells.push({day:cells.length-daysInMon-firstDay+1,type:'next'});

  const pick = (day:number) => {
    onChange(`${viewY}-${String(viewM+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
    setOpen(false); setMode('days');
  };

  const prevM = () => { if(viewM===0){setViewM(11);setViewY(y=>y-1);}else setViewM(m=>m-1); };
  const nextM = () => {
    const nx=new Date(viewY,viewM+1,1);
    if(nx>today) return;
    if(viewM===11){setViewM(0);setViewY(y=>y+1);}else setViewM(m=>m+1);
  };

  const isSel = (d:number) => { if(!value)return false; const dt=new Date(value+'T00:00:00'); return dt.getFullYear()===viewY&&dt.getMonth()===viewM&&dt.getDate()===d; };
  const isTod = (d:number) => today.getFullYear()===viewY&&today.getMonth()===viewM&&today.getDate()===d;
  const isFut = (d:number) => new Date(viewY,viewM,d)>today;

  const startYear = Math.floor(viewY/10)*10;
  const years     = Array.from({length:12},(_,i)=>startYear+i).filter(y=>y<=today.getFullYear());

  return (
    <div ref={ref} style={{ position:'relative' }}>
      {label && <label style={{ fontSize:'13px',fontWeight:500,color:'var(--text2)',display:'block',marginBottom:'6px' }}>{label}</label>}
      <button ref={trigRef} type="button" onClick={()=>setOpen(!open)}
        style={{ width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--glass-border)',background:'var(--glass)',fontSize:'14px',color:value?'var(--text)':'var(--text3)',cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',justifyContent:'space-between',fontFamily:'inherit',transition:'border-color 0.15s,background 0.15s' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='var(--glass-hover)';}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--glass-border)';e.currentTarget.style.background='var(--glass)';}}>
        {displayLabel}
        <Calendar size={14} strokeWidth={2} color="var(--text3)"/>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0,y:5,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,scale:0.97 }} transition={{ duration:0.14 }}
            style={{ ...POPUP,...pos,borderRadius:'20px',padding:'14px',width:'294px' }}>

            {/* Header row */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px' }}>
              <button type="button" onClick={mode==='days'?prevM:()=>setViewY(y=>y-(mode==='months'?1:10))}
                style={{ ...btnReset,width:28,height:28,borderRadius:'50%',background:'var(--glass)',color:'var(--text2)',display:'flex',alignItems:'center',justifyContent:'center' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')} onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
                {mode==='years'?<ChevronsLeft size={13}/>:<ChevronLeft size={14}/>}
              </button>

              {/* Clickable title — cycles through day→month→year view */}
              <button type="button" onClick={()=>setMode(m=>m==='days'?'months':m==='months'?'years':'days')}
                style={{ ...btnReset,fontSize:'13.5px',fontWeight:700,color:'var(--text)',padding:'4px 10px',borderRadius:'8px',background:'var(--glass)',display:'flex',alignItems:'center',gap:'4px' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')} onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
                {mode==='days' && <>{MONTHS_FULL[viewM]} {viewY}</>}
                {mode==='months' && <>{viewY}</>}
                {mode==='years' && <>{startYear}–{startYear+11}</>}
                <ChevronRight size={11} style={{ transform:'rotate(90deg)',opacity:0.5 }}/>
              </button>

              <button type="button" onClick={mode==='days'?nextM:()=>setViewY(y=>y+(mode==='months'?1:10))}
                disabled={mode==='days'&&new Date(viewY,viewM+1,1)>today}
                style={{ ...btnReset,width:28,height:28,borderRadius:'50%',background:'var(--glass)',color:'var(--text2)',display:'flex',alignItems:'center',justifyContent:'center',opacity:mode==='days'&&new Date(viewY,viewM+1,1)>today?0.3:1,cursor:mode==='days'&&new Date(viewY,viewM+1,1)>today?'not-allowed':'pointer' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-hover)')} onMouseLeave={e=>(e.currentTarget.style.background='var(--glass)')}>
                {mode==='years'?<ChevronsRight size={13}/>:<ChevronRight size={14}/>}
              </button>
            </div>

            {/* Year grid */}
            {mode==='years' && (
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'4px' }}>
                {years.map(y=>(
                  <button key={y} type="button" onClick={()=>{setViewY(y);setMode('months');}}
                    style={{ ...btnReset,padding:'9px 4px',borderRadius:'9px',fontSize:'12.5px',fontWeight:y===viewY?700:400,
                      background:y===viewY?'var(--accent)':'transparent',color:y===viewY?'#fff':'var(--text2)' }}
                    onMouseEnter={e=>{if(y!==viewY)e.currentTarget.style.background='var(--glass-hover)';}}
                    onMouseLeave={e=>{if(y!==viewY)e.currentTarget.style.background='transparent';}}>
                    {y}
                  </button>
                ))}
              </div>
            )}

            {/* Month grid */}
            {mode==='months' && (
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'4px' }}>
                {MONTHS_SHORT.map((m,i)=>{
                  const future=new Date(viewY,i,1)>today;
                  const active=i===viewM;
                  return (
                    <button key={m} type="button" onClick={()=>{if(!future){setViewM(i);setMode('days');}}}
                      style={{ ...btnReset,padding:'9px 4px',borderRadius:'9px',fontSize:'12.5px',fontWeight:active?700:400,
                        background:active?'var(--accent)':'transparent',color:active?'#fff':future?'var(--text3)':'var(--text2)',cursor:future?'not-allowed':'pointer' }}
                      onMouseEnter={e=>{if(!future&&!active)e.currentTarget.style.background='var(--glass-hover)';}}
                      onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent';}}>
                      {m}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Day grid */}
            {mode==='days' && (
              <>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'1px',marginBottom:'4px' }}>
                  {DAYS.map(d=>(
                    <div key={d} style={{ textAlign:'center',fontSize:'10px',fontWeight:600,color:'var(--text3)',padding:'3px 0',textTransform:'uppercase',letterSpacing:'0.3px' }}>{d}</div>
                  ))}
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'1px' }}>
                  {cells.map((cell,i)=>{
                    const other=cell.type!=='cur';
                    const s=!other&&isSel(cell.day);
                    const t=!other&&isTod(cell.day);
                    const f=!other&&isFut(cell.day);
                    return (
                      <button key={i} type="button"
                        onClick={()=>!other&&!f&&pick(cell.day)}
                        disabled={other||f}
                        style={{ ...btnReset,height:34,width:'100%',borderRadius:'50%',fontSize:'12.5px',fontWeight:s||t?600:400,cursor:other||f?'default':'pointer',
                          background:s?'var(--accent)':'transparent',
                          color:s?'#fff':other?'var(--text3)':f?'var(--text3)':t?'var(--accent)':'var(--text)',
                          outline:t&&!s?'1.5px solid var(--accent)':'none',outlineOffset:'-1.5px',
                        }}
                        onMouseEnter={e=>{if(!other&&!f&&!s)e.currentTarget.style.background='var(--accent-dim)';}}
                        onMouseLeave={e=>{if(!s)e.currentTarget.style.background='transparent';}}>
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={()=>{pick(today.getDate());setViewY(today.getFullYear());setViewM(today.getMonth());}}
                  style={{ ...btnReset,width:'100%',marginTop:'10px',padding:'8px',borderRadius:'10px',background:'var(--accent-dim)',color:'var(--accent)',fontSize:'12px',fontWeight:600,border:'1px solid',borderColor:'var(--accent-dim)' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--glass-strong)')} onMouseLeave={e=>(e.currentTarget.style.background='var(--accent-dim)')}>
                  Today
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
