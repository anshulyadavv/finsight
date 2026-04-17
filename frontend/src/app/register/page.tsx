'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import dynamic from 'next/dynamic';
const WatcherRobot = dynamic(() => import('@/components/auth/WatcherRobot'), { ssr: false });
import Logo from '@/components/ui/Logo';
import { ArrowRight, Github, Mail } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { 
      setError('Password must be at least 8 characters'); 
      return; 
    }
    setLoading(true); 
    setError('');
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
    <div className="min-h-screen flex selection:bg-violet-200 selection:text-violet-900 font-sans bg-white overflow-y-auto">
      
      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')" }} />

      {/* Left side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10 bg-white shadow-[20px_0_60px_rgba(0,0,0,0.02)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-6">
            <Link href="/" className="inline-block mb-6 group focus:outline-none">
              <Logo variant="light" />
            </Link>
            <h1 className="text-[32px] font-black tracking-tighter leading-none text-gray-900 mb-2">Get Started</h1>
            <p className="text-[14px] text-gray-600 font-medium tracking-tight">Create your account for AI-powered finance intelligence.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-50 text-rose-600 rounded-[12px] px-4 py-3 text-[13px] font-bold border border-rose-100 mb-5 flex items-center gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="relative group">
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)} required 
                placeholder="Full Name" 
                className="w-full px-5 py-4 rounded-[16px] border border-gray-100 bg-[#FBFBFC] focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 shadow-sm text-[14px] font-bold outline-none transition-all placeholder:text-gray-500 placeholder:font-medium text-gray-900"
              />
            </div>
            <div className="relative group">
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)} required 
                placeholder="Email address" 
                className="w-full px-5 py-4 rounded-[16px] border border-gray-100 bg-[#FBFBFC] focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 shadow-sm text-[14px] font-bold outline-none transition-all placeholder:text-gray-500 placeholder:font-medium text-gray-900"
              />
            </div>
            <div className="relative group">
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)} required 
                placeholder="Password (Min. 8 chars)" 
                className="w-full px-5 py-4 rounded-[16px] border border-gray-100 bg-[#FBFBFC] focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 shadow-sm text-[14px] font-bold outline-none transition-all placeholder:text-gray-500 placeholder:font-medium text-gray-900"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-gray-900 text-white rounded-full py-4 text-[15px] font-bold shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Creating account...' : 'Create free account'}
              {!loading && <ArrowRight size={16} className="text-gray-500" />}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] gap-3">
            <div className="h-px bg-gray-100 flex-1"></div>
            <span>or sign up with</span>
            <div className="h-px bg-gray-100 flex-1"></div>
          </div>

          <div className="flex justify-center gap-3 mt-5">
            <button className="flex-1 h-12 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-900 transition-all flex items-center justify-center gap-2.5 text-[13px] font-bold text-gray-900 shadow-sm">
              <Mail size={16} className="text-gray-700" /> Google
            </button>
            <button className="flex-1 h-12 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-900 transition-all flex items-center justify-center gap-2.5 text-[13px] font-bold text-gray-900 shadow-sm">
              <Github size={16} className="text-gray-700" /> GitHub
            </button>
          </div>

          <p className="mt-8 text-center text-[14px] font-medium text-gray-600">
            Already have an account? <Link href="/login" className="text-gray-900 font-black hover:underline underline-offset-4">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Robot character + Restored Intelligent Underwater Background */}
      <div className="hidden md:flex w-1/2 p-10 bg-white relative overflow-hidden">
        <div className="w-full h-full rounded-[40px] relative flex flex-col items-center justify-center gap-8 shadow-inner overflow-hidden border border-black/5" style={{ backgroundImage: "url('/images/underwater.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          
          {/* Ambient Overlay for depth and contrast */}
          <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-0" />



          {/* 3D Watcher Robot character */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="z-10 relative mt-[-20px]"
          >
            <WatcherRobot isPasswordFocused={passwordFocused} />
          </motion.div>

          {/* Bottom text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.8, duration: 1 }}
            className="text-center z-10 px-10 relative bg-white/10 backdrop-blur-md pb-6 pt-5 rounded-3xl border border-white/20 shadow-xl"
          >
            <h3 className="text-[24px] font-black text-white tracking-tighter leading-none mb-3 drop-shadow-md">
              Welcome to <br />FinSight Intelligence.
            </h3>
            <p className="text-[14px] font-semibold text-white/90 tracking-tight leading-relaxed">Your financial data, protected by the most advanced automated security protocols.</p>
          </motion.div>

        </div>
      </div>

    </div>
  );
}
