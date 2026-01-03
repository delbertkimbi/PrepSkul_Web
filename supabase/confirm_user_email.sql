-- Confirm Email for User: lekebrian2@gmail.com
-- Run this in Supabase SQL Editor with service role permissions

-- Step 1: Confirm email in auth.users table
-- Note: confirmed_at is a generated column, so we only update email_confirmed_at
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'lekebrian2@gmail.com';

-- Step 2: Verify the update worked
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'lekebrian2@gmail.com';

-- Step 3: Ensure ticha_users profile exists (should be created by trigger, but just in case)
INSERT INTO ticha_users (id, email, full_name)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
WHERE email = 'lekebrian2@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Step 4: Show final status
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  tu.full_name,
  tu.is_admin,
  tu.created_at as profile_created_at
FROM auth.users u
LEFT JOIN ticha_users tu ON tu.id = u.id
WHERE u.email = 'lekebrian2@gmail.com';

