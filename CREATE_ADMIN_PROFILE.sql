-- ============================================
-- CREATE ADMIN PROFILE
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check if auth user exists
SELECT id, email, email_confirmed_at
FROM auth.users 
WHERE email = 'prepskul@gmail.com';

-- Step 2: Create profile from auth user
INSERT INTO profiles (id, email, full_name, is_admin, user_type, created_at, updated_at)
SELECT 
  id,
  email,
  'PrepSkul Admin',
  TRUE,
  'admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'prepskul@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
  is_admin = TRUE, 
  user_type = 'admin',
  full_name = 'PrepSkul Admin',
  updated_at = NOW();

-- Step 3: Verify the profile was created
SELECT 
  id,
  email,
  full_name,
  is_admin,
  user_type,
  created_at
FROM profiles 
WHERE email = 'prepskul@gmail.com';

-- ============================================
-- DONE! Now try logging in again
-- ============================================

