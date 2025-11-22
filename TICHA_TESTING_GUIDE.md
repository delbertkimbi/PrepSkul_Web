# TichaAI Backend Testing Guide

## 🚀 Quick Start Testing

### Step 1: Verify Environment Variables

Create or update `.env.local` with these variables:

```env
# OpenRouter API (Required)
OPENROUTER_API_KEY=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

# TichaAI Supabase (Required)
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://olrjjctddhlvnwclcich.supabase.co
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your_anon_key_here
TICHA_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmpqY3RkZGhsdm53Y2xjaWNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU4NjA4NywiZXhwIjoyMDc5MTYyMDg3fQ.UWMHebsrBEg2UBf5UkfeBFR_QfeYjPKiqdGrOcMmujk

# Optional: Site URL for OpenRouter headers
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important**: Make sure `.env.local` exists in the project root!

---

### Step 2: Start Development Server

```bash
pnpm dev
```

The server should start at `http://localhost:3000`

---

### Step 3: Verify Storage Buckets

Make sure you've created the Supabase Storage buckets:

1. **`uploads`** bucket - for user uploads
2. **`generated`** bucket - for generated presentations

(See `TICHA_SUPABASE_STORAGE_SETUP.md` for details)

---

### Step 4: Test the API

#### Option 1: Using curl (Terminal/Command Prompt)

```bash
curl -X POST http://localhost:3000/api/ticha/generate \
  -H "Content-Type: application/json" \
  -d "{\"fileUrl\": \"YOUR_FILE_URL_HERE\"}"
```

#### Option 2: Using Postman

1. **Method**: `POST`
2. **URL**: `http://localhost:3000/api/ticha/generate`
3. **Headers**: 
   - `Content-Type: application/json`
4. **Body** (JSON):
   ```json
   {
     "fileUrl": "https://olrjjctddhlvnwclcich.supabase.co/storage/v1/object/public/uploads/path/to/your/file.pdf",
     "prompt": "Optional: Make it professional and engaging",
     "userId": "optional-user-id"
   }
   ```

#### Option 3: Using Thunder Client (VS Code Extension)

1. Install "Thunder Client" extension in VS Code
2. Create new request:
   - **Method**: POST
   - **URL**: `http://localhost:3000/api/ticha/generate`
   - **Body** (JSON): Same as Postman above

#### Option 4: Using Browser DevTools (For Frontend Integration)

```javascript
// In browser console or frontend code
const response = await fetch('/api/ticha/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileUrl: 'https://olrjjctddhlvnwclcich.supabase.co/storage/v1/object/public/uploads/test.pdf',
    prompt: 'Make it professional',
    userId: 'optional-user-id'
  }),
})

const data = await response.json()
console.log(data)
```

---

## 📋 Test Checklist

### Prerequisites

- [ ] Environment variables set in `.env.local`
- [ ] Dependencies installed (`pnpm install` completed)
- [ ] Development server running (`pnpm dev`)
- [ ] Supabase Storage buckets created (`uploads` and `generated`)
- [ ] Test file uploaded to Supabase Storage (`uploads` bucket)

### Testing Steps

1. **Upload a Test File**:
   - Upload a PDF/DOCX/image/text file to Supabase Storage
   - Copy the public URL (format: `https://...supabase.co/storage/v1/object/public/uploads/path/to/file.pdf`)

2. **Call the API**:
   - Use one of the testing methods above
   - Use the file URL from step 1

3. **Check Response**:
   - Success: `{ success: true, downloadUrl: "...", slides: 8, processingTime: "..." }`
   - Error: `{ error: "...", message: "..." }`

4. **Download Generated PPT**:
   - Use the `downloadUrl` from the response
   - Open in PowerPoint or Google Slides to verify

---

## 🧪 Test Cases

### Test Case 1: PDF File

**File**: Any PDF file with text content

**Expected**:
- ✅ Text extracted successfully
- ✅ Presentation generated
- ✅ PPT file created and uploaded
- ✅ Download URL returned

**Check**:
- Open generated PPT
- Verify slides have content
- Verify design themes are applied

### Test Case 2: DOCX File

**File**: Any Word document (.docx)

**Expected**:
- ✅ Same as PDF test

### Test Case 3: Text File

**File**: Plain text file (.txt)

**Expected**:
- ✅ Text extracted
- ✅ Presentation generated

### Test Case 4: Image File (with text)

**File**: Image with text content (JPG/PNG)

**Expected**:
- ✅ OCR extracts text
- ✅ Presentation generated
- ✅ Uses OpenRouter Vision or Tesseract.js

### Test Case 5: Error Handling

**Test**: Invalid file URL

**Expected**:
- ✅ Returns error message
- ✅ Doesn't crash

**Test**: Missing fileUrl

**Expected**:
- ✅ Returns `400 Bad Request`
- ✅ Error: "fileUrl is required"

---

## 🔍 Debugging

### Check Console Logs

The API logs each step. Watch the terminal where `pnpm dev` is running:

```
[Generate] Starting generation for file: uploads/test.pdf
[Generate] Step 1: Downloading file...
[Generate] Step 2: Extracting text...
[Generate] Extracted 1250 characters using pdf-parse
[Generate] Step 3: Cleaning text...
[Generate] Cleaned text: 1200 characters
[Generate] Step 4: Generating outline with design specs...
[Generate] Generated 8 slides
[Generate] Step 5: Creating PowerPoint...
[Generate] Created PPT: 245678 bytes
[Generate] Step 6: Uploading to Storage...
[Generate] Uploaded PPT: https://...
[Generate] Success! Processing time: 12456ms
```

### Common Issues

#### "Missing TichaAI Supabase credentials"
- ✅ Check `.env.local` exists
- ✅ Verify `TICHA_SUPABASE_SERVICE_KEY` is set
- ✅ Restart dev server after adding env vars

#### "Failed to download file"
- ✅ Verify file URL is correct
- ✅ Check file exists in `uploads` bucket
- ✅ Verify bucket is public

#### "Failed to extract text"
- ✅ Verify file type is supported (PDF/DOCX/Image/Text)
- ✅ Check file has readable content
- ✅ For images, ensure OCR dependencies are installed

#### "Failed to generate outline"
- ✅ Check `OPENROUTER_API_KEY` is set
- ✅ Verify API key is valid
- ✅ Check OpenRouter account has credits

#### "Failed to create presentation"
- ✅ Verify `pptxgenjs` is installed
- ✅ Check outline structure is valid
- ✅ Look for errors in console

---

## 📊 Expected Response Times

- **Small file (< 1MB)**: 5-15 seconds
- **Medium file (1-5MB)**: 15-30 seconds
- **Large file (5-10MB)**: 30-60 seconds

Processing time depends on:
- File size
- Text extraction method
- AI model response time
- Network speed

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ API returns `{ success: true, downloadUrl: "..." }`
2. ✅ Generated PPT file exists at download URL
3. ✅ PPT opens correctly in PowerPoint
4. ✅ Slides have proper design (colors, layouts, icons)
5. ✅ Content matches source file
6. ✅ File appears in `generated` bucket in Supabase

---

## 🚀 Next Steps After Testing

Once testing is successful:

1. ✅ Integrate with frontend upload component
2. ✅ Add loading states and progress indicators
3. ✅ Add error handling UI
4. ✅ Add rate limiting (Upstash recommended)
5. ✅ Deploy to production (Vercel)

---

**Ready to test?** Make sure your environment variables are set, then start the dev server and try the API! 🎉

