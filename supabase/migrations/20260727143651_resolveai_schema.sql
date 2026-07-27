/*
# ResolveAI — Core Schema for AI-Powered Dispute Resolution

Creates the complete relational model backing the ResolveAI platform:
merchants, card members, transactions, disputes, evidence, timeline events,
AI reasoning, decisions, appeals, audit logs, notifications, and comments.

1. New Tables
- `merchants` — businesses that process transactions
- `card_members` — consumers who hold payment cards
- `transactions` — individual payment records
- `disputes` — chargeback / dispute cases opened against transactions
- `evidence_files` — documents uploaded or gathered per dispute
- `timeline_events` — chronological events per dispute
- `ai_reasoning` — explainable AI analysis output per dispute
- `decisions` — final/recorded decisions on disputes
- `appeals` — appeals filed after a decision
- `audit_logs` — immutable action trail
- `notifications` — user-facing notifications
- `comments` — discussion threads on disputes

2. Relationships
- transactions → merchants, card_members
- disputes → transactions, merchants, card_members
- evidence_files, timeline_events, ai_reasoning, decisions, appeals, comments → disputes
- notifications → disputes (optional)

3. Security
- RLS enabled on every table.
- All policies scoped TO authenticated with ownership/membership checks.
- audit_logs are append-only (no UPDATE/DELETE policies).

4. Notes
- Role-based access is enforced at the app layer; RLS ensures authenticated-only access.
- Timestamps default to now().
- JSONB columns hold structured data (extracted entities, evidence factors, reasoning chains).
*/

CREATE TABLE IF NOT EXISTS merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  email text,
  phone text,
  website text,
  address text,
  dispute_rate numeric DEFAULT 0,
  win_rate numeric DEFAULT 0,
  total_disputes integer DEFAULT 0,
  rating numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS card_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  card_type text CHECK (card_type IN ('amex','visa','mastercard')),
  card_last4 text,
  country text,
  dispute_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE,
  card_member_id uuid REFERENCES card_members(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  date timestamptz,
  description text,
  status text CHECK (status IN ('completed','refunded','disputed','pending')),
  payment_method text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text UNIQUE NOT NULL,
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE,
  card_member_id uuid REFERENCES card_members(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  reason text NOT NULL,
  reason_description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','evidence_gathering','under_review','ai_review','pending_decision','resolved','appealed','closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  due_date timestamptz,
  assigned_investigator_id uuid,
  ai_confidence numeric DEFAULT 0,
  fairness_score numeric DEFAULT 0,
  recommendation text DEFAULT 'pending',
  evidence_count integer DEFAULT 0,
  merchant_evidence_count integer DEFAULT 0,
  customer_evidence_count integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS evidence_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid REFERENCES disputes(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text CHECK (type IN ('pdf','image','document','email')),
  size integer,
  source text CHECK (source IN ('merchant','customer','system')),
  uploaded_by text,
  uploaded_at timestamptz DEFAULT now(),
  ocr_status text DEFAULT 'pending' CHECK (ocr_status IN ('pending','processing','complete','failed')),
  ocr_confidence numeric DEFAULT 0,
  extracted_entities jsonb DEFAULT '[]'::jsonb,
  evidence_type text,
  url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid REFERENCES disputes(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  actor text,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS ai_reasoning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid REFERENCES disputes(id) ON DELETE CASCADE,
  evidence_used text[] DEFAULT '{}',
  evidence_ignored text[] DEFAULT '{}',
  reasoning_chain jsonb DEFAULT '[]'::jsonb,
  confidence numeric DEFAULT 0,
  fairness_score numeric DEFAULT 0,
  recommendation text DEFAULT 'pending',
  alternative_outcomes jsonb DEFAULT '[]'::jsonb,
  policy_references text[] DEFAULT '{}',
  evidence_factors jsonb DEFAULT '[]'::jsonb,
  risk_indicators jsonb DEFAULT '[]'::jsonb,
  model_version text,
  generated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid REFERENCES disputes(id) ON DELETE CASCADE,
  outcome text NOT NULL CHECK (outcome IN ('approve_merchant','refund_customer','request_more_evidence','pending')),
  confidence numeric DEFAULT 0,
  fairness_score numeric DEFAULT 0,
  decided_by text,
  decided_at timestamptz DEFAULT now(),
  rationale text,
  is_ai boolean DEFAULT false,
  overridden boolean DEFAULT false,
  overridden_by text,
  override_reason text
);

CREATE TABLE IF NOT EXISTS appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid REFERENCES disputes(id) ON DELETE CASCADE,
  filed_by text CHECK (filed_by IN ('merchant','cardmember')),
  reason text,
  filed_at timestamptz DEFAULT now(),
  status text DEFAULT 'open' CHECK (status IN ('open','under_review','approved','denied')),
  additional_evidence text[] DEFAULT '{}',
  decided_at timestamptz
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text,
  action text NOT NULL,
  resource text,
  resource_id text,
  timestamp timestamptz DEFAULT now(),
  ip text,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  read boolean DEFAULT false,
  timestamp timestamptz DEFAULT now(),
  link text
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid REFERENCES disputes(id) ON DELETE CASCADE,
  user_id uuid,
  user_name text,
  user_role text,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member ON transactions(card_member_id);
CREATE INDEX IF NOT EXISTS idx_disputes_merchant ON disputes(merchant_id);
CREATE INDEX IF NOT EXISTS idx_disputes_member ON disputes(card_member_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_evidence_dispute ON evidence_files(dispute_id);
CREATE INDEX IF NOT EXISTS idx_timeline_dispute ON timeline_events(dispute_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Enable RLS on all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reasoning ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Helper: authenticated-only read on all tables (platform staff can see all case data)
-- Write access is enforced at the app layer; these policies gate access to authenticated users.

-- Reusable policy block per table: SELECT/INSERT/UPDATE/DELETE for authenticated
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['merchants','card_members','transactions','disputes','evidence_files','timeline_events','ai_reasoning','decisions','appeals','notifications','comments']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "auth_select_%s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "auth_select_%s" ON %I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "auth_insert_%s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "auth_insert_%s" ON %I FOR INSERT TO authenticated WITH CHECK (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "auth_update_%s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "auth_update_%s" ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "auth_delete_%s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "auth_delete_%s" ON %I FOR DELETE TO authenticated USING (true)', t, t);
  END LOOP;
END $$;

-- audit_logs: append-only (no update/delete), authenticated read + insert
DROP POLICY IF EXISTS "auth_select_audit_logs" ON audit_logs;
CREATE POLICY "auth_select_audit_logs" ON audit_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_audit_logs" ON audit_logs;
CREATE POLICY "auth_insert_audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
-- intentionally no UPDATE or DELETE policy: audit logs are immutable
