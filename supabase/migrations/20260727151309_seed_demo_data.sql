/*
# Seed demo merchants, card members, disputes, evidence, timeline, AI reasoning

1. Purpose
- Populate the platform with realistic demo data so new sign-ups see a
  populated dashboard, disputes list, and evidence library immediately.

2. Data inserted (idempotent via ON CONFLICT DO NOTHING)
- 6 merchants, 4 card members, 6 transactions, 6 disputes (all statuses),
  10 evidence files, timeline events, AI reasoning rows, 3 decisions.

3. Notes
- Shared platform data, accessible to all authenticated users (existing RLS).
*/

INSERT INTO merchants (id, name, category, email, phone, website, address, dispute_rate, win_rate, total_disputes, rating)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'TechNova Solutions', 'Electronics', 'billing@technova.com', '+1 415-555-0142', 'https://technova.com', '100 Market St, San Francisco, CA', 2.4, 68.5, 142, 4.6),
  ('11111111-1111-1111-1111-111111111102', 'Apex Electronics', 'Electronics', 'support@apexelec.com', '+1 212-555-0177', 'https://apexelec.com', '440 5th Ave, New York, NY', 3.1, 55.2, 98, 4.1),
  ('11111111-1111-1111-1111-111111111103', 'Lumen Apparel', 'Apparel', 'orders@lumenapparel.com', '+1 512-555-0190', 'https://lumenapparel.com', '22 Congress Ave, Austin, TX', 1.8, 72.0, 64, 4.8),
  ('11111111-1111-1111-1111-111111111104', 'CloudForge', 'SaaS', 'billing@cloudforge.io', '+1 206-555-0113', 'https://cloudforge.io', '77 Pine St, Seattle, WA', 4.2, 61.3, 210, 3.9),
  ('11111111-1111-1111-1111-111111111105', 'Verdant Grocer', 'Grocery', 'help@verdantgrocer.com', '+1 305-555-0164', 'https://verdantgrocer.com', '900 Ocean Dr, Miami, FL', 0.9, 78.4, 31, 4.4),
  ('11111111-1111-1111-1111-111111111106', 'Nimbus Travel', 'Travel', 'bookings@nimbustravel.com', '+1 312-555-0155', 'https://nimbustravel.com', '15 Navy Pier, Chicago, IL', 2.7, 49.8, 87, 3.7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO card_members (id, name, email, card_type, card_last4, country, dispute_count)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'Sarah Chen', 'sarah.chen@email.com', 'visa', '4291', 'United States', 2),
  ('22222222-2222-2222-2222-222222222202', 'David Kim', 'david.kim@email.com', 'amex', '0005', 'Canada', 1),
  ('22222222-2222-2222-2222-222222222203', 'Maria Garcia', 'maria.garcia@email.com', 'mastercard', '7782', 'United Kingdom', 0),
  ('22222222-2222-2222-2222-222222222204', 'James Anderson', 'james.anderson@email.com', 'visa', '1183', 'Germany', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO transactions (id, merchant_id, card_member_id, amount, currency, date, description, status, payment_method)
VALUES
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 349.99, 'USD', now() - interval '12 days', 'Pro Bundle Order #INV-2024', 'disputed', 'Visa ••4291'),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202', 1299.00, 'USD', now() - interval '20 days', 'Refurbished Laptop Sale', 'disputed', 'Amex ••0005'),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222203', 89.50, 'USD', now() - interval '5 days', 'Winter Coat Purchase', 'disputed', 'MC ••7782'),
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222204', 29.99, 'USD', now() - interval '30 days', 'Premium Subscription Annual', 'disputed', 'Visa ••1183'),
  ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 599.00, 'USD', now() - interval '45 days', 'Hardware Warranty Extension', 'disputed', 'Visa ••4291'),
  ('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222203', 42.75, 'USD', now() - interval '8 days', 'Grocery Delivery Order', 'disputed', 'MC ••7782')
ON CONFLICT (id) DO NOTHING;

INSERT INTO disputes (id, case_number, transaction_id, merchant_id, card_member_id, amount, currency, reason, reason_description, status, priority, created_at, updated_at, due_date, ai_confidence, fairness_score, recommendation, evidence_count, merchant_evidence_count, customer_evidence_count)
VALUES
  ('44444444-4444-4444-4444-444444444401', 'DSP-2401', '33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 349.99, 'USD', 'product_not_received', 'Goods never delivered to cardholder', 'under_review', 'high', now() - interval '12 days', now() - interval '4 hours', now() + interval '2 days', 0.88, 0.82, 'approve_merchant', 4, 2, 1),
  ('44444444-4444-4444-4444-444444444402', 'DSP-2402', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202', 1299.00, 'USD', 'product_unacceptable', 'Item condition differs from description', 'evidence_gathering', 'critical', now() - interval '20 days', now() - interval '8 hours', now() + interval '1 day', 0.58, 0.64, 'request_more_evidence', 3, 1, 1),
  ('44444444-4444-4444-4444-444444444403', 'DSP-2403', '33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222203', 89.50, 'USD', 'duplicate_charge', 'Same transaction processed twice', 'resolved', 'medium', now() - interval '5 days', now() - interval '1 day', now() - interval '2 days', 0.92, 0.89, 'refund_customer', 3, 2, 1),
  ('44444444-4444-4444-4444-444444444404', 'DSP-2404', '33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222204', 29.99, 'USD', 'subscription_cancelled', 'Subscription cancelled but still billed', 'appealed', 'low', now() - interval '30 days', now() - interval '3 days', now() - interval '5 days', 0.75, 0.71, 'refund_customer', 4, 2, 2),
  ('44444444-4444-4444-4444-444444444405', 'DSP-2405', '33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 599.00, 'USD', 'fraud', 'Transaction not recognized by cardholder', 'ai_review', 'high', now() - interval '45 days', now() - interval '2 hours', now() + interval '3 days', 0.67, 0.70, 'request_more_evidence', 2, 1, 1),
  ('44444444-4444-4444-4444-444444444406', 'DSP-2406', '33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222203', 42.75, 'USD', 'incorrect_amount', 'Charged amount exceeds authorized amount', 'open', 'low', now() - interval '8 days', now() - interval '6 hours', now() + interval '6 days', 0.50, 0.55, 'pending', 1, 0, 1)
ON CONFLICT (case_number) DO NOTHING;

INSERT INTO evidence_files (id, dispute_id, name, type, size, source, uploaded_by, uploaded_at, ocr_status, ocr_confidence, extracted_entities, evidence_type)
VALUES
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'invoice_482.pdf', 'pdf', 248000, 'merchant', 'Sarah Chen', now() - interval '10 days', 'complete', 0.94, '[{"field":"Amount","value":"$349.99","confidence":0.97},{"field":"Date","value":"Jul 15, 2026","confidence":0.93},{"field":"Merchant","value":"TechNova Solutions","confidence":0.91}]'::jsonb, 'invoice'),
  ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401', 'tracking_1z884.png', 'image', 512000, 'merchant', 'Sarah Chen', now() - interval '10 days', 'complete', 0.96, '[{"field":"Tracking Number","value":"1Z88429104","confidence":0.95},{"field":"Status","value":"Delivered","confidence":0.92}]'::jsonb, 'tracking'),
  ('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444401', 'auth_log.pdf', 'pdf', 98000, 'system', 'ResolveAI Engine', now() - interval '11 days', 'complete', 0.99, '[{"field":"Auth Status","value":"Approved","confidence":0.99},{"field":"AVS Match","value":"Full","confidence":0.97}]'::jsonb, 'screenshot'),
  ('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444401', 'customer_claim.eml', 'email', 34000, 'customer', 'Sarah Chen', now() - interval '9 days', 'complete', 0.88, '[{"field":"Email From","value":"sarah.chen@email.com","confidence":0.99},{"field":"Claim","value":"Never received package","confidence":0.85}]'::jsonb, 'email'),
  ('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444402', 'product_photo.png', 'image', 1840000, 'customer', 'David Kim', now() - interval '18 days', 'complete', 0.79, '[{"field":"Condition","value":"Scratched screen","confidence":0.72}]'::jsonb, 'photo'),
  ('55555555-5555-5555-5555-555555555506', '44444444-4444-4444-4444-444444444402', 'listing_screenshot.png', 'image', 320000, 'merchant', 'Apex Electronics', now() - interval '17 days', 'complete', 0.91, '[{"field":"Condition Listed","value":"Good","confidence":0.90}]'::jsonb, 'screenshot'),
  ('55555555-5555-5555-5555-555555555507', '44444444-4444-4444-4444-444444444403', 'receipt_219.pdf', 'pdf', 156000, 'merchant', 'Lumen Apparel', now() - interval '4 days', 'complete', 0.93, '[{"field":"Amount","value":"$89.50","confidence":0.95},{"field":"Date","value":"Jul 20, 2026","confidence":0.92}]'::jsonb, 'receipt'),
  ('55555555-5555-5555-5555-555555555508', '44444444-4444-4444-4444-444444444403', 'bank_statement.pdf', 'pdf', 410000, 'customer', 'Maria Garcia', now() - interval '3 days', 'complete', 0.87, '[{"field":"Duplicate Charge","value":"$89.50 x2","confidence":0.89}]'::jsonb, 'bank_statement'),
  ('55555555-5555-5555-5555-555555555509', '44444444-4444-4444-4444-444444444404', 'cancellation_email.eml', 'email', 28000, 'customer', 'James Anderson', now() - interval '28 days', 'complete', 0.94, '[{"field":"Cancellation Date","value":"Jun 1, 2026","confidence":0.93}]'::jsonb, 'email'),
  ('55555555-5555-5555-5555-555555555510', '44444444-4444-4444-4444-444444444405', 'signature_proof.pdf', 'pdf', 88000, 'merchant', 'TechNova Solutions', now() - interval '40 days', 'complete', 0.90, '[{"field":"Signature Match","value":"Verified","confidence":0.88}]'::jsonb, 'signature')
ON CONFLICT (id) DO NOTHING;

INSERT INTO timeline_events (dispute_id, type, title, description, actor, timestamp)
SELECT d.id, 'dispute_created', 'Dispute filed', d.reason_description, 'System', d.created_at FROM disputes d WHERE d.case_number LIKE 'DSP-240%'
ON CONFLICT DO NOTHING;

INSERT INTO timeline_events (dispute_id, type, title, description, actor, timestamp)
SELECT d.id, 'evidence_uploaded', 'System evidence gathered', 'Transaction records and auth logs auto-collected.', 'ResolveAI Engine', d.created_at + interval '1 hour'
FROM disputes d WHERE d.case_number LIKE 'DSP-240%'
ON CONFLICT DO NOTHING;

INSERT INTO timeline_events (dispute_id, type, title, description, actor, timestamp)
SELECT d.id, 'ai_processing', 'AI analysis started', 'OCR extraction and evidence scoring in progress.', 'ResolveAI Engine', d.created_at + interval '3 hours'
FROM disputes d WHERE d.case_number LIKE 'DSP-240%'
ON CONFLICT DO NOTHING;

INSERT INTO timeline_events (dispute_id, type, title, description, actor, timestamp)
SELECT d.id, 'ai_complete', 'AI analysis complete', 'Confidence score and recommendation generated.', 'ResolveAI Engine', d.created_at + interval '4 hours'
FROM disputes d WHERE d.case_number LIKE 'DSP-240%'
ON CONFLICT DO NOTHING;

INSERT INTO timeline_events (dispute_id, type, title, description, actor, timestamp)
SELECT d.id, 'decision', 'Decision recorded', 'Final decision entered for this dispute.', 'Investigator', d.updated_at
FROM disputes d WHERE d.status IN ('resolved','appealed')
ON CONFLICT DO NOTHING;

INSERT INTO timeline_events (dispute_id, type, title, description, actor, timestamp)
SELECT d.id, 'appeal', 'Appeal filed', 'A party has filed an appeal requesting review.', 'Card Member', d.updated_at
FROM disputes d WHERE d.status = 'appealed'
ON CONFLICT DO NOTHING;

INSERT INTO ai_reasoning (id, dispute_id, evidence_used, evidence_ignored, reasoning_chain, confidence, fairness_score, recommendation, alternative_outcomes, policy_references, evidence_factors, risk_indicators, model_version, generated_at)
VALUES
  ('66666666-6666-6666-6666-666666666601', '44444444-4444-4444-4444-444444444401', ARRAY['Invoice','Tracking','Auth log','Customer email'], ARRAY[]::text[], '[{"step":1,"premise":"Merchant provided invoice matching the disputed amount.","conclusion":"Charge amount is verified.","evidenceRef":"Invoice","confidence":0.94},{"step":2,"premise":"Tracking number shows delivery before dispute.","conclusion":"Product was delivered.","evidenceRef":"Tracking","confidence":0.91},{"step":3,"premise":"Card member did not provide cancellation proof.","conclusion":"Claim unsupported.","evidenceRef":"Customer email","confidence":0.68},{"step":4,"premise":"Combined evidence favors merchant.","conclusion":"Recommend approving merchant.","evidenceRef":"Fairness Engine v2.3","confidence":0.88}]'::jsonb, 0.88, 0.82, 'approve_merchant', '[{"outcome":"approve_merchant","probability":0.88,"rationale":"Primary recommendation supported by strongest evidence cluster."},{"outcome":"request_more_evidence","probability":0.2,"rationale":"Fallback if additional context is needed."}]'::jsonb, ARRAY['DISP-POL-2024-03 §4.2','DISP-POL-2024-03 §6.1'], '[{"name":"Completeness","score":0.88,"weight":0.25,"reason":"All required evidence types present.","source":"system","reliability":"high"},{"name":"Consistency","score":0.82,"weight":0.2,"reason":"Merchant records align with transaction data.","source":"merchant","reliability":"medium"},{"name":"Corroboration","score":0.79,"weight":0.2,"reason":"Tracking data confirms delivery timeline.","source":"merchant","reliability":"high"},{"name":"Authenticity","score":0.91,"weight":0.2,"reason":"OCR confidence above threshold on key documents.","source":"system","reliability":"high"},{"name":"Timeliness","score":0.75,"weight":0.15,"reason":"Evidence submitted within SLA window.","source":"system","reliability":"medium"}]'::jsonb, '[]'::jsonb, 'resolve-fairness-v2.3.1', now() - interval '11 days'),
  ('66666666-6666-6666-6666-666666666602', '44444444-4444-4444-4444-444444444402', ARRAY['Product photo','Listing screenshot'], ARRAY[]::text[], '[{"step":1,"premise":"Customer photo shows scratched screen.","conclusion":"Condition issue confirmed.","evidenceRef":"Product photo","confidence":0.72},{"step":2,"premise":"Listing screenshot says Good condition.","conclusion":"Possible misrepresentation.","evidenceRef":"Listing screenshot","confidence":0.68},{"step":3,"premise":"Conflicting condition reports.","conclusion":"Need more evidence.","evidenceRef":"Fairness Engine v2.3","confidence":0.58}]'::jsonb, 0.58, 0.64, 'request_more_evidence', '[{"outcome":"request_more_evidence","probability":0.58,"rationale":"Conflicting evidence requires more documentation."},{"outcome":"refund_customer","probability":0.3,"rationale":"Customer photo supports claim."}]'::jsonb, ARRAY['DISP-POL-2024-03 §4.2'], '[{"name":"Completeness","score":0.55,"weight":0.25,"reason":"Missing detailed inspection report.","source":"system","reliability":"medium"},{"name":"Consistency","score":0.48,"weight":0.2,"reason":"Conflicting condition descriptions.","source":"customer","reliability":"low"},{"name":"Corroboration","score":0.52,"weight":0.2,"reason":"Only two sources, conflicting.","source":"merchant","reliability":"medium"},{"name":"Authenticity","score":0.79,"weight":0.2,"reason":"Photos appear genuine.","source":"customer","reliability":"medium"},{"name":"Timeliness","score":0.70,"weight":0.15,"reason":"Evidence submitted within window.","source":"system","reliability":"medium"}]'::jsonb, '[{"label":"Low confidence","level":"high","detail":"AI confidence below human-review threshold."},{"label":"Conflicting evidence","level":"medium","detail":"Merchant and customer reports disagree."}]'::jsonb, 'resolve-fairness-v2.3.1', now() - interval '19 days'),
  ('66666666-6666-6666-6666-666666666603', '44444444-4444-4444-4444-444444444403', ARRAY['Receipt','Bank statement'], ARRAY[]::text[], '[{"step":1,"premise":"Bank statement shows duplicate charge.","conclusion":"Duplicate confirmed.","evidenceRef":"Bank statement","confidence":0.89},{"step":2,"premise":"Receipt shows single transaction.","conclusion":"System error likely.","evidenceRef":"Receipt","confidence":0.91},{"step":3,"premise":"Duplicate verified, refund warranted.","conclusion":"Recommend refunding customer.","evidenceRef":"Fairness Engine v2.3","confidence":0.92}]'::jsonb, 0.92, 0.89, 'refund_customer', '[{"outcome":"refund_customer","probability":0.92,"rationale":"Duplicate charge verified."},{"outcome":"approve_merchant","probability":0.05,"rationale":"Unlikely given evidence."}]'::jsonb, ARRAY['DISP-POL-2024-03 §6.1'], '[{"name":"Completeness","score":0.90,"weight":0.25,"reason":"Both receipt and statement present.","source":"system","reliability":"high"},{"name":"Consistency","score":0.85,"weight":0.2,"reason":"Receipt and statement align on amount.","source":"merchant","reliability":"high"},{"name":"Corroboration","score":0.88,"weight":0.2,"reason":"Bank confirms duplicate.","source":"customer","reliability":"high"},{"name":"Authenticity","score":0.93,"weight":0.2,"reason":"Bank statement verified.","source":"system","reliability":"high"},{"name":"Timeliness","score":0.82,"weight":0.15,"reason":"Prompt submission.","source":"system","reliability":"high"}]'::jsonb, '[]'::jsonb, 'resolve-fairness-v2.3.1', now() - interval '4 days'),
  ('66666666-6666-6666-6666-666666666604', '44444444-4444-4444-4444-444444444404', ARRAY['Cancellation email','Subscription records'], ARRAY[]::text[], '[{"step":1,"premise":"Cancellation email dated before charge.","conclusion":"Subscription should have been cancelled.","evidenceRef":"Cancellation email","confidence":0.93},{"step":2,"premise":"Merchant billed after cancellation date.","conclusion":"Charge is erroneous.","evidenceRef":"Subscription records","confidence":0.88},{"step":3,"premise":"Customer claim corroborated.","conclusion":"Recommend refunding customer.","evidenceRef":"Fairness Engine v2.3","confidence":0.75}]'::jsonb, 0.75, 0.71, 'refund_customer', '[{"outcome":"refund_customer","probability":0.75,"rationale":"Cancellation proof provided."},{"outcome":"request_more_evidence","probability":0.2,"rationale":"Need billing system logs."}]'::jsonb, ARRAY['DISP-POL-2024-03 §4.2'], '[{"name":"Completeness","score":0.80,"weight":0.25,"reason":"Cancellation proof present.","source":"customer","reliability":"high"},{"name":"Consistency","score":0.74,"weight":0.2,"reason":"Dates align with claim.","source":"system","reliability":"medium"},{"name":"Corroboration","score":0.70,"weight":0.2,"reason":"Email and records agree.","source":"customer","reliability":"medium"},{"name":"Authenticity","score":0.85,"weight":0.2,"reason":"Email verified genuine.","source":"system","reliability":"high"},{"name":"Timeliness","score":0.68,"weight":0.15,"reason":"Appeal filed promptly.","source":"system","reliability":"medium"}]'::jsonb, '[]'::jsonb, 'resolve-fairness-v2.3.1', now() - interval '29 days'),
  ('66666666-6666-6666-6666-666666666605', '44444444-4444-4444-4444-444444444405', ARRAY['Signature proof','Auth log'], ARRAY[]::text[], '[{"step":1,"premise":"Cardholder denies transaction.","conclusion":"Fraud claim made.","evidenceRef":"Customer claim","confidence":0.65},{"step":2,"premise":"Signature proof suggests verification.","conclusion":"Authorization possible.","evidenceRef":"Signature proof","confidence":0.70},{"step":3,"premise":"Inconclusive — need more evidence.","conclusion":"Request additional documentation.","evidenceRef":"Fairness Engine v2.3","confidence":0.67}]'::jsonb, 0.67, 0.70, 'request_more_evidence', '[{"outcome":"request_more_evidence","probability":0.67,"rationale":"Need device and IP logs."},{"outcome":"approve_merchant","probability":0.25,"rationale":"Signature supports merchant."}]'::jsonb, ARRAY['DISP-POL-2024-03 §4.2'], '[{"name":"Completeness","score":0.65,"weight":0.25,"reason":"Missing device/IP logs.","source":"system","reliability":"medium"},{"name":"Consistency","score":0.68,"weight":0.2,"reason":"Signature partially corroborates.","source":"merchant","reliability":"medium"},{"name":"Corroboration","score":0.60,"weight":0.2,"reason":"Limited cross-source agreement.","source":"system","reliability":"low"},{"name":"Authenticity","score":0.72,"weight":0.2,"reason":"Signature verified.","source":"merchant","reliability":"medium"},{"name":"Timeliness","score":0.78,"weight":0.15,"reason":"Filed within window.","source":"system","reliability":"medium"}]'::jsonb, '[{"label":"Low confidence","level":"high","detail":"AI confidence below human-review threshold."}]'::jsonb, 'resolve-fairness-v2.3.1', now() - interval '44 days'),
  ('66666666-6666-6666-6666-666666666606', '44444444-4444-4444-4444-444444444406', ARRAY[]::text[], ARRAY[]::text[], '[{"step":1,"premise":"Dispute newly filed.","conclusion":"Awaiting evidence.","evidenceRef":"System","confidence":0.50}]'::jsonb, 0.50, 0.55, 'pending', '[{"outcome":"pending","probability":0.5,"rationale":"No evidence yet."}]'::jsonb, ARRAY['DISP-POL-2024-03 §4.2'], '[{"name":"Completeness","score":0.30,"weight":0.25,"reason":"No evidence submitted.","source":"system","reliability":"low"},{"name":"Consistency","score":0.50,"weight":0.2,"reason":"Insufficient data.","source":"system","reliability":"low"},{"name":"Corroboration","score":0.40,"weight":0.2,"reason":"No sources.","source":"system","reliability":"low"},{"name":"Authenticity","score":0.50,"weight":0.2,"reason":"N/A.","source":"system","reliability":"low"},{"name":"Timeliness","score":0.80,"weight":0.15,"reason":"Recently filed.","source":"system","reliability":"medium"}]'::jsonb, '[{"label":"Low confidence","level":"high","detail":"No evidence gathered yet."}]'::jsonb, 'resolve-fairness-v2.3.1', now() - interval '7 days')
ON CONFLICT DO NOTHING;

INSERT INTO decisions (dispute_id, outcome, confidence, fairness_score, decided_by, decided_at, rationale, is_ai)
SELECT d.id, d.recommendation, d.ai_confidence, d.fairness_score, 'Investigator', d.updated_at,
  CASE WHEN d.recommendation = 'approve_merchant' THEN 'Evidence supports merchant — delivery confirmed and amount verified.'
       WHEN d.recommendation = 'refund_customer' THEN 'Insufficient merchant evidence; customer claim corroborated.'
       ELSE 'Additional evidence required before a fair decision can be reached.' END,
  d.ai_confidence > 0.85
FROM disputes d WHERE d.status IN ('resolved','appealed')
ON CONFLICT DO NOTHING;
