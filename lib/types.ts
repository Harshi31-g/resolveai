export type UserRole = 'admin' | 'investigator' | 'merchant' | 'cardmember';

export type DisputeStatus =
  | 'open'
  | 'evidence_gathering'
  | 'under_review'
  | 'ai_review'
  | 'pending_decision'
  | 'resolved'
  | 'appealed'
  | 'closed';

export type DisputePriority = 'low' | 'medium' | 'high' | 'critical';

export type DisputeReason =
  | 'fraud'
  | 'unauthorized'
  | 'product_not_received'
  | 'product_unacceptable'
  | 'duplicate_charge'
  | 'subscription_cancelled'
  | 'credit_not_processed'
  | 'incorrect_amount';

export type DecisionOutcome =
  | 'approve_merchant'
  | 'refund_customer'
  | 'request_more_evidence'
  | 'pending';

export type EvidenceType =
  | 'invoice'
  | 'receipt'
  | 'tracking'
  | 'email'
  | 'signature'
  | 'photo'
  | 'contract'
  | 'screenshot'
  | 'bank_statement'
  | 'other';

export type EvidenceSource = 'merchant' | 'customer' | 'system';

export type FileType = 'pdf' | 'image' | 'document' | 'email';

export type NotificationType =
  | 'dispute_created'
  | 'evidence_uploaded'
  | 'decision_made'
  | 'appeal_opened'
  | 'ai_complete'
  | 'assigned'
  | 'comment'
  | 'status_change';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  lastActive: string;
  status: 'active' | 'suspended' | 'invited';
}

export interface Merchant {
  id: string;
  name: string;
  logo: string;
  category: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  disputeRate: number;
  winRate: number;
  totalDisputes: number;
  rating: number;
  createdAt: string;
}

export interface CardMember {
  id: string;
  name: string;
  email: string;
  cardType: 'amex' | 'visa' | 'mastercard';
  cardLast4: string;
  country: string;
  createdAt: string;
  disputeCount: number;
}

export interface Transaction {
  id: string;
  merchantId: string;
  cardMemberId: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  status: 'completed' | 'refunded' | 'disputed' | 'pending';
  paymentMethod: string;
}

export interface EvidenceFile {
  id: string;
  disputeId: string;
  name: string;
  type: FileType;
  size: number;
  source: EvidenceSource;
  uploadedBy: string;
  uploadedAt: string;
  ocrStatus: 'pending' | 'processing' | 'complete' | 'failed';
  ocrConfidence: number;
  extractedEntities: ExtractedEntity[];
  evidenceType: EvidenceType;
  url?: string;
}

export interface ExtractedEntity {
  field: string;
  value: string;
  confidence: number;
  bbox?: { x: number; y: number; w: number; h: number };
}

export interface TimelineEvent {
  id: string;
  disputeId: string;
  type: NotificationType | 'dispute_created' | 'evidence_uploaded' | 'ai_processing' | 'decision' | 'appeal';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface EvidenceFactor {
  name: string;
  score: number;
  weight: number;
  reason: string;
  source: 'merchant' | 'customer' | 'system';
  reliability: 'high' | 'medium' | 'low';
}

export interface AIReasoning {
  id: string;
  disputeId: string;
  evidenceUsed: string[];
  evidenceIgnored: string[];
  reasoningChain: ReasoningStep[];
  confidence: number;
  fairnessScore: number;
  recommendation: DecisionOutcome;
  alternativeOutcomes: AlternativeOutcome[];
  policyReferences: string[];
  evidenceFactors: EvidenceFactor[];
  riskIndicators: RiskIndicator[];
  modelVersion: string;
  generatedAt: string;
}

export interface ReasoningStep {
  step: number;
  premise: string;
  conclusion: string;
  evidenceRef: string;
  confidence: number;
}

export interface AlternativeOutcome {
  outcome: DecisionOutcome;
  probability: number;
  rationale: string;
}

export interface RiskIndicator {
  label: string;
  level: 'low' | 'medium' | 'high';
  detail: string;
}

export interface Decision {
  id: string;
  disputeId: string;
  outcome: DecisionOutcome;
  confidence: number;
  fairnessScore: number;
  decidedBy: string;
  decidedAt: string;
  rationale: string;
  isAI: boolean;
  overridden?: boolean;
  overriddenBy?: string;
  overrideReason?: string;
}

export interface Appeal {
  id: string;
  disputeId: string;
  filedBy: 'merchant' | 'cardmember';
  reason: string;
  filedAt: string;
  status: 'open' | 'under_review' | 'approved' | 'denied';
  additionalEvidence?: string[];
  decidedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ip: string;
  metadata: Record<string, string>;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface Comment {
  id: string;
  disputeId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  disputeContext?: string;
  citations?: { label: string; ref: string }[];
}

export interface Dispute {
  id: string;
  caseNumber: string;
  transactionId: string;
  merchantId: string;
  cardMemberId: string;
  amount: number;
  currency: string;
  reason: DisputeReason;
  reasonDescription: string;
  status: DisputeStatus;
  priority: DisputePriority;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  assignedInvestigator?: string;
  assignedInvestigatorName?: string;
  aiConfidence: number;
  fairnessScore: number;
  recommendation: DecisionOutcome;
  evidenceCount: number;
  merchantEvidenceCount: number;
  customerEvidenceCount: number;
  timeline: TimelineEvent[];
  decision?: Decision;
  appeal?: Appeal;
  comments: Comment[];
  aiReasoning?: AIReasoning;
}
