-- Recalculate pending offline session reminders using Africa/Douala local session time.
-- Safe to run after fixing the scheduler timezone bug.
--
-- It only touches pending scheduled_notifications generated for offline sessions
-- (metadata.offline_email = true) and leaves sent/failed rows unchanged.

UPDATE public.scheduled_notifications sn
SET
  scheduled_for = CASE sn.metadata->>'reminder_type'
    WHEN '24_hours' THEN ((s.scheduled_date::date + s.scheduled_time::time) AT TIME ZONE 'Africa/Douala') - INTERVAL '24 hours'
    WHEN '1_hour' THEN ((s.scheduled_date::date + s.scheduled_time::time) AT TIME ZONE 'Africa/Douala') - INTERVAL '1 hour'
    WHEN 'session_start' THEN (s.scheduled_date::date + s.scheduled_time::time) AT TIME ZONE 'Africa/Douala'
    ELSE sn.scheduled_for
  END
FROM public.individual_sessions s
WHERE sn.related_id = s.id
  AND sn.status = 'pending'
  AND sn.metadata->>'offline_email' = 'true'
  AND sn.metadata->>'reminder_type' IN ('24_hours', '1_hour', 'session_start')
  AND s.scheduled_date IS NOT NULL
  AND s.scheduled_time IS NOT NULL;

NOTIFY pgrst, 'reload schema';
