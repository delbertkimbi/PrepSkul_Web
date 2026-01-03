-- Create design-inspiration storage bucket and policies
-- Run this in Supabase SQL Editor

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'design-inspiration',
  'design-inspiration',
  true,  -- Public bucket for easy access
  10485760,  -- 10 MB limit for images
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Read Design Inspiration" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Design Inspiration" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Delete Own Design Files" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Can Upload Design Inspiration" ON storage.objects;

-- Public read access (anyone can view design images)
CREATE POLICY "Public Read Design Inspiration" ON storage.objects
FOR SELECT 
USING (bucket_id = 'design-inspiration');

-- Authenticated users can upload to their own folder
CREATE POLICY "Authenticated Upload Design Inspiration" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'design-inspiration' AND
  auth.role() = 'authenticated'
);

-- Users can delete their own files (files in their user folder)
CREATE POLICY "Users Can Delete Own Design Files" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'design-inspiration' AND
  (
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'user-designs' AND
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Service role can upload (for admin operations)
CREATE POLICY "Service Role Can Upload Design Inspiration" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'design-inspiration' AND
  auth.role() = 'service_role'
);

