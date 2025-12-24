-- ============================================
-- Grant Admin Permissions to User
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Ensure is_admin column exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Grant admin permissions to your email
-- Replace 'prepskul@gmail.com' with your actual email if different
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'prepskul@gmail.com';

-- Step 3: Verify the update worked
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
-- Expected Result:
-- You should see your user with is_admin = true
-- ============================================

-- If the above query returns no rows, the user might not exist in profiles table.
-- In that case, run this to create the profile from auth.users:
INSERT INTO profiles (id, email, full_name, is_admin, user_type, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
  TRUE,
  'admin',
  created_at,
  NOW()
FROM auth.users 
WHERE email = 'prepskul@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
  is_admin = TRUE,
  user_type = COALESCE(profiles.user_type, 'admin'),
  updated_at = NOW();

-- Verify again
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
-- DONE! 
-- Now try logging in at /admin/login
-- Email: prepskul@gmail.com
-- Password: DE12$kimb (or whatever you set)
-- ============================================

