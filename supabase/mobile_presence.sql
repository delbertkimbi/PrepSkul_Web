-- Mobile app presence tracking columns on profiles

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_seen_source TEXT,
ADD COLUMN IF NOT EXISTS last_seen_platform TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles (last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_mobile ON public.profiles (last_seen DESC)
  WHERE last_seen_source = 'mobile';

COMMENT ON COLUMN public.profiles.last_seen IS 'Last activity timestamp (mobile ping or web session).';
COMMENT ON COLUMN public.profiles.last_seen_source IS 'mobile | web';
COMMENT ON COLUMN public.profiles.last_seen_platform IS 'ios | android | web';





