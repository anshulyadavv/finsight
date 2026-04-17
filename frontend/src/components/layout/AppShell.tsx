'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import Logo from '@/components/ui/Logo';

interface Props { children: React.ReactNode; }

const ROUTE_MAP: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/insights':     'Insights',
  '/predictions':  'Predictions',
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

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.1,
            filter: 'blur(10px)',
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0E17]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.05, 1], 
              opacity: 1,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Animated Glow / Pulse */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.5, 0.2] 
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"
            />
            
            <Logo size="lg" iconOnly className="relative z-10" />
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 flex flex-col items-center gap-2"
            >
              <p className="text-white font-black tracking-[0.3em] uppercase text-[10px] opacity-40">Intelligence Loading</p>
              <div className="w-12 h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: [-48, 48] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : user ? (
        <motion.div
          key="content"
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="min-h-screen flex flex-col"
          style={{ background: 'var(--bg)', transition: 'background 0.3s' }}
        >
          <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
