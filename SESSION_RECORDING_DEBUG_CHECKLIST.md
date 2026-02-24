# Session Recording Debug Checklist

## ✅ Deepgram Implementation Complete

All Whisper/OpenAI references have been removed and replaced with Deepgram:
- ✅ `whisper.client.ts` deleted
- ✅ `deepgram.client.ts` using Deepgram API
- ✅ `transcription.service.ts` updated to use Deepgram confidence
- ✅ Documentation updated

## 🔍 Why Records Aren't Being Stored - Debug Checklist

Follow these steps in order to identify where the pipeline is breaking:

### Step 1: Verify Database Tables Exist

**Check in Supabase Dashboard:**
1. Go to Table Editor
2. Verify these tables exist:
   - `session_recordings` (should have columns: `session_id`, `recording_resource_id`, `recording_sid`, `recording_status`, `transcription_status`, etc.)
   - `session_participants` (should have columns: `session_id`, `agora_uid`, `user_id`, `role`)
   - `session_transcripts` (should have columns: `session_id`, `participant_id`, `agora_uid`, `start_time`, `end_time`, `text`, `confidence`)
   - `media_cleanup_logs` (should have columns: `session_id`, `agora_uid`, `audio_url`, `status`)

**If tables don't exist:**
- Run migration: `supabase migration up` (in PrepSkul_App directory)
- Or manually apply `supabase/migrations/058_add_agora_transcription_tables.sql`

### Step 2: Verify Environment Variables

**In your Next.js backend (PrepSkul_Web):**

Check `.env.local` (or Vercel environment variables for production):

```env
# Required for Agora Cloud Recording
AGORA_CUSTOMER_ID=your_customer_id
AGORA_CUSTOMER_SECRET=your_customer_secret
AGORA_APP_ID=your_app_id

# Required for Deepgram Transcription
DEEPGRAM_API_KEY=your-deepgram-api-key

# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**To get Deepgram API Key:**
1. Go to https://console.deepgram.com/signup
2. Sign up (no credit card required for free tier)
3. Get your API key from the dashboard
4. Free tier: $200 credit = ~418 sessions (61 min each)

**To verify keys are loaded:**
- Check backend logs when starting a session
- Look for errors like "DEEPGRAM_API_KEY environment variable is required"

### Step 3: Test Recording Start Endpoint

**From Postman or curl:**

```bash
POST https://www.prepskul.com/api/agora/recording/start
Authorization: Bearer <your-supabase-access-token>
Content-Type: application/json

{
  "sessionId": "<an-existing-individual_sessions-id>"
}
```

**Expected Response (200):**
```json
{
  "resourceId": "...",
  "sid": "...",
  "channelName": "session_..."
}
```

**If you get 404:**
- Backend routes not deployed → Redeploy PrepSkul_Web

**If you get 500 with Agora error:**
- Check `AGORA_CUSTOMER_ID`, `AGORA_CUSTOMER_SECRET`, `AGORA_APP_ID`
- Verify credentials in Agora Console

**If you get 500 with Supabase error:**
- Check `SUPABASE_SERVICE_ROLE_KEY`
- Verify tables exist (Step 1)

### Step 4: Check Flutter App Logs

**When starting a session in the app:**

Look for these log messages:
```
🎙️ [Recording] POST https://www.prepskul.com/api/agora/recording/start (sessionId=...)
✅ Agora recording started: ...
```

**If you see errors:**
- Check network connectivity
- Verify `AppConfig.effectiveApiBaseUrl` points to correct backend
- Check if Supabase auth token is valid

### Step 5: Verify Recording Started in Database

**After starting a session, check Supabase:**

```sql
-- Check if recording was created
SELECT * FROM session_recordings 
WHERE session_id = '<your-session-id>';

-- Check if participants were created
SELECT * FROM session_participants 
WHERE session_id = '<your-session-id>';

-- Check individual_sessions was updated
SELECT recording_resource_id, recording_sid, recording_status 
FROM individual_sessions 
WHERE id = '<your-session-id>';
```

**Expected:**
- `session_recordings` should have 1 row with `recording_status = 'recording'`
- `session_participants` should have 2 rows (tutor + learner)
- `individual_sessions.recording_status` should be `'recording'`

**If no rows:**
- Recording start endpoint is failing silently
- Check backend logs for errors
- Verify `RecordingService.storeRecordingMetadata` is being called

### Step 6: Verify Agora Webhook Configuration

**In Agora Console:**
1. Go to Cloud Recording → Webhooks
2. Verify webhook URL: `https://www.prepskul.com/api/webhooks/agora/recording`
3. Verify event `recording_file_ready` is enabled
4. Test webhook (if Agora provides test button)

**After ending a session:**
- Agora should send webhook when files are ready (may take 1-5 minutes)
- Check backend logs for webhook requests

### Step 7: Check Webhook Processing

**In backend logs, look for:**
```
[Webhook] Processing webhook: notifyId=...
[Webhook] Transcription already exists for ... (or starting transcription)
[TranscriptionService] Attempt 1/3 for session ..., uid ...
```

**If webhook not received:**
- Check Agora Console webhook configuration (Step 6)
- Verify webhook endpoint is publicly accessible
- Check if Agora is actually uploading files (check Agora Console)

**If webhook received but transcription fails:**
- Check `DEEPGRAM_API_KEY` is set correctly
- Verify Deepgram API quota (free tier: $200 credit)
- Check Deepgram API logs for errors

### Step 8: Verify Transcription Storage

**After webhook processes, check Supabase:**

```sql
-- Check transcription status
SELECT transcription_status, transcription_started_at, transcription_completed_at
FROM session_recordings 
WHERE session_id = '<your-session-id>';

-- Check if transcripts were stored
SELECT COUNT(*) as segment_count, agora_uid
FROM session_transcripts 
WHERE session_id = '<your-session-id>'
GROUP BY agora_uid;

-- Check cleanup logs
SELECT * FROM media_cleanup_logs 
WHERE session_id = '<your-session-id>';
```

**Expected:**
- `transcription_status` should progress: `pending` → `processing` → `completed`
- `session_transcripts` should have multiple rows (segments) per participant
- `media_cleanup_logs` should have entries

**If no transcripts:**
- Check Deepgram API errors in backend logs
- Verify audio URLs are accessible (webhook provides correct URLs)
- Check `TranscriptionService.transcribeAndStore` errors

### Step 9: Common Issues & Fixes

#### Issue: Recording starts but no `session_recordings` row
**Fix:** Check `RecordingService.storeRecordingMetadata` - verify Supabase service role key has write permissions

#### Issue: Webhook received but no transcription
**Fix:** 
- Check `DEEPGRAM_API_KEY` is set
- Verify audio URLs from webhook are accessible
- Check Deepgram API quota

#### Issue: Transcription fails with "Participant not found"
**Fix:** 
- Verify `session_participants` rows exist (created when recording starts)
- Check `agora_uid` mapping matches between recording start and webhook

#### Issue: Audio file URL is placeholder/incorrect
**Fix:** 
- Agora webhook should provide `fileUrl` in `fileList`
- Update `webhook.service.ts` line 153 if Agora provides URLs differently
- Check Agora Console for actual file URLs

### Step 10: Manual Testing Flow

**Complete test flow:**

1. **Start session as tutor:**
   - App calls `POST /api/agora/recording/start`
   - Check `session_recordings` table → should have 1 row
   - Check `session_participants` table → should have 2 rows

2. **Join session as learner:**
   - Both users in Agora channel
   - Recording captures both audio streams

3. **End session:**
   - App calls `POST /api/agora/recording/stop`
   - Agora uploads files (1-5 minutes)
   - Agora sends webhook to `/api/webhooks/agora/recording`

4. **Webhook processes:**
   - Extracts audio file URLs
   - Calls Deepgram for each participant
   - Stores transcripts in `session_transcripts`
   - Marks transcription as completed

5. **Verify results:**
   - Check `session_transcripts` has rows
   - Check `transcription_status = 'completed'`
   - Check `media_cleanup_logs` has entries

## 🚨 Critical Checks

Before testing, ensure:
- ✅ Database migration applied (`058_add_agora_transcription_tables.sql`)
- ✅ All environment variables set in backend
- ✅ Agora webhook configured correctly
- ✅ Deepgram API key is valid and has credits
- ✅ Backend is deployed and accessible

## 📞 Next Steps After Debugging

Once records are being stored:
1. Verify transcripts appear in `session_transcripts` table
2. Test with multiple sessions
3. Implement OpenRouter summary logic (read from `session_transcripts`, generate summary, store in `individual_sessions.session_summary`)

## 🔗 Useful Links

- Deepgram Console: https://console.deepgram.com
- Agora Console: https://console.agora.io
- Supabase Dashboard: Your project dashboard
- Backend Logs: Check Vercel/logging service
