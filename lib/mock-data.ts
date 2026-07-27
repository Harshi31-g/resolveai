import type {
  AuditLog,
  AIReasoning,
  AlternativeOutcome,
  Appeal,
  CardMember,
  Comment,
  Decision,
  DecisionOutcome,
  Dispute,
  DisputePriority,
  DisputeReason,
  DisputeStatus,
  EvidenceFactor,
  EvidenceFile,
  EvidenceType,
  ExtractedEntity,
  FileType,
  Merchant,
  Notification,
  RiskIndicator,
  TimelineEvent,
  Transaction,
  User,
  UserRole,
} from './types';

// Deterministic PRNG so the dataset is stable across reloads
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
};
const randInt = (min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, dp = 2) =>
  parseFloat((rng() * (max - min) + min).toFixed(dp));
const id = (prefix: string, n: number) =>
  `${prefix}_${String(n).padStart(5, '0')}`;
const daysAgo = (d: number) =>
  new Date(Date.now() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

const FIRST_NAMES = [
  'Sarah', 'James', 'Maria', 'David', 'Emma', 'Michael', 'Sofia', 'Daniel',
  'Olivia', 'William', 'Ava', 'Robert', 'Isabella', 'John', 'Mia', 'Chris',
  'Charlotte', 'Andrew', 'Amelia', 'Joshua', 'Harper', 'Ethan', 'Evelyn',
  'Marcus', 'Abigail', 'Liam', 'Emily', 'Noah', 'Elizabeth', 'Lucas',
  'Aisha', 'Raj', 'Yuki', 'Chen', 'Diego', 'Priya', 'Omar', 'Nadia',
  'Elena', 'Tariq', 'Anika', 'Sven', 'Lena', 'Mateo', 'Zara', 'Hassan',
  'Mei', 'Igor', 'Rosa', 'Kofi',
];
const LAST_NAMES = [
  'Chen', 'Patel', 'Garcia', 'Kim', 'Anderson', 'Müller', 'Silva', 'Nguyen',
  'Okafor', 'Rossi', 'Walsh', 'Mendez', 'Bauer', 'Singh', 'Lopez', 'Schmidt',
  'Yamamoto', 'Ivanov', 'Costa', 'Andersson', 'Kowalski', 'Reyes', 'Murphy',
  'Volkov', 'Park', 'Johnson', 'Williams', 'Brown', 'Jones', 'Taylor',
];
const MERCHANT_NAMES = [
  'TechNova Solutions', 'Apex Electronics', 'Lumen Apparel', 'CloudForge',
  'Verdant Grocer', 'Nimbus Travel', 'Atlas Hardware', 'Pulse Fitness',
  'Cobalt Books', 'Stellar Audio', 'Bloom Cosmetics', 'Quantum Labs',
  'Maple Furniture', 'Orbit Mobility', 'Crest Pharmacy', 'Sable Watches',
  'Harbor Bistro', 'Pinnacle Software', 'Driftwood Decor', 'Echo Music',
  'Granite Outdoors', 'Lattice Studio', 'Marble & Co', 'Vista Optics',
  'Forge Tools',
];
const MERCHANT_CATEGORIES = [
  'Electronics', 'Apparel', 'SaaS', 'Travel', 'Grocery', 'Hardware',
  'Fitness', 'Books', 'Audio', 'Beauty', 'Home Goods', 'Pharmacy',
];
const CITIES = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
  'Boston, MA', 'Chicago, IL', 'Denver, CO', 'Miami, FL', 'Atlanta, GA',
  'Portland, OR', 'London, UK', 'Toronto, CA', 'Berlin, DE', 'Sydney, AU',
];
const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia', 'France'];
const DISPUTE_REASONS: { key: DisputeReason; desc: string }[] = [
  { key: 'fraud', desc: 'Transaction not recognized by cardholder' },
  { key: 'unauthorized', desc: 'Cardholder denies authorizing the charge' },
  { key: 'product_not_received', desc: 'Goods or services never delivered' },
  { key: 'product_unacceptable', desc: 'Product differs materially from description' },
  { key: 'duplicate_charge', desc: 'Same transaction processed more than once' },
  { key: 'subscription_cancelled', desc: 'Subscription cancelled but still billed' },
  { key: 'credit_not_processed', desc: 'Refund promised but never received' },
  { key: 'incorrect_amount', desc: 'Charged amount exceeds authorized amount' },
];
const EVIDENCE_TYPES: EvidenceType[] = [
  'invoice', 'receipt', 'tracking', 'email', 'signature',
  'photo', 'contract', 'screenshot', 'bank_statement', 'other',
];
const FILE_TYPES: FileType[] = ['pdf', 'image', 'document', 'email'];
const INVESTIGATORS = ['Sarah Chen', 'Marcus Webb', 'Elena Rossi', 'David Kim', 'Aisha Okafor'];
const COMMENTS_SEEDS = [
  'Initial review complete. Evidence appears consistent with merchant records.',
  'Card member claims the charge appeared after subscription cancellation date.',
  'Tracking shows delivery 2 days before dispute was filed. Strong merchant case.',
  'Reached out to merchant for additional fulfillment documentation.',
  'OCR extraction on invoice shows amount mismatch of $12.40. Investigating.',
  'AI confidence is borderline. Recommending human review before decision.',
  'Customer provided email confirmation of cancellation. Compelling evidence.',
  'Duplicate charge confirmed via transaction log. Refund warranted.',
];
const AUDIT_ACTIONS = [
  'viewed_dispute', 'uploaded_evidence', 'ran_ai_analysis', 'made_decision',
  'opened_appeal', 'assigned_investigator', 'exported_report', 'updated_policy',
  'logged_in', 'changed_status', 'added_comment', 'overrode_ai',
];

function makeUsers(): User[] {
  const users: User[] = [];
  // 1 admin
  users.push({
    id: id('usr', 1), email: 'admin@resolveai.io', name: 'Alex Morgan',
    role: 'admin', avatar: '', createdAt: daysAgo(420), lastActive: hoursAgo(2),
    status: 'active',
  });
  // 5 investigators
  INVESTIGATORS.forEach((n, i) => users.push({
    id: id('usr', i + 2), email: n.toLowerCase().replace(' ', '.') + '@resolveai.io',
    name: n, role: 'investigator', avatar: '', createdAt: daysAgo(randInt(200, 400)),
    lastActive: hoursAgo(randInt(1, 48)), status: 'active',
  }));
  // 4 merchant users
  for (let i = 0; i < 4; i++) users.push({
    id: id('usr', i + 7), email: `merchant${i + 1}@example.com`,
    name: pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES), role: 'merchant', avatar: '',
    createdAt: daysAgo(randInt(60, 300)), lastActive: hoursAgo(randInt(1, 72)),
    status: 'active',
  });
  // 4 card member users
  for (let i = 0; i < 4; i++) users.push({
    id: id('usr', i + 11), email: `customer${i + 1}@example.com`,
    name: pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES), role: 'cardmember', avatar: '',
    createdAt: daysAgo(randInt(30, 200)), lastActive: hoursAgo(randInt(1, 96)),
    status: 'active',
  });
  return users;
}

function makeMerchants(): Merchant[] {
  return MERCHANT_NAMES.map((name, i) => ({
    id: id('mch', i + 1), name, logo: '', category: pick(MERCHANT_CATEGORIES),
    email: `billing@${name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
    phone: `+1 ${randInt(200, 999)}-${randInt(200, 999)}-${randInt(1000, 9999)}`,
    website: `https://${name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
    address: `${randInt(100, 9999)} Market St, ${pick(CITIES)}`,
    disputeRate: randFloat(0.5, 4.5, 2),
    winRate: randFloat(35, 78, 1),
    totalDisputes: randInt(20, 400),
    rating: randFloat(3.2, 4.9, 1),
    createdAt: daysAgo(randInt(180, 720)),
  }));
}

function makeCardMembers(): CardMember[] {
  const out: CardMember[] = [];
  for (let i = 0; i < 50; i++) out.push({
    id: id('cm', i + 1),
    name: pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES),
    email: `customer${i + 1}@email.com`,
    cardType: pick(['amex', 'visa', 'mastercard'] as ('amex' | 'visa' | 'mastercard')[]),
    cardLast4: String(randInt(1000, 9999)),
    country: pick(COUNTRIES),
    createdAt: daysAgo(randInt(30, 700)),
    disputeCount: randInt(0, 4),
  });
  return out;
}

function makeTransactions(
  merchants: Merchant[], members: CardMember[]
): Transaction[] {
  const out: Transaction[] = [];
  const descriptions = [
    'Premium Subscription Annual', 'Order #INV-2024 Pro Bundle',
    'Express Shipping Upgrade', 'Digital Download License',
    'Hardware Warranty Extension', 'Consulting Service Retainer',
    'Event Ticket Purchase', 'Refurbished Item Sale',
  ];
  for (let i = 0; i < 200; i++) {
    const m = pick(merchants); const c = pick(members);
    const status = pick(['completed', 'completed', 'completed', 'completed', 'disputed', 'refunded', 'pending'] as Transaction['status'][]);
    out.push({
      id: id('txn', i + 1), merchantId: m.id, cardMemberId: c.id,
      amount: randFloat(12.5, 2400, 2), currency: 'USD',
      date: daysAgo(randInt(1, 180)), description: pick(descriptions),
      status, paymentMethod: pick(['Visa ••1234', 'Amex ••0005', 'MC ••7782', 'Apple Pay']),
    });
  }
  return out;
}

function makeEvidenceFiles(
  disputeId: string, count: number, source: 'merchant' | 'customer' | 'system'
): EvidenceFile[] {
  const out: EvidenceFile[] = [];
  for (let i = 0; i < count; i++) {
    const et = pick(EVIDENCE_TYPES);
    const ft: FileType = et === 'email' ? 'email' : et === 'photo' ? 'image' : pick(['pdf', 'document', 'image']);
    const ocrConf = randFloat(0.72, 0.99, 3);
    const entities: ExtractedEntity[] = [
      { field: 'Amount', value: `$${randFloat(12.5, 2400, 2)}`, confidence: randFloat(0.85, 0.99, 2) },
      { field: 'Date', value: new Date(daysAgo(randInt(1, 90))).toLocaleDateString(), confidence: randFloat(0.8, 0.98, 2) },
      { field: 'Merchant', value: pick(MERCHANT_NAMES), confidence: randFloat(0.78, 0.97, 2) },
    ];
    if (et === 'tracking') entities.push({
      field: 'Tracking Number', value: `1Z${randInt(100000, 999999)}`,
      confidence: randFloat(0.82, 0.99, 2),
    });
    if (et === 'email') entities.push({
      field: 'Email From', value: `support@${pick(MERCHANT_NAMES).toLowerCase().replace(/[^a-z]/g, '')}.com`,
      confidence: randFloat(0.88, 0.99, 2),
    });
    out.push({
      id: id('ev', randInt(1, 99999) + i),
      disputeId, name: `${et}_${randInt(100, 999)}.${ft === 'image' ? 'png' : ft === 'email' ? 'eml' : 'pdf'}`,
      type: ft, size: randInt(45000, 4800000),
      source, uploadedBy: source === 'system' ? 'ResolveAI OCR Engine' : pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES),
      uploadedAt: hoursAgo(randInt(1, 400)),
      ocrStatus: pick(['complete', 'complete', 'complete', 'processing', 'pending'] as EvidenceFile['ocrStatus'][]),
      ocrConfidence: ocrConf,
      extractedEntities: entities,
      evidenceType: et,
    });
  }
  return out;
}

function makeTimeline(disputeId: string, createdAt: string, hasDecision: boolean, hasAppeal: boolean): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const c = new Date(createdAt).getTime();
  events.push({
    id: id('tl', randInt(1, 99999)), disputeId, type: 'dispute_created',
    title: 'Dispute filed', description: 'Card member initiated a dispute through their bank.',
    actor: 'System', timestamp: createdAt,
  });
  events.push({
    id: id('tl', randInt(1, 99999)), disputeId, type: 'evidence_uploaded',
    title: 'System evidence gathered', description: 'Transaction records, auth logs, and prior history auto-collected.',
    actor: 'ResolveAI Engine', timestamp: new Date(c + 3600000).toISOString(),
  });
  if (rng() > 0.3) events.push({
    id: id('tl', randInt(1, 99999)), disputeId, type: 'evidence_uploaded',
    title: 'Merchant submitted evidence', description: 'Invoice, shipping confirmation, and tracking number uploaded.',
    actor: 'Merchant Portal', timestamp: new Date(c + 7200000).toISOString(),
  });
  events.push({
    id: id('tl', randInt(1, 99999)), disputeId, type: 'ai_processing',
    title: 'AI analysis started', description: 'OCR extraction and evidence scoring in progress.',
    actor: 'ResolveAI Engine', timestamp: new Date(c + 10800000).toISOString(),
  });
  events.push({
    id: id('tl', randInt(1, 99999)), disputeId, type: 'ai_complete',
    title: 'AI analysis complete', description: 'Confidence score and recommendation generated.',
    actor: 'ResolveAI Engine', timestamp: new Date(c + 14400000).toISOString(),
  });
  if (hasDecision) events.push({
    id: id('tl', randInt(1, 99999)), disputeId, type: 'decision',
    title: 'Decision recorded', description: 'Final decision entered for this dispute.',
    actor: pick(INVESTIGATORS), timestamp: new Date(c + 21600000).toISOString(),
  });
  if (hasAppeal) events.push({
    id: id('tl', randInt(1, 99999)), disputeId, type: 'appeal',
    title: 'Appeal filed', description: 'A party has filed an appeal requesting review.',
    actor: 'Card Member', timestamp: new Date(c + 259200000).toISOString(),
  });
  return events.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
}

function makeAIReasoning(disputeId: string, confidence: number, fairness: number, recommendation: DecisionOutcome): AIReasoning {
  const factors: EvidenceFactor[] = [
    { name: 'Completeness', score: randFloat(0.6, 0.98, 2), weight: 0.25, reason: 'All required evidence types present.', source: 'system', reliability: 'high' },
    { name: 'Consistency', score: randFloat(0.55, 0.95, 2), weight: 0.2, reason: 'Merchant records align with transaction data.', source: 'merchant', reliability: 'medium' },
    { name: 'Corroboration', score: randFloat(0.5, 0.92, 2), weight: 0.2, reason: 'Tracking data confirms delivery timeline.', source: 'merchant', reliability: 'high' },
    { name: 'Authenticity', score: randFloat(0.6, 0.96, 2), weight: 0.2, reason: 'OCR confidence above threshold on key documents.', source: 'system', reliability: 'high' },
    { name: 'Timeliness', score: randFloat(0.5, 0.9, 2), weight: 0.15, reason: 'Evidence submitted within SLA window.', source: 'system', reliability: 'medium' },
  ];
  const alts = [
    { outcome: recommendation, probability: confidence, rationale: 'Primary recommendation supported by strongest evidence cluster.' },
    { outcome: 'request_more_evidence' as DecisionOutcome, probability: randFloat(0.1, 0.35, 2), rationale: 'Fallback if additional context is needed.' },
    { outcome: (recommendation === 'refund_customer' ? 'approve_merchant' : 'refund_customer') as DecisionOutcome, probability: randFloat(0.05, 0.3, 2), rationale: 'Alternative outcome with weaker evidence support.' },
  ].sort((a, b) => b.probability - a.probability) as AlternativeOutcome[];
  const risks: RiskIndicator[] = [];
  if (confidence < 0.7) risks.push({ label: 'Low confidence', level: 'high', detail: 'AI confidence below human-review threshold.' });
  if (fairness < 0.6) risks.push({ label: 'Fairness imbalance', level: 'medium', detail: 'Evidence skews heavily toward one party.' });
  if (rng() > 0.6) risks.push({ label: 'First-time dispute', level: 'low', detail: 'Card member has no prior dispute history.' });
  if (rng() > 0.7) risks.push({ label: 'High-value transaction', level: 'medium', detail: 'Amount exceeds $500 — extra review recommended.' });
  return {
    id: id('air', randInt(1, 99999)), disputeId,
    evidenceUsed: ['Invoice #INV-2291', 'Tracking 1Z884291', 'Authorization log', 'Customer email thread'],
    evidenceIgnored: ['Low-quality screenshot (OCR failed)'],
    reasoningChain: [
      { step: 1, premise: 'Merchant provided invoice matching the disputed amount.', conclusion: 'Charge amount is verified.', evidenceRef: 'Invoice #INV-2291', confidence: 0.94 },
      { step: 2, premise: 'Tracking number shows delivery 48h before dispute.', conclusion: 'Product was delivered.', evidenceRef: 'Tracking 1Z884291', confidence: 0.91 },
      { step: 3, premise: 'Card member did not provide cancellation email.', conclusion: 'Cancellation claim unsupported.', evidenceRef: 'Customer email thread (gaps)', confidence: 0.68 },
      { step: 4, premise: 'Combined evidence favors merchant.', conclusion: 'Recommend approving merchant.', evidenceRef: 'Fairness Engine v2.3', confidence },
    ],
    confidence, fairnessScore: fairness, recommendation,
    alternativeOutcomes: alts, evidenceFactors: factors, riskIndicators: risks,
    policyReferences: ['DISP-POL-2024-03 §4.2 (Evidence Sufficiency)', 'DISP-POL-2024-03 §6.1 (Auto-Resolution Thresholds)'],
    modelVersion: 'resolve-fairness-v2.3.1', generatedAt: hoursAgo(randInt(1, 96)),
  };
}

function makeComments(disputeId: string, count: number, users: User[]): Comment[] {
  const out: Comment[] = [];
  for (let i = 0; i < count; i++) {
    const u = pick(users);
    out.push({
      id: id('cmt', randInt(1, 99999) + i), disputeId,
      userId: u.id, userName: u.name, userRole: u.role,
      text: pick(COMMENTS_SEEDS), createdAt: hoursAgo(randInt(1, 200)),
    });
  }
  return out.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

function makeDisputes(
  txns: Transaction[], merchants: Merchant[], members: CardMember[], users: User[]
): Dispute[] {
  const disputedTxns = txns.filter((t) => t.status === 'disputed');
  const chosen = disputedTxns.length >= 75 ? disputedTxns : txns;
  const out: Dispute[] = [];
  for (let i = 0; i < 75; i++) {
    const t = chosen[i % chosen.length];
    const m = merchants.find((x) => x.id === t.merchantId)!;
    const c = members.find((x) => x.id === t.cardMemberId)!;
    const reason = pick(DISPUTE_REASONS);
    const createdAt = daysAgo(randInt(1, 120));
    const confidence = randFloat(0.45, 0.97, 2);
    const fairness = randFloat(0.5, 0.95, 2);
    let status: DisputeStatus;
    let recommendation: DecisionOutcome;
    if (confidence > 0.85) recommendation = rng() > 0.4 ? 'approve_merchant' : 'refund_customer';
    else if (confidence >= 0.6) recommendation = 'request_more_evidence';
    else recommendation = 'request_more_evidence';
    const roll = rng();
    if (roll < 0.45) status = 'resolved';
    else if (roll < 0.6) status = 'under_review';
    else if (roll < 0.7) status = 'evidence_gathering';
    else if (roll < 0.8) status = 'ai_review';
    else if (roll < 0.88) status = 'pending_decision';
    else if (roll < 0.94) status = 'appealed';
    else status = 'open';
    const hasDecision = status === 'resolved' || status === 'appealed';
    const hasAppeal = status === 'appealed';
    const priority: DisputePriority = t.amount > 800 ? 'critical' : t.amount > 300 ? 'high' : t.amount > 100 ? 'medium' : 'low';
    const investigator = rng() > 0.25 ? pick(INVESTIGATORS) : undefined;
    const meCount = randInt(1, 5);
    const ceCount = randInt(0, 3);
    const evidenceFiles = [
      ...makeEvidenceFiles(t.id, meCount, 'merchant'),
      ...makeEvidenceFiles(t.id, ceCount, 'customer'),
      ...makeEvidenceFiles(t.id, randInt(1, 2), 'system'),
    ];
    const caseNumber = `DSP-${2400 + i}`;
    const dispute: Dispute = {
      id: id('dsp', i + 1), caseNumber, transactionId: t.id,
      merchantId: m.id, cardMemberId: c.id,
      amount: t.amount, currency: 'USD',
      reason: reason.key, reasonDescription: reason.desc,
      status, priority, createdAt,
      updatedAt: hoursAgo(randInt(1, 72)),
      dueDate: new Date(+new Date(createdAt) + 14 * 86400000).toISOString(),
      assignedInvestigator: investigator ? id('usr', 2) : undefined,
      assignedInvestigatorName: investigator,
      aiConfidence: confidence, fairnessScore: fairness,
      recommendation, evidenceCount: evidenceFiles.length,
      merchantEvidenceCount: meCount, customerEvidenceCount: ceCount,
      timeline: [], comments: makeComments(t.id, randInt(0, 4), users),
      aiReasoning: makeAIReasoning(t.id, confidence, fairness, recommendation),
    };
    dispute.timeline = makeTimeline(dispute.id, createdAt, hasDecision, hasAppeal);
    if (hasDecision) {
      dispute.decision = {
        id: id('dec', i + 1), disputeId: dispute.id,
        outcome: recommendation === 'request_more_evidence' ? pick(['approve_merchant', 'refund_customer']) : recommendation,
        confidence, fairnessScore: fairness,
        decidedBy: investigator || 'ResolveAI Engine', decidedAt: hoursAgo(randInt(24, 200)),
        rationale: recommendation === 'approve_merchant'
          ? 'Evidence supports merchant — delivery confirmed and amount verified.'
          : recommendation === 'refund_customer'
          ? 'Insufficient merchant evidence; customer claim corroborated.'
          : 'Additional evidence required before a fair decision can be reached.',
        isAI: confidence > 0.85 && rng() > 0.5,
      };
    }
    if (hasAppeal) {
      dispute.appeal = {
        id: id('apl', i + 1), disputeId: dispute.id,
        filedBy: rng() > 0.5 ? 'merchant' : 'cardmember',
        reason: pick(['New evidence unavailable at time of decision', 'Procedural error in evidence handling', 'Decision does not reflect submitted evidence']),
        filedAt: hoursAgo(randInt(12, 96)),
        status: rng() > 0.5 ? 'open' : 'under_review',
      };
    }
    out.push(dispute);
  }
  return out;
}

function makeAuditLogs(users: User[], disputes: Dispute[]): AuditLog[] {
  const out: AuditLog[] = [];
  for (let i = 0; i < 120; i++) {
    const u = pick(users);
    const d = pick(disputes);
    out.push({
      id: id('aud', i + 1), userId: u.id, userName: u.name,
      action: pick(AUDIT_ACTIONS),
      resource: rng() > 0.5 ? 'dispute' : pick(['user', 'policy', 'evidence', 'report']),
      resourceId: d.id, timestamp: hoursAgo(randInt(1, 500)),
      ip: `${randInt(10, 220)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
      metadata: { caseNumber: d.caseNumber },
    });
  }
  return out.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

function makeNotifications(users: User[], disputes: Dispute[]): Notification[] {
  const out: Notification[] = [];
  const titles: Record<string, { title: string; desc: string }> = {
    dispute_created: { title: 'New dispute filed', desc: 'A new dispute requires attention.' },
    evidence_uploaded: { title: 'Evidence uploaded', desc: 'New evidence has been added to a case.' },
    decision_made: { title: 'Decision recorded', desc: 'A decision was made on a dispute.' },
    appeal_opened: { title: 'Appeal opened', desc: 'An appeal has been filed.' },
    ai_complete: { title: 'AI analysis complete', desc: 'Confidence and recommendation ready.' },
    assigned: { title: 'Case assigned', desc: 'A dispute has been assigned to you.' },
    comment: { title: 'New comment', desc: 'A colleague commented on a case.' },
    status_change: { title: 'Status updated', desc: 'A dispute changed status.' },
  };
  for (let i = 0; i < 40; i++) {
    const u = pick(users.filter((x) => x.role !== 'cardmember'));
    const d = pick(disputes);
    const type = pick(Object.keys(titles)) as Notification['type'];
    out.push({
      id: id('ntf', i + 1), userId: u.id, type,
      title: titles[type].title, description: `${titles[type].desc} — ${d.caseNumber}`,
      read: rng() > 0.4, timestamp: hoursAgo(randInt(1, 120)),
      link: `/disputes/${d.id}`,
    });
  }
  return out.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

export interface Dataset {
  users: User[];
  merchants: Merchant[];
  cardMembers: CardMember[];
  transactions: Transaction[];
  disputes: Dispute[];
  evidenceFiles: EvidenceFile[];
  auditLogs: AuditLog[];
  notifications: Notification[];
}

let cache: Dataset | null = null;

export function getDataset(): Dataset {
  if (cache) return cache;
  const users = makeUsers();
  const merchants = makeMerchants();
  const cardMembers = makeCardMembers();
  const transactions = makeTransactions(merchants, cardMembers);
  const disputes = makeDisputes(transactions, merchants, cardMembers, users);
  const evidenceFiles: EvidenceFile[] = disputes.flatMap((d) =>
    makeEvidenceFiles(d.id, d.evidenceCount, 'merchant').slice(0, d.merchantEvidenceCount)
      .concat(makeEvidenceFiles(d.id, d.customerEvidenceCount, 'customer'))
      .concat(makeEvidenceFiles(d.id, randInt(1, 2), 'system'))
  ).slice(0, 300);
  const auditLogs = makeAuditLogs(users, disputes);
  const notifications = makeNotifications(users, disputes);
  cache = {
    users, merchants, cardMembers, transactions,
    disputes, evidenceFiles, auditLogs, notifications,
  };
  return cache;
}

export function getDispute(id: string): Dispute | undefined {
  return getDataset().disputes.find((d) => d.id === id || d.caseNumber === id);
}
export function getMerchant(id: string) {
  return getDataset().merchants.find((m) => m.id === id);
}
export function getCardMember(id: string) {
  return getDataset().cardMembers.find((c) => c.id === id);
}
export function getTransaction(id: string) {
  return getDataset().transactions.find((t) => t.id === id);
}
export function getEvidenceForDispute(disputeId: string) {
  return getDataset().evidenceFiles.filter((e) => e.disputeId === disputeId);
}
export function getUser(id: string) {
  return getDataset().users.find((u) => u.id === id);
}

// --- Mutations (operate on the in-memory dataset) ---

export interface NewDisputeInput {
  merchantId: string;
  cardMemberId: string;
  amount: number;
  reason: DisputeReason;
  reasonDescription: string;
}

export function addDispute(input: NewDisputeInput): Dispute {
  const ds = getDataset();
  const caseNum = `DSP-${2400 + ds.disputes.length + 1}`;
  const disputeId = `dsp_${String(ds.disputes.length + 1).padStart(5, '0')}`;
  const now = new Date().toISOString();
  const timeline: TimelineEvent[] = [
    {
      id: `tl_${Date.now()}`,
      disputeId,
      type: 'dispute_created',
      title: 'Dispute filed',
      description: input.reasonDescription,
      actor: 'User',
      timestamp: now,
    },
  ];
  const dispute: Dispute = {
    id: disputeId,
    caseNumber: caseNum,
    transactionId: `txn_new_${ds.disputes.length + 1}`,
    merchantId: input.merchantId,
    cardMemberId: input.cardMemberId,
    amount: input.amount,
    currency: 'USD',
    reason: input.reason,
    reasonDescription: input.reasonDescription,
    status: 'open',
    priority: input.amount > 800 ? 'critical' : input.amount > 300 ? 'high' : input.amount > 100 ? 'medium' : 'low',
    createdAt: now,
    updatedAt: now,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    aiConfidence: 0.5,
    fairnessScore: 0.5,
    recommendation: 'pending',
    evidenceCount: 0,
    merchantEvidenceCount: 0,
    customerEvidenceCount: 0,
    timeline,
    comments: [],
    aiReasoning: undefined,
  };
  ds.disputes.unshift(dispute);
  return dispute;
}

export function removeEvidenceFile(evidenceId: string): boolean {
  const ds = getDataset();
  const idx = ds.evidenceFiles.findIndex((e) => e.id === evidenceId);
  if (idx === -1) return false;
  const [removed] = ds.evidenceFiles.splice(idx, 1);
  const dispute = ds.disputes.find((d) => d.id === removed.disputeId);
  if (dispute) {
    dispute.evidenceCount = Math.max(0, dispute.evidenceCount - 1);
    if (removed.source === 'merchant') dispute.merchantEvidenceCount = Math.max(0, dispute.merchantEvidenceCount - 1);
    if (removed.source === 'customer') dispute.customerEvidenceCount = Math.max(0, dispute.customerEvidenceCount - 1);
  }
  return true;
}
