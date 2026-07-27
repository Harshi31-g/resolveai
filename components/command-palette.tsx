'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, FileText, BrainCircuit, BarChart3, FolderKanban, Settings, FileSearch, GitBranch, ScrollText, LayoutDashboard, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getDataset } from '@/lib/mock-data';

const PAGES = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Disputes', href: '/disputes', icon: FolderKanban },
  { label: 'Evidence', href: '/evidence', icon: FileSearch },
  { label: 'AI Investigator', href: '/ai-investigator', icon: BrainCircuit },
  { label: 'Explainability', href: '/explainability', icon: GitBranch },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Audit Logs', href: '/audit-logs', icon: ScrollText },
  { label: 'Admin', href: '/admin', icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const disputes = getDataset().disputes;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
    setSearch('');
  };

  const matchedDisputes = search
    ? disputes.filter((d) =>
        (d.caseNumber + d.reasonDescription).toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors w-56"
      >
        <Search className="h-4 w-4" />
        <span>Search or jump to...</span>
        <kbd className="ml-auto rounded bg-background px-1.5 py-0.5 text-[10px] font-medium border">⌘K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden">
          <Command className="rounded-lg" loop>
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command.Input
                placeholder="Search pages, disputes, or actions..."
                value={search}
                onValueChange={setSearch}
                className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List className="max-h-[320px] overflow-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>
              <Command.Group heading="Pages" className="text-sm">
                {PAGES.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Command.Item
                      key={p.href}
                      value={p.label}
                      onSelect={() => go(p.href)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 aria-selected:bg-accent cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{p.label}</span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 aria-selected:opacity-100" />
                    </Command.Item>
                  );
                })}
              </Command.Group>
              {matchedDisputes.length > 0 && (
                <Command.Group heading="Disputes" className="text-sm">
                  {matchedDisputes.map((d) => (
                    <Command.Item
                      key={d.id}
                      value={d.caseNumber + ' ' + d.reasonDescription}
                      onSelect={() => go(`/disputes/${d.id}`)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 aria-selected:bg-accent cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{d.caseNumber}</div>
                        <div className="text-xs text-muted-foreground truncate">{d.reasonDescription}</div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
