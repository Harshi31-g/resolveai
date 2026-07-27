/*
# Evidence count increment helper

1. Purpose
- `increment_evidence_count(p_dispute_id, p_source)` atomically increments
  the evidence_count (and the source-specific counter) on a dispute when a
  new evidence file is uploaded.

2. Notes
- SECURITY DEFINER so it can run regardless of RLS on disputes.
- Idempotent enough for the upload-after-insert flow.
*/

CREATE OR REPLACE FUNCTION increment_evidence_count(p_dispute_id uuid, p_source text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE disputes
  SET
    evidence_count = evidence_count + 1,
    merchant_evidence_count = merchant_evidence_count + CASE WHEN p_source = 'merchant' THEN 1 ELSE 0 END,
    customer_evidence_count = customer_evidence_count + CASE WHEN p_source = 'customer' THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE id = p_dispute_id;
END;
$$;
