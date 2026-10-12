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
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
REVOKE ALL ON FUNCTION public.match_skulmate_chunks(vector,uuid,uuid,int,float) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_skulmate_chunks(vector,uuid,uuid,int,float) TO service_role;
-- A student's direct REST update must not change invoice price, ownership or settlement.
CREATE OR REPLACE FUNCTION public.guard_payment_request_client_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    IF ROW(NEW.amount,NEW.original_amount,NEW.discount_percent,NEW.discount_amount,NEW.student_id,NEW.tutor_id,NEW.booking_request_id,NEW.fapshi_trans_id,NEW.payment_id,NEW.paid_at)
       IS DISTINCT FROM ROW(OLD.amount,OLD.original_amount,OLD.discount_percent,OLD.discount_amount,OLD.student_id,OLD.tutor_id,OLD.booking_request_id,OLD.fapshi_trans_id,OLD.payment_id,OLD.paid_at)
       OR (NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'cancelled') THEN
       RAISE EXCEPTION 'Use the authenticated payment API';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_payment_request_client_update ON public.payment_requests;
CREATE TRIGGER guard_payment_request_client_update BEFORE UPDATE ON public.payment_requests
FOR EACH ROW EXECUTE FUNCTION public.guard_payment_request_client_update();
-- Tutor memory is owned by the API. Clients may read their own rows through existing RLS,
-- but cannot forge outcomes, impersonate turns, or write to another learner's memory.
REVOKE INSERT, UPDATE, DELETE ON public.skulmate_sessions, public.skulmate_turns,
 public.skulmate_artifacts, public.skulmate_chunks, public.skulmate_learner_state,
 public.skulmate_outcomes, public.skulmate_tutor_traces FROM anon, authenticated;
CREATE OR REPLACE FUNCTION public.guard_trial_payment_client_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.payment_status IS NOT NULL AND NEW.payment_status <> 'unpaid' OR NEW.fapshi_trans_id IS NOT NULL OR NEW.payment_id IS NOT NULL THEN RAISE EXCEPTION 'Payment fields are server managed'; END IF;
    ELSIF ROW(NEW.payment_status,NEW.fapshi_trans_id,NEW.payment_id,NEW.trial_fee)
          IS DISTINCT FROM ROW(OLD.payment_status,OLD.fapshi_trans_id,OLD.payment_id,OLD.trial_fee) THEN
      RAISE EXCEPTION 'Payment fields are server managed';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_trial_payment_client_write ON public.trial_sessions;
CREATE TRIGGER guard_trial_payment_client_write BEFORE INSERT OR UPDATE ON public.trial_sessions
FOR EACH ROW EXECUTE FUNCTION public.guard_trial_payment_client_write();
CREATE OR REPLACE FUNCTION public.guard_profile_privileges()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      IF coalesce((to_jsonb(NEW)->>'is_admin')::boolean,false) OR to_jsonb(NEW)->>'user_type' IN ('admin','super_admin') THEN RAISE EXCEPTION 'Privileges are server managed'; END IF;
    ELSIF (to_jsonb(NEW)->'is_admin') IS DISTINCT FROM (to_jsonb(OLD)->'is_admin')
       OR (to_jsonb(NEW)->>'user_type' IN ('admin','super_admin') AND (to_jsonb(NEW)->'user_type') IS DISTINCT FROM (to_jsonb(OLD)->'user_type')) THEN
      RAISE EXCEPTION 'Privileges are server managed';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_profile_privileges ON public.profiles;
CREATE TRIGGER guard_profile_privileges BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileges();
COMMIT;
