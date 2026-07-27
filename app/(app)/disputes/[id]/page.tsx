'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Paperclip, Clock, BrainCircuit, Scale,
  CheckCircle2, XCircle, AlertCircle, Gavel, MessageSquare,
  Send, Shield, TrendingUp, AlertTriangle, Lightbulb, ChevronRight,
  User as UserIcon, Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ConfidenceGauge, ScoreBar } from '@/components/confidence-gauge';
import {
  useDispute, useMerchant, useCardMember, useTransaction,
  useEvidence, useTimeline, useAIReasoning, useDecision,
  useComments, useAddComment, useRecordDecision,
} from '@/lib/data-hooks';
import {
  formatCurrency, formatDate, formatDateTime, formatRelative,
  initials, outcomeColor, outcomeLabel, priorityColor, statusColor,
  computeFairness,
} from '@/lib/fairness';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import type {
  Dispute, Merchant, CardMember, Transaction, EvidenceFile,
  TimelineEvent, AIReasoning, Decision, Comment,
} from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  open: 'Open', evidence_gathering: 'Gathering', under_review: 'Under Review',
  ai_review: 'AI Review', pending_decision: 'Pending', resolved: 'Resolved',
  appealed: 'Appealed', closed: 'Closed',
};

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const { data: dispute, isLoading } = useDispute(id) as { data: Dispute | null; isLoading: boolean };
  const { data: merchant } = useMerchant(dispute?.merchantId ?? '') as { data: Merchant | null };
  const { data: customer } = useCardMember(dispute?.cardMemberId ?? '') as { data: CardMember | null };
  const { data: transaction } = useTransaction(dispute?.transactionId ?? '') as { data: Transaction | null };
  const { data: evidence } = useEvidence(dispute?.id ?? '') as { data: EvidenceFile[] };
  const { data: timeline } = useTimeline(dispute?.id ?? '') as { data: TimelineEvent[] };
  const { data: aiReasoning } = useAIReasoning(dispute?.id ?? '') as { data: AIReasoning | null };
  const { data: decisionData } = useDecision(dispute?.id ?? '') as { data: Decision | null };
  const { data: comments } = useComments(dispute?.id ?? '') as { data: Comment[] };
  const { mutateAsync: addCommentAsync } = useAddComment(dispute?.id ?? '');
  const { mutateAsync: recordDecisionAsync } = useRecordDecision(dispute?.id ?? '');

  const [comment, setComment] = useState('');
  const [decision, setDecision] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground mt-2">Loading dispute…</p>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Dispute not found.</p>
        <Button variant="outline" className="mt-3" onClick={() => router.push('/disputes')}>Back to disputes</Button>
      </div>
    );
  }

  const evidenceList: EvidenceFile[] = evidence ?? [];
  const timelineList: TimelineEvent[] = timeline ?? [];
  const commentList: Comment[] = comments ?? [];
  const fairness = computeFairness(aiReasoning ?? undefined);

  const merchantEvidence = evidenceList.filter((e) => e.source === 'merchant');
  const customerEvidence = evidenceList.filter((e) => e.source === 'customer');
  const systemEvidence = evidenceList.filter((e) => e.source === 'system');

  const handleDecision = async (outcome: string) => {
    setDecision(outcome);
    await recordDecisionAsync({ outcome, decidedBy: user?.name || 'User', rationale: 'Decision recorded by investigator.' });
    toast.success(`Decision recorded: ${outcomeLabel(outcome as any)}`, {
      description: `Case ${dispute.caseNumber} has been updated.`,
    });
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    await addCommentAsync({ text: comment, userName: user?.name || 'User', userRole: user?.role || 'investigator' });
    toast.success('Comment added', { description: 'Your comment has been posted to the case.' });
    setComment('');
  };

  const canDecide = user?.role === 'admin' || user?.role === 'investigator';

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/disputes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight font-mono">{dispute.caseNumber}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(dispute.status)}`}>
                {STATUS_LABELS[dispute.status]}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityColor(dispute.priority)}`}>
                {dispute.priority}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(dispute.amount)} · {dispute.reasonDescription} · Opened {formatDate(dispute.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/explainability?case=${dispute.id}`}>Explainability <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/ai-investigator?case=${dispute.id}`}>Ask AI <BrainCircuit className="ml-1.5 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr_320px] gap-4">
        {/* LEFT — Timeline, Evidence, Files */}
        <div className="space-y-4">
          {/* Parties */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Parties</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-blue-100 text-blue-700 text-xs"><Building2 className="h-4 w-4" /></AvatarFallback></Avatar>
                <div className="min-w-0">
                  <div className="font-medium truncate">{merchant?.name}</div>
                  <div className="text-xs text-muted-foreground">{merchant?.category} · {merchant?.email}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs"><UserIcon className="h-4 w-4" /></AvatarFallback></Avatar>
                <div className="min-w-0">
                  <div className="font-medium truncate">{customer?.name}</div>
                  <div className="text-xs text-muted-foreground">{customer?.cardType.toUpperCase()} ••{customer?.cardLast4} · {customer?.country}</div>
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Transaction</span><span className="font-mono">{transaction?.id.replace('_', '-')}</span></div>
                <div className="flex justify-between"><span>Amount</span><span className="font-medium">{formatCurrency(dispute.amount)}</span></div>
                <div className="flex justify-between"><span>Date</span><span>{transaction && formatDate(transaction.date)}</span></div>
                <div className="flex justify-between"><span>Due</span><span className="text-warning">{formatDate(dispute.dueDate)}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><CardTitle className="text-sm">Timeline</CardTitle></div>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4">
                <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />
                {timelineList.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pl-7"
                  >
                    <div className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                    <div className="text-sm font-medium">{ev.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ev.description}</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-1">{formatDateTime(ev.timestamp)} · {ev.actor}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Paperclip className="h-4 w-4 text-muted-foreground" /><CardTitle className="text-sm">Evidence</CardTitle></div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href={`/evidence?case=${dispute.id}`}>Manage</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Merchant submissions', items: merchantEvidence, icon: Building2 },
                { label: 'Customer submissions', items: customerEvidence, icon: UserIcon },
                { label: 'System gathered', items: systemEvidence, icon: Shield },
              ].map((group) => (
                <div key={group.label}>
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">{group.label} ({group.items.length})</div>
                  <div className="space-y-1.5">
                    {group.items.length === 0 && <div className="text-xs text-muted-foreground/60 italic px-2">None submitted</div>}
                    {group.items.map((ef) => (
                      <div key={ef.id} className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1">{ef.name}</span>
                        <Badge variant="outline" className="text-[9px] py-0 capitalize">{ef.evidenceType}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* CENTER — AI Summary, Fairness, Explainability */}
        <div className="space-y-4">
          {aiReasoning && fairness && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><BrainCircuit className="h-5 w-5" /></div>
                      <div>
                        <CardTitle>AI Analysis Summary</CardTitle>
                        <CardDescription>{aiReasoning.modelVersion} · {formatRelative(aiReasoning.generatedAt)}</CardDescription>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${outcomeColor(dispute.recommendation)}`}>
                      {outcomeLabel(dispute.recommendation)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Gauges */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center rounded-xl border p-4">
                      <ConfidenceGauge value={dispute.aiConfidence} label="AI Confidence" size={100} />
                    </div>
                    <div className="flex flex-col items-center rounded-xl border p-4">
                      <ConfidenceGauge value={dispute.fairnessScore} label="Fairness Score" size={100} />
                    </div>
                  </div>

                  {/* Fairness factors */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Fairness Engine Breakdown</span>
                    </div>
                    <div className="space-y-3">
                      <ScoreBar label="Completeness" value={fairness.completeness} />
                      <ScoreBar label="Consistency" value={fairness.consistency} />
                      <ScoreBar label="Corroboration" value={fairness.corroboration} />
                      <ScoreBar label="Authenticity" value={fairness.authenticity} />
                      <ScoreBar label="Timeliness" value={fairness.timeliness} />
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Recommendation</span>
                    </div>
                    <p className="text-sm">{fairness.recommendationLabel}</p>
                    <div className="mt-3 flex gap-2">
                      {fairness.autoResolvable && <Badge className="bg-success/10 text-success border-0">Auto-resolvable</Badge>}
                      {fairness.needsHuman && <Badge className="bg-warning/10 text-warning border-0">Human review</Badge>}
                      {fairness.needsMoreEvidence && <Badge className="bg-amber-100 text-amber-700 border-0">More evidence</Badge>}
                    </div>
                  </div>

                  {/* Risk indicators */}
                  {aiReasoning.riskIndicators.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Risk Indicators</span>
                      </div>
                      <div className="space-y-2">
                        {aiReasoning.riskIndicators.map((r, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm">
                            <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${r.level === 'high' ? 'bg-destructive' : r.level === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                            <div>
                              <span className="font-medium">{r.label}</span>
                              <span className="text-muted-foreground"> — {r.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reasoning chain */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" /><CardTitle>Reasoning Chain</CardTitle></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiReasoning.reasoningChain.map((step, i) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-3"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{step.step}</div>
                        <div className="flex-1">
                          <p className="text-sm"><span className="text-muted-foreground">Premise: </span>{step.premise}</p>
                          <p className="text-sm mt-1"><span className="text-muted-foreground">Conclusion: </span><span className="font-medium">{step.conclusion}</span></p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span>Ref: {step.evidenceRef}</span>
                            <span className="flex items-center gap-1">Confidence: <span className="font-medium text-foreground">{Math.round(step.confidence * 100)}%</span></span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Comments */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground" /><CardTitle className="text-sm">Comments</CardTitle></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {commentList.length === 0 && <p className="text-sm text-muted-foreground italic">No comments yet.</p>}
              {commentList.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="text-xs bg-muted">{initials(c.userName)}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.userName}</span>
                      <span className="text-[10px] text-muted-foreground">{formatRelative(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." className="min-h-[60px] text-sm" />
                <Button size="icon" onClick={handleComment} disabled={!comment.trim()}><Send className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Decision panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2"><Gavel className="h-4 w-4 text-muted-foreground" /><CardTitle>Decision Panel</CardTitle></div>
              <CardDescription>
                {canDecide ? 'Record or override the AI recommendation.' : 'View the decision for this case.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {canDecide ? (
                <>
                  <Button className="w-full justify-start" variant={decision === 'approve_merchant' ? 'default' : 'outline'}
                    onClick={() => handleDecision('approve_merchant')}>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> Approve Merchant
                  </Button>
                  <Button className="w-full justify-start" variant={decision === 'refund_customer' ? 'default' : 'outline'}
                    onClick={() => handleDecision('refund_customer')}>
                    <XCircle className="mr-2 h-4 w-4 text-blue-500" /> Refund Customer
                  </Button>
                  <Button className="w-full justify-start" variant={decision === 'request_more_evidence' ? 'default' : 'outline'}
                    onClick={() => handleDecision('request_more_evidence')}>
                    <AlertCircle className="mr-2 h-4 w-4 text-warning" /> Request More Evidence
                  </Button>
                  <Separator className="my-3" />
                  <Button className="w-full justify-start" variant="outline">
                    <UserIcon className="mr-2 h-4 w-4" /> Assign Investigator
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Gavel className="mr-2 h-4 w-4" /> Open Appeal
                  </Button>
                </>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  {decisionData ? (
                    <>
                      <div className="text-xs text-muted-foreground mb-1">Final decision</div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${outcomeColor(decisionData.outcome)}`}>
                        {outcomeLabel(decisionData.outcome)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-2">{decisionData.rationale}</p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No decision recorded yet.</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing decision */}
          {decisionData && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Recorded Decision</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Outcome</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${outcomeColor(decisionData.outcome)}`}>{outcomeLabel(decisionData.outcome)}</span>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Decided by</span><span>{decisionData.decidedBy}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{decisionData.isAI ? 'AI auto-resolved' : 'Human decision'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">When</span><span>{formatRelative(decisionData.decidedAt)}</span></div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">{decisionData.rationale}</p>
              </CardContent>
            </Card>
          )}

          {/* Appeal */}
          {dispute.appeal && (
            <Card className="border-rose-200 dark:border-rose-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-rose-500" /><CardTitle className="text-sm">Appeal Filed</CardTitle></div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Filed by</span><span className="capitalize">{dispute.appeal.filedBy.replace('card', 'card ')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className="capitalize">{dispute.appeal.status.replace('_', ' ')}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">When</span><span>{formatRelative(dispute.appeal.filedAt)}</span></div>
                <Separator className="my-2" />
                <p className="text-xs">{dispute.appeal.reason}</p>
              </CardContent>
            </Card>
          )}

          {/* AI reasoning meta */}
          {aiReasoning && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">AI Reasoning Metadata</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Model</span><span className="font-mono">{aiReasoning.modelVersion}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Evidence used</span><span>{aiReasoning.evidenceUsed.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Evidence ignored</span><span>{aiReasoning.evidenceIgnored.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Policy refs</span><span>{aiReasoning.policyReferences.length}</span></div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
