-- Create First Admin User
-- Run this AFTER running the migration to create your first admin
-- Replace 'your-email@example.com' with your actual email

-- Option 1: Set existing user as admin by email
UPDATE ticha_users 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';

-- Option 2: Set existing user as admin by user ID (get ID from Supabase Auth dashboard)
-- UPDATE ticha_users 
-- SET is_admin = TRUE 
-- WHERE id = 'user-uuid-here';

-- Verify admin was created
SELECT id, email, is_admin, created_at 
FROM ticha_users 
WHERE is_admin = TRUE;

