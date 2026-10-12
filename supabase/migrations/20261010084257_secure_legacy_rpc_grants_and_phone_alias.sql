BEGIN;
-- Phone aliases are identifiers, not proof of ownership.
DROP TRIGGER IF EXISTS trg_auto_confirm_phone_alias_auth_user ON auth.users;

CREATE OR REPLACE FUNCTION public.check_recurring_session_access(session_id uuid, user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp STABLE AS $$
  SELECT user_id IS NOT DISTINCT FROM auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.recurring_sessions rs
      WHERE rs.id = session_id AND rs.learner_id = user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.mark_abandoned_booking_completed(
  p_user_id uuid, p_tutor_id uuid, p_booking_type text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  UPDATE public.abandoned_bookings
  SET status = 'completed', completed_at = now(), updated_at = now()
  WHERE user_id = p_user_id AND tutor_id = p_tutor_id
    AND booking_type = p_booking_type AND status IN ('pending', 'reminded');
END;
$$;

CREATE OR REPLACE FUNCTION public.create_conversation_for_trial(
  p_trial_session_id uuid, p_student_id uuid, p_tutor_id uuid
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE v_id uuid; v_expires_at timestamptz;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() NOT IN (p_student_id, p_tutor_id) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  SELECT t.scheduled_date::timestamptz + interval '30 days'
    INTO v_expires_at
  FROM public.trial_sessions t
  WHERE t.id = p_trial_session_id AND t.tutor_id = p_tutor_id
    AND (t.learner_id = p_student_id OR t.parent_id = p_student_id);
  IF NOT FOUND THEN RAISE EXCEPTION 'Trial session mismatch'; END IF;
  SELECT c.id INTO v_id FROM public.conversations c
  WHERE c.trial_session_id = p_trial_session_id LIMIT 1;
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  INSERT INTO public.conversations (
    student_id, tutor_id, trial_session_id, status, expires_at
  ) VALUES (
    p_student_id, p_tutor_id, p_trial_session_id, 'active', v_expires_at
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_conversation_for_booking(
  p_booking_request_id uuid, p_student_id uuid, p_tutor_id uuid
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() NOT IN (p_student_id, p_tutor_id) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.booking_requests b
    WHERE b.id = p_booking_request_id
      AND b.student_id = p_student_id AND b.tutor_id = p_tutor_id
  ) THEN RAISE EXCEPTION 'Booking request mismatch'; END IF;
  SELECT c.id INTO v_id FROM public.conversations c
  WHERE c.booking_request_id = p_booking_request_id LIMIT 1;
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  INSERT INTO public.conversations (
    student_id, tutor_id, booking_request_id, status
  ) VALUES (
    p_student_id, p_tutor_id, p_booking_request_id, 'active'
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Remove anonymous access inherited through PUBLIC. Keep server access.
DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
      AND has_function_privilege('anon', p.oid, 'EXECUTE')
      AND NOT EXISTS (
        SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.signature);
  END LOOP;
END $$;

-- Grant only the client RPCs that have a caller or ownership check.
GRANT EXECUTE ON FUNCTION public.check_recurring_session_access(uuid,uuid),
  public.confirm_onsite_session_started(uuid),
  public.confirm_onsite_session_ended(uuid),
  public.create_conversation_for_trial(uuid,uuid,uuid),
  public.create_conversation_for_booking(uuid,uuid,uuid),
  public.ensure_call_timer_started(uuid),
  public.get_recommended_skulmate_friends(integer),
  public.get_skulmate_leaderboard(text,timestamptz,integer),
  public.get_skulmate_public_profiles(uuid[]),
  public.is_public_approved_tutor(uuid),
  public.is_session_eligible_for_payment(uuid),
  public.mark_abandoned_booking_completed(uuid,uuid,text)
TO authenticated;

-- Existing users may call this harmless housekeeping RPC on app startup.
GRANT EXECUTE ON FUNCTION public.auto_close_expired_conversations()
TO authenticated;

COMMIT;
