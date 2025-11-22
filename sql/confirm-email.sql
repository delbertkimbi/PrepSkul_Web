-- SQL Queries to Confirm User Emails in Supabase
-- Run these in Supabase SQL Editor

-- =====================================================
-- 1. Confirm a specific email address
-- =====================================================
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';

-- =====================================================
-- 2. Confirm email for a specific user ID
-- =====================================================
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE id = 'user-uuid-here';

-- =====================================================
-- 3. Confirm email (case-insensitive)
-- =====================================================
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE LOWER(email) = LOWER('User@Example.com');

-- =====================================================
-- 4. Confirm ALL unconfirmed emails
-- (Use with caution!)
-- =====================================================
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- =====================================================
-- 5. Confirm email and return confirmation
-- =====================================================
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com'
RETURNING id, email, email_confirmed_at;

-- =====================================================
-- 6. Check if an email is confirmed
-- =====================================================
SELECT 
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Not Confirmed'
  END AS status
FROM auth.users
WHERE email = 'user@example.com';

-- =====================================================
-- 7. List all unconfirmed emails
-- =====================================================
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- =====================================================
-- 8. Confirm email for TichaAI users only
-- (Joins with ticha_users table)
-- =====================================================
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com'
AND EXISTS (
  SELECT 1 
  FROM ticha_users 
  WHERE ticha_users.id = auth.users.id
);

-- =====================================================
-- 9. Confirm all unconfirmed TichaAI users
-- =====================================================
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL
AND EXISTS (
  SELECT 1 
  FROM ticha_users 
  WHERE ticha_users.id = auth.users.id
);

-- =====================================================
-- 10. Confirm and update phone verification too (if needed)
-- =====================================================
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  phone_confirmed_at = NOW()
WHERE email = 'user@example.com';

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Confirm a specific user's email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'lekebryan64@gmail.com';

-- Example 2: Confirm multiple emails at once
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email IN ('user1@example.com', 'user2@example.com', 'user3@example.com');

-- Example 3: Confirm and see what was updated
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com'
RETURNING id, email, email_confirmed_at, created_at;

-- Example 4: View unconfirmed users with their profile info (TichaAI)
SELECT 
  au.id,
  au.email,
  au.created_at,
  tu.full_name,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Not Confirmed'
  END AS status
FROM auth.users au
LEFT JOIN ticha_users tu ON tu.id = au.id
WHERE au.email_confirmed_at IS NULL
ORDER BY au.created_at DESC;

