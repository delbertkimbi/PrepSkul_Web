-- Upgrade offline_operations to support rich detail tracking and joins
-- Run this in Supabase SQL editor.

ALTER TABLE offline_operations
  ADD COLUMN IF NOT EXISTS offline_run_id UUID REFERENCES offline_onboarding_runs (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS learner_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tutor_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS recurring_session_id UUID,
  ADD COLUMN IF NOT EXISTS expected_total_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_offline_operations_run ON offline_operations (offline_run_id);
CREATE INDEX IF NOT EXISTS idx_offline_operations_learner ON offline_operations (learner_user_id);
CREATE INDEX IF NOT EXISTS idx_offline_operations_tutor ON offline_operations (tutor_user_id);
