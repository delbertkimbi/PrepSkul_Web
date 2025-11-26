-- Migration: Make user_id nullable in ticha_presentations
-- Run this if you already have the table with NOT NULL constraint

-- Drop the NOT NULL constraint on user_id
ALTER TABLE ticha_presentations 
  ALTER COLUMN user_id DROP NOT NULL;

-- Update foreign key constraint to allow NULL
-- (The existing foreign key should already allow NULL, but we're ensuring it)
-- If you get an error, the constraint might need to be dropped and recreated
-- DO $$ 
-- BEGIN
--   ALTER TABLE ticha_presentations 
--     DROP CONSTRAINT IF EXISTS ticha_presentations_user_id_fkey;
--   
--   ALTER TABLE ticha_presentations 
--     ADD CONSTRAINT ticha_presentations_user_id_fkey 
--     FOREIGN KEY (user_id) REFERENCES ticha_users(id) ON DELETE CASCADE;
-- END $$;

