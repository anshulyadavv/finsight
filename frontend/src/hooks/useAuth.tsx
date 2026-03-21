'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

interface User { id: string; name: string; email: string; currency: string; }

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      authApi.me()
        .then((r) => setUser(r.data.data))
        .catch(() => { Cookies.remove('accessToken'); Cookies.remove('refreshToken'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    const { user: u, tokens } = data.data;
    Cookies.set('accessToken',  tokens.accessToken,  { expires: 1 });
    Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
    setUser(u);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authApi.register({ name, email, password });
    const { user: u, tokens } = data.data;
    Cookies.set('accessToken',  tokens.accessToken,  { expires: 1 });
    Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
    setUser(u);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
