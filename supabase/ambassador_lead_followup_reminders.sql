-- Track daily ops reminder for ambassador lead follow-up dates (avoids duplicate emails same day).

ALTER TABLE public.ambassador_leads
  ADD COLUMN IF NOT EXISTS follow_up_reminder_sent_at DATE;

CREATE INDEX IF NOT EXISTS idx_ambassador_leads_follow_up_reminder
  ON public.ambassador_leads (follow_up_date)
  WHERE follow_up_date IS NOT NULL;

NOTIFY pgrst, 'reload schema';
