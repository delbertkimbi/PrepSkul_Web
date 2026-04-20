-- Offline onboarding sync: links admin-driven WhatsApp flows to real platform users & sessions.
-- Run after offline_operations_schema.sql if you use the legacy table.

-- ---------------------------------------------------------------------------
-- Offline onboarding run (one admin submission → users + recurring + instances)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offline_onboarding_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE,
  created_by_admin_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  source_channel TEXT NOT NULL DEFAULT 'whatsapp_direct',
  -- Primary account created for the family contact (parent or student)
  primary_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  primary_role TEXT NOT NULL CHECK (primary_role IN ('parent', 'student', 'learner')),
  -- When parent flow includes a separate learner account
  learner_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  tutor_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  recurring_session_id UUID,
  scheduling JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'rolled_back')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offline_runs_created ON offline_onboarding_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offline_runs_tutor ON offline_onboarding_runs (tutor_user_id);
CREATE INDEX IF NOT EXISTS idx_offline_runs_primary ON offline_onboarding_runs (primary_user_id);

ALTER TABLE offline_onboarding_runs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; authenticated admins use API routes with service role.
DROP POLICY IF EXISTS "Service role full access offline_onboarding_runs" ON offline_onboarding_runs;
CREATE POLICY "Service role full access offline_onboarding_runs"
  ON offline_onboarding_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Session completion / feedback tokens (tutor.prepskul.com & learner.prepskul.com)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  individual_session_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL CHECK (purpose IN ('tutor_report', 'learner_feedback')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_portal_tokens_session ON session_portal_tokens (individual_session_id);

ALTER TABLE session_portal_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access session_portal_tokens" ON session_portal_tokens;
CREATE POLICY "Service role full access session_portal_tokens"
  ON session_portal_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Tutor post-session report
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_tutor_completion_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  individual_session_id UUID NOT NULL,
  tutor_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  attended BOOLEAN NOT NULL DEFAULT true,
  topics_covered TEXT,
  learner_engagement TEXT,
  issues TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tutor_report_per_session ON session_tutor_completion_reports (individual_session_id);

ALTER TABLE session_tutor_completion_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access session_tutor_completion_reports" ON session_tutor_completion_reports;
CREATE POLICY "Service role full access session_tutor_completion_reports"
  ON session_tutor_completion_reports FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Learner / parent session feedback
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_learner_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  individual_session_id UUID NOT NULL,
  author_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learner_feedback_session ON session_learner_feedback (individual_session_id);

ALTER TABLE session_learner_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access session_learner_feedback" ON session_learner_feedback;
CREATE POLICY "Service role full access session_learner_feedback"
  ON session_learner_feedback FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Admin operational events (reminder emails, syncs, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_operational_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  subject TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  emails_sent TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_ops_events_type ON admin_operational_events (event_type, created_at DESC);

ALTER TABLE admin_operational_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access admin_operational_events" ON admin_operational_events;
CREATE POLICY "Service role full access admin_operational_events"
  ON admin_operational_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Mobile app event ingestion (Flutter native)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mobile_app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE,
  event_type TEXT NOT NULL, -- signup, login, session_action, payment_action, etc.
  user_id UUID,
  user_role TEXT,
  platform TEXT NOT NULL DEFAULT 'mobile', -- android/ios
  source_app TEXT NOT NULL DEFAULT 'flutter_native',
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mobile_app_events_type_time ON mobile_app_events (event_type, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mobile_app_events_user_time ON mobile_app_events (user_id, event_timestamp DESC);

ALTER TABLE mobile_app_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access mobile_app_events" ON mobile_app_events;
CREATE POLICY "Service role full access mobile_app_events"
  ON mobile_app_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
