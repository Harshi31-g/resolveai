'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(su: SupabaseUser, profile: { full_name: string; role: string } | null): User {
  return {
    id: su.id,
    email: su.email || '',
    name: profile?.full_name || su.user_metadata?.full_name || su.email?.split('@')[0] || 'User',
    role: (profile?.role || su.user_metadata?.role || 'investigator') as User['role'],
    avatar: '',
    createdAt: su.created_at || new Date().toISOString(),
    lastActive: new Date().toISOString(),
    status: 'active',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      if (!mounted) return;
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .maybeSingle();
        if (mounted) setUser(mapUser(session.user, profile));
      }
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', session.user.id)
            .maybeSingle();
          if (mounted) setUser(mapUser(session.user, profile));
        } else {
          if (mounted) setUser(null);
        }
        if (mounted) setLoading(false);
      })();
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, role: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });
    if (error) return { error: error.message };
    if (data.user && !data.session) {
      return { error: 'Check your email to confirm your account.' };
    }
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
