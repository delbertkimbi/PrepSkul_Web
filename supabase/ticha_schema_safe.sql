-- TichaAI Database Schema (Safe to Run Multiple Times)
-- Run this in Supabase SQL Editor
-- This version drops existing policies before creating them

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TichaAI Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS ticha_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- TichaAI Presentations Table
CREATE TABLE IF NOT EXISTS ticha_presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES ticha_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT, -- Original file URL if uploaded
  file_name TEXT,
  file_type TEXT, -- pdf, txt, docx, etc.
  prompt TEXT, -- User's prompt/instructions
  status TEXT NOT NULL DEFAULT 'processing', -- processing, completed, failed
  presentation_url TEXT, -- Generated presentation URL
  presentation_data JSONB, -- Full slide structure and design specs for editor
  refinement_history JSONB DEFAULT '[]'::jsonb, -- Array of refinement iterations
  design_preset TEXT, -- Selected design preset (corporate, creative, minimalist, academic, marketing)
  design_customizations JSONB, -- User customizations to design
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- TichaAI Presentation Slides Table (if you want to store slide data)
CREATE TABLE IF NOT EXISTS ticha_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID NOT NULL REFERENCES ticha_presentations(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  title TEXT,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ticha_presentations_user_id ON ticha_presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_ticha_presentations_status ON ticha_presentations(status);
CREATE INDEX IF NOT EXISTS idx_ticha_presentations_created_at ON ticha_presentations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticha_slides_presentation_id ON ticha_slides(presentation_id);
CREATE INDEX IF NOT EXISTS idx_ticha_slides_slide_number ON ticha_slides(presentation_id, slide_number);
CREATE INDEX IF NOT EXISTS idx_ticha_design_templates_category ON ticha_design_templates(category);
CREATE INDEX IF NOT EXISTS idx_ticha_design_inspiration_category ON ticha_design_inspiration(category);
CREATE INDEX IF NOT EXISTS idx_ticha_design_inspiration_scraped_at ON ticha_design_inspiration(scraped_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE ticha_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticha_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticha_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticha_design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticha_design_inspiration ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
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

-- RLS Policies: Users can only see/edit their own data

-- User Profile Policies
CREATE POLICY "Users can view own profile"
  ON ticha_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON ticha_users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON ticha_users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Presentation Policies
CREATE POLICY "Users can view own presentations"
  ON ticha_presentations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own presentations"
  ON ticha_presentations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentations"
  ON ticha_presentations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentations"
  ON ticha_presentations FOR DELETE
  USING (auth.uid() = user_id);

-- Slides Policies
CREATE POLICY "Users can view own slides"
  ON ticha_slides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ticha_presentations
      WHERE ticha_presentations.id = ticha_slides.presentation_id
      AND ticha_presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create slides for own presentations"
  ON ticha_slides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ticha_presentations
      WHERE ticha_presentations.id = ticha_slides.presentation_id
      AND ticha_presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own slides"
  ON ticha_slides FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ticha_presentations
      WHERE ticha_presentations.id = ticha_slides.presentation_id
      AND ticha_presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own slides"
  ON ticha_slides FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ticha_presentations
      WHERE ticha_presentations.id = ticha_slides.presentation_id
      AND ticha_presentations.user_id = auth.uid()
    )
  );

-- Design Templates Policies (public read)
CREATE POLICY "Anyone can view design templates"
  ON ticha_design_templates FOR SELECT
  USING (true);

-- Design Inspiration Policies (public read)
CREATE POLICY "Anyone can view design inspiration"
  ON ticha_design_inspiration FOR SELECT
  USING (true);

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_ticha_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ticha_users (id, email, full_name)
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If email conflict, just return NEW without error
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_ticha_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_ticha_users_updated_at ON ticha_users;
CREATE TRIGGER update_ticha_users_updated_at
  BEFORE UPDATE ON ticha_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ticha_presentations_updated_at ON ticha_presentations;
CREATE TRIGGER update_ticha_presentations_updated_at
  BEFORE UPDATE ON ticha_presentations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

