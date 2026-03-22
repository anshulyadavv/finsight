'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface Props { children: React.ReactNode; }

const ROUTE_MAP: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/insights':     'Insights',
  '/predictions':  'Predictions',
  '/settings':     'Dashboard',
};

const TAB_ROUTES: Record<string, string> = {
  Dashboard:    '/dashboard',
  Transactions: '/transactions',
  Insights:     '/insights',
  Predictions:  '/predictions',
};

export default function AppShell({ children }: Props) {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const activeTab = ROUTE_MAP[pathname] || 'Dashboard';

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleTabChange = (tab: string) => {
    const route = TAB_ROUTES[tab];
    if (route && route !== pathname) router.push(route);
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>
        <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="#0f766e" opacity="0.1"/>
          <rect x="5" y="16" width="4" height="8" rx="2" fill="#0f766e"/>
          <rect x="12" y="10" width="4" height="14" rx="2" fill="#14b8a6"/>
          <rect x="19" y="4" width="4" height="20" rx="2" fill="#22c55e"/>
        </svg>
        <p style={{ fontSize:'14px', color:'var(--text3)', fontFamily:'DM Sans, sans-serif' }}>Loading FinSight…</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      <main style={{ flex:1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}