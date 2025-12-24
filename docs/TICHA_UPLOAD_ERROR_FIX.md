# Fixing TichaAI Upload 500 Error

## 🔍 Common Causes of 500 Error

### 1. Missing Environment Variables

The most common cause is missing or incorrect environment variables.

**Check your `.env.local` file** (in project root):

```env
# Required - TichaAI Supabase
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://olrjjctddhlvnwclcich.supabase.co
TICHA_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmpqY3RkZGhsdm53Y2xjaWNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU4NjA4NywiZXhwIjoyMDc5MTYyMDg3fQ.UWMHebsrBEg2UBf5UkfeBFR_QfeYjPKiqdGrOcMmujk

# Required - OpenRouter API
OPENROUTER_API_KEY=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
```

**After adding/changing env vars:**
- **Restart the dev server** (Ctrl+C, then `pnpm dev` again)
- Environment variables only load on server start

---

### 2. Missing Supabase Storage Bucket

If the `uploads` bucket doesn't exist, uploads will fail.

**Fix**: Create the `uploads` bucket in Supabase Dashboard
- Go to Storage → Create Bucket
- Name: `uploads`
- Public: ✅ Yes
- (See `TICHA_SUPABASE_STORAGE_SETUP.md` for details)

---

### 3. File Type Validation

The API might be rejecting your file type.

**Check terminal logs** for:
```
[Upload] Invalid file type: image/jpeg, extension: jpg
```

**Supported types**:
- PDF: `application/pdf`
- DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Images: `image/jpeg`, `image/png`, `image/gif`
- Text: `text/plain`

**Note**: If the file MIME type is missing, it checks the file extension.

---

## 🔍 Debugging Steps

### Step 1: Check Terminal Logs

Look at the terminal where `pnpm dev` is running for detailed error messages:

```
[Upload] Starting file upload request
[Upload] Received file: test.jpg, size: 123456, type: image/jpeg
[Upload] Error: Failed to upload file: ...
```

**Common error patterns**:

- `Missing TichaAI Supabase credentials` → Add env vars to `.env.local`
- `bucket does not exist` → Create `uploads` bucket in Supabase
- `Invalid JWT` → Service key is incorrect
- `permission denied` → Storage bucket policies not configured

---

### Step 2: Verify Environment Variables

Create or update `.env.local` in the project root:

```env
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://olrjjctddhlvnwclcich.supabase.co
TICHA_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmpqY3RkZGhsdm53Y2xjaWNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU4NjA4NywiZXhwIjoyMDc5MTYyMDg3fQ.UWMHebsrBEg2UBf5UkfeBFR_QfeYjPKiqdGrOcMmujk
OPENROUTER_API_KEY=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
```

**Get your ANON_KEY**:
- Supabase Dashboard → Project Settings → API
- Copy the `anon` `public` key
- Add to `.env.local` as: `NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your_anon_key_here`

---

### Step 3: Verify Storage Buckets

**In Supabase Dashboard**:
1. Go to **Storage** → **Buckets**
2. Check if `uploads` bucket exists
3. Check if it's **public** (toggle should be ON)
4. If missing, create it (see `TICHA_SUPABASE_STORAGE_SETUP.md`)

---

### Step 4: Check Browser Console

Open browser DevTools (F12) → Console tab:
- Look for detailed error messages
- Check Network tab for the failed request
- See the actual error response

---

### Step 5: Test with Simple Request

Test the API directly:

```bash
# Using curl (replace with actual file)
curl -X POST http://localhost:3000/api/ticha/upload \
  -F "file=@test.txt" \
  -F "prompt=test"
```

Or use Postman/Thunder Client with:
- Method: POST
- URL: `http://localhost:3000/api/ticha/upload`
- Body: form-data
- Key: `file`, Type: File, Value: (select file)

---

## ✅ Quick Fixes

### Fix 1: Missing Env Vars

1. Create `.env.local` in project root
2. Add the required variables (see above)
3. **Restart dev server**: `pnpm dev`

### Fix 2: Missing Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `uploads`
4. Public: ✅ Yes
5. Create

### Fix 3: Restart Dev Server

After any config changes:
```bash
# Stop server (Ctrl+C)
# Restart
pnpm dev
```

---

## 🔍 What to Look For

**In Terminal** (where `pnpm dev` runs):
```
[Upload] Starting file upload request
[Upload] Received file: test.jpg, size: 123456, type: image/jpeg
[Upload] Uploading file: public/1234567890-abc123.jpg (123456 bytes)
[Upload] Error: Failed to upload file: bucket does not exist
```

**In Browser Console** (F12):
```
POST /api/ticha/upload 500 (Internal Server Error)
Error: Failed to upload file
```

---

## 📝 Next Steps

1. **Check terminal logs** - Look for `[Upload]` messages
2. **Verify `.env.local` exists** - In project root
3. **Restart dev server** - After env var changes
4. **Verify buckets exist** - In Supabase Dashboard
5. **Check file type** - Make sure it's supported

---

**Most likely issue**: Missing environment variables. Check `.env.local` and restart the dev server!

