'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, FileSearch, BrainCircuit,
  GitBranch, BarChart3, ScrollText, Settings, Scale, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'investigator', 'merchant', 'cardmember'] },
  { href: '/disputes', label: 'Disputes', icon: FolderKanban, roles: ['admin', 'investigator', 'merchant', 'cardmember'] },
  { href: '/evidence', label: 'Evidence', icon: FileSearch, roles: ['admin', 'investigator', 'merchant'] },
  { href: '/ai-investigator', label: 'AI Investigator', icon: BrainCircuit, roles: ['admin', 'investigator'] },
  { href: '/explainability', label: 'Explainability', icon: GitBranch, roles: ['admin', 'investigator'] },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'investigator'] },
  { href: '/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['admin', 'investigator'] },
  { href: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = NAV.filter((n) => user && n.roles.includes(user.role));

  return (
    <aside className="hidden md:flex w-60 flex-col border-r bg-card/40 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Scale className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">ResolveAI</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className={cn('relative h-4 w-4', active && 'text-primary')} />
              <span className="relative">{item.label}</span>
              {active && <ChevronRight className="relative ml-auto h-4 w-4 text-primary" />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="font-medium text-foreground">System operational</span>
          </div>
          <div>Fairness Engine v2.3.1</div>
        </div>
      </div>
    </aside>
  );
}
