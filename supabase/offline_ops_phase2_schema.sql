-- Offline ops phase 2: scheduling periods, multi-child, reschedule, session delivery fields.
-- Run in Supabase SQL editor after offline_onboarding_sync_schema.sql

-- ---------------------------------------------------------------------------
-- Scheduling periods (initial, renewal, historical import)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offline_scheduling_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offline_operation_id UUID REFERENCES offline_operations (id) ON DELETE SET NULL,
  offline_run_id UUID REFERENCES offline_onboarding_runs (id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_offline_periods_primary ON offline_scheduling_periods (primary_user_id);
CREATE INDEX IF NOT EXISTS idx_offline_periods_learner ON offline_scheduling_periods (learner_user_id);
CREATE INDEX IF NOT EXISTS idx_offline_periods_tutor ON offline_scheduling_periods (tutor_user_id);
CREATE INDEX IF NOT EXISTS idx_offline_periods_start ON offline_scheduling_periods (period_start);

ALTER TABLE offline_scheduling_periods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access offline_scheduling_periods" ON offline_scheduling_periods;
CREATE POLICY "Service role full access offline_scheduling_periods"
  ON offline_scheduling_periods FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Parent → learner links (multi-child offline families)
-- If an older parent_learners table exists with parent_id/learner_id, run
-- offline_ops_phase2_schema_fix.sql instead of re-running this block.
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

CREATE TABLE IF NOT EXISTS parent_learners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  learner_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_user_id, learner_user_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_learners_parent ON parent_learners (parent_user_id);

ALTER TABLE parent_learners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access parent_learners" ON parent_learners;
CREATE POLICY "Service role full access parent_learners"
  ON parent_learners FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Session reschedule requests
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

CREATE TABLE IF NOT EXISTS session_reschedule_requests (
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

CREATE INDEX IF NOT EXISTS idx_reschedule_session ON session_reschedule_requests (individual_session_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_status ON session_reschedule_requests (status);

ALTER TABLE session_reschedule_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access session_reschedule_requests" ON session_reschedule_requests;
CREATE POLICY "Service role full access session_reschedule_requests"
  ON session_reschedule_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- individual_sessions extensions (best-effort; ignore if table missing columns in older DBs)
-- ---------------------------------------------------------------------------
ALTER TABLE individual_sessions
  ADD COLUMN IF NOT EXISTS offline_scheduling_period_id UUID REFERENCES offline_scheduling_periods (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivery_mode TEXT,
  ADD COLUMN IF NOT EXISTS meet_link TEXT,
  ADD COLUMN IF NOT EXISTS onsite_location TEXT,
  ADD COLUMN IF NOT EXISTS onsite_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS tutor_portal_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS learner_portal_token_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_individual_sessions_offline_period ON individual_sessions (offline_scheduling_period_id);

-- ---------------------------------------------------------------------------
-- Tutor report extensions
-- ---------------------------------------------------------------------------
ALTER TABLE session_tutor_completion_reports
  ADD COLUMN IF NOT EXISTS subject_taught TEXT,
  ADD COLUMN IF NOT EXISTS pre_session_photo_url TEXT;

-- ---------------------------------------------------------------------------
-- Stable portal tokens: allow reuse until feedback submitted (drop strict one-time at landing)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'session_portal_tokens'
  ) THEN
    ALTER TABLE session_portal_tokens
      ADD COLUMN IF NOT EXISTS is_persistent BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
