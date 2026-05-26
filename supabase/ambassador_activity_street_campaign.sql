-- Replace "Discord Community" outreach type with "Street Campaign" (existing rows + constraint).

UPDATE public.outreach_activities
SET activity_type = 'Street Campaign'
WHERE activity_type = 'Discord Community';

ALTER TABLE public.outreach_activities
  DROP CONSTRAINT IF EXISTS outreach_activities_activity_type_check;

ALTER TABLE public.outreach_activities
  ADD CONSTRAINT outreach_activities_activity_type_check
  CHECK (activity_type IN (
    'WhatsApp Community',
    'Telegram Group',
    'Street Campaign',
    'Campus Event',
    'Classroom Talk',
    'Online Community'
  ));

NOTIFY pgrst, 'reload schema';
