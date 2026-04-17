'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Sun, Moon, LogOut, User as UserIcon, X, Check, Trash2, TrendingUp, Lightbulb, Tag, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/Logo';
import { useTheme } from '@/hooks/useTheme';
import { searchApi, notificationsApi } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ activeTab, onTabChange }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { fmt } = useCurrency();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Notification State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs for click-outside
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userDispRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const [searchMaxWidth, setSearchMaxWidth] = useState(220);

  useOnClickOutside(searchRef, () => setSearchOpen(false));
  useOnClickOutside(notifRef, () => setNotificationsOpen(false));
  useOnClickOutside(userDispRef, () => setDropdownOpen(false));

  // Measure available space for search bar expansion
  useEffect(() => {
    const measure = () => {
      if (!rightColumnRef.current || !searchRef.current) return;
      const colWidth = rightColumnRef.current.getBoundingClientRect().width;
      // icons after search: theme(44) + bell(44) + avatar(56) + gaps(3×12) = 180px
      const reservedForIcons = 180;
      const available = colWidth - reservedForIcons - 16; // 16px breathing room
      setSearchMaxWidth(Math.max(44, Math.min(available, 320)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // The actual functional tabs of the application
  const tabs = ['Dashboard', 'Transactions', 'Insights', 'Predictions'];

  // ─── Search Logic ────────────────────────────────────────────────────────
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 1) handleSearch();
      else setSearchResults(null);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const { data } = await searchApi.global(searchQuery);
      setSearchResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  // ─── Notification Logic ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationsApi.list();
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setNotifications(list);
      setUnreadCount(list.filter((n: any) => !n.isRead).length);
    } catch (e) {
      console.error(e);
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30s poll
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const markRead = async (id: string) => {
    await notificationsApi.read(id);
    fetchNotifications();
  };

  const archiveNotify = async (id: string) => {
    await notificationsApi.archive(id);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await notificationsApi.readAll();
    fetchNotifications();
  };

  return (
    <div className="w-full flex items-center justify-between px-8 py-5 relative z-[100]">
      {/* Brand - Left Column */}
      <div className="flex-1 flex justify-start min-w-0">
        <Link href="/dashboard" className="flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer focus:outline-none">
            <Logo />
          </div>
        </Link>
      </div>

      {/* Pill Nav - Center Column — lower z so expanded search appears on top */}
      <div className="flex-none relative z-10">
        <div className="hidden md:flex bg-gray-100/80 dark:bg-[#131823] dark:border border-white/10 rounded-full p-1.5 shadow-xl backdrop-blur-sm">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-semibold ${
                activeTab === tab
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Right Actions - Right Column */}
      <div className="flex-1 flex items-center gap-3 justify-end min-w-0" ref={rightColumnRef}>
        {/* Search — fixed 44px in flow; expands leftward via absolute overlay */}
        <div className="relative flex-shrink-0 h-11 w-11" ref={searchRef}>
          {/* Expanding pill — absolutely positioned growing leftward, z above pill nav */}
          <motion.div
            initial={false}
            animate={{ width: searchOpen ? searchMaxWidth : 44 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="absolute right-0 top-0 h-11 bg-gray-100/80 dark:bg-[#131823] dark:border border-white/10 rounded-full flex items-center shadow-inner overflow-hidden z-[60]"
          >
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-11 h-11 flex-shrink-0 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Search size={18} />
            </button>
            <input
              placeholder="Search anything..."
              className="flex-1 min-w-0 h-full !bg-transparent !border-none !outline-none !shadow-none !ring-0 text-sm text-gray-900 dark:text-white pr-4 placeholder:text-gray-400 font-medium"
              style={{ background: 'none', border: 'none', boxShadow: 'none' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
            />
          </motion.div>

          {/* Search results dropdown */}
          <AnimatePresence>
            {searchOpen && searchQuery.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-3 w-[450px] bg-white dark:bg-[#131823] border border-gray-200 dark:border-white/10 rounded-[24px] shadow-2xl overflow-hidden z-[100]"
              >
                <div className="p-4 max-h-[500px] overflow-y-auto">
                  {searching ? (
                    <div className="py-8 text-center text-sm text-gray-400">Searching...</div>
                  ) : !searchResults ? (
                    <div className="py-8 text-center text-sm text-gray-400">Loading results...</div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {searchResults.transactions?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3 px-2">
                            <Tag size={12} className="text-purple-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Transactions</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {searchResults.transactions.map((tx: any) => (
                              <div key={tx.id} className="p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl flex items-center justify-between transition group cursor-pointer border border-transparent hover:border-purple-500/20">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-600 uppercase border border-purple-500/10">
                                    {tx.merchant?.[0] || 'T'}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{tx.merchant || 'Unknown'}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{tx.category?.name} • {new Date(tx.date).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <span className="text-sm font-black text-gray-900 dark:text-white">{fmt(tx.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {searchResults.insights?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3 px-2">
                            <Lightbulb size={12} className="text-amber-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Insights</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {searchResults.insights.map((ins: any) => (
                              <div key={ins.id} className="p-3 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 rounded-xl flex items-start gap-3 transition cursor-pointer border border-transparent hover:border-amber-500/20 group">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                                  <Zap size={16} className="text-amber-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <p className="text-xs text-gray-700 dark:text-white leading-relaxed font-medium">{ins.message}</p>
                                  <span className="text-[10px] text-amber-600/60 font-bold uppercase tracking-tighter">AI Analysis</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {searchResults.predictions?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3 px-2">
                            <TrendingUp size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Forecasts</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {searchResults.predictions.map((p: any, i: number) => (
                              <div key={i} className="p-3 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 rounded-xl flex items-center justify-between transition cursor-pointer border border-transparent hover:border-emerald-500/20">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{p.category}</span>
                                <div className="flex flex-col items-end">
                                  <span className="text-xs font-black text-emerald-500">{fmt(p.projectedAmount)}</span>
                                  <span className="text-[9px] uppercase font-bold text-gray-400">Projected</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggle}
          className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-100/80 dark:bg-[#131823] border border-transparent dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm dark:shadow-none hover:shadow-md"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative flex-shrink-0" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-11 h-11 rounded-full bg-gray-100/80 dark:bg-[#131823] border border-transparent dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm dark:shadow-none hover:shadow-md relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-background"></div>
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#131823] border border-gray-200 dark:border-white/10 rounded-[24px] shadow-2xl overflow-hidden z-[100]"
              >
                <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] font-bold text-purple-500 hover:text-purple-600">Mark all read</button>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400">No notifications yet</div>
                  ) : (
                    notifications.map((n: any) => (
                      <div key={n.id} className={`p-4 border-b border-gray-50 dark:border-white/5 flex gap-3 group transition hover:bg-gray-50 dark:hover:bg-white/[0.03] ${!n.isRead ? 'bg-purple-500/[0.03]' : ''}`}>
                        <div className="flex-1">
                          <p className={`text-xs leading-relaxed ${!n.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{n.message}</p>
                          <span className="text-[10px] text-gray-400 block mt-1">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => markRead(n.id)} className="p-1 hover:bg-green-500/10 text-gray-400 hover:text-green-500 rounded"><Check size={12} /></button>
                          <button onClick={() => archiveNotify(n.id)} className="p-1 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded"><X size={12} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Dropdown */}
        <div className="relative flex-shrink-0" ref={userDispRef}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 cursor-pointer ml-2 shadow-[0_0_15px_rgba(192,132,252,0.3)] hover:shadow-[0_0_20px_rgba(192,132,252,0.5)] transition-shadow"
          >
            <div className="w-full h-full rounded-full bg-white dark:bg-[#131823] flex items-center justify-center overflow-hidden">
              <span className="text-gray-900 dark:text-white font-bold text-sm">{user?.name ? user.name[0].toUpperCase() : 'A'}</span>
            </div>
          </div>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-14 w-60 bg-white dark:bg-[#131823] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2"
              >
                <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'email@example.com'}</p>
                </div>
                <div className="py-2">
                  <Link href="/settings" onClick={() => setDropdownOpen(false)}>
                    <div className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition">
                      <UserIcon size={16} /> Profile Settings
                    </div>
                  </Link>
                  <div
                    onClick={() => { toggle(); setDropdownOpen(false); }}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition"
                  >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </div>
                </div>
                <div className="py-2 border-t border-gray-100 dark:border-white/5">
                  <div
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition"
                  >
                    <LogOut size={16} /> Logout
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
