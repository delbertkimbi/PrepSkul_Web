-- Add description column to ticha_design_inspiration table
-- Run this in Supabase SQL Editor

DO $$ 
BEGIN
  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticha_design_inspiration' AND column_name = 'description'
  ) THEN
    ALTER TABLE ticha_design_inspiration ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column to ticha_design_inspiration';
  ELSE
    RAISE NOTICE 'description column already exists';
  END IF;
END $$;

