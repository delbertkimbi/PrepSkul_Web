-- Purge offline analytics for tutor Leke Delbert (name variants).
-- Run ONE block at a time in Supabase SQL editor (do not paste markdown bullets).

-- STEP 0: Diagnostic (run this block only first)
WITH tutor_cluster AS (
  SELECT id, full_name
  FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%'
     OR full_name ILIKE '%delbert%leke%'
)
SELECT 'tutor_profiles' AS bucket, COUNT(*)::bigint AS n FROM tutor_cluster
UNION ALL
SELECT 'offline_periods', COUNT(*)::bigint
FROM public.offline_scheduling_periods p
WHERE p.tutor_user_id IN (SELECT id FROM tutor_cluster)
UNION ALL
SELECT 'offline_linked_sessions', COUNT(*)::bigint
FROM public.individual_sessions s
WHERE s.tutor_id IN (SELECT id FROM tutor_cluster)
  AND s.offline_scheduling_period_id IS NOT NULL
UNION ALL
SELECT 'offline_operations', COUNT(*)::bigint
FROM public.offline_operations o
WHERE o.tutor_user_id IN (SELECT id FROM tutor_cluster);


-- STEP 1: Delete (run entire block below inside BEGIN/COMMIT)
BEGIN;

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
),
target_sessions AS (
  SELECT s.id
  FROM public.individual_sessions s
  WHERE s.tutor_id IN (SELECT id FROM tutor_cluster)
    AND s.offline_scheduling_period_id IS NOT NULL
)
DELETE FROM public.scheduled_notifications sn
WHERE sn.related_id IN (SELECT id FROM target_sessions);

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
),
target_sessions AS (
  SELECT s.id FROM public.individual_sessions s
  WHERE s.tutor_id IN (SELECT id FROM tutor_cluster)
    AND s.offline_scheduling_period_id IS NOT NULL
)
DELETE FROM public.session_portal_tokens t
WHERE t.individual_session_id IN (SELECT id FROM target_sessions);

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
),
target_sessions AS (
  SELECT s.id FROM public.individual_sessions s
  WHERE s.tutor_id IN (SELECT id FROM tutor_cluster)
    AND s.offline_scheduling_period_id IS NOT NULL
)
DELETE FROM public.session_learner_feedback f
WHERE f.individual_session_id IN (SELECT id FROM target_sessions);

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
),
target_sessions AS (
  SELECT s.id FROM public.individual_sessions s
  WHERE s.tutor_id IN (SELECT id FROM tutor_cluster)
    AND s.offline_scheduling_period_id IS NOT NULL
)
DELETE FROM public.session_tutor_completion_reports r
WHERE r.individual_session_id IN (SELECT id FROM target_sessions);

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
),
target_sessions AS (
  SELECT s.id FROM public.individual_sessions s
  WHERE s.tutor_id IN (SELECT id FROM tutor_cluster)
    AND s.offline_scheduling_period_id IS NOT NULL
)
DELETE FROM public.session_reschedule_requests rr
WHERE rr.individual_session_id IN (SELECT id FROM target_sessions);

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
),
target_sessions AS (
  SELECT s.id FROM public.individual_sessions s
  WHERE s.tutor_id IN (SELECT id FROM tutor_cluster)
    AND s.offline_scheduling_period_id IS NOT NULL
)
DELETE FROM public.session_payments pay
WHERE pay.session_id IN (SELECT id FROM target_sessions);

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
)
DELETE FROM public.individual_sessions s
WHERE s.tutor_id IN (SELECT id FROM tutor_cluster)
  AND s.offline_scheduling_period_id IS NOT NULL;

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
)
DELETE FROM public.offline_scheduling_periods p
WHERE p.tutor_user_id IN (SELECT id FROM tutor_cluster);

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
)
DELETE FROM public.offline_onboarding_runs r
WHERE r.tutor_user_id IN (SELECT id FROM tutor_cluster);

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
)
DELETE FROM public.offline_operations o
WHERE o.tutor_user_id IN (SELECT id FROM tutor_cluster);

COMMIT;


-- STEP 2: Verify (run after Step 1; both counts should be 0)
WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
)
SELECT COUNT(*) AS remaining_offline_periods
FROM public.offline_scheduling_periods p
WHERE p.tutor_user_id IN (SELECT id FROM tutor_cluster);

WITH tutor_cluster AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
)
SELECT COUNT(*) AS remaining_offline_linked_sessions
FROM public.individual_sessions s
WHERE s.tutor_id IN (SELECT id FROM tutor_cluster)
  AND s.offline_scheduling_period_id IS NOT NULL;


-- PAYMENT AUDIT (optional): production vs sandbox Fapshi
SELECT 'session_payments_paid_fapshi_production' AS bucket, COUNT(*)::bigint AS n
FROM public.session_payments
WHERE payment_status = 'paid'
  AND fapshi_trans_id IS NOT NULL
  AND COALESCE(payment_environment, 'real') = 'real'
UNION ALL
SELECT 'payment_requests_paid_fapshi_all', COUNT(*)::bigint
FROM public.payment_requests
WHERE status = 'paid' AND fapshi_trans_id IS NOT NULL
UNION ALL
SELECT 'payment_requests_paid_fapshi_production', COUNT(*)::bigint
FROM public.payment_requests
WHERE status = 'paid'
  AND fapshi_trans_id IS NOT NULL
  AND payment_environment = 'real'
UNION ALL
SELECT 'offline_operations_paid_production', COUNT(*)::bigint
FROM public.offline_operations
WHERE payment_status = 'paid' AND COALESCE(payment_environment, 'real') = 'real';
