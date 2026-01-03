# Ambassadors Storage Bucket Setup

## 📦 Setting Up Storage Bucket for Ambassador Profile Images

Follow these steps to create and configure the storage bucket for ambassador profile images.

---

## Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your **main PrepSkul project** (not TichaAI)
3. Navigate to **Storage** in the left sidebar

---

## Step 2: Create `ambassador_profiles` Bucket

### 2.1 Create the Bucket

1. Click **"New bucket"** button (top right)
2. Enter bucket name: `ambassador_profiles`
3. **Toggle "Public bucket"** to **ON** (enabled)
   - This allows public access to profile images
4. **Toggle "File size limit"** to **ON** (recommended)
   - Set limit to: `2097152` (2 MB in bytes)
   - This matches the validation in the application form
5. Click **"Create bucket"**

### 2.2 Configure Bucket Policies

1. Click on the **`ambassador_profiles`** bucket to open it
2. Go to **"Policies"** tab
3. Click **"New Policy"** or **"Add policy"**

#### Policy 1: Public Read Access
- **Policy name**: `Public Read Access`
- **Allowed operation**: `SELECT` (read)
- **Policy definition**:
  ```sql
  (bucket_id = 'ambassador_profiles')
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 2: Public Upload (for application form)
- **Policy name**: `Public Upload`
- **Allowed operation**: `INSERT` (upload)
- **Policy definition**:
  ```sql
  (bucket_id = 'ambassador_profiles')
  ```
- Click **"Review"** then **"Save policy"**

**Note**: Since this is for public applications, we allow public uploads. You can restrict this further if needed by requiring authentication.

---

## Step 3: Verify Setup

### Test Upload

You can test the upload functionality by submitting an ambassador application through the form at `/ambassadors/apply`.

### Test Public URL

After an image is uploaded, you can access it via:
```
https://[YOUR_SUPABASE_URL]/storage/v1/object/public/ambassador_profiles/[filename]
```

---

## 🔒 Security Notes

1. **Public Buckets**: Files are accessible to anyone with the URL
   - Suitable for profile images that need to be displayed publicly
   - Consider adding authentication if you want to restrict access

2. **File Size Limits**: Set to 2 MB to match form validation
   - Adjust if needed, but remember to update validation in the form

3. **File Types**: Currently accepts JPG and PNG
   - Configured in the application form validation
   - Can be further restricted in bucket policies if needed

---

## 🐛 Troubleshooting

### Bucket Not Found
- Ensure bucket name is exactly `ambassador_profiles` (lowercase, underscore)
- Check you're in the correct Supabase project (main PrepSkul, not TichaAI)

### Permission Denied
- Verify bucket is set to **public**
- Check policies are created correctly
- Ensure policies allow both SELECT and INSERT operations

### Upload Fails
- Check file size is under 2 MB
- Verify file type is JPG or PNG
- Check browser console for detailed error messages

### Public URL Not Working
- Verify bucket is **public** (not private)
- Check the file path is correct
- Ensure policies allow SELECT operations

---

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)

