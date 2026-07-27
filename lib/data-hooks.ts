'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import type {
  Dispute, Merchant, CardMember, Transaction, EvidenceFile,
  TimelineEvent, AIReasoning, Decision, Appeal, Comment,
  DisputeReason, DisputePriority, EvidenceSource, FileType, EvidenceType,
} from './types';

// ---- Row -> domain mappers (snake_case DB -> camelCase TS) ----

function mapDispute(r: any): Dispute {
  return {
    id: r.id,
    caseNumber: r.case_number,
    transactionId: r.transaction_id,
    merchantId: r.merchant_id,
    cardMemberId: r.card_member_id,
    amount: Number(r.amount),
    currency: r.currency,
    reason: r.reason,
    reasonDescription: r.reason_description,
    status: r.status,
    priority: r.priority,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    dueDate: r.due_date,
    assignedInvestigator: r.assigned_investigator_id,
    aiConfidence: Number(r.ai_confidence),
    fairnessScore: Number(r.fairness_score),
    recommendation: r.recommendation,
    evidenceCount: r.evidence_count ?? 0,
    merchantEvidenceCount: r.merchant_evidence_count ?? 0,
    customerEvidenceCount: r.customer_evidence_count ?? 0,
    timeline: [],
    comments: [],
  };
}

function mapMerchant(r: any): Merchant {
  return {
    id: r.id, name: r.name, logo: '', category: r.category || '',
    email: r.email || '', phone: r.phone || '', website: r.website || '',
    address: r.address || '',
    disputeRate: Number(r.dispute_rate) || 0,
    winRate: Number(r.win_rate) || 0,
    totalDisputes: r.total_disputes || 0,
    rating: Number(r.rating) || 0,
    createdAt: r.created_at,
  };
}

function mapCardMember(r: any): CardMember {
  return {
    id: r.id, name: r.name, email: r.email || '',
    cardType: r.card_type, cardLast4: r.card_last4 || '',
    country: r.country || '', createdAt: r.created_at,
    disputeCount: r.dispute_count || 0,
  };
}

function mapTransaction(r: any): Transaction {
  return {
    id: r.id, merchantId: r.merchant_id, cardMemberId: r.card_member_id,
    amount: Number(r.amount), currency: r.currency || 'USD',
    date: r.date, description: r.description || '',
    status: r.status, paymentMethod: r.payment_method || '',
  };
}

function mapEvidence(r: any): EvidenceFile {
  return {
    id: r.id, disputeId: r.dispute_id, name: r.name, type: r.type,
    size: r.size || 0, source: r.source, uploadedBy: r.uploaded_by || '',
    uploadedAt: r.uploaded_at, ocrStatus: r.ocr_status,
    ocrConfidence: Number(r.ocr_confidence) || 0,
    extractedEntities: r.extracted_entities || [],
    evidenceType: r.evidence_type || 'other',
    url: r.url,
  };
}

function mapTimeline(r: any): TimelineEvent {
  return {
    id: r.id, disputeId: r.dispute_id, type: r.type, title: r.title,
    description: r.description || '', actor: r.actor || '',
    timestamp: r.timestamp, metadata: r.metadata || {},
  };
}

function mapAIReasoning(r: any): AIReasoning {
  return {
    id: r.id, disputeId: r.dispute_id,
    evidenceUsed: r.evidence_used || [],
    evidenceIgnored: r.evidence_ignored || [],
    reasoningChain: r.reasoning_chain || [],
    confidence: Number(r.confidence) || 0,
    fairnessScore: Number(r.fairness_score) || 0,
    recommendation: r.recommendation,
    alternativeOutcomes: r.alternative_outcomes || [],
    policyReferences: r.policy_references || [],
    evidenceFactors: r.evidence_factors || [],
    riskIndicators: r.risk_indicators || [],
    modelVersion: r.model_version || '',
    generatedAt: r.generated_at,
  };
}

function mapDecision(r: any): Decision {
  return {
    id: r.id, disputeId: r.dispute_id, outcome: r.outcome,
    confidence: Number(r.confidence) || 0,
    fairnessScore: Number(r.fairness_score) || 0,
    decidedBy: r.decided_by || '', decidedAt: r.decided_at,
    rationale: r.rationale || '', isAI: r.is_ai || false,
    overridden: r.overridden, overriddenBy: r.overridden_by,
    overrideReason: r.override_reason,
  };
}

function mapComment(r: any): Comment {
  return {
    id: r.id, disputeId: r.dispute_id,
    userId: r.user_id || '', userName: r.user_name || '',
    userRole: r.user_role || 'investigator',
    text: r.text, createdAt: r.created_at,
  };
}

// ---- Query keys ----

const K = {
  disputes: ['disputes'] as const,
  dispute: (id: string) => ['dispute', id] as const,
  merchants: ['merchants'] as const,
  cardMembers: ['cardMembers'] as const,
  evidence: (disputeId: string) => ['evidence', disputeId] as const,
  timeline: (disputeId: string) => ['timeline', disputeId] as const,
  aiReasoning: (disputeId: string) => ['aiReasoning', disputeId] as const,
  decision: (disputeId: string) => ['decision', disputeId] as const,
  comments: (disputeId: string) => ['comments', disputeId] as const,
};

// ---- Queries ----

export function useDisputes() {
  return useQuery({
    queryKey: K.disputes,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDispute);
    },
  });
}

export function useDispute(id: string) {
  return useQuery({
    queryKey: K.dispute(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDispute(data) : null;
    },
    enabled: !!id,
  });
}

export function useMerchants() {
  return useQuery({
    queryKey: K.merchants,
    queryFn: async () => {
      const { data, error } = await supabase.from('merchants').select('*').order('name');
      if (error) throw error;
      return (data || []).map(mapMerchant);
    },
  });
}

export function useMerchant(id: string) {
  return useQuery({
    queryKey: ['merchant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchants').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? mapMerchant(data) : null;
    },
    enabled: !!id,
  });
}

export function useCardMembers() {
  return useQuery({
    queryKey: K.cardMembers,
    queryFn: async () => {
      const { data, error } = await supabase.from('card_members').select('*').order('name');
      if (error) throw error;
      return (data || []).map(mapCardMember);
    },
  });
}

export function useCardMember(id: string) {
  return useQuery({
    queryKey: ['cardMember', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('card_members').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? mapCardMember(data) : null;
    },
    enabled: !!id,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? mapTransaction(data) : null;
    },
    enabled: !!id,
  });
}

export function useEvidence(disputeId: string) {
  return useQuery({
    queryKey: K.evidence(disputeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evidence_files')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapEvidence);
    },
    enabled: !!disputeId,
  });
}

export function useAllEvidence() {
  return useQuery({
    queryKey: ['evidence', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evidence_files')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map(mapEvidence);
    },
  });
}

export function useTimeline(disputeId: string) {
  return useQuery({
    queryKey: K.timeline(disputeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('timestamp', { ascending: true });
      if (error) throw error;
      return (data || []).map(mapTimeline);
    },
    enabled: !!disputeId,
  });
}

export function useAIReasoning(disputeId: string) {
  return useQuery({
    queryKey: K.aiReasoning(disputeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_reasoning')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? mapAIReasoning(data) : null;
    },
    enabled: !!disputeId,
  });
}

export function useDecision(disputeId: string) {
  return useQuery({
    queryKey: K.decision(disputeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('decided_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDecision(data) : null;
    },
    enabled: !!disputeId,
  });
}

export function useComments(disputeId: string) {
  return useQuery({
    queryKey: K.comments(disputeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map(mapComment);
    },
    enabled: !!disputeId,
  });
}

// ---- Mutations ----

export interface NewDisputeInput {
  merchantId: string;
  cardMemberId: string;
  amount: number;
  reason: DisputeReason;
  reasonDescription: string;
}

export function useCreateDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewDisputeInput) => {
      const caseNumber = `DSP-${2400 + Math.floor(Math.random() * 9000)}`;
      const priority: DisputePriority =
        input.amount > 800 ? 'critical' : input.amount > 300 ? 'high' : input.amount > 100 ? 'medium' : 'low';
      const now = new Date().toISOString();

      const { data: disputeRow, error } = await supabase
        .from('disputes')
        .insert({
          case_number: caseNumber,
          merchant_id: input.merchantId,
          card_member_id: input.cardMemberId,
          amount: input.amount,
          currency: 'USD',
          reason: input.reason,
          reason_description: input.reasonDescription,
          status: 'open',
          priority,
          due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
          ai_confidence: 0.5,
          fairness_score: 0.5,
          recommendation: 'pending',
          evidence_count: 0,
          merchant_evidence_count: 0,
          customer_evidence_count: 0,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('timeline_events').insert({
        dispute_id: disputeRow.id,
        type: 'dispute_created',
        title: 'Dispute filed',
        description: input.reasonDescription,
        actor: 'User',
        timestamp: now,
      });

      return mapDispute(disputeRow);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: K.disputes });
    },
  });
}

export function useAddComment(disputeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ text, userName, userRole }: { text: string; userName: string; userRole: string }) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({ dispute_id: disputeId, text, user_name: userName, user_role: userRole })
        .select()
        .single();
      if (error) throw error;
      return mapComment(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: K.comments(disputeId) });
    },
  });
}

export interface NewEvidenceInput {
  disputeId: string;
  name: string;
  type: FileType;
  size: number;
  source: EvidenceSource;
  uploadedBy: string;
  evidenceType: EvidenceType;
}

export function useAddEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewEvidenceInput) => {
      const { data, error } = await supabase
        .from('evidence_files')
        .insert({
          dispute_id: input.disputeId,
          name: input.name,
          type: input.type,
          size: input.size,
          source: input.source,
          uploaded_by: input.uploadedBy,
          evidence_type: input.evidenceType,
          ocr_status: 'pending',
          ocr_confidence: 0,
          extracted_entities: [],
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('timeline_events').insert({
        dispute_id: input.disputeId,
        type: 'evidence_uploaded',
        title: `${input.source === 'merchant' ? 'Merchant' : input.source === 'customer' ? 'Customer' : 'System'} evidence uploaded`,
        description: `${input.name} was added to the case.`,
        actor: input.uploadedBy,
      });

      const { error: rpcErr } = await supabase.rpc('increment_evidence_count', {
        p_dispute_id: input.disputeId,
        p_source: input.source,
      });
      if (rpcErr) console.warn('increment_evidence_count failed:', rpcErr.message);

      return mapEvidence(data);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: K.evidence(variables.disputeId) });
      qc.invalidateQueries({ queryKey: K.disputes });
      qc.invalidateQueries({ queryKey: ['evidence', 'all'] });
    },
  });
}

export function useDeleteEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, disputeId }: { id: string; disputeId: string }) => {
      const { error } = await supabase.from('evidence_files').delete().eq('id', id);
      if (error) throw error;
      return { id, disputeId };
    },
    onSuccess: ({ disputeId }) => {
      qc.invalidateQueries({ queryKey: K.evidence(disputeId) });
      qc.invalidateQueries({ queryKey: K.disputes });
      qc.invalidateQueries({ queryKey: ['evidence', 'all'] });
    },
  });
}

export function useRecordDecision(disputeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ outcome, decidedBy, rationale }: { outcome: string; decidedBy: string; rationale: string }) => {
      const { data: disputeRow } = await supabase
        .from('disputes').select('ai_confidence, fairness_score').eq('id', disputeId).maybeSingle();

      const { data, error } = await supabase
        .from('decisions')
        .insert({
          dispute_id: disputeId,
          outcome,
          confidence: disputeRow?.ai_confidence || 0.5,
          fairness_score: disputeRow?.fairness_score || 0.5,
          decided_by: decidedBy,
          rationale,
          is_ai: false,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('disputes').update({ status: 'resolved', updated_at: new Date().toISOString() }).eq('id', disputeId);

      await supabase.from('timeline_events').insert({
        dispute_id: disputeId,
        type: 'decision',
        title: 'Decision recorded',
        description: rationale,
        actor: decidedBy,
      });

      return mapDecision(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: K.decision(disputeId) });
      qc.invalidateQueries({ queryKey: K.disputes });
      qc.invalidateQueries({ queryKey: K.dispute(disputeId) });
      qc.invalidateQueries({ queryKey: K.timeline(disputeId) });
    },
  });
}
