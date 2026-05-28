-- Allow paused offline matchings (historical imports / admin pause before resuming live sessions)
ALTER TABLE public.offline_operations
  DROP CONSTRAINT IF EXISTS offline_operations_onboarding_stage_check;

ALTER TABLE public.offline_operations
  ADD CONSTRAINT offline_operations_onboarding_stage_check
  CHECK (
    onboarding_stage IN (
      'new_lead',
      'qualified',
      'matched',
      'paused',
      'active_sessions',
      'completed',
      'dropped'
    )
  );
