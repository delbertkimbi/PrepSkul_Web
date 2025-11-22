# TichaAI Backend Setup Guide

## 🔐 Environment Variables

Add these to your `.env.local` file:

```env
# OpenRouter API (Required)
OPENROUTER_API_KEY=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

# TichaAI Supabase (Required)
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://olrjjctddhlvnwclcich.supabase.co
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your_anon_key_here
TICHA_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmpqY3RkZGhsdm53Y2xjaWNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU4NjA4NywiZXhwIjoyMDc5MTYyMDg3fQ.UWMHebsrBEg2UBf5UkfeBFR_QfeYjPKiqdGrOcMmujk

# Optional: Site URL for OpenRouter headers
NEXT_PUBLIC_SITE_URL=https://ticha.prepskul.com
```

## 📦 Installation

After npm issue is resolved, install dependencies:

```bash
npm install pptxgenjs pdf-parse docx mammoth tesseract.js sharp --legacy-peer-deps
```

Or manually add to `package.json` and run:
```bash
npm install --legacy-peer-deps
```

## 🗄️ Supabase Storage Setup

### 1. Create Storage Buckets

Go to Supabase Dashboard → Storage → Create Bucket:

**Bucket 1: `uploads`**
- Public: ✅ Yes
- File size limit: 50MB
- Allowed MIME types: `application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/*, text/plain`

**Bucket 2: `generated`**
- Public: ✅ Yes
- File size limit: 50MB
- Allowed MIME types: `application/vnd.openxmlformats-officedocument.presentationml.presentation`

### 2. Storage Policies

Enable public access for both buckets:

```sql
-- Allow public read access to uploads
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND
  auth.role() = 'authenticated'
);

-- Allow public read access to generated
CREATE POLICY "Public Read Generated" ON storage.objects
FOR SELECT USING (bucket_id = 'generated');
```

## 🚀 API Usage

### Endpoint: `POST /api/ticha/generate`

**Request Body:**
```json
{
  "fileUrl": "https://...supabase.co/storage/v1/object/public/uploads/path/to/file.pdf",
  "prompt": "Optional user prompt for customization",
  "userId": "optional-user-id"
}
```

**Success Response:**
```json
{
  "success": true,
  "downloadUrl": "https://...supabase.co/storage/v1/object/public/generated/user-id/presentation-1234567890.pptx",
  "slides": 8,
  "processingTime": "12.45s"
}
```

**Error Response:**
```json
{
  "error": "Error message here",
  "message": "Detailed error message"
}
```

## 🎨 Design Features

### Supported Layouts
- **title-only**: Impactful opening/closing slides
- **title-and-bullets**: Standard content slides
- **two-column**: Comparisons and side-by-side content
- **image-left**: Visual-heavy with supporting text
- **image-right**: Content-first with supporting visuals

### Color Themes
- **light-blue**: Friendly, professional, modern
- **dark-blue**: Authoritative, trustworthy, serious
- **white**: Clean, minimalist, high contrast
- **gray**: Neutral, balanced, corporate
- **green**: Growth, success, positive outcomes

### Icons
- **none**: Clean, text-focused
- **book**: Educational content
- **idea**: Innovation, concepts
- **warning**: Important notices
- **check**: Accomplishments, success

## 🔄 Processing Pipeline

1. **File Download** → Download from Supabase Storage
2. **Text Extraction** → PDF/DOCX/Image/Text extraction
3. **Text Cleaning** → AI-powered cleaning and normalization
4. **Outline Generation** → AI creates slide structure with design specs
5. **PPT Creation** → Generate PowerPoint with templates and themes
6. **Storage Upload** → Upload to `generated` bucket
7. **Database Record** → Save presentation metadata (optional)

## 📝 File Type Support

- ✅ PDF (.pdf) - via pdf-parse
- ✅ Word (.docx) - via mammoth
- ✅ Images (.jpg, .png, .gif) - via OpenRouter Vision or Tesseract.js
- ✅ Text (.txt) - direct text extraction

## ⚠️ Limitations

- Max file size: 50MB
- Max processing time: 60 seconds
- Supported languages: English (OCR models)
- Image extraction requires public URL (temporary upload)

## 🐛 Troubleshooting

### "Missing TichaAI Supabase credentials"
- Ensure `NEXT_PUBLIC_TICHA_SUPABASE_URL` and `TICHA_SUPABASE_SERVICE_KEY` are set

### "Failed to extract text"
- Check file format is supported
- For images, ensure OCR has access to public URLs

### "Failed to generate outline"
- Check OpenRouter API key is valid
- Ensure API credits are available
- Check response format matches expected JSON structure

### "Failed to create presentation"
- Verify pptxgenjs is installed
- Check that outline structure is valid

## 🔒 Security Notes

- **Service Role Key**: NEVER expose to client-side code
- **File Upload**: Validate file types and sizes on client and server
- **API Keys**: Store in environment variables only
- **Rate Limiting**: Consider adding Upstash rate limiting for production

## 📚 File Structure

```
lib/ticha/
├── supabase-service.ts    # Storage operations (service role)
├── openrouter.ts          # AI model calls
├── extract/
│   ├── index.ts          # File extraction hub
│   ├── extractPdf.ts     # PDF extraction
│   ├── extractDocx.ts    # DOCX extraction
│   ├── extractImage.ts   # Image OCR
│   └── extractText.ts    # Plain text
└── ppt/
    └── createPPT.ts      # PowerPoint generation

app/api/ticha/
└── generate/
    └── route.ts          # Main API endpoint
```

## 🎯 Next Steps

1. ✅ Add environment variables to `.env.local`
2. ✅ Install dependencies (when npm issue resolved)
3. ✅ Set up Supabase Storage buckets
4. ✅ Test API endpoint with sample file
5. ✅ Integrate with frontend upload component
6. ⚠️ Add rate limiting (Upstash recommended)
7. ⚠️ Add error monitoring (Sentry recommended)
8. ⚠️ Optimize for large files (chunking)

