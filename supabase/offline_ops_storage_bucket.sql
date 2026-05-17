-- PrepSkul offline ops: venue photo storage bucket
-- Run in Supabase Dashboard → SQL Editor (or via CLI) after enabling Storage.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'offline-ops',
  'offline-ops',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for venue KYC photos (admin upload only via service role API)
DROP POLICY IF EXISTS "Public read offline-ops" ON storage.objects;
CREATE POLICY "Public read offline-ops"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'offline-ops');

-- Service role / admin API uploads use service role key (bypasses RLS).
-- Optional: allow authenticated admins to upload directly from browser:
DROP POLICY IF EXISTS "Admins upload offline-ops" ON storage.objects;
CREATE POLICY "Admins upload offline-ops"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'offline-ops');
