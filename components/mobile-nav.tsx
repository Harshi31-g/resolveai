'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { ROLE_LABELS } from '@/lib/nav';
import {
  LayoutDashboard, FolderKanban, FileSearch, BrainCircuit,
  GitBranch, BarChart3, ScrollText, Settings,
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

const NAV: { href: string; label: string; icon: typeof LayoutDashboard; roles: UserRole[] }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'investigator', 'merchant', 'cardmember'] },
  { href: '/disputes', label: 'Disputes', icon: FolderKanban, roles: ['admin', 'investigator', 'merchant', 'cardmember'] },
  { href: '/evidence', label: 'Evidence', icon: FileSearch, roles: ['admin', 'investigator', 'merchant'] },
  { href: '/ai-investigator', label: 'AI Investigator', icon: BrainCircuit, roles: ['admin', 'investigator'] },
  { href: '/explainability', label: 'Explainability', icon: GitBranch, roles: ['admin', 'investigator'] },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'investigator'] },
  { href: '/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['admin', 'investigator'] },
  { href: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
];

export function MobileNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = NAV.filter((n) => user && n.roles.includes(user.role));
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Scale className="h-5 w-5" />
        </div>
        <span className="font-display text-lg font-bold">ResolveAI</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3 text-xs text-muted-foreground">
        Signed in as {user ? ROLE_LABELS[user.role] : ''}
      </div>
    </div>
  );
}
