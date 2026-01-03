-- RLS Policies for User Design Uploads
-- Allows users to insert their own design inspirations
-- Service role bypasses RLS, but these policies allow authenticated users too

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own designs" ON ticha_design_inspiration;
DROP POLICY IF EXISTS "Admins can insert design inspiration" ON ticha_design_inspiration;
DROP POLICY IF EXISTS "Users can view their own designs" ON ticha_design_inspiration;
DROP POLICY IF EXISTS "Users can update their own designs" ON ticha_design_inspiration;
DROP POLICY IF EXISTS "Users can delete their own designs" ON ticha_design_inspiration;
DROP POLICY IF EXISTS "Public can view all designs" ON ticha_design_inspiration;

-- Allow authenticated users to insert their own designs
-- Service role bypasses RLS automatically, but this allows regular authenticated users
CREATE POLICY "Users can insert their own designs"
  ON ticha_design_inspiration FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by OR
    uploaded_by IS NULL
  );

-- Also keep the admin policy for backward compatibility (allows any authenticated user)
-- This is less restrictive and allows inserts from service role context too
CREATE POLICY "Admins can insert design inspiration"
  ON ticha_design_inspiration FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow users to view their own designs and all public designs
CREATE POLICY "Users can view their own designs"
  ON ticha_design_inspiration FOR SELECT
  TO authenticated
  USING (
    auth.uid() = uploaded_by OR
    uploaded_by IS NULL OR
    TRUE  -- Allow viewing all designs for matching purposes
  );

-- Allow users to update their own designs
CREATE POLICY "Users can update their own designs"
  ON ticha_design_inspiration FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

-- Allow users to delete their own designs
CREATE POLICY "Users can delete their own designs"
  ON ticha_design_inspiration FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

-- Allow public/anonymous users to view designs (for matching)
CREATE POLICY "Public can view all designs"
  ON ticha_design_inspiration FOR SELECT
  TO anon
  USING (TRUE);

