import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, API_BASE } from '../lib/api';
import type { Profile } from '../types';

type AuthStatus = 'checking' | 'authenticated' | 'anonymous' | 'expired';

interface AuthValue {
  user: Profile | null;
  status: AuthStatus;
  loginUrl: string;
  refresh: () => Promise<Profile | null>;
  completeLogin: (token: string) => Promise<Profile>;
  logout: (reason?: 'expired') => void;
}

const AuthContext = createContext<AuthValue | null>(null);
const TOKEN_KEY = 'cs2squad_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');

  const logout = useCallback((reason?: 'expired') => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus(reason === 'expired' ? 'expired' : 'anonymous');
  }, []);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setStatus('anonymous');
      return null;
    }
    try {
      const profile = await api.profile(token);
      setUser(profile);
      setStatus('authenticated');
      return profile;
    } catch {
      logout('expired');
      return null;
    }
  }, [logout]);

  const completeLogin = useCallback(async (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    const profile = await api.profile(token);
    setUser(profile);
    setStatus('authenticated');
    return profile;
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const handleExpiry = () => logout('expired');
    window.addEventListener('cs2squad:session-expired', handleExpiry);
    return () => window.removeEventListener('cs2squad:session-expired', handleExpiry);
  }, [logout]);

  const value = useMemo<AuthValue>(() => ({
    user,
    status,
    loginUrl: `${API_BASE}/auth/steam`,
    refresh,
    completeLogin,
    logout,
  }), [completeLogin, logout, refresh, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
