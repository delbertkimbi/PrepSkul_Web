-- Align older databases with offline-onboarding-service.ts expectations.
-- Run in Supabase SQL editor if you see PGRST204 errors for:
--   - recurring_sessions.parent_id
--   - offline_onboarding_runs.idempotency_key
--
-- After running, reload the PostgREST schema cache (Supabase Dashboard →
-- Project Settings → API → "Reload schema" if available), or wait a minute.

ALTER TABLE IF EXISTS public.recurring_sessions
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.offline_onboarding_runs
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Optional: dedupe safety for replays (ignore NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS uq_offline_onboarding_runs_idempotency_key
  ON public.offline_onboarding_runs (idempotency_key)
  WHERE idempotency_key IS NOT NULL;
