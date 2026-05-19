-- Phone numbers are contact details, not account identities.
-- Multiple PrepSkul profiles may share the same phone/WhatsApp number
-- (for example siblings, parents, and offline operations contacts).

ALTER TABLE IF EXISTS public.profiles
  DROP CONSTRAINT IF EXISTS profiles_unique_phone_number_not_null;

DROP INDEX IF EXISTS public.profiles_unique_phone_number_not_null;

NOTIFY pgrst, 'reload schema';
