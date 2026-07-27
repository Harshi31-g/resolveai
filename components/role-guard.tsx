'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';

export function RoleGuard({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user && !roles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [user, loading, roles, router]);
  if (loading) return null;
  if (user && !roles.includes(user.role)) {
    return <div className="p-8 text-center text-muted-foreground">You don't have access to this page.</div>;
  }
  return <>{children}</>;
}
