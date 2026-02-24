-- PrepSkul Ambassadors Application Table
-- Stores ambassador application survey responses

CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  age_range TEXT NOT NULL CHECK (age_range IN ('under_18', '18_20', '21_25', '26_30', '30_plus')),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  city TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN (
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'North West', 'South', 'South West', 'West'
  )),
  status TEXT NOT NULL CHECK (status IN ('student', 'graduate', 'tutor_teacher', 'working_professional', 'other')),
  status_other TEXT, -- Only filled if status is 'other'
  student_class_level TEXT, -- Only filled if status is 'student'
  motivation TEXT NOT NULL,
  alignment_goals TEXT[] NOT NULL, -- Array of selected goals
  explanation TEXT,
  social_platforms JSONB, -- { platform: { username, followers } }
  reach_range TEXT CHECK (reach_range IN ('less_than_20', '20_50', '50_100', '100_plus')),
  promotion_methods TEXT[] NOT NULL, -- Array of selected methods
  promotion_methods_other TEXT, -- Text for "Other" promotion method option
  creative_idea TEXT,
  email TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  profile_image_url TEXT,
  application_status TEXT DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ambassadors_email ON ambassadors(email);
CREATE INDEX IF NOT EXISTS idx_ambassadors_region ON ambassadors(region);
CREATE INDEX IF NOT EXISTS idx_ambassadors_status ON ambassadors(status);
CREATE INDEX IF NOT EXISTS idx_ambassadors_application_status ON ambassadors(application_status);
CREATE INDEX IF NOT EXISTS idx_ambassadors_created_at ON ambassadors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ambassadors_approved_at ON ambassadors(approved_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can submit ambassador application" ON ambassadors;
DROP POLICY IF EXISTS "Public can submit ambassador application" ON ambassadors;

-- Allow all roles (anon and authenticated) to insert (submit applications)
-- Removing TO clause allows all roles by default
CREATE POLICY "Public can submit ambassador application"
  ON ambassadors FOR INSERT
  WITH CHECK (true);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view ambassador applications" ON ambassadors;
DROP POLICY IF EXISTS "Admins can update ambassador applications" ON ambassadors;
DROP POLICY IF EXISTS "Authenticated users can view ambassador applications" ON ambassadors;
DROP POLICY IF EXISTS "Authenticated users can update ambassador applications" ON ambassadors;

-- Only authenticated users can view applications (you can restrict further based on your admin system)
CREATE POLICY "Authenticated users can view ambassador applications"
  ON ambassadors FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update applications
CREATE POLICY "Authenticated users can update ambassador applications"
  ON ambassadors FOR UPDATE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
-- Drop trigger first if it exists (since it depends on the function)
DROP TRIGGER IF EXISTS update_ambassadors_updated_at ON ambassadors;

-- Drop function if it exists
DROP FUNCTION IF EXISTS update_ambassadors_updated_at();

-- Create the function
CREATE OR REPLACE FUNCTION update_ambassadors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ambassadors_updated_at
  BEFORE UPDATE ON ambassadors
  FOR EACH ROW
  EXECUTE FUNCTION update_ambassadors_updated_at();

