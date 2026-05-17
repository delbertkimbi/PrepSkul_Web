-- Fix for phase 2 migration when parent_learners already exists with different column names.
-- Run this if you saw: ERROR 42703: column "parent_user_id" does not exist
-- Safe to run multiple times.

-- ---------------------------------------------------------------------------
-- 1) Diagnose (optional — run alone to inspect)
-- ---------------------------------------------------------------------------
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'parent_learners'
-- ORDER BY ordinal_position;

-- ---------------------------------------------------------------------------
-- 2) Align parent_learners columns (parent_id → parent_user_id, etc.)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'parent_learners'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'parent_learners' AND column_name = 'parent_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'parent_learners' AND column_name = 'parent_user_id'
    ) THEN
      ALTER TABLE public.parent_learners RENAME COLUMN parent_id TO parent_user_id;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'parent_learners' AND column_name = 'learner_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'parent_learners' AND column_name = 'learner_user_id'
    ) THEN
      ALTER TABLE public.parent_learners RENAME COLUMN learner_id TO learner_user_id;
    END IF;
  END IF;
END $$;

-- If parent_learners still does not exist, create it (same as phase 2)
CREATE TABLE IF NOT EXISTS public.parent_learners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  learner_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_user_id, learner_user_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_learners_parent ON public.parent_learners (parent_user_id);

ALTER TABLE public.parent_learners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access parent_learners" ON public.parent_learners;
CREATE POLICY "Service role full access parent_learners"
  ON public.parent_learners FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 3) Ensure offline_scheduling_periods exists (if phase 2 stopped early)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offline_scheduling_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offline_operation_id UUID REFERENCES public.offline_operations (id) ON DELETE SET NULL,
  offline_run_id UUID REFERENCES public.offline_onboarding_runs (id) ON DELETE SET NULL,
  primary_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  learner_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  tutor_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  learner_display_names TEXT,
  sessions_per_week INTEGER,
  subjects JSONB NOT NULL DEFAULT '[]',
  scheduling JSONB NOT NULL DEFAULT '{}',
  delivery_mode TEXT NOT NULL DEFAULT 'online' CHECK (delivery_mode IN ('online', 'onsite', 'hybrid')),
  meet_link TEXT,
  onsite_location TEXT,
  onsite_photo_url TEXT,
  pay_per_month_xaf NUMERIC(12,2),
  pay_months_count NUMERIC(6,2),
  expected_period_revenue_xaf NUMERIC(12,2),
  operation_state TEXT NOT NULL DEFAULT 'active' CHECK (operation_state IN ('active', 'paused', 'stopped')),
  period_start DATE,
  period_end DATE,
  start_month_label TEXT,
  is_historical_import BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'admin_form' CHECK (source IN ('admin_form', 'csv_import')),
  created_by_admin_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offline_periods_primary ON public.offline_scheduling_periods (primary_user_id);
CREATE INDEX IF NOT EXISTS idx_offline_periods_learner ON public.offline_scheduling_periods (learner_user_id);
CREATE INDEX IF NOT EXISTS idx_offline_periods_tutor ON public.offline_scheduling_periods (tutor_user_id);
CREATE INDEX IF NOT EXISTS idx_offline_periods_start ON public.offline_scheduling_periods (period_start);

ALTER TABLE public.offline_scheduling_periods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access offline_scheduling_periods" ON public.offline_scheduling_periods;
CREATE POLICY "Service role full access offline_scheduling_periods"
  ON public.offline_scheduling_periods FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 4) session_reschedule_requests — align column names if table already exists
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'session_reschedule_requests'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'session_reschedule_requests' AND column_name = 'session_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'session_reschedule_requests' AND column_name = 'individual_session_id'
    ) THEN
      ALTER TABLE public.session_reschedule_requests RENAME COLUMN session_id TO individual_session_id;
    END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.session_reschedule_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  individual_session_id UUID NOT NULL,
  requested_by_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  proposed_date DATE NOT NULL,
  proposed_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  responded_by_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only index columns that exist (avoids 42703 if table shape is still unexpected)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'session_reschedule_requests' AND column_name = 'individual_session_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_reschedule_session ON public.session_reschedule_requests (individual_session_id);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'session_reschedule_requests' AND column_name = 'status'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_reschedule_status ON public.session_reschedule_requests (status);
  END IF;
END $$;

ALTER TABLE public.session_reschedule_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access session_reschedule_requests" ON public.session_reschedule_requests;
CREATE POLICY "Service role full access session_reschedule_requests"
  ON public.session_reschedule_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'individual_sessions'
  ) THEN
    ALTER TABLE public.individual_sessions
      ADD COLUMN IF NOT EXISTS offline_scheduling_period_id UUID REFERENCES public.offline_scheduling_periods (id) ON DELETE SET NULL;
    ALTER TABLE public.individual_sessions ADD COLUMN IF NOT EXISTS delivery_mode TEXT;
    ALTER TABLE public.individual_sessions ADD COLUMN IF NOT EXISTS meet_link TEXT;
    ALTER TABLE public.individual_sessions ADD COLUMN IF NOT EXISTS onsite_location TEXT;
    ALTER TABLE public.individual_sessions ADD COLUMN IF NOT EXISTS onsite_photo_url TEXT;
    ALTER TABLE public.individual_sessions ADD COLUMN IF NOT EXISTS tutor_portal_token_hash TEXT;
    ALTER TABLE public.individual_sessions ADD COLUMN IF NOT EXISTS learner_portal_token_hash TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'individual_sessions' AND column_name = 'offline_scheduling_period_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_individual_sessions_offline_period ON public.individual_sessions (offline_scheduling_period_id);
  END IF;
END $$;

ALTER TABLE public.session_tutor_completion_reports
  ADD COLUMN IF NOT EXISTS subject_taught TEXT,
  ADD COLUMN IF NOT EXISTS pre_session_photo_url TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'session_portal_tokens'
  ) THEN
    ALTER TABLE public.session_portal_tokens
      ADD COLUMN IF NOT EXISTS is_persistent BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
