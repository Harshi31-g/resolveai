import type {
  AIReasoning,
  DecisionOutcome,
  Dispute,
  EvidenceFactor,
} from './types';

export interface FairnessBreakdown {
  completeness: number;
  consistency: number;
  corroboration: number;
  authenticity: number;
  timeliness: number;
  weighted: number;
  recommendation: DecisionOutcome;
  recommendationLabel: string;
  autoResolvable: boolean;
  needsHuman: boolean;
  needsMoreEvidence: boolean;
}

export function computeFairness(reasoning?: AIReasoning): FairnessBreakdown | null {
  if (!reasoning) return null;
  const byName = new Map(reasoning.evidenceFactors.map((f) => [f.name.toLowerCase(), f]));
  const get = (n: string) => byName.get(n)?.score ?? 0.7;
  const completeness = get('completeness');
  const consistency = get('consistency');
  const corroboration = get('corroboration');
  const authenticity = get('authenticity');
  const timeliness = get('timeliness');
  const weighted =
    completeness * 0.25 +
    consistency * 0.2 +
    corroboration * 0.2 +
    authenticity * 0.2 +
    timeliness * 0.15;
  const confidence = reasoning.confidence;
  let recommendation: DecisionOutcome;
  let recommendationLabel: string;
  let autoResolvable = false;
  let needsHuman = false;
  let needsMoreEvidence = false;
  if (confidence > 0.85) {
    recommendation = reasoning.recommendation;
    recommendationLabel =
      recommendation === 'approve_merchant'
        ? 'Auto-resolve: Approve Merchant'
        : recommendation === 'refund_customer'
        ? 'Auto-resolve: Refund Customer'
        : 'Auto-resolve';
    autoResolvable = true;
  } else if (confidence >= 0.6) {
    recommendation = reasoning.recommendation;
    recommendationLabel = 'Human investigator review';
    needsHuman = true;
  } else {
    recommendation = 'request_more_evidence';
    recommendationLabel = 'Request additional evidence';
    needsMoreEvidence = true;
  }
  return {
    completeness, consistency, corroboration, authenticity, timeliness,
    weighted, recommendation, recommendationLabel,
    autoResolvable, needsHuman, needsMoreEvidence,
  };
}

export function fairnessColor(score: number): string {
  if (score >= 0.8) return 'text-success';
  if (score >= 0.6) return 'text-warning';
  return 'text-destructive';
}

export function confidenceColor(score: number): string {
  if (score >= 0.85) return 'text-success';
  if (score >= 0.6) return 'text-warning';
  return 'text-destructive';
}

export function statusColor(status: Dispute['status']): string {
  const map: Record<Dispute['status'], string> = {
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    evidence_gathering: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    under_review: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    ai_review: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    pending_decision: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    appealed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    closed: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
  };
  return map[status];
}

export function priorityColor(p: Dispute['priority']): string {
  const map: Record<Dispute['priority'], string> = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  };
  return map[p];
}

export function outcomeLabel(o: DecisionOutcome): string {
  return o === 'approve_merchant'
    ? 'Approve Merchant'
    : o === 'refund_customer'
    ? 'Refund Customer'
    : o === 'request_more_evidence'
    ? 'Request More Evidence'
    : 'Pending';
}

export function outcomeColor(o: DecisionOutcome): string {
  return o === 'approve_merchant'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
    : o === 'refund_customer'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
    : o === 'request_more_evidence'
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
    : 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300';
}

export function formatCurrency(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}
