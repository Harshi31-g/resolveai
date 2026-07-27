'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  Filter, Download, FileSearch, Plus, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared';
import { useDisputes, useMerchants, useCardMembers, useCreateDispute } from '@/lib/data-hooks';
import { formatCurrency, formatRelative, outcomeColor, outcomeLabel, priorityColor, statusColor } from '@/lib/fairness';
import { toast } from 'sonner';
import type { Dispute, DisputeReason, Merchant, CardMember } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  open: 'Open', evidence_gathering: 'Gathering', under_review: 'Under Review',
  ai_review: 'AI Review', pending_decision: 'Pending', resolved: 'Resolved',
  appealed: 'Appealed', closed: 'Closed',
};

const REASON_OPTIONS: { value: DisputeReason; label: string; description: string }[] = [
  { value: 'fraud', label: 'Fraud', description: 'Transaction not recognized by cardholder' },
  { value: 'unauthorized', label: 'Unauthorized', description: 'Cardholder denies authorizing the charge' },
  { value: 'product_not_received', label: 'Product Not Received', description: 'Goods or services never delivered' },
  { value: 'product_unacceptable', label: 'Product Unacceptable', description: 'Product differs materially from description' },
  { value: 'duplicate_charge', label: 'Duplicate Charge', description: 'Same transaction processed more than once' },
  { value: 'subscription_cancelled', label: 'Subscription Cancelled', description: 'Subscription cancelled but still billed' },
  { value: 'credit_not_processed', label: 'Credit Not Processed', description: 'Refund promised but never received' },
  { value: 'incorrect_amount', label: 'Incorrect Amount', description: 'Charged amount exceeds authorized amount' },
];

type SortKey = 'caseNumber' | 'amount' | 'aiConfidence' | 'fairnessScore' | 'createdAt' | 'updatedAt' | 'priority';
type SortDir = 'asc' | 'desc';

const PRIORITY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };

export default function DisputesPage() {
  const router = useRouter();
  const { data: disputes = [], isLoading } = useDisputes() as { data: Dispute[]; isLoading: boolean };
  const { data: merchants = [] } = useMerchants() as { data: Merchant[] };
  const { data: cardMembers = [] } = useCardMembers() as { data: CardMember[] };
  const { mutateAsync: createDisputeAsync } = useCreateDispute();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [merchantFilter, setMerchantFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // New dispute dialog state
  const [newOpen, setNewOpen] = useState(false);
  const [ndMerchant, setNdMerchant] = useState('');
  const [ndCustomer, setNdCustomer] = useState('');
  const [ndAmount, setNdAmount] = useState('');
  const [ndReason, setNdReason] = useState<DisputeReason>('fraud');
  const [ndDesc, setNdDesc] = useState('');
  const [ndSaving, setNdSaving] = useState(false);

  const resetNewForm = () => {
    setNdMerchant(''); setNdCustomer(''); setNdAmount('');
    setNdReason('fraud'); setNdDesc('');
  };

  const createDispute = async () => {
    if (!ndMerchant || !ndCustomer || !ndAmount) {
      toast.error('Please fill in all required fields');
      return;
    }
    const amount = parseFloat(ndAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const reasonOpt = REASON_OPTIONS.find((r) => r.value === ndReason)!;
    setNdSaving(true);
    try {
      const created = await createDisputeAsync({
        merchantId: ndMerchant,
        cardMemberId: ndCustomer,
        amount,
        reason: ndReason,
        reasonDescription: ndDesc || reasonOpt.description,
      });
      setNewOpen(false);
      resetNewForm();
      toast.success('Dispute created', { description: `${created.caseNumber} has been filed.` });
      router.push(`/disputes/${created.id}`);
    } catch (err) {
      toast.error('Failed to create dispute', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setNdSaving(false);
    }
  };

  const filtered = useMemo<Dispute[]>(() => {
    let list: Dispute[] = disputes;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d) =>
        d.caseNumber.toLowerCase().includes(q) ||
        d.reasonDescription.toLowerCase().includes(q) ||
        merchants.find((m) => m.id === d.merchantId)?.name.toLowerCase().includes(q) ||
        cardMembers.find((c) => c.id === d.cardMemberId)?.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter((d) => d.status === statusFilter);
    if (priorityFilter !== 'all') list = list.filter((d) => d.priority === priorityFilter);
    if (merchantFilter !== 'all') list = list.filter((d) => d.merchantId === merchantFilter);
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'priority') cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      else if (sortKey === 'amount') cmp = a.amount - b.amount;
      else if (sortKey === 'aiConfidence') cmp = a.aiConfidence - b.aiConfidence;
      else if (sortKey === 'fairnessScore') cmp = a.fairnessScore - b.fairnessScore;
      else if (sortKey === 'caseNumber') cmp = a.caseNumber.localeCompare(b.caseNumber);
      else if (sortKey === 'createdAt') cmp = +new Date(a.createdAt) - +new Date(b.createdAt);
      else cmp = +new Date(a.updatedAt) - +new Date(b.updatedAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [disputes, merchants, cardMembers, search, statusFilter, priorityFilter, merchantFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Disputes"
        description={`${filtered.length} cases · ${disputes.filter((d) => !['resolved', 'closed'].includes(d.status)).length} active`}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => setNewOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> New dispute</Button>
          </>
        }
      />

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by case number, merchant, customer, or reason..."
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full lg:w-40"><Filter className="mr-1.5 h-3.5 w-3.5" /><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={merchantFilter} onValueChange={(v) => { setMerchantFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Merchant" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All merchants</SelectItem>
                {merchants.slice(0, 15).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading disputes…</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort('caseNumber')}>
                        <span className="flex items-center gap-1.5">Case <SortIcon k="caseNumber" /></span>
                      </th>
                      <th className="px-4 py-3 font-medium">Merchant / Customer</th>
                      <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort('amount')}>
                        <span className="flex items-center gap-1.5">Amount <SortIcon k="amount" /></span>
                      </th>
                      <th className="px-4 py-3 font-medium">Reason</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort('priority')}>
                        <span className="flex items-center gap-1.5">Priority <SortIcon k="priority" /></span>
                      </th>
                      <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort('aiConfidence')}>
                        <span className="flex items-center gap-1.5">Confidence <SortIcon k="aiConfidence" /></span>
                      </th>
                      <th className="px-4 py-3 font-medium">Investigator</th>
                      <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort('updatedAt')}>
                        <span className="flex items-center gap-1.5">Updated <SortIcon k="updatedAt" /></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((d, i) => {
                      const m = merchants.find((x) => x.id === d.merchantId);
                      const c = cardMembers.find((x) => x.id === d.cardMemberId);
                      return (
                        <motion.tr
                          key={d.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                          className="border-b last:border-0 hover:bg-accent/40 transition-colors cursor-pointer group"
                          onClick={() => window.location.href = `/disputes/${d.id}`}
                        >
                          <td className="px-4 py-3">
                            <Link href={`/disputes/${d.id}`} className="font-mono font-medium text-primary hover:underline">
                              {d.caseNumber}
                            </Link>
                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[180px]">{d.reasonDescription}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium truncate max-w-[160px]">{m?.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[160px]">{c?.name}</div>
                          </td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(d.amount)}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs capitalize max-w-[140px] truncate">{d.reason.replace(/_/g, ' ')}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(d.status)}`}>
                              {STATUS_LABELS[d.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityColor(d.priority)}`}>
                              {d.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                                <div className={`h-full ${d.aiConfidence > 0.85 ? 'bg-success' : d.aiConfidence >= 0.6 ? 'bg-warning' : 'bg-destructive'}`}
                                  style={{ width: `${d.aiConfidence * 100}%` }} />
                              </div>
                              <span className="text-xs font-medium">{Math.round(d.aiConfidence * 100)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{d.assignedInvestigatorName || 'Unassigned'}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelative(d.updatedAt)}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pageItems.length === 0 && (
                <div className="py-16 text-center">
                  <FileSearch className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <p className="mt-3 text-sm text-muted-foreground">No disputes match your filters.</p>
                  <Button variant="outline" size="sm" className="mt-3"
                    onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); setMerchantFilter('all'); }}>
                    Clear filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">{page + 1} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* New Dispute Dialog */}
      <Dialog open={newOpen} onOpenChange={(o) => { setNewOpen(o); if (!o) resetNewForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>File a new dispute</DialogTitle>
            <DialogDescription>
              Create a new dispute case. You'll be taken to the case detail page after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Merchant <span className="text-destructive">*</span></Label>
              <Select value={ndMerchant} onValueChange={setNdMerchant}>
                <SelectTrigger><SelectValue placeholder="Select a merchant" /></SelectTrigger>
                <SelectContent>
                  {merchants.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Card Member <span className="text-destructive">*</span></Label>
              <Select value={ndCustomer} onValueChange={setNdCustomer}>
                <SelectTrigger><SelectValue placeholder="Select a card member" /></SelectTrigger>
                <SelectContent>
                  {cardMembers.slice(0, 25).map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · ••{c.cardLast4}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nd-amount">Amount (USD) <span className="text-destructive">*</span></Label>
                <Input id="nd-amount" type="number" min="0" step="0.01" placeholder="349.99" value={ndAmount} onChange={(e) => setNdAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={ndReason} onValueChange={(v) => setNdReason(v as DisputeReason)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REASON_OPTIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nd-desc">Description (optional)</Label>
              <Textarea id="nd-desc" placeholder="Additional details about the dispute..." value={ndDesc} onChange={(e) => setNdDesc(e.target.value)} className="min-h-[70px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewOpen(false); resetNewForm(); }}>Cancel</Button>
            <Button onClick={createDispute} disabled={ndSaving}>
              {ndSaving ? 'Creating…' : 'Create dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
