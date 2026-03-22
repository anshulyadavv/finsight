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
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid rgba(0,0,0,0.1)', background:'var(--bg)', fontSize:'14px', outline:'none', fontFamily:'inherit', color:'var(--text)' };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
          style={{ width:'100%', maxWidth:'400px' }}>
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#0f766e" opacity="0.1"/>
                <rect x="5" y="16" width="4" height="8" rx="2" fill="#0f766e"/>
                <rect x="12" y="10" width="4" height="14" rx="2" fill="#14b8a6"/>
                <rect x="19" y="4" width="4" height="20" rx="2" fill="#22c55e"/>
              </svg>
              <span style={{ fontSize:'22px', fontWeight:700, color:'var(--teal)' }}>FinSight</span>
            </div>
            <p style={{ color:'var(--text2)', fontSize:'13.5px' }}>Personal Finance Intelligence</p>
          </div>

          <div style={{ background:'#fff', borderRadius:'24px', padding:'32px', boxShadow:'6px 6px 24px rgba(0,0,0,0.06)' }}>
            <h1 style={{ fontSize:'21px', fontWeight:700, marginBottom:'5px', color:'var(--text)' }}>Welcome back</h1>
            <p style={{ color:'var(--text2)', fontSize:'13.5px', marginBottom:'24px' }}>Sign in to your account</p>

            {error && (
              <div style={{ background:'#fef2f2', color:'#ef4444', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', marginBottom:'16px', border:'1px solid rgba(239,68,68,0.15)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ fontSize:'13px', fontWeight:500, color:'var(--text2)', display:'block', marginBottom:'6px' }}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" style={inp}/>
              </div>
              <div>
                <label style={{ fontSize:'13px', fontWeight:500, color:'var(--text2)', display:'block', marginBottom:'6px' }}>Password</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={inp}/>
              </div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                style={{ background:'var(--teal)', color:'#fff', border:'none', borderRadius:'50px', padding:'12px', fontSize:'14.5px', fontWeight:600, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, marginTop:'4px', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(15,118,110,0.3)' }}>
                {loading ? 'Signing in…' : 'Sign in'}
              </motion.button>
            </form>

            <p style={{ textAlign:'center', fontSize:'13px', color:'var(--text2)', marginTop:'20px' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color:'var(--teal)', fontWeight:600, textDecoration:'none' }}>Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
      <Footer/>
    </div>
  );
}
