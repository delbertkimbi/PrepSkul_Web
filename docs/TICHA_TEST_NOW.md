# 🚀 Test TichaAI Now - Quick Guide

## ✅ Pre-Flight Checklist

Before testing, verify these are set up:

### 1. Environment Variables
Check your `.env.local` file has:
```env
OPENROUTER_API_KEY=your_key_here
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your_anon_key
TICHA_SUPABASE_SERVICE_KEY=your_service_key
```

### 2. Supabase Storage Buckets (CRITICAL!)
You MUST create these 2 buckets in your TichaAI Supabase project:

**Bucket 1: `uploads`**
- Go to Supabase Dashboard → Storage → Buckets
- Click "New bucket"
- Name: `uploads`
- Make it **Public** ✅
- File size limit: 50MB

**Bucket 2: `generated`**
- Click "New bucket" again
- Name: `generated`
- Make it **Public** ✅
- File size limit: 50MB

**⚠️ Without these buckets, uploads will fail!**

### 3. OpenRouter Credits
- ✅ You mentioned you credited $9 - that's enough!
- Check balance: https://openrouter.ai/activity

### 4. Dependencies Installed
```bash
pnpm install
```

---

## 🧪 Step-by-Step Testing

### Step 1: Start the Development Server

```bash
pnpm dev
```

Wait for: `✓ Ready in X.Xs` and `○ Local: http://localhost:3000`

### Step 2: Open TichaAI Page

Navigate to: **http://localhost:3000/ticha**

You should see the TichaAI interface with:
- File upload area
- Input field for prompts (optional)
- Upload button

### Step 3: Prepare a Test File

**Easiest test - Create a TXT file:**

Create a file called `test.txt` with this content:
```
Introduction to Artificial Intelligence

What is AI?
- AI is the simulation of human intelligence
- Machine learning enables computers to learn
- Deep learning uses neural networks

Applications
- Natural language processing
- Computer vision
- Autonomous vehicles

Conclusion
- AI is transforming industries
- Future holds exciting possibilities
```

### Step 4: Upload and Test

1. **Click the upload area** or drag your `test.txt` file
2. **Wait for upload** (should show "Uploading...")
3. **Wait for processing** (30-60 seconds):
   - Status will show "Processing..."
   - This includes: Extract → Clean → Generate Outline → Create PPT
4. **Download the PowerPoint**:
   - When complete, you'll see "Download Presentation" button
   - Click it to download the `.pptx` file

### Step 5: Verify the PowerPoint

1. Open the downloaded `.pptx` file in:
   - Microsoft PowerPoint
   - Google Slides
   - LibreOffice Impress
2. Check that it has:
   - Multiple slides
   - Professional design
   - Your content organized into slides

---

## 🐛 Troubleshooting

### Error: "Failed to upload file"
**Cause**: Missing `uploads` bucket
**Fix**: Create `uploads` bucket in Supabase Storage (make it public)

### Error: "Failed to upload presentation"
**Cause**: Missing `generated` bucket
**Fix**: Create `generated` bucket in Supabase Storage (make it public)

### Error: "402 - Insufficient credits"
**Cause**: OpenRouter credits exhausted
**Fix**: Check balance at https://openrouter.ai/activity

### Error: "Missing TichaAI Supabase credentials"
**Cause**: Environment variables not set
**Fix**: Check `.env.local` has all required variables

### Error: "Failed to extract text"
**Cause**: Invalid or corrupted file
**Fix**: Try a different file (start with TXT for easiest test)

### Server won't start
**Fix**: 
```bash
# Stop server (Ctrl+C)
# Clear cache and restart
pnpm dev --turbo
```

---

## 📊 What to Expect

### Successful Flow:
1. ✅ File uploads (2-5 seconds)
2. ✅ Status shows "Processing..." (30-60 seconds)
3. ✅ Status shows "Success!"
4. ✅ Download button appears
5. ✅ Click download → File downloads
6. ✅ Open `.pptx` → See your presentation!

### Processing Steps (you'll see in console/logs):
```
[Upload] File uploaded: https://...
[Generate] Step 1: Downloading file...
[Generate] Step 2: Extracting text...
[Generate] Step 3: Cleaning text...
[Generate] Step 4: Generating outline...
[Generate] Step 5: Creating PowerPoint...
[Generate] Step 6: Uploading to Storage...
[Generate] Success! Processing time: Xs
```

---

## 🎯 Quick Test Scenarios

### Test 1: Simple TXT File (Recommended First)
- **File**: Plain text file
- **Expected**: 5-10 slides
- **Time**: ~30-45 seconds
- **Cost**: ~$0.0006

### Test 2: PDF File
- **File**: Any PDF document
- **Expected**: Extracted text → slides
- **Time**: ~45-60 seconds
- **Cost**: ~$0.001

### Test 3: DOCX File
- **File**: Word document
- **Expected**: Extracted text → slides
- **Time**: ~45-60 seconds
- **Cost**: ~$0.001

### Test 4: Image with Text
- **File**: JPG/PNG with text
- **Expected**: OCR → extracted text → slides
- **Time**: ~60-90 seconds
- **Cost**: ~$0.0015
- **Note**: Requires OpenRouter credits

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ File uploads without errors
- ✅ Processing completes (not stuck)
- ✅ Download button appears
- ✅ PowerPoint file downloads
- ✅ PowerPoint opens and shows your content
- ✅ Slides have professional design

---

## 🎉 Ready to Test!

**If you have:**
- ✅ Environment variables set
- ✅ Supabase buckets created (`uploads` and `generated`)
- ✅ OpenRouter credits ($9 is enough!)
- ✅ Dependencies installed

**Then you're ready!** Just:
1. Run `pnpm dev`
2. Go to `http://localhost:3000/ticha`
3. Upload a file
4. Wait for processing
5. Download and enjoy! 🚀

---

## 📝 Notes

- **First test**: Use a simple TXT file (easiest, fastest)
- **Processing time**: 30-60 seconds is normal
- **Cost per test**: ~$0.0006-$0.002 (very cheap!)
- **With $9**: You can test 4,500-15,000 times!

**Good luck!** 🎯

