'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, SlidersHorizontal, FileText, Cpu, MessageSquare,
  Flag, Plus, Save, Shield, Check, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared';
import { getDataset } from '@/lib/mock-data';
import { ROLE_LABELS } from '@/lib/nav';
import { formatRelative, initials } from '@/lib/fairness';
import { toast } from 'sonner';

const PROMPT_TEMPLATES = [
  { id: 'pt1', name: 'Dispute Summary', template: 'Summarize dispute {{case_number}} including amount, reason, evidence, and current status.' },
  { id: 'pt2', name: 'Decision Explanation', template: 'Explain the AI decision for {{case_number}} using the reasoning chain and evidence weights.' },
  { id: 'pt3', name: 'Customer Notification', template: 'Write a customer-friendly notification for {{case_number}} explaining the outcome of {{outcome}}.' },
  { id: 'pt4', name: 'Audit Report', template: 'Generate a compliance audit report for {{case_number}} with policy references and decision pathway.' },
];

const FEATURE_FLAGS = [
  { id: 'ff1', name: 'Auto-resolution', desc: 'Allow AI to auto-resolve cases above 85% confidence', enabled: true },
  { id: 'ff2', name: 'Real-time notifications', desc: 'WebSocket push for status changes', enabled: true },
  { id: 'ff3', name: 'Advanced OCR pipeline', desc: 'Use GPT-4 Vision for document parsing', enabled: true },
  { id: 'ff4', name: 'Sentiment analysis', desc: 'Analyze customer message tone', enabled: false },
  { id: 'ff5', name: 'Multi-language support', desc: 'Translate evidence and messages', enabled: false },
  { id: 'ff6', name: 'Predictive churn flagging', desc: 'Flag merchants with high dispute risk', enabled: true },
];

export default function AdminPage() {
  const ds = getDataset();
  const [autoThreshold, setAutoThreshold] = useState(85);
  const [humanThreshold, setHumanThreshold] = useState(60);
  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const [templates, setTemplates] = useState(PROMPT_TEMPLATES);

  const saveThresholds = () => toast.success('Thresholds saved', { description: `Auto-resolve ≥ ${autoThreshold}%, human review ≥ ${humanThreshold}%` });
  const toggleFlag = (id: string) => {
    setFlags((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled } : f));
    const f = flags.find((x) => x.id === id);
    toast.success(`${f?.name} ${f?.enabled ? 'disabled' : 'enabled'}`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Admin"
        description="Manage users, policies, AI configuration, and feature flags"
        actions={<Button variant="outline" size="sm"><Shield className="mr-1.5 h-4 w-4" /> View audit logs</Button>}
      />

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-4 h-auto">
          <TabsTrigger value="users" className="text-xs gap-1.5 py-2"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
          <TabsTrigger value="thresholds" className="text-xs gap-1.5 py-2"><SlidersHorizontal className="h-3.5 w-3.5" /> Thresholds</TabsTrigger>
          <TabsTrigger value="policies" className="text-xs gap-1.5 py-2"><FileText className="h-3.5 w-3.5" /> Policies</TabsTrigger>
          <TabsTrigger value="model" className="text-xs gap-1.5 py-2"><Cpu className="h-3.5 w-3.5" /> Model</TabsTrigger>
          <TabsTrigger value="prompts" className="text-xs gap-1.5 py-2"><MessageSquare className="h-3.5 w-3.5" /> Prompts</TabsTrigger>
          <TabsTrigger value="flags" className="text-xs gap-1.5 py-2"><Flag className="h-3.5 w-3.5" /> Flags</TabsTrigger>
        </TabsList>

        {/* Users */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div><CardTitle>Users</CardTitle><CardDescription>{ds.users.length} users across 4 roles</CardDescription></div>
              <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Invite user</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30"><tr className="text-left">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last active</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr></thead>
                  <tbody>
                    {ds.users.map((u, i) => (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b last:border-0 hover:bg-accent/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">{initials(u.name)}</div>
                            <div>
                              <div className="font-medium">{u.name}</div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="outline">{ROLE_LABELS[u.role]}</Badge></td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 text-xs ${u.status === 'active' ? 'text-success' : 'text-muted-foreground'}`}><span className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-success' : 'bg-muted-foreground'}`} /> {u.status}</span></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelative(u.lastActive)}</td>
                        <td className="px-4 py-3"><Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thresholds */}
        <TabsContent value="thresholds">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Decision Thresholds</CardTitle><CardDescription>Confidence boundaries for the fairness engine</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label>Auto-resolve threshold</Label><span className="text-sm font-bold text-success">{autoThreshold}%</span></div>
                  <input type="range" min={70} max={95} value={autoThreshold} onChange={(e) => setAutoThreshold(+e.target.value)} className="w-full accent-primary" />
                  <p className="text-xs text-muted-foreground">Cases above this confidence are auto-resolved by the AI.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label>Human review threshold</Label><span className="text-sm font-bold text-warning">{humanThreshold}%</span></div>
                  <input type="range" min={40} max={80} value={humanThreshold} onChange={(e) => setHumanThreshold(+e.target.value)} className="w-full accent-primary" />
                  <p className="text-xs text-muted-foreground">Cases between this and auto-resolve go to a human investigator.</p>
                </div>
                <Separator />
                <div className="rounded-lg bg-muted/30 p-4 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Auto-resolve</span><Badge className="bg-success/10 text-success border-0">≥ {autoThreshold}%</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Human review</span><Badge className="bg-warning/10 text-warning border-0">{humanThreshold}–{autoThreshold}%</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Request more evidence</span><Badge className="bg-destructive/10 text-destructive border-0">&lt; {humanThreshold}%</Badge></div>
                </div>
                <Button onClick={saveThresholds}><Save className="mr-1.5 h-4 w-4" /> Save thresholds</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Role Permissions</CardTitle><CardDescription>Access control matrix</CardDescription></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b"><tr className="text-left">
                      <th className="px-3 py-2 font-medium">Permission</th>
                      <th className="px-3 py-2 font-medium text-center">Admin</th>
                      <th className="px-3 py-2 font-medium text-center">Investigator</th>
                      <th className="px-3 py-2 font-medium text-center">Merchant</th>
                      <th className="px-3 py-2 font-medium text-center">Member</th>
                    </tr></thead>
                    <tbody>
                      {[
                        { p: 'View disputes', a: true, i: true, m: true, c: true },
                        { p: 'Make decisions', a: true, i: true, m: false, c: false },
                        { p: 'Upload evidence', a: true, i: true, m: true, c: true },
                        { p: 'Override AI', a: true, i: true, m: false, c: false },
                        { p: 'Manage users', a: true, i: false, m: false, c: false },
                        { p: 'View analytics', a: true, i: true, m: true, c: false },
                        { p: 'Configure AI', a: true, i: false, m: false, c: false },
                        { p: 'Export audit logs', a: true, i: true, m: false, c: false },
                      ].map((row) => (
                        <tr key={row.p} className="border-b last:border-0">
                          <td className="px-3 py-2">{row.p}</td>
                          <td className="px-3 py-2 text-center">{row.a ? <Check className="h-3.5 w-3.5 text-success mx-auto" /> : <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />}</td>
                          <td className="px-3 py-2 text-center">{row.i ? <Check className="h-3.5 w-3.5 text-success mx-auto" /> : <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />}</td>
                          <td className="px-3 py-2 text-center">{row.m ? <Check className="h-3.5 w-3.5 text-success mx-auto" /> : <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />}</td>
                          <td className="px-3 py-2 text-center">{row.c ? <Check className="h-3.5 w-3.5 text-success mx-auto" /> : <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies">
          <Card>
            <CardHeader><CardTitle>Dispute Policies</CardTitle><CardDescription>Rules governing the resolution pipeline</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 'DISP-POL-2024-03', title: 'Evidence Sufficiency Standard', desc: 'Defines minimum evidence types required per dispute reason.', status: 'active' },
                { id: 'DISP-POL-2024-04', title: 'Auto-Resolution Thresholds', desc: 'Confidence boundaries for AI auto-resolution vs. human review.', status: 'active' },
                { id: 'DISP-POL-2024-05', title: 'Appeal Window', desc: '10-day window for filing appeals post-decision.', status: 'active' },
                { id: 'DISP-POL-2024-06', title: 'High-value Review', desc: 'All disputes above $500 require human sign-off regardless of AI confidence.', status: 'review' },
                { id: 'DISP-POL-2024-07', title: 'Fairness Disclosure', desc: 'Both parties must receive explainability report with each decision.', status: 'active' },
              ].map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary">{p.id}</span>
                      <Badge variant="outline" className={p.status === 'active' ? 'text-success' : 'text-warning'}>{p.status}</Badge>
                    </div>
                    <div className="font-medium text-sm mt-1">{p.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model */}
        <TabsContent value="model">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>AI Model Configuration</CardTitle><CardDescription>Current model and parameters</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Cpu className="h-5 w-5" /></div>
                    <div>
                      <div className="font-display text-lg font-bold">resolve-fairness-v2.3.1</div>
                      <div className="text-xs text-muted-foreground">Deployed 7 days ago · Production</div>
                    </div>
                    <Badge className="ml-auto bg-success/10 text-success border-0">Healthy</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Temperature</span><span className="font-mono">0.2</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Max tokens</span><span className="font-mono">4096</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Evidence weight model</span><span className="font-mono">5-factor</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Training data cutoff</span><span className="font-mono">2024-06</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Avg. inference time</span><span className="font-mono">1.4s</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Decision accuracy</span><span className="font-mono text-success">94.2%</span></div>
                </div>
                <Button variant="outline" className="w-full">Roll back to v2.2.0</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Model Versions</CardTitle><CardDescription>Version history and metrics</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { v: 'v2.3.1', date: '7 days ago', acc: '94.2%', status: 'active' },
                  { v: 'v2.3.0', date: '3 weeks ago', acc: '93.1%', status: 'archived' },
                  { v: 'v2.2.0', date: '2 months ago', acc: '91.5%', status: 'archived' },
                  { v: 'v2.1.0', date: '4 months ago', acc: '89.8%', status: 'archived' },
                ].map((m) => (
                  <div key={m.v} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-mono text-sm font-medium">{m.v}</div>
                      <div className="text-xs text-muted-foreground">{m.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Acc: <span className="font-medium text-foreground">{m.acc}</span></span>
                      {m.status === 'active' ? <Badge className="bg-success/10 text-success border-0">Active</Badge> : <Badge variant="outline">Archived</Badge>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Prompts */}
        <TabsContent value="prompts">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div><CardTitle>Prompt Templates</CardTitle><CardDescription>Reusable prompts for the AI Investigator</CardDescription></div>
              <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> New template</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{t.name}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                  </div>
                  <Textarea readOnly value={t.template} className="text-xs font-mono min-h-[60px] bg-muted/30" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flags */}
        <TabsContent value="flags">
          <Card>
            <CardHeader><CardTitle>Feature Flags</CardTitle><CardDescription>Toggle capabilities across the platform</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {flags.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{f.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                  </div>
                  <Switch checked={f.enabled} onCheckedChange={() => toggleFlag(f.id)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
