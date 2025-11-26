-- Run ONLY these lines if you already ran the original schema
-- This adds the missing tables and policies

-- TichaAI Design Templates Table
CREATE TABLE IF NOT EXISTS ticha_design_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- corporate, creative, minimalist, academic, marketing
  preset_data JSONB NOT NULL, -- Full preset definition with colors, fonts, layouts
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- TichaAI Design Inspiration Table
CREATE TABLE IF NOT EXISTS ticha_design_inspiration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_url TEXT NOT NULL,
  design_data JSONB NOT NULL, -- Extracted design patterns (colors, layouts, typography)
  category TEXT, -- corporate, creative, minimalist, academic, marketing
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Add missing columns to ticha_presentations if they don't exist
DO $$ 
BEGIN
  -- Add presentation_data column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ticha_presentations' AND column_name='presentation_data') THEN
    ALTER TABLE ticha_presentations ADD COLUMN presentation_data JSONB;
  END IF;
  
  -- Add refinement_history column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ticha_presentations' AND column_name='refinement_history') THEN
    ALTER TABLE ticha_presentations ADD COLUMN refinement_history JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  -- Add design_preset column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ticha_presentations' AND column_name='design_preset') THEN
    ALTER TABLE ticha_presentations ADD COLUMN design_preset TEXT;
  END IF;
  
  -- Add design_customizations column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ticha_presentations' AND column_name='design_customizations') THEN
    ALTER TABLE ticha_presentations ADD COLUMN design_customizations JSONB;
  END IF;
END $$;

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_ticha_design_templates_category ON ticha_design_templates(category);
CREATE INDEX IF NOT EXISTS idx_ticha_design_inspiration_category ON ticha_design_inspiration(category);
CREATE INDEX IF NOT EXISTS idx_ticha_design_inspiration_scraped_at ON ticha_design_inspiration(scraped_at DESC);

-- Enable RLS on new tables
ALTER TABLE ticha_design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticha_design_inspiration ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view design templates" ON ticha_design_templates;
DROP POLICY IF EXISTS "Anyone can view design inspiration" ON ticha_design_inspiration;

-- RLS Policies for Design Templates (public read)
CREATE POLICY "Anyone can view design templates"
  ON ticha_design_templates FOR SELECT
  USING (true);

-- RLS Policies for Design Inspiration (public read)
CREATE POLICY "Anyone can view design inspiration"
  ON ticha_design_inspiration FOR SELECT
  USING (true);

