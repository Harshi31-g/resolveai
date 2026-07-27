'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  FolderKanban, Clock, CheckCircle2, Scale, BrainCircuit,
  ArrowRight, TrendingUp, Activity, AlertTriangle, FileSearch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard, PageHeader } from '@/components/shared';
import { useDisputes, useMerchants } from '@/lib/data-hooks';
import { formatCurrency, formatRelative, outcomeColor, outcomeLabel, priorityColor, statusColor } from '@/lib/fairness';
import { useAuth } from '@/lib/auth-context';
import type { Dispute, Merchant } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  open: 'Open', evidence_gathering: 'Gathering', under_review: 'Under Review',
  ai_review: 'AI Review', pending_decision: 'Pending', resolved: 'Resolved',
  appealed: 'Appealed', closed: 'Closed',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: disputes = [], isLoading } = useDisputes() as { data: Dispute[]; isLoading: boolean };
  const { data: merchants = [] } = useMerchants() as { data: Merchant[]; isLoading: boolean };

  if (isLoading || disputes.length === 0) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm text-muted-foreground">Loading dashboard…</span>
          </div>
        </div>
      </div>
    );
  }
  const active = disputes.filter((d) => !['resolved', 'closed'].includes(d.status)).length;
  const pending = disputes.filter((d) => ['pending_decision', 'ai_review'].includes(d.status)).length;
  const resolvedToday = disputes.filter((d) => d.status === 'resolved').length;
  const avgFairness = (disputes.reduce((s, d) => s + d.fairnessScore, 0) / disputes.length).toFixed(2);
  const avgConfidence = Math.round(disputes.reduce((s, d) => s + d.aiConfidence, 0) / disputes.length * 100);

  // Disputes over time (last 12 weeks)
  const overTime = Array.from({ length: 12 }).map((_, i) => ({
    week: `W${i + 1}`,
    disputes: Math.floor(8 + Math.sin(i / 2) * 4 + (i * 1.2) + Math.random() * 4),
    resolved: Math.floor(6 + Math.sin(i / 2) * 3 + (i * 1.1) + Math.random() * 3),
  }));

  const merchantSuccess = disputes
    .filter((d) => d.decision)
    .reduce((acc, d) => {
      const m = merchants.find((x) => x.id === d.merchantId);
      if (m) acc[m.name] = (acc[m.name] || 0) + (d.decision!.outcome === 'approve_merchant' ? 1 : 0);
      return acc;
    }, {} as Record<string, number>);
  const topMerchants = Object.entries(merchantSuccess)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, value]) => ({ name: name.split(' ')[0], value }));

  const customerSuccess = disputes.filter((d) => d.decision).reduce((acc, d) => {
    acc[d.reason] = (acc[d.reason] || 0) + (d.decision!.outcome === 'refund_customer' ? 1 : 0);
    return acc;
  }, {} as Record<string, number>);
  const customerData = Object.entries(customerSuccess).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').slice(0, 14), value,
  })).slice(0, 6);

  const distribution = [
    { name: 'Resolved', value: disputes.filter((d) => d.status === 'resolved').length, color: 'hsl(142 71% 45%)' },
    { name: 'Under Review', value: disputes.filter((d) => d.status === 'under_review').length, color: 'hsl(217 91% 60%)' },
    { name: 'Appealed', value: disputes.filter((d) => d.status === 'appealed').length, color: 'hsl(340 75% 55%)' },
    { name: 'Gathering', value: disputes.filter((d) => d.status === 'evidence_gathering').length, color: 'hsl(38 92% 50%)' },
    { name: 'Other', value: disputes.filter((d) => !['resolved', 'under_review', 'appealed', 'evidence_gathering'].includes(d.status)).length, color: 'hsl(280 65% 60%)' },
  ];

  const recent = [...disputes].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 6);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}`}
        description="Here's what's happening across your dispute portfolio today."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/analytics">View analytics</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/disputes">All disputes <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard label="Active Cases" value={active} icon={FolderKanban} color="text-blue-600" delay={0} trend={{ value: '12%', positive: false }} />
        <MetricCard label="Pending Reviews" value={pending} icon={Clock} color="text-amber-600" delay={0.05} trend={{ value: '8%', positive: true }} />
        <MetricCard label="Resolved Today" value={resolvedToday} icon={CheckCircle2} color="text-emerald-600" delay={0.1} trend={{ value: '24%', positive: true }} />
        <MetricCard label="Fairness Score" value={avgFairness} icon={Scale} color="text-violet-600" delay={0.15} sub="avg across all cases" />
        <MetricCard label="Avg Resolution" value="4.2h" icon={Clock} color="text-cyan-600" delay={0.2} trend={{ value: '18%', positive: true }} />
        <MetricCard label="AI Confidence" value={`${avgConfidence}%`} icon={BrainCircuit} color="text-indigo-600" delay={0.25} sub="model v2.3.1" />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Disputes Over Time</CardTitle>
                <CardDescription>New disputes vs. resolved, last 12 weeks</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={overTime} margin={{ left: -16, right: 8 }}>
                <defs>
                  <linearGradient id="gDisputes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="disputes" stroke="hsl(217 91% 60%)" strokeWidth={2} fill="url(#gDisputes)" name="New" />
                <Area type="monotone" dataKey="resolved" stroke="hsl(142 71% 45%)" strokeWidth={2} fill="url(#gResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Distribution</CardTitle>
            <CardDescription>By current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {distribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {distribution.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Merchant Success Rate</CardTitle>
            <CardDescription>Wins per merchant (top 5)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topMerchants} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(217 91% 60%)" radius={[6, 6, 0, 0]} name="Wins" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Success by Reason</CardTitle>
            <CardDescription>Refunds granted per dispute reason</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={customerData} layout="vertical" margin={{ left: 24, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={90} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(142 71% 45%)" radius={[0, 6, 6, 0]} name="Refunds" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest dispute updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/disputes">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recent.map((d, i) => {
              const m = merchants.find((x) => x.id === d.merchantId);
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/disputes/${d.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/60 transition-colors group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                      <FileSearch className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm font-mono">{d.caseNumber}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(d.status)}`}>
                          {STATUS_LABELS[d.status]}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColor(d.priority)}`}>
                          {d.priority}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {m?.name} · {formatCurrency(d.amount)} · {d.reasonDescription}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className="text-sm font-medium">{Math.round(d.aiConfidence * 100)}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Updated</div>
                        <div className="text-sm font-medium">{formatRelative(d.updatedAt)}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
