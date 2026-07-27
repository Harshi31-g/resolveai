'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/top-bar';
import type { UserRole } from '@/lib/types';

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/dashboard',
  investigator: '/dashboard',
  merchant: '/dashboard',
  cardmember: '/dashboard',
};

export function AppShell({ children, requireRoles }: { children: React.ReactNode; requireRoles?: UserRole[] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    else if (user && requireRoles && !requireRoles.includes(user.role))
      router.replace(ROLE_HOME[user.role]);
  }, [user, loading, router, requireRoles]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-muted-foreground">Loading workspace…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
