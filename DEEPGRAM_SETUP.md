# Deepgram Transcription Setup Guide

## ✅ What's Been Done

1. ✅ Created `DeepgramClient.ts` - Replaces WhisperClient
2. ✅ Updated `TranscriptionService.ts` - Now uses Deepgram
3. ✅ Updated `.env.local` - Added `DEEPGRAM_API_KEY` placeholder

## 🚀 Quick Setup Steps

### 1. Get Your Deepgram API Key (FREE - No Credit Card Required!)

1. **Sign up:** Go to https://console.deepgram.com/signup
2. **Create account:** No credit card required for free tier
3. **Get API key:**
   - Go to https://console.deepgram.com/projects
   - Click on your project (or create one)
   - Go to "API Keys" section
   - Click "Create API Key"
   - Copy the key (it will look like: `abc123def456...`)

### 2. Add to `.env.local`

Open `PrepSkul_Web/.env.local` and replace:
```bash
DEEPGRAM_API_KEY=your-deepgram-api-key-here
```

With your actual API key:
```bash
DEEPGRAM_API_KEY=abc123def456...
```

### 3. Restart Your Development Server

If your Next.js server is running, restart it to load the new environment variable.

## 💰 Free Tier Details

- **Free Credit:** $200 (no credit card required)
- **Coverage:** ~25,974 minutes = ~425 hours = **~418 sessions** (at 61 min each)
- **After Free Credits:** $0.0077/min (~$0.47 per 61-min session)

## 🧪 Testing

Once you've added your API key, test the transcription by:

1. Starting a session recording
2. Ending the session
3. Waiting for the webhook to trigger transcription
4. Check the `session_transcripts` table in Supabase

## 📋 What Changed

### Files Modified:
- `lib/services/transcription/deepgram.client.ts` - **NEW** Deepgram client
- `lib/services/transcription/transcription.service.ts` - Updated to use Deepgram
- `.env.local` - Added `DEEPGRAM_API_KEY`

### Files Kept (for reference):
- `lib/services/transcription/whisper.client.ts` - Kept but not used (can delete if you want)

## 🔍 API Differences

Deepgram has some advantages over OpenAI Whisper:
- ✅ Direct URL transcription (no download needed)
- ✅ Better utterance segmentation
- ✅ Speaker diarization support (if needed later)
- ✅ More generous free tier

## 🐛 Troubleshooting

### "DEEPGRAM_API_KEY environment variable is required"
- Make sure you've added the key to `.env.local`
- Restart your Next.js server
- Check that the key doesn't have extra spaces

### "Deepgram API error: Unauthorized"
- Verify your API key is correct
- Check that you copied the entire key
- Make sure you're using the correct format (no "Token " prefix needed in code)

### "Failed to transcribe from URL"
- Check that the audio URL is publicly accessible
- Verify the audio format is supported (MP3, WAV, etc.)
- Check Deepgram console for usage/quota limits

## 📚 Resources

- **Deepgram Docs:** https://developers.deepgram.com/docs
- **API Reference:** https://developers.deepgram.com/reference/speech-to-text-api/listen
- **Dashboard:** https://console.deepgram.com
- **Pricing:** https://deepgram.com/pricing

## ✅ Next Steps

1. Get your Deepgram API key
2. Add it to `.env.local`
3. Restart your server
4. Test with a real session recording!
