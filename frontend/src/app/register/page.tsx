'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const router       = useRouter();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#0f766e" opacity="0.1"/>
              <rect x="5" y="16" width="4" height="8" rx="2" fill="#0f766e"/>
              <rect x="12" y="10" width="4" height="14" rx="2" fill="#14b8a6"/>
              <rect x="19" y="4" width="4" height="20" rx="2" fill="#22c55e"/>
            </svg>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--teal)' }}>FinSight</span>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Personal Finance Intelligence</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Create account</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px' }}>Start tracking your finances today</p>

          {error && (
            <div style={{ background: 'var(--red-light)', color: 'var(--red)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Full name', type: 'text', value: name, setter: setName, placeholder: 'Alex Rajan' },
              { label: 'Email', type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
              { label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: '••••••••' },
            ].map(({ label, type, value, setter, placeholder }) => (
              <div key={label}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>{label}</label>
                <input
                  type={type} value={value} onChange={e => setter(e.target.value)} required
                  placeholder={placeholder}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
            ))}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{ background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '50px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px', fontFamily: 'inherit' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text2)', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
