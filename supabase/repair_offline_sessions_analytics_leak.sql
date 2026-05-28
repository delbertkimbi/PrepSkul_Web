-- Fix offline sessions that still appear in on-platform analytics.
--
-- Cause: individual_sessions.offline_scheduling_period_id IS NULL while the tutor
-- or family is enrolled in offline ops (often duplicate tutor profile ids).
--
-- Run Step 1 (diagnostic) first. Review rows, then run Step 2 (repair).
-- Optional Step 3 targets a tutor by name (e.g. Leke Delbert).

-- =============================================================================
-- Step 1 — DIAGNOSTIC: orphan sessions that look offline
-- =============================================================================
WITH offline_tutors AS (
  SELECT DISTINCT tutor_user_id AS id
  FROM public.offline_scheduling_periods
  WHERE tutor_user_id IS NOT NULL
  UNION
  SELECT DISTINCT tutor_user_id
  FROM public.offline_operations
  WHERE tutor_user_id IS NOT NULL
),
offline_users AS (
  SELECT DISTINCT primary_user_id AS id
  FROM public.offline_scheduling_periods
  WHERE primary_user_id IS NOT NULL
  UNION
  SELECT DISTINCT learner_user_id
  FROM public.offline_scheduling_periods
  WHERE learner_user_id IS NOT NULL
  UNION
  SELECT DISTINCT primary_user_id
  FROM public.offline_operations
  WHERE primary_user_id IS NOT NULL
  UNION
  SELECT DISTINCT learner_user_id
  FROM public.offline_operations
  WHERE learner_user_id IS NOT NULL
),
orphan AS (
  SELECT
    s.id AS session_id,
    s.tutor_id,
    s.learner_id,
    s.parent_id,
    s.scheduled_date,
    s.status,
    tp.full_name AS tutor_name,
    COALESCE(lp.full_name, pp.full_name) AS learner_name
  FROM public.individual_sessions s
  LEFT JOIN public.profiles tp ON tp.id = s.tutor_id
  LEFT JOIN public.profiles lp ON lp.id = s.learner_id
  LEFT JOIN public.profiles pp ON pp.id = s.parent_id
  WHERE s.offline_scheduling_period_id IS NULL
    AND (
      s.tutor_id IN (SELECT id FROM offline_tutors)
      OR s.learner_id IN (SELECT id FROM offline_users)
      OR s.parent_id IN (SELECT id FROM offline_users)
    )
)
SELECT * FROM orphan ORDER BY scheduled_date NULLS LAST, tutor_name;

-- =============================================================================
-- Step 2 — REPAIR: link orphans to the best matching offline period
-- =============================================================================
-- BEGIN;

WITH offline_tutors AS (
  SELECT DISTINCT tutor_user_id AS id
  FROM public.offline_scheduling_periods
  WHERE tutor_user_id IS NOT NULL
  UNION
  SELECT DISTINCT tutor_user_id
  FROM public.offline_operations
  WHERE tutor_user_id IS NOT NULL
),
offline_users AS (
  SELECT DISTINCT primary_user_id AS id
  FROM public.offline_scheduling_periods
  WHERE primary_user_id IS NOT NULL
  UNION
  SELECT DISTINCT learner_user_id
  FROM public.offline_scheduling_periods
  WHERE learner_user_id IS NOT NULL
  UNION
  SELECT DISTINCT primary_user_id
  FROM public.offline_operations
  WHERE primary_user_id IS NOT NULL
  UNION
  SELECT DISTINCT learner_user_id
  FROM public.offline_operations
  WHERE learner_user_id IS NOT NULL
),
orphan AS (
  SELECT s.id, s.tutor_id, s.learner_id, s.parent_id, s.scheduled_date
  FROM public.individual_sessions s
  WHERE s.offline_scheduling_period_id IS NULL
    AND (
      s.tutor_id IN (SELECT id FROM offline_tutors)
      OR s.learner_id IN (SELECT id FROM offline_users)
      OR s.parent_id IN (SELECT id FROM offline_users)
    )
),
best_period AS (
  SELECT DISTINCT ON (o.id)
    o.id AS session_id,
    p.id AS period_id
  FROM orphan o
  JOIN public.offline_scheduling_periods p
    ON p.tutor_user_id = o.tutor_id
   AND (
     p.learner_user_id = o.learner_id
     OR p.primary_user_id = COALESCE(o.parent_id, o.learner_id)
   )
   AND (p.period_start IS NULL OR p.period_start <= COALESCE(o.scheduled_date, CURRENT_DATE))
  ORDER BY o.id, p.period_start DESC NULLS LAST, p.created_at DESC NULLS LAST
)
UPDATE public.individual_sessions s
SET offline_scheduling_period_id = bp.period_id
FROM best_period bp
WHERE s.id = bp.session_id;

-- COMMIT;

-- =============================================================================
-- Step 3 — OPTIONAL: same tutor name on multiple profiles (e.g. Leke Delbert)
-- Links orphans when session tutor name matches ANY offline period tutor name.
-- =============================================================================
-- BEGIN;

WITH leke_tutor_ids AS (
  SELECT id FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
),
orphan_leke AS (
  SELECT s.id, s.learner_id, s.parent_id, s.scheduled_date, s.tutor_id
  FROM public.individual_sessions s
  WHERE s.offline_scheduling_period_id IS NULL
    AND s.tutor_id IN (SELECT id FROM leke_tutor_ids)
),
best_period AS (
  SELECT DISTINCT ON (o.id)
    o.id AS session_id,
    p.id AS period_id
  FROM orphan_leke o
  JOIN public.offline_scheduling_periods p
    ON p.tutor_user_id IN (SELECT id FROM leke_tutor_ids)
   AND (
     p.learner_user_id = o.learner_id
     OR p.primary_user_id = COALESCE(o.parent_id, o.learner_id)
   )
   AND (p.period_start IS NULL OR p.period_start <= COALESCE(o.scheduled_date, CURRENT_DATE))
  ORDER BY o.id, p.period_start DESC NULLS LAST
)
UPDATE public.individual_sessions s
SET offline_scheduling_period_id = bp.period_id
FROM best_period bp
WHERE s.id = bp.session_id;

-- COMMIT;

-- =============================================================================
-- Step 4 — POST-DELETE orphans (only works if offline_scheduling_periods still exist)
-- If Step 4 updates 0 rows, the offline user delete CASCADE-dropped periods — use Step 5.
-- =============================================================================
-- BEGIN;

WITH tutor_cluster AS (
  SELECT id
  FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
),
period_bounds AS (
  SELECT
    p.id AS period_id,
    p.tutor_user_id,
    p.period_start,
    COALESCE(
      p.period_end,
      (p.period_start + INTERVAL '27 days')::date
    ) AS period_end_inclusive
  FROM public.offline_scheduling_periods p
  WHERE p.tutor_user_id IN (SELECT id FROM tutor_cluster)
    AND p.period_start IS NOT NULL
),
orphan AS (
  SELECT s.id, s.tutor_id, s.scheduled_date
  FROM public.individual_sessions s
  WHERE s.offline_scheduling_period_id IS NULL
    AND s.tutor_id IN (SELECT id FROM tutor_cluster)
    AND s.scheduled_date IS NOT NULL
),
best_period AS (
  SELECT DISTINCT ON (o.id)
    o.id AS session_id,
    pb.period_id
  FROM orphan o
  JOIN period_bounds pb
    ON pb.tutor_user_id IN (SELECT id FROM tutor_cluster)
   AND o.scheduled_date >= pb.period_start
   AND o.scheduled_date <= pb.period_end_inclusive
  ORDER BY o.id, pb.period_start DESC
)
UPDATE public.individual_sessions s
SET offline_scheduling_period_id = bp.period_id
FROM best_period bp
WHERE s.id = bp.session_id;

-- Verify (expect 0 rows):
-- SELECT s.id FROM individual_sessions s
-- JOIN profiles p ON p.id = s.tutor_id
-- WHERE p.full_name ILIKE '%leke%delbert%' AND s.offline_scheduling_period_id IS NULL;

-- COMMIT;

-- =============================================================================
-- Step 5 — Recreate periods + link (after user delete CASCADE removed periods)
--
-- Deleting an offline auth user removes offline_scheduling_periods (FK CASCADE) and
-- SET NULL on individual_sessions.offline_scheduling_period_id — Step 4 has nothing to join.
-- This rebuilds one period per billing month from orphan session dates, then links them.
-- Uses tutor auth id for period FK placeholders (tutor account must still exist).
-- =============================================================================
-- BEGIN;

WITH tutor_cluster AS (
  SELECT id
  FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
),
orphan AS (
  SELECT s.id, s.tutor_id, s.scheduled_date::date AS sched_date
  FROM public.individual_sessions s
  WHERE s.offline_scheduling_period_id IS NULL
    AND s.tutor_id IN (SELECT id FROM tutor_cluster)
    AND s.scheduled_date IS NOT NULL
),
month_groups AS (
  SELECT
    o.tutor_id,
    date_trunc('month', o.sched_date)::date AS billing_month,
    MIN(o.sched_date) AS period_start,
    MAX(o.sched_date) AS period_end,
    COUNT(*)::int AS session_count
  FROM orphan o
  GROUP BY o.tutor_id, date_trunc('month', o.sched_date)
),
new_periods AS (
  INSERT INTO public.offline_scheduling_periods (
    primary_user_id,
    learner_user_id,
    tutor_user_id,
    period_start,
    period_end,
    is_historical_import,
    operation_state,
    subjects,
    scheduling,
    delivery_mode,
    source,
    learner_display_names,
    start_month_label,
    pay_months_count,
    expected_period_revenue_xaf,
    pay_per_month_xaf
  )
  SELECT
    mg.tutor_id,
    mg.tutor_id,
    mg.tutor_id,
    mg.billing_month,
    GREATEST(mg.period_end, (mg.billing_month + INTERVAL '27 days')::date),
    true,
    'active',
    '[]'::jsonb,
    jsonb_build_object(
      'analyticsRepair', true,
      'sessionCount', mg.session_count,
      'billingMonth', to_char(mg.billing_month, 'YYYY-MM')
    ),
    'online',
    'admin_form',
    'Deleted offline enrollment (analytics retention)',
    to_char(mg.billing_month, 'Mon YY'),
    1,
    0,
    0
  FROM month_groups mg
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.offline_scheduling_periods ex
    WHERE ex.tutor_user_id = mg.tutor_id
      AND (ex.scheduling->>'analyticsRepair')::boolean IS TRUE
      AND ex.period_start = mg.billing_month
  )
  RETURNING id, tutor_user_id, period_start
)
UPDATE public.individual_sessions s
SET offline_scheduling_period_id = np.id
FROM new_periods np
WHERE s.offline_scheduling_period_id IS NULL
  AND s.tutor_id = np.tutor_user_id
  AND date_trunc('month', s.scheduled_date::date) = date_trunc('month', np.period_start);

-- Link any remaining orphans to existing periods for that tutor/month
WITH tutor_cluster AS (
  SELECT id
  FROM public.profiles
  WHERE full_name ILIKE '%leke%delbert%' OR full_name ILIKE '%delbert%leke%'
)
UPDATE public.individual_sessions s
SET offline_scheduling_period_id = p.id
FROM public.offline_scheduling_periods p
WHERE s.offline_scheduling_period_id IS NULL
  AND s.tutor_id IN (SELECT id FROM tutor_cluster)
  AND s.tutor_id = p.tutor_user_id
  AND s.scheduled_date IS NOT NULL
  AND p.period_start IS NOT NULL
  AND date_trunc('month', s.scheduled_date::date) = date_trunc('month', p.period_start::date);

-- COMMIT;

-- Verify (expect 0 rows):
-- SELECT s.id FROM individual_sessions s
-- JOIN profiles p ON p.id = s.tutor_id
-- WHERE p.full_name ILIKE '%leke%delbert%' AND s.offline_scheduling_period_id IS NULL;

NOTIFY pgrst, 'reload schema';
