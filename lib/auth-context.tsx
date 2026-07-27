'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, UserRole } from './types';
import { getDataset } from './mock-data';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => void;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'resolveai.session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const id = JSON.parse(raw).userId as string;
        const found = getDataset().users.find((u) => u.id === id);
        if (found) setUser(found);
      }
    } catch {}
    setLoading(false);
  }, []);

  const persist = (u: User | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: u.id }));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = (email: string, role: UserRole = 'investigator') => {
    const ds = getDataset();
    const found = ds.users.find((u) => u.email === email) ||
      ds.users.find((u) => u.role === role);
    if (found) { setUser(found); persist(found); }
  };

  const loginAs = (role: UserRole) => {
    const found = getDataset().users.find((u) => u.role === role);
    if (found) { setUser(found); persist(found); }
  };

  const logout = () => { setUser(null); persist(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
