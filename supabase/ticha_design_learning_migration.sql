-- Migration: Add Design Learning System Columns + Admin Support
-- Run this if you already have the base schema
-- Safe to run multiple times

-- Add is_admin column to ticha_users table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticha_users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE ticha_users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add new columns to ticha_design_inspiration table (if they don't exist)
DO $$ 
BEGIN
  -- Add image_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticha_design_inspiration' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE ticha_design_inspiration ADD COLUMN image_url TEXT;
  END IF;

  -- Add keywords column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticha_design_inspiration' AND column_name = 'keywords'
  ) THEN
    ALTER TABLE ticha_design_inspiration ADD COLUMN keywords TEXT[];
  END IF;

  -- Add extracted_design_spec column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticha_design_inspiration' AND column_name = 'extracted_design_spec'
  ) THEN
    ALTER TABLE ticha_design_inspiration ADD COLUMN extracted_design_spec JSONB;
  END IF;

  -- Add quality_score column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticha_design_inspiration' AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE ticha_design_inspiration ADD COLUMN quality_score NUMERIC(5,2);
  END IF;

  -- Add usage_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticha_design_inspiration' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE ticha_design_inspiration ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;

  -- Add uploaded_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticha_design_inspiration' AND column_name = 'uploaded_by'
  ) THEN
    ALTER TABLE ticha_design_inspiration ADD COLUMN uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticha_design_inspiration' AND column_name = 'description'
  ) THEN
    ALTER TABLE ticha_design_inspiration ADD COLUMN description TEXT;
  END IF;
END $$;

-- Create indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_ticha_design_inspiration_keywords 
  ON ticha_design_inspiration USING GIN(keywords);

CREATE INDEX IF NOT EXISTS idx_ticha_design_inspiration_quality_score 
  ON ticha_design_inspiration(quality_score DESC);

CREATE INDEX IF NOT EXISTS idx_ticha_design_inspiration_usage_count 
  ON ticha_design_inspiration(usage_count DESC);

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can insert design inspiration" ON ticha_design_inspiration;
DROP POLICY IF EXISTS "Admins can update design inspiration" ON ticha_design_inspiration;
DROP POLICY IF EXISTS "Admins can delete design inspiration" ON ticha_design_inspiration;

-- Create admin policies for design inspiration management
CREATE POLICY "Admins can insert design inspiration"
  ON ticha_design_inspiration FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update design inspiration"
  ON ticha_design_inspiration FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete design inspiration"
  ON ticha_design_inspiration FOR DELETE
  USING (auth.role() = 'authenticated');

