-- Run this FIRST to drop all existing policies
-- Then you can run the original ticha_schema.sql

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON ticha_users;
DROP POLICY IF EXISTS "Users can update own profile" ON ticha_users;
DROP POLICY IF EXISTS "Users can insert own profile" ON ticha_users;
DROP POLICY IF EXISTS "Users can view own presentations" ON ticha_presentations;
DROP POLICY IF EXISTS "Users can create own presentations" ON ticha_presentations;
DROP POLICY IF EXISTS "Users can update own presentations" ON ticha_presentations;
DROP POLICY IF EXISTS "Users can delete own presentations" ON ticha_presentations;
DROP POLICY IF EXISTS "Users can view own slides" ON ticha_slides;
DROP POLICY IF EXISTS "Users can create slides for own presentations" ON ticha_slides;
DROP POLICY IF EXISTS "Users can update own slides" ON ticha_slides;
DROP POLICY IF EXISTS "Users can delete own slides" ON ticha_slides;
DROP POLICY IF EXISTS "Anyone can view design templates" ON ticha_design_templates;
DROP POLICY IF EXISTS "Anyone can view design inspiration" ON ticha_design_inspiration;

