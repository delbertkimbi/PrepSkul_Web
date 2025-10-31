-- Quick check for admin profile
SELECT 
  id,
  email,
  is_admin,
  user_type,
  created_at
FROM profiles 
WHERE email = 'prepskul@gmail.com';

-- Count profiles
SELECT COUNT(*) as total
FROM profiles 
WHERE email = 'prepskul@gmail.com';

