'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, Shield, ScrollText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared';
import { getDataset } from '@/lib/mock-data';
import { formatDateTime, initials } from '@/lib/fairness';
import { toast } from 'sonner';

export default function AuditLogsPage() {
  const ds = getDataset();
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const resources = Array.from(new Set(ds.auditLogs.map((l) => l.resource)));
  const users = Array.from(new Set(ds.auditLogs.map((l) => l.userName)));

  const filtered = useMemo(() => {
    let list = ds.auditLogs;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) => l.action.toLowerCase().includes(q) || l.userName.toLowerCase().includes(q) || l.resourceId.toLowerCase().includes(q));
    }
    if (userFilter !== 'all') list = list.filter((l) => l.userName === userFilter);
    if (resourceFilter !== 'all') list = list.filter((l) => l.resource === resourceFilter);
    return list;
  }, [ds.auditLogs, search, userFilter, resourceFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'IP'];
    const rows = filtered.map((l) => [l.timestamp, l.userName, l.action, l.resource, l.resourceId, l.ip]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'audit-logs.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log exported', { description: `${filtered.length} records exported as CSV.` });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Audit Logs"
        description={`${filtered.length} immutable records · every action is permanently tracked`}
        actions={<Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-1.5 h-4 w-4" /> Export CSV</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><ScrollText className="h-4 w-4" /></div><div><div className="text-xl font-bold">{ds.auditLogs.length}</div><div className="text-xs text-muted-foreground">Total events</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success"><Shield className="h-4 w-4" /></div><div><div className="text-xl font-bold">{ds.users.length}</div><div className="text-xs text-muted-foreground">Active users</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Filter className="h-4 w-4" /></div><div><div className="text-xl font-bold">{resources.length}</div><div className="text-xs text-muted-foreground">Resource types</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><Shield className="h-4 w-4" /></div><div><div className="text-xl font-bold">100%</div><div className="text-xs text-muted-foreground">Tamper-proof</div></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card className="mb-4"><CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by action, user, or resource ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
          </div>
          <Select value={userFilter} onValueChange={(v) => { setUserFilter(v); setPage(0); }}>
            <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="User" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {users.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={resourceFilter} onValueChange={(v) => { setResourceFilter(v); setPage(0); }}>
            <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Resource" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All resources</SelectItem>
              {resources.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      {/* Log table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Resource</th>
                  <th className="px-4 py-3 font-medium">Resource ID</th>
                  <th className="px-4 py-3 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((l, i) => (
                  <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                    className="border-b last:border-0 hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">{formatDateTime(l.timestamp)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">{initials(l.userName)}</div>
                        <span className="text-xs">{l.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline" className="font-mono text-xs">{l.action}</Badge></td>
                    <td className="px-4 py-3 capitalize text-xs text-muted-foreground">{l.resource}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.resourceId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <span className="text-xs text-muted-foreground">Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
                <span className="text-xs text-muted-foreground px-2">{page + 1} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
