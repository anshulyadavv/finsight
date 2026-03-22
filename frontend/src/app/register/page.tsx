'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/layout/Footer';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pass.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try { await register(name, email, pass); router.push('/dashboard'); }
    catch (err:any) { setError(err.response?.data?.message||'Registration failed'); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { width:'100%',padding:'11px 14px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',fontSize:'14px',color:'var(--text)',fontFamily:'inherit',outline:'none' };
  const lbl: React.CSSProperties = { fontSize:'13px',fontWeight:500,color:'rgba(255,255,255,0.5)',display:'block',marginBottom:'6px' };
  const focus = (e: any) => { e.currentTarget.style.borderColor='rgba(45,212,191,0.5)'; e.currentTarget.style.background='rgba(255,255,255,0.08)'; };
  const blur  = (e: any) => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.background='rgba(255,255,255,0.06)'; };

  return (
    <div style={{ minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
      <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px' }}>
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.35 }} style={{ width:'100%',maxWidth:'400px' }}>
          <div style={{ textAlign:'center',marginBottom:'32px' }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:'10px',marginBottom:'8px' }}>
              <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#2dd4bf" opacity="0.15"/>
                <rect x="5" y="16" width="4" height="8" rx="2" fill="#2dd4bf"/>
                <rect x="12" y="10" width="4" height="14" rx="2" fill="#5eead4"/>
                <rect x="19" y="4" width="4" height="20" rx="2" fill="#4ade80"/>
              </svg>
              <span style={{ fontSize:'22px',fontWeight:700,color:'#2dd4bf' }}>FinSight</span>
            </div>
            <p style={{ color:'var(--text3)',fontSize:'13.5px' }}>Personal Finance Intelligence</p>
          </div>

          <div style={{ background:'var(--glass)',border:'1px solid var(--glass-border)',borderRadius:'24px',padding:'32px',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',boxShadow:'var(--shadow)' }}>
            <h1 style={{ fontSize:'21px',fontWeight:700,color:'var(--text)',marginBottom:'5px' }}>Create account</h1>
            <p style={{ color:'var(--text3)',fontSize:'13.5px',marginBottom:'24px' }}>Start tracking your finances today</p>

            {error && <div style={{ background:'var(--accent3-dim)',color:'var(--accent3)',borderRadius:'10px',padding:'10px 14px',fontSize:'13px',marginBottom:'16px',border:'1px solid var(--accent3-dim)' }}>{error}</div>}

            <form onSubmit={onSubmit} style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
              {[
                { label:'Full name',    type:'text',     val:name,  set:setName,  ph:'Alex Rajan' },
                { label:'Email',        type:'email',    val:email, set:setEmail, ph:'you@example.com' },
                { label:'Password',     type:'password', val:pass,  set:setPass,  ph:'Min. 8 characters' },
              ].map(({ label, type, val, set, ph }) => (
                <div key={label}>
                  <label style={lbl}>{label}</label>
                  <input type={type} value={val} onChange={e=>set(e.target.value)} required placeholder={ph} style={inp} onFocus={focus} onBlur={blur}/>
                </div>
              ))}
              <motion.button type="submit" disabled={loading} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                style={{ background:'#2dd4bf',color:'#0d1117',border:'none',borderRadius:'50px',padding:'13px',fontSize:'14.5px',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,marginTop:'4px',fontFamily:'inherit',boxShadow:'0 4px 20px rgba(45,212,191,0.3)' }}>
                {loading?'Creating…':'Create account'}
              </motion.button>
            </form>
            <p style={{ textAlign:'center',fontSize:'13px',color:'var(--text3)',marginTop:'20px' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color:'#2dd4bf',fontWeight:600,textDecoration:'none' }}>Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
      <Footer/>
    </div>
  );
}
