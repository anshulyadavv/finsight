'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email,p,e,l] = [useState(''),useState(''),useState(''),useState(false)];
  const [email_v, setEmail]    = email;
  const [pass_v,  setPass]     = p;
  const [error_v, setError]    = e;
  const [load_v,  setLoad]     = l;

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault(); setLoad(true); setError('');
    try { await login(email_v, pass_v); router.push('/dashboard'); }
    catch (err:any) { setError(err.response?.data?.message||'Invalid email or password'); }
    finally { setLoad(false); }
  };

  const inp: React.CSSProperties = { width:'100%',padding:'11px 14px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',fontSize:'14px',color:'var(--text)',fontFamily:'inherit',outline:'none',transition:'border-color 0.15s,background 0.15s' };

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
            <h1 style={{ fontSize:'21px',fontWeight:700,color:'var(--text)',marginBottom:'5px' }}>Welcome back</h1>
            <p style={{ color:'var(--text3)',fontSize:'13.5px',marginBottom:'24px' }}>Sign in to your account</p>

            {error_v && (
              <div style={{ background:'var(--accent3-dim)',color:'var(--accent3)',borderRadius:'10px',padding:'10px 14px',fontSize:'13px',marginBottom:'16px',border:'1px solid var(--accent3-dim)' }}>
                {error_v}
              </div>
            )}

            <form onSubmit={onSubmit} style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
              <div>
                <label style={{ fontSize:'13px',fontWeight:500,color:'rgba(255,255,255,0.5)',display:'block',marginBottom:'6px' }}>Email</label>
                <input type="email" value={email_v} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" style={inp}
                  onFocus={e=>{e.currentTarget.style.borderColor='rgba(45,212,191,0.5)';e.currentTarget.style.background='rgba(255,255,255,0.08)';}}
                  onBlur={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.background='rgba(255,255,255,0.06)';}}/>
              </div>
              <div>
                <label style={{ fontSize:'13px',fontWeight:500,color:'rgba(255,255,255,0.5)',display:'block',marginBottom:'6px' }}>Password</label>
                <input type="password" value={pass_v} onChange={e=>setPass(e.target.value)} required placeholder="••••••••" style={inp}
                  onFocus={e=>{e.currentTarget.style.borderColor='rgba(45,212,191,0.5)';e.currentTarget.style.background='rgba(255,255,255,0.08)';}}
                  onBlur={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.background='rgba(255,255,255,0.06)';}}/>
              </div>
              <motion.button type="submit" disabled={load_v} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                style={{ background:'#2dd4bf',color:'#0d1117',border:'none',borderRadius:'50px',padding:'13px',fontSize:'14.5px',fontWeight:700,cursor:load_v?'not-allowed':'pointer',opacity:load_v?0.7:1,marginTop:'4px',fontFamily:'inherit',boxShadow:'0 4px 20px rgba(45,212,191,0.3)' }}>
                {load_v?'Signing in…':'Sign in'}
              </motion.button>
            </form>

            <p style={{ textAlign:'center',fontSize:'13px',color:'var(--text3)',marginTop:'20px' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color:'#2dd4bf',fontWeight:600,textDecoration:'none' }}>Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
      <Footer/>
    </div>
  );
}
