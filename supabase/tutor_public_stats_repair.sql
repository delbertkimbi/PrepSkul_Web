-- Repair script: run this if tutor_public_stats.sql failed partway through.
-- Step 1: add columns (skipped if first migration failed before ALTER TABLE)
-- Step 2: functions + triggers + backfill

ALTER TABLE public.tutor_profiles
ADD COLUMN IF NOT EXISTS total_sessions_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS offline_tutor_earnings_xaf BIGINT DEFAULT 0;

COMMENT ON COLUMN public.tutor_profiles.total_sessions_completed IS
  'Completed/evaluated individual_sessions (on + off platform). Public aggregate for discovery.';
COMMENT ON COLUMN public.tutor_profiles.offline_tutor_earnings_xaf IS
  '85% share of active offline_scheduling_periods revenue for this tutor.';

CREATE OR REPLACE FUNCTION public.refresh_tutor_public_stats(p_tutor_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sessions INTEGER;
  v_students INTEGER;
  v_offline_earnings BIGINT;
BEGIN
  IF p_tutor_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_sessions
  FROM public.individual_sessions s
  WHERE s.tutor_id = p_tutor_user_id
    AND LOWER(COALESCE(s.status, '')) IN ('completed', 'evaluated');

  SELECT COUNT(DISTINCT learner_key)::INTEGER INTO v_students
  FROM (
    SELECT COALESCE(NULLIF(s.learner_id::TEXT, ''), NULLIF(s.parent_id::TEXT, '')) AS learner_key
    FROM public.individual_sessions s
    WHERE s.tutor_id = p_tutor_user_id
      AND LOWER(COALESCE(s.status, '')) IN ('completed', 'evaluated')
    UNION
    SELECT t.learner_id::TEXT AS learner_key
    FROM public.trial_sessions t
    WHERE t.tutor_id = p_tutor_user_id
      AND LOWER(COALESCE(t.status, '')) IN ('completed', 'no_show_tutor', 'no_show_learner', 'missed')
  ) learners
  WHERE learner_key IS NOT NULL AND learner_key <> '';

  SELECT COALESCE(SUM(
    CASE WHEN LOWER(COALESCE(p.operation_state, 'active')) = 'active'
      THEN ROUND(COALESCE(p.expected_period_revenue_xaf, 0) * 0.85)::BIGINT
      ELSE 0
    END
  ), 0)::BIGINT INTO v_offline_earnings
  FROM public.offline_scheduling_periods p
  WHERE p.tutor_user_id = p_tutor_user_id;

  UPDATE public.tutor_profiles tp
  SET
    total_sessions_completed = v_sessions,
    total_students = v_students,
    offline_tutor_earnings_xaf = v_offline_earnings,
    updated_at = NOW()
  WHERE tp.user_id = p_tutor_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_refresh_tutor_public_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tutor UUID;
BEGIN
  v_tutor := COALESCE(NEW.tutor_id, OLD.tutor_id);
  IF v_tutor IS NOT NULL THEN
    PERFORM public.refresh_tutor_public_stats(v_tutor);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS refresh_tutor_stats_on_session ON public.individual_sessions;
CREATE TRIGGER refresh_tutor_stats_on_session
  AFTER INSERT OR UPDATE OF status, tutor_id, learner_id, parent_id OR DELETE
  ON public.individual_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_refresh_tutor_public_stats();

CREATE OR REPLACE FUNCTION public.trg_refresh_tutor_stats_from_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tutor UUID;
BEGIN
  v_tutor := COALESCE(NEW.tutor_id, OLD.tutor_id);
  IF v_tutor IS NOT NULL THEN
    PERFORM public.refresh_tutor_public_stats(v_tutor);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS refresh_tutor_stats_on_trial ON public.trial_sessions;
CREATE TRIGGER refresh_tutor_stats_on_trial
  AFTER INSERT OR UPDATE OF status, tutor_id, learner_id OR DELETE
  ON public.trial_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_refresh_tutor_stats_from_trial();

CREATE OR REPLACE FUNCTION public.trg_refresh_tutor_stats_from_offline_period()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tutor UUID;
BEGIN
  v_tutor := COALESCE(NEW.tutor_user_id, OLD.tutor_user_id);
  IF v_tutor IS NOT NULL THEN
    PERFORM public.refresh_tutor_public_stats(v_tutor);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS refresh_tutor_stats_on_offline_period ON public.offline_scheduling_periods;
CREATE TRIGGER refresh_tutor_stats_on_offline_period
  AFTER INSERT OR UPDATE OF operation_state, expected_period_revenue_xaf, tutor_user_id OR DELETE
  ON public.offline_scheduling_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_refresh_tutor_stats_from_offline_period();

-- Backfill all tutors
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT user_id FROM public.tutor_profiles WHERE user_id IS NOT NULL
  LOOP
    PERFORM public.refresh_tutor_public_stats(r.user_id);
  END LOOP;
END $$;
