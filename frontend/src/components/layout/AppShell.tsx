'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Logo from '@/components/ui/Logo';

interface Props { children: React.ReactNode; }

const ROUTE_MAP: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/insights':     'Insights',
  '/predictions':  'Predictions',
  '/assets':       'Assets',
  '/goals':        'Goals',
};

const TAB_ROUTES: Record<string, string> = {
  Dashboard:    '/dashboard',
  Transactions: '/transactions',
  Insights:     '/insights',
  Predictions:  '/predictions',
  Assets:       '/assets',
  Goals:        '/goals',
};

export default function AppShell({ children }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router   = useRouter();
  const pathname = usePathname();
  const activeTab = ROUTE_MAP[pathname] || 'Dashboard';

  // Ensure high-impact preloader displays for at least 2.5 seconds
  const [minLoadingDone, setMinLoadingDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingDone(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Synchronize dashboard theme boundary to html root while inside AppShell
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Cleanup: reset document element back to clean light mode when navigating away from AppShell
    return () => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    };
  }, [theme]);

  const showPreloader = authLoading || !minLoadingDone;

  useEffect(() => {
    if (!showPreloader && !user) {
      router.push('/login');
    }
  }, [user, showPreloader, router]);

  const handleTabChange = (tab: string) => {
    const route = TAB_ROUTES[tab];
    if (route && route !== pathname) router.push(route);
  };

  return (
    <AnimatePresence mode="wait">
      {showPreloader ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.05,
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
                scale: [1, 1.25, 1],
                opacity: [0.2, 0.55, 0.2] 
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"
            />
            
            <Logo size="lg" variant="mono-light" className="relative z-10" />
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 flex flex-col items-center"
            >
              <div className="w-24 h-[3px] bg-white/[0.08] rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: [-96, 96] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : user ? (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', transition: 'background 0.3s' }}>
          <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
          <AnimatePresence mode="wait">
            <motion.main 
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1"
            >
              {children}
            </motion.main>
          </AnimatePresence>
          <Footer />
        </div>
      ) : null}
    </AnimatePresence>
  );
}
