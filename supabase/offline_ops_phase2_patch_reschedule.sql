-- Quick patch: run ONLY this if fix.sql failed on session_reschedule_requests / individual_session_id
-- Safe to run multiple times.

-- See current columns:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'session_reschedule_requests';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'session_reschedule_requests'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'session_reschedule_requests' AND column_name = 'session_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'session_reschedule_requests' AND column_name = 'individual_session_id'
  ) THEN
    ALTER TABLE public.session_reschedule_requests RENAME COLUMN session_id TO individual_session_id;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reschedule_session ON public.session_reschedule_requests (individual_session_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_status ON public.session_reschedule_requests (status);

ALTER TABLE public.session_reschedule_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access session_reschedule_requests" ON public.session_reschedule_requests;
CREATE POLICY "Service role full access session_reschedule_requests"
  ON public.session_reschedule_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Then run the rest of offline_ops_phase2_schema_fix.sql from section 4 (individual_sessions columns) if not done yet.
