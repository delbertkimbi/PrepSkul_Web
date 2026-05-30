-- Align older databases with the current offline enrollment flow.
-- Safe to run multiple times in Supabase SQL editor.
--
-- Fixes common PGRST204/schema-cache errors for:
--   - recurring_sessions.parent_id
--   - offline_onboarding_runs.idempotency_key
--   - offline_operations.origin_kind / primary_user_id / learner_user_id / etc.
--   - offline_scheduling_periods and individual_sessions offline columns
--
-- The final NOTIFY asks PostgREST to reload its schema cache immediately.

ALTER TABLE IF EXISTS public.recurring_sessions
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- offline_onboarding_runs must exist before offline_operations.offline_run_id FK
-- (CREATE TABLE IF NOT EXISTS is a no-op when the table already exists.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offline_onboarding_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT,
  created_by_admin_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  source_channel TEXT NOT NULL DEFAULT 'whatsapp_direct',
  primary_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  primary_role TEXT NOT NULL,
  learner_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  tutor_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  recurring_session_id UUID,
  scheduling JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'completed',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.offline_onboarding_runs
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_offline_onboarding_runs_idempotency_key
  ON public.offline_onboarding_runs (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ---------------------------------------------------------------------------
-- offline_operations: base table + enrollment/detail columns (one ADD per statement
-- so a single FK failure does not skip the rest of the columns).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offline_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  source_channel TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_role TEXT NOT NULL,
  number_of_learners INTEGER NOT NULL DEFAULT 1,
  learner_educational_level TEXT NOT NULL DEFAULT 'Captured in onboarding notes',
  subjects_of_interest TEXT NOT NULL DEFAULT '',
  tutor_match_type TEXT NOT NULL DEFAULT 'platform_tutor',
  delivery_mode TEXT NOT NULL DEFAULT 'online',
  onboarding_stage TEXT NOT NULL DEFAULT 'matched',
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_environment TEXT NOT NULL DEFAULT 'real',
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  notes TEXT NOT NULL DEFAULT '',
  converted_to_platform BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.offline_operations ADD COLUMN IF NOT EXISTS origin_kind TEXT;
ALTER TABLE public.offline_operations
  ADD COLUMN IF NOT EXISTS offline_run_id UUID REFERENCES public.offline_onboarding_runs (id) ON DELETE SET NULL;
ALTER TABLE public.offline_operations
  ADD COLUMN IF NOT EXISTS primary_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;
ALTER TABLE public.offline_operations
  ADD COLUMN IF NOT EXISTS learner_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;
ALTER TABLE public.offline_operations
  ADD COLUMN IF NOT EXISTS tutor_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;
ALTER TABLE public.offline_operations ADD COLUMN IF NOT EXISTS recurring_session_id UUID;
ALTER TABLE public.offline_operations
  ADD COLUMN IF NOT EXISTS expected_total_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_offline_operations_created_at ON public.offline_operations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offline_operations_whatsapp ON public.offline_operations (customer_whatsapp);
CREATE INDEX IF NOT EXISTS idx_offline_operations_agent_name ON public.offline_operations (agent_name);
CREATE INDEX IF NOT EXISTS idx_offline_operations_stage ON public.offline_operations (onboarding_stage);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offline_operations' AND column_name = 'offline_run_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offline_operations_run ON public.offline_operations (offline_run_id);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offline_operations' AND column_name = 'primary_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offline_operations_primary ON public.offline_operations (primary_user_id);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offline_operations' AND column_name = 'learner_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offline_operations_learner ON public.offline_operations (learner_user_id);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offline_operations' AND column_name = 'tutor_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offline_operations_tutor ON public.offline_operations (tutor_user_id);
  END IF;
END $$;

ALTER TABLE public.offline_operations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access offline_operations" ON public.offline_operations;
CREATE POLICY "Service role full access offline_operations"
  ON public.offline_operations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Parent → learner auth account links (offline ops only; do not touch
-- parent_learners — mobile app child profiles live there)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parent_learner_account_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  learner_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_user_id, learner_user_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_learner_account_links_parent
  ON public.parent_learner_account_links (parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_learner_account_links_learner
  ON public.parent_learner_account_links (learner_user_id);

ALTER TABLE public.parent_learner_account_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access parent_learner_account_links"
  ON public.parent_learner_account_links;
CREATE POLICY "Service role full access parent_learner_account_links"
  ON public.parent_learner_account_links FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Scheduling periods used by enrollment, renewals, and past imports
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
  delivery_mode TEXT NOT NULL DEFAULT 'online',
  meet_link TEXT,
  onsite_location TEXT,
  onsite_photo_url TEXT,
  pay_per_month_xaf NUMERIC(12,2),
  pay_months_count NUMERIC(6,2),
  expected_period_revenue_xaf NUMERIC(12,2),
  operation_state TEXT NOT NULL DEFAULT 'active',
  period_start DATE,
  period_end DATE,
  start_month_label TEXT,
  is_historical_import BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'admin_form',
  created_by_admin_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offline_scheduling_periods' AND column_name = 'offline_operation_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offline_periods_operation ON public.offline_scheduling_periods (offline_operation_id);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offline_scheduling_periods' AND column_name = 'primary_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offline_periods_primary ON public.offline_scheduling_periods (primary_user_id);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offline_scheduling_periods' AND column_name = 'learner_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offline_periods_learner ON public.offline_scheduling_periods (learner_user_id);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offline_scheduling_periods' AND column_name = 'tutor_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offline_periods_tutor ON public.offline_scheduling_periods (tutor_user_id);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offline_scheduling_periods' AND column_name = 'period_start'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offline_periods_start ON public.offline_scheduling_periods (period_start);
  END IF;
END $$;

ALTER TABLE public.offline_scheduling_periods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access offline_scheduling_periods" ON public.offline_scheduling_periods;
CREATE POLICY "Service role full access offline_scheduling_periods"
  ON public.offline_scheduling_periods FOR ALL TO service_role USING (true) WITH CHECK (true);

-- individual_sessions columns used when sessions are created for an offline period.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'individual_sessions'
  ) THEN
    ALTER TABLE public.individual_sessions
      ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS offline_scheduling_period_id UUID REFERENCES public.offline_scheduling_periods (id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS delivery_mode TEXT,
      ADD COLUMN IF NOT EXISTS meet_link TEXT,
      ADD COLUMN IF NOT EXISTS onsite_location TEXT,
      ADD COLUMN IF NOT EXISTS onsite_photo_url TEXT,
      ADD COLUMN IF NOT EXISTS tutor_portal_token_hash TEXT,
      ADD COLUMN IF NOT EXISTS learner_portal_token_hash TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'individual_sessions' AND column_name = 'offline_scheduling_period_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_individual_sessions_offline_period
      ON public.individual_sessions (offline_scheduling_period_id);
  END IF;
END $$;

-- Ask Supabase/PostgREST to reload schema now, avoiding "schema cache" delays.
NOTIFY pgrst, 'reload schema';
