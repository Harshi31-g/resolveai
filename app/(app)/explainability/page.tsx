'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, GitBranch, Scale, Gauge, Layers, Shield,
  TrendingUp, AlertTriangle, FileText, ChevronRight, CheckCircle2, XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfidenceGauge, ScoreBar } from '@/components/confidence-gauge';
import { PageHeader } from '@/components/shared';
import { getDataset, getDispute } from '@/lib/mock-data';
import { computeFairness, outcomeColor, outcomeLabel } from '@/lib/fairness';

function ExplainabilityContent() {
  const sp = useSearchParams();
  const caseId = sp.get('case');
  const ds = getDataset();
  const dispute = caseId ? getDispute(caseId) : ds.disputes.find((d) => d.aiReasoning) || ds.disputes[0];

  if (!dispute || !dispute.aiReasoning) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No AI reasoning available.</p>
        <Button variant="outline" className="mt-3" asChild><Link href="/disputes">Back to disputes</Link></Button>
      </div>
    );
  }

  const fairness = computeFairness(dispute.aiReasoning)!;
  const r = dispute.aiReasoning;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Explainability"
        description={`Interactive decision explanation for ${dispute.caseNumber}`}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/disputes/${dispute.id}`}><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to case</Link>
          </Button>
        }
      />

      {/* Top: gauges + recommendation */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-muted-foreground" /><CardTitle className="text-sm">Confidence Gauge</CardTitle></div>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2">
            <ConfidenceGauge value={dispute.aiConfidence} size={140} label="AI Confidence" />
            <div className="mt-3 text-center text-xs text-muted-foreground">
              {dispute.aiConfidence > 0.85 ? 'Above auto-resolve threshold' : dispute.aiConfidence >= 0.6 ? 'Within human review range' : 'Below evidence sufficiency threshold'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Scale className="h-4 w-4 text-muted-foreground" /><CardTitle className="text-sm">Fairness Meter</CardTitle></div>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2">
            <ConfidenceGauge value={dispute.fairnessScore} size={140} label="Fairness Score" />
            <div className="mt-3 w-full space-y-2">
              <ScoreBar label="Completeness" value={fairness.completeness} />
              <ScoreBar label="Consistency" value={fairness.consistency} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" /><CardTitle className="text-sm">Decision Recommendation</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`rounded-xl p-4 text-center ${outcomeColor(dispute.recommendation)}`}>
              <div className="text-lg font-bold">{outcomeLabel(dispute.recommendation)}</div>
            </div>
            <div className="text-xs text-muted-foreground text-center">{fairness.recommendationLabel}</div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {fairness.autoResolvable && <Badge className="bg-success/10 text-success border-0">Auto-resolvable</Badge>}
              {fairness.needsHuman && <Badge className="bg-warning/10 text-warning border-0">Human review</Badge>}
              {fairness.needsMoreEvidence && <Badge className="bg-amber-100 text-amber-700 border-0">More evidence needed</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Decision tree */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-muted-foreground" /><CardTitle>Decision Tree</CardTitle></div>
            <CardDescription>Step-by-step reasoning chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {r.reasoningChain.map((step, i) => (
                <motion.div key={step.step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative pl-8 pb-4 last:pb-0">
                  {i < r.reasoningChain.length - 1 && <div className="absolute left-3.5 top-7 bottom-0 w-px bg-border" />}
                  <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold ring-4 ring-background">{step.step}</div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm"><span className="text-muted-foreground">If:</span> {step.premise}</p>
                    <p className="text-sm mt-1.5"><span className="text-muted-foreground">Then:</span> <span className="font-medium">{step.conclusion}</span></p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground"><FileText className="h-3 w-3" /> {step.evidenceRef}</span>
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className={`font-medium ${step.confidence > 0.85 ? 'text-success' : step.confidence >= 0.6 ? 'text-warning' : 'text-destructive'}`}>{Math.round(step.confidence * 100)}%</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evidence weights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-muted-foreground" /><CardTitle>Evidence Weights</CardTitle></div>
            <CardDescription>How each factor contributed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {r.evidenceFactors.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{f.name}</span>
                    <Badge variant="outline" className="text-[9px] py-0 capitalize">{f.source}</Badge>
                    <Badge variant="outline" className={`text-[9px] py-0 ${f.reliability === 'high' ? 'text-success' : f.reliability === 'medium' ? 'text-warning' : 'text-destructive'}`}>{f.reliability} reliability</Badge>
                  </div>
                  <span className="text-xs font-medium">{Math.round(f.score * 100)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div className={`h-full rounded-full ${f.score > 0.8 ? 'bg-success' : f.score >= 0.6 ? 'bg-warning' : 'bg-destructive'}`}
                    initial={{ width: 0 }} animate={{ width: `${f.score * 100}%` }} transition={{ duration: 0.8, delay: i * 0.06 }} />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <span>{f.reason}</span>
                  <span>Weight: {Math.round(f.weight * 100)}%</span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Evidence used vs ignored */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground" /><CardTitle>Evidence Considered</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs font-medium text-success flex items-center gap-1.5 mb-2"><CheckCircle2 className="h-3.5 w-3.5" /> Used in decision</div>
              <div className="space-y-1.5">
                {r.evidenceUsed.map((e, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-3 py-2 text-sm">
                    <FileText className="h-3.5 w-3.5 text-success" /> {e}
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-destructive flex items-center gap-1.5 mb-2"><XCircle className="h-3.5 w-3.5" /> Ignored / insufficient</div>
              <div className="space-y-1.5">
                {r.evidenceIgnored.length === 0 && <div className="text-xs text-muted-foreground italic">No evidence was excluded.</div>}
                {r.evidenceIgnored.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm">
                    <XCircle className="h-3.5 w-3.5 text-destructive" /> {e}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative outcomes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" /><CardTitle>Alternative Outcomes</CardTitle></div>
            <CardDescription>Other considered decisions and their probabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {r.alternativeOutcomes.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${outcomeColor(a.outcome)}`}>{outcomeLabel(a.outcome)}</span>
                  <span className="text-sm font-bold">{Math.round(a.probability * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${a.probability * 100}%` }} transition={{ duration: 0.8, delay: i * 0.08 }} />
                </div>
                <p className="text-xs text-muted-foreground">{a.rationale}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Policy references + risk indicators */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /><CardTitle>Policy References & Risk Indicators</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Policy references</div>
                <div className="space-y-1.5">
                  {r.policyReferences.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
                      <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-mono">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Risk indicators</div>
                <div className="space-y-1.5">
                  {r.riskIndicators.length === 0 && <div className="text-xs text-muted-foreground italic">No risk indicators flagged.</div>}
                  {r.riskIndicators.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
                      <AlertTriangle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${risk.level === 'high' ? 'text-destructive' : risk.level === 'medium' ? 'text-warning' : 'text-success'}`} />
                      <div>
                        <span className="font-medium">{risk.label}</span>
                        <span className="text-muted-foreground"> — {risk.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 text-xs">
              <span className="text-muted-foreground">Model: <span className="font-mono font-medium text-foreground">{r.modelVersion}</span></span>
              <Link href={`/ai-investigator?case=${dispute.id}`} className="text-primary hover:underline flex items-center gap-1">
                Ask AI about this decision <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ExplainabilityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
      <ExplainabilityContent />
    </Suspense>
  );
}
