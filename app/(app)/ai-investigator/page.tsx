'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, Send, Sparkles, FileText, Scale, GitCompare,
  ClipboardCheck, UserRound, Building2, Bot, User as UserIcon,
  ChevronRight, Lightbulb,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageHeader } from '@/components/shared';
import { getDataset, getDispute } from '@/lib/mock-data';
import type { ChatMessage } from '@/lib/types';

const SUGGESTED_PROMPTS = [
  { icon: FileText, label: 'Summarize this dispute', prompt: 'Summarize this dispute for me.' },
  { icon: Scale, label: 'Explain the decision', prompt: 'Explain the AI decision and reasoning chain.' },
  { icon: GitCompare, label: 'Compare evidence', prompt: 'Compare the merchant and customer evidence.' },
  { icon: ClipboardCheck, label: 'Generate audit report', prompt: 'Generate a compliance audit report for this case.' },
  { icon: UserRound, label: 'Customer explanation', prompt: 'Write a customer-friendly explanation of the outcome.' },
  { icon: Building2, label: 'Merchant explanation', prompt: 'Write a merchant-facing explanation of the outcome.' },
];

function generateResponse(prompt: string, dispute: ReturnType<typeof getDispute>): string {
  if (!dispute) {
    return "I don't have a specific dispute loaded. Select a case from the disputes table and I can summarize it, explain the AI reasoning, compare evidence, or generate audit and customer-facing reports.";
  }
  const p = prompt.toLowerCase();
  const merchant = getDataset().merchants.find((m) => m.id === dispute.merchantId);
  const customer = getDataset().cardMembers.find((c) => c.id === dispute.cardMemberId);

  if (p.includes('summar')) {
    return `**Dispute ${dispute.caseNumber} Summary**\n\nThis case involves ${customer?.name} disputing a ${new Intl.NumberFormat('en-US', { style: 'currency', currency: dispute.currency }).format(dispute.amount)} charge from ${merchant?.name}, filed on ${new Date(dispute.createdAt).toLocaleDateString()}.\n\n**Reason:** ${dispute.reasonDescription}\n\n**Current status:** ${dispute.status.replace(/_/g, ' ')}\n**Evidence submitted:** ${dispute.merchantEvidenceCount} from merchant, ${dispute.customerEvidenceCount} from customer, ${dispute.evidenceCount - dispute.merchantEvidenceCount - dispute.customerEvidenceCount} gathered by system.\n**AI confidence:** ${Math.round(dispute.aiConfidence * 100)}% · **Fairness score:** ${dispute.fairnessScore.toFixed(2)}\n**Recommendation:** ${dispute.recommendation.replace(/_/g, ' ')}\n\nThe case is ${dispute.assignedInvestigatorName ? `assigned to ${dispute.assignedInvestigatorName}` : 'unassigned'} and due by ${new Date(dispute.dueDate).toLocaleDateString()}.`;
  }
  if (p.includes('decision') || p.includes('reason')) {
    if (!dispute.aiReasoning) return 'No AI reasoning is available for this case.';
    return `**Decision Explanation**\n\nThe AI recommends **${dispute.recommendation.replace(/_/g, ' ')}** with ${Math.round(dispute.aiConfidence * 100)}% confidence and a fairness score of ${dispute.fairnessScore.toFixed(2)}.\n\n**Reasoning chain:**\n${dispute.aiReasoning.reasoningChain.map((s) => `${s.step}. ${s.premise} → ${s.conclusion} (${Math.round(s.confidence * 100)}% confidence, ref: ${s.evidenceRef})`).join('\n')}\n\n**Evidence used:** ${dispute.aiReasoning.evidenceUsed.join(', ')}\n**Evidence ignored:** ${dispute.aiReasoning.evidenceIgnored.join(', ')}\n**Policy references:** ${dispute.aiReasoning.policyReferences.join('; ')}`;
  }
  if (p.includes('compare')) {
    return `**Evidence Comparison**\n\n**Merchant evidence (${dispute.merchantEvidenceCount} items):**\n- Generally stronger corroboration and authenticity scores\n- Includes invoices, tracking numbers, and authorization logs\n- Supports the position that goods were delivered and the charge is valid\n\n**Customer evidence (${dispute.customerEvidenceCount} items):**\n- Fewer documents submitted\n- Lacks a cancellation email that would corroborate the claim\n- Customer statement alone carries lower weight\n\n**Fairness assessment:** The evidence skew favors the merchant ${Math.round(dispute.fairnessScore * 100)}%, primarily due to delivery confirmation and amount verification. The customer's case would strengthen significantly with a cancellation confirmation or communication trail.`;
  }
  if (p.includes('audit')) {
    return `**Compliance Audit Report — ${dispute.caseNumber}**\n\n**Case ID:** ${dispute.id}\n**Parties:** ${merchant?.name} (merchant) · ${customer?.name} (card member)\n**Amount:** ${new Intl.NumberFormat('en-US', { style: 'currency', currency: dispute.currency }).format(dispute.amount)}\n**Opened:** ${new Date(dispute.createdAt).toLocaleString()}\n**Model version:** ${dispute.aiReasoning?.modelVersion}\n**Confidence:** ${Math.round(dispute.aiConfidence * 100)}% · **Fairness:** ${dispute.fairnessScore.toFixed(2)}\n\n**Decision pathway:** ${dispute.aiConfidence > 0.85 ? 'Auto-resolved (above 85% threshold)' : 'Routed to human review'}\n**Investigator:** ${dispute.assignedInvestigatorName || 'Unassigned'}\n**Override:** ${dispute.decision?.overridden ? 'Yes — ' + dispute.decision.overrideReason : 'No'}\n\n**Audit trail:** ${dispute.timeline.length} events recorded. All actions captured in immutable audit log. Policy references: ${dispute.aiReasoning?.policyReferences.join('; ')}.`;
  }
  if (p.includes('customer')) {
    return `**Customer Explanation**\n\nDear ${customer?.name},\n\nWe've completed the review of your dispute (case ${dispute.caseNumber}) regarding the ${new Intl.NumberFormat('en-US', { style: 'currency', currency: dispute.currency }).format(dispute.amount)} charge from ${merchant?.name}.\n\nAfter carefully weighing all submitted evidence, our decision is to **${dispute.recommendation === 'refund_customer' ? 'refund the charge to your account' : dispute.recommendation === 'approve_merchant' ? 'uphold the merchant charge' : 'request additional information'}**.\n\nThe key factors in this decision were:\n- ${dispute.aiReasoning?.reasoningChain[0]?.conclusion || 'Evidence review'}\n- ${dispute.aiReasoning?.reasoningChain[1]?.conclusion || 'Fairness evaluation'}\n\nIf you have additional evidence (such as a cancellation confirmation or communication with the merchant), you may file an appeal within 10 days.\n\nThank you,\nThe ResolveAI Team`;
  }
  if (p.includes('merchant')) {
    return `**Merchant Explanation**\n\nDear ${merchant?.name} team,\n\nThe dispute (case ${dispute.caseNumber}) for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: dispute.currency }).format(dispute.amount)} has been reviewed.\n\n**Outcome:** ${dispute.recommendation.replace(/_/g, ' ')}\n\n**Why:** ${dispute.aiReasoning?.reasoningChain.map((s) => s.conclusion).join('; ')}.\n\nYour submitted evidence — particularly the tracking confirmation and invoice — was instrumental. We recommend continuing to capture delivery proof and authorization logs for future transactions to maintain a strong dispute defense posture.\n\nRegards,\nResolveAI Investigations`;
  }
  return `I can help with this dispute (${dispute.caseNumber}). Try asking me to summarize the case, explain the AI decision, compare the evidence, generate an audit report, or write a customer- or merchant-facing explanation.`;
}

function AIInvestigatorContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('case');
  const dispute = caseId ? getDispute(caseId) : getDataset().disputes[0];
  const merchant = dispute ? getDataset().merchants.find((m) => m.id === dispute.merchantId) : null;
  const customer = dispute ? getDataset().cardMembers.find((c) => c.id === dispute.cardMemberId) : null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1', role: 'assistant',
      content: `Hello! I'm your AI Investigator. ${dispute ? `I have case **${dispute.caseNumber}** loaded — a ${new Intl.NumberFormat('en-US', { style: 'currency', currency: dispute.currency }).format(dispute.amount)} dispute between ${merchant?.name} and ${customer?.name}.` : ''} Ask me anything, or pick a suggested prompt below.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `a_${Date.now()}`, role: 'assistant',
        content: generateResponse(text, dispute),
        timestamp: new Date().toISOString(),
        citations: dispute?.aiReasoning?.evidenceUsed.slice(0, 3).map((e, i) => ({ label: e, ref: `ev-${i}` })),
      };
      setMessages((prev) => [...prev, reply]);
      setThinking(false);
    }, 900 + Math.random() * 700);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full flex flex-col flex-1 overflow-hidden">
        <PageHeader
          title="AI Investigator"
          description={dispute ? `Analyzing ${dispute.caseNumber} · ${merchant?.name} vs ${customer?.name}` : 'Conversational AI for dispute analysis'}
          actions={dispute && (
            <Badge variant="outline" className="font-mono">{dispute.aiReasoning?.modelVersion}</Badge>
          )}
        />

        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Context bar */}
          {dispute && (
            <div className="flex items-center gap-3 border-b px-4 py-2.5 bg-muted/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium font-mono">{dispute.caseNumber}</span>
                <span className="text-xs text-muted-foreground ml-2">{new Intl.NumberFormat('en-US', { style: 'currency', currency: dispute.currency }).format(dispute.amount)}</span>
              </div>
              <Badge variant="outline" className="text-xs">Confidence {Math.round(dispute.aiConfidence * 100)}%</Badge>
              <Badge variant="outline" className="text-xs">Fairness {dispute.fairnessScore.toFixed(2)}</Badge>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-blue-500 to-violet-500 text-white'
                }`}>
                  {m.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                }`}>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.citations.map((c) => (
                        <Badge key={c.ref} variant="outline" className="text-[10px] py-0 bg-background/50">
                          <Sparkles className="h-2.5 w-2.5 mr-1" />{c.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <AnimatePresence>
              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white"><Bot className="h-4 w-4" /></div>
                  <div className="bg-muted/50 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-2 w-2 rounded-full bg-muted-foreground/60"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Suggested prompts */}
          {messages.length <= 2 && (
            <div className="border-t p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2"><Lightbulb className="h-3.5 w-3.5" /> Suggested prompts</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUGGESTED_PROMPTS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button key={s.label}
                      onClick={() => send(s.prompt)}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-left hover:bg-accent transition-colors group">
                      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="flex-1">{s.label}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask about this dispute... (Shift+Enter for new line)"
                className="min-h-[52px] max-h-32 resize-none text-sm"
              />
              <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || thinking}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1.5">
              <BrainCircuit className="h-3 w-3" /> AI-generated content should be reviewed before action. Responses cite evidence sources.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AIInvestigatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
      <AIInvestigatorContent />
    </Suspense>
  );
}
