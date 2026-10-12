-- Reviewed existing trigger functions: pin object resolution and remove RPC grants.
DO $$
DECLARE f record;
BEGIN
 FOR f IN SELECT p.oid::regprocedure AS signature
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.prorettype='trigger'::regtype
 AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid=p.oid AND d.deptype='e')
 LOOP
  EXECUTE format('ALTER FUNCTION %s SET search_path = pg_catalog, public, pg_temp',f.signature);
  EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',f.signature);
 END LOOP;
END $$;
-- These routines expose private cross-account data or perform financial settlement.
REVOKE EXECUTE ON FUNCTION public.get_active_fcm_tokens(uuid),
 public.get_abandoned_bookings_for_reminder(), public.reserve_tutor_payout_earnings(uuid)
 FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_fcm_tokens(uuid),
 public.get_abandoned_bookings_for_reminder(), public.reserve_tutor_payout_earnings(uuid)
 TO service_role;
ALTER FUNCTION public.get_active_fcm_tokens(uuid) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.get_abandoned_bookings_for_reminder() SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.reserve_tutor_payout_earnings(uuid) SET search_path = pg_catalog, public, pg_temp;
