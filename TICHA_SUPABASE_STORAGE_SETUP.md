# TichaAI Supabase Storage Setup Guide

## 📦 Setting Up Storage Buckets

Follow these steps to create and configure the storage buckets for TichaAI.

---

## Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your **TichaAI project** (the one with URL: `https://olrjjctddhlvnwclcich.supabase.co`)
3. Navigate to **Storage** in the left sidebar

---

## Step 2: Create `uploads` Bucket

### 2.1 Create the Bucket

1. Click **"New bucket"** button (top right)
2. Enter bucket name: `uploads`
3. **Toggle "Public bucket"** to **ON** (enabled)
   - This allows public access to uploaded files
4. **Toggle "File size limit"** to **ON** (optional but recommended)
   - Set limit to: `52428800` (50 MB in bytes)
   - This prevents oversized uploads
5. Click **"Create bucket"**

### 2.2 Configure Bucket Policies

1. Click on the **`uploads`** bucket to open it
2. Go to **"Policies"** tab
3. Click **"New Policy"** or **"Add policy"**

#### Policy 1: Public Read Access
- **Policy name**: `Public Read Access`
- **Allowed operation**: `SELECT` (read)
- **Policy definition**:
  ```sql
  (bucket_id = 'uploads')
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 2: Authenticated Upload
- **Policy name**: `Authenticated Upload`
- **Allowed operation**: `INSERT` (upload)
- **Policy definition**:
  ```sql
  (bucket_id = 'uploads' AND auth.role() = 'authenticated')
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 3: Authenticated Delete (Own Files)
- **Policy name**: `Users Can Delete Own Files`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1])
  ```
- Click **"Review"** then **"Save policy"**

---

## Step 3: Create `generated` Bucket

### 3.1 Create the Bucket

1. Click **"New bucket"** button again
2. Enter bucket name: `generated`
3. **Toggle "Public bucket"** to **ON** (enabled)
   - This allows public download of generated presentations
4. **Toggle "File size limit"** to **ON** (optional)
   - Set limit to: `52428800` (50 MB)
5. Click **"Create bucket"**

### 3.2 Configure Bucket Policies

1. Click on the **`generated`** bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Public Read Access
- **Policy name**: `Public Read Generated`
- **Allowed operation**: `SELECT` (read)
- **Policy definition**:
  ```sql
  (bucket_id = 'generated')
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 2: Authenticated Upload (Service Role)
- **Policy name**: `Service Role Can Upload`
- **Allowed operation**: `INSERT` (upload)
- **Policy definition**:
  ```sql
  (bucket_id = 'generated')
  ```
- **Note**: This allows the service role (used by API) to upload files
- Click **"Review"** then **"Save policy"**

---

## Step 4: Verify Bucket Setup

### 4.1 Check Bucket Visibility

1. Go to **Storage** → **Buckets**
2. Verify both buckets show:
   - ✅ **Public** badge
   - ✅ Correct names: `uploads` and `generated`

### 4.2 Test File Upload (Optional)

1. Go to **Storage** → **`uploads`** bucket
2. Click **"Upload file"**
3. Upload a small test file (e.g., `test.txt`)
4. Verify the file appears in the bucket
5. Copy the **public URL** and verify it's accessible

---

## Step 5: SQL Policies (Alternative Method)

If you prefer using SQL Editor instead of the UI:

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New query"**
3. Paste and run this SQL:

```sql
-- Create uploads bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  52428800, -- 50 MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- Create generated bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated',
  'generated',
  true,
  52428800, -- 50 MB
  ARRAY['application/vnd.openxmlformats-officedocument.presentationml.presentation']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- Uploads: Public read access
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

-- Uploads: Authenticated upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND
  auth.role() = 'authenticated'
);

-- Uploads: Users can delete own files
CREATE POLICY "Users Can Delete Own Files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Generated: Public read access
CREATE POLICY "Public Read Generated" ON storage.objects
FOR SELECT USING (bucket_id = 'generated');

-- Generated: Service role can upload (this is automatic, but explicit policy for clarity)
CREATE POLICY "Service Role Can Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'generated');
```

4. Click **"Run"** or press `Ctrl/Cmd + Enter`

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `uploads` bucket exists and is **public**
- [ ] `generated` bucket exists and is **public**
- [ ] Both buckets have file size limit set (50 MB)
- [ ] Policies are configured correctly
- [ ] You can upload a test file to `uploads`
- [ ] Public URLs work for both buckets

---

## 🧪 Test Storage Access

### Test Upload

```typescript
// In your browser console or API test
const { data, error } = await supabase.storage
  .from('uploads')
  .upload('test/test.txt', 'Hello World', {
    contentType: 'text/plain'
  })

console.log('Upload result:', { data, error })
```

### Test Download

```typescript
const { data, error } = await supabase.storage
  .from('uploads')
  .download('test/test.txt')

console.log('Download result:', { data, error })
```

### Test Public URL

Visit this URL (replace with your actual file path):
```
https://olrjjctddhlvnwclcich.supabase.co/storage/v1/object/public/uploads/test/test.txt
```

If the file loads, your public access is working! ✅

---

## 🔒 Security Notes

1. **Public Buckets**: Files are accessible to anyone with the URL
   - Suitable for user uploads that need to be processed
   - Suitable for generated presentations that users need to download

2. **Service Role Key**: Used by API for uploads
   - NEVER expose service role key to client-side code
   - Only use in server-side API routes

3. **File Size Limits**: Set to 50 MB to prevent abuse
   - Adjust if needed for larger files

4. **MIME Types**: Can restrict allowed file types
   - Configure in bucket settings or policies

---

## 🐛 Troubleshooting

### Bucket Not Found
- Ensure bucket name is exactly `uploads` or `generated` (lowercase)
- Check you're in the correct Supabase project

### Permission Denied
- Verify bucket is set to **public**
- Check policies are created correctly
- Ensure service role key is used for API operations

### Upload Fails
- Check file size is under limit (50 MB)
- Verify MIME type is allowed
- Check authentication if using authenticated uploads

### Public URL Not Working
- Verify bucket is **public** (not private)
- Check the file path is correct
- Ensure policies allow SELECT operations

---

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage)

---

**Need Help?** If you encounter issues, check the Supabase logs or verify your bucket configurations match the steps above.

