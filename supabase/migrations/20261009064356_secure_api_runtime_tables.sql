-- Apply after 106, 107, 108. Additive release migration; never expose these tables to clients.
BEGIN;
CREATE TABLE IF NOT EXISTS public.secure_payment_attempts (
  external_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  resource_table text NOT NULL CHECK (resource_table IN ('trial_sessions','payment_requests')),
  resource_id uuid NOT NULL,
  amount bigint NOT NULL CHECK (amount >= 100),
  trans_id text UNIQUE,
  state text NOT NULL CHECK (state IN ('initiating','pending','successful','failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.secure_payment_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.secure_payment_attempts FROM anon, authenticated;
GRANT ALL ON public.secure_payment_attempts TO service_role;
CREATE TABLE IF NOT EXISTS public.secure_webhook_jobs (
  transaction_id text PRIMARY KEY,
  lease_until timestamptz NOT NULL,
  successful boolean NOT NULL DEFAULT false,
  lease_token uuid,
  finished_status text
);
ALTER TABLE public.secure_webhook_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.secure_webhook_jobs FROM anon, authenticated;
GRANT ALL ON public.secure_webhook_jobs TO service_role;
CREATE OR REPLACE FUNCTION public.claim_payment_webhook(p_trans_id text, p_status text)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE t uuid := gen_random_uuid(); claimed uuid;
BEGIN
  INSERT INTO secure_webhook_jobs(transaction_id,lease_until,lease_token)
  VALUES(p_trans_id, now()+interval '2 minutes', t)
  ON CONFLICT(transaction_id) DO UPDATE SET lease_until=now()+interval '2 minutes',lease_token=t
  WHERE secure_webhook_jobs.lease_until < now() AND NOT secure_webhook_jobs.successful
    AND secure_webhook_jobs.finished_status IS DISTINCT FROM p_status
  RETURNING lease_token INTO claimed;
  RETURN claimed;
END $$;
REVOKE ALL ON FUNCTION public.claim_payment_webhook(text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_payment_webhook(text,text) TO service_role;
CREATE TABLE IF NOT EXISTS public.api_rate_buckets (
  key text PRIMARY KEY, hits integer NOT NULL, expires_at timestamptz NOT NULL
);
ALTER TABLE public.api_rate_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.api_rate_buckets FROM anon, authenticated;
GRANT ALL ON public.api_rate_buckets TO service_role;
CREATE OR REPLACE FUNCTION public.consume_api_rate_limit(bucket_key text, max_hits int, window_seconds int)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE n int;
BEGIN
  IF max_hits < 1 OR window_seconds < 1 OR length(bucket_key) > 256 THEN RAISE EXCEPTION 'Invalid limit'; END IF;
  INSERT INTO api_rate_buckets(key,hits,expires_at) VALUES(bucket_key,1,now()+make_interval(secs=>window_seconds))
  ON CONFLICT(key) DO UPDATE SET
    hits = CASE WHEN api_rate_buckets.expires_at <= now() THEN 1 ELSE least(api_rate_buckets.hits+1,max_hits+1) END,
    expires_at = CASE WHEN api_rate_buckets.expires_at <= now() THEN now()+make_interval(secs=>window_seconds) ELSE api_rate_buckets.expires_at END
  RETURNING hits INTO n;
  DELETE FROM api_rate_buckets WHERE key IN (SELECT key FROM api_rate_buckets WHERE expires_at < now()-interval '1 day' LIMIT 100);
  RETURN n <= max_hits;
END $$;
REVOKE ALL ON FUNCTION public.consume_api_rate_limit(text,int,int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_api_rate_limit(text,int,int) TO service_role;
COMMIT;
