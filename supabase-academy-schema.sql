-- PrepSkul Academy Database Schema
-- Run this SQL in your Academy Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Academy Users Profile Table
CREATE TABLE IF NOT EXISTS academy_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academy Progress Table
-- Tracks user progress across levels, modules, and sections
CREATE TABLE IF NOT EXISTS academy_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES academy_profiles(id) ON DELETE CASCADE,
    level_id TEXT NOT NULL, -- 'nursery', 'primary', 'secondary', 'university', 'skills'
    module_id TEXT NOT NULL,
    -- Module quiz score (0-100)
    quiz_score INTEGER DEFAULT 0,
    -- Whether module quiz is passed (score >= 70)
    is_passed BOOLEAN DEFAULT FALSE,
    -- Sections that have been watched/completed
    watched_sections TEXT[] DEFAULT '{}',
    -- Section progress (JSONB: { "section_id": progress_percentage })
    section_progress JSONB DEFAULT '{}',
    -- Timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique constraint: one progress record per user per module
    UNIQUE(user_id, level_id, module_id)
);

-- Academy Level Final Quiz Table
-- Tracks final quiz completion for each level
CREATE TABLE IF NOT EXISTS academy_level_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES academy_profiles(id) ON DELETE CASCADE,
    level_id TEXT NOT NULL,
    score INTEGER NOT NULL, -- 0-100
    is_passed BOOLEAN NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique constraint: one final quiz per user per level
    UNIQUE(user_id, level_id)
);

-- Academy Certificates Table
-- Tracks issued certificates for completed levels
CREATE TABLE IF NOT EXISTS academy_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES academy_profiles(id) ON DELETE CASCADE,
    level_id TEXT NOT NULL,
    tutor_name TEXT NOT NULL,
    verification_code TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique constraint: one certificate per user per level
    UNIQUE(user_id, level_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_academy_progress_user_id ON academy_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_progress_level_module ON academy_progress(level_id, module_id);
CREATE INDEX IF NOT EXISTS idx_academy_level_quizzes_user_id ON academy_level_quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_level_quizzes_level_id ON academy_level_quizzes(level_id);
CREATE INDEX IF NOT EXISTS idx_academy_certificates_user_id ON academy_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_certificates_verification_code ON academy_certificates(verification_code);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_academy_profiles_updated_at
    BEFORE UPDATE ON academy_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academy_progress_updated_at
    BEFORE UPDATE ON academy_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE academy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_level_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;

-- Academy Profiles Policies
-- Users can read and update their own profile
CREATE POLICY "Users can view own profile"
    ON academy_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON academy_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_academy_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.academy_profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_academy_user();

-- Academy Progress Policies
-- Users can read and write their own progress
CREATE POLICY "Users can view own progress"
    ON academy_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
    ON academy_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
    ON academy_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Academy Level Quizzes Policies
-- Users can read and write their own quiz results
CREATE POLICY "Users can view own level quizzes"
    ON academy_level_quizzes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own level quizzes"
    ON academy_level_quizzes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own level quizzes"
    ON academy_level_quizzes FOR UPDATE
    USING (auth.uid() = user_id);

-- Academy Certificates Policies
-- Users can read their own certificates
-- Certificates can be read by anyone (for verification)
CREATE POLICY "Users can view own certificates"
    ON academy_certificates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can verify certificates"
    ON academy_certificates FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own certificates"
    ON academy_certificates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON academy_profiles TO authenticated;
GRANT ALL ON academy_progress TO authenticated;
GRANT ALL ON academy_level_quizzes TO authenticated;
GRANT ALL ON academy_certificates TO authenticated;


