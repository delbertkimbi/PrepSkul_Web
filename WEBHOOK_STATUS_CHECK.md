# Webhook Status Check Results

## ✅ Endpoint Accessibility: CONFIRMED

**Test Result:**
```json
{"message":"Agora recording webhook endpoint"}
```

**Status:** ✅ **ENDPOINT IS ACCESSIBLE AND WORKING**

This confirms:
- ✅ Backend route is deployed
- ✅ Endpoint is publicly accessible
- ✅ Route handler is responding correctly

## Next Steps: Verify Agora Console Configuration

Since the endpoint is working, the issue is likely in **Agora Console webhook configuration**.

### Step 1: Access Agora Console
1. Go to **https://console.agora.io**
2. Log in with your Agora account
3. Select your project (the one matching your `AGORA_APP_ID`)

### Step 2: Check Webhook Configuration
Navigate to: **Cloud Recording → Webhooks** (or **Recording → Webhooks**)

**Verify these settings:**

1. **Webhook URL:**
   ```
   https://www.prepskul.com/api/webhooks/agora/recording
   ```
   - Must match exactly (no trailing slash)
   - Must be HTTPS (not HTTP)

2. **Event Subscription:**
   - ✅ `recording_file_ready` must be **ENABLED**
   - This is the event that triggers when files are uploaded

3. **Webhook Status:**
   - Should show **"Active"** or **"Enabled"**
   - If it shows "Inactive" or "Disabled", enable it

4. **HTTP Method:**
   - Should be **POST**

### Step 3: Test Webhook (If Available)
If Agora Console has a "Test Webhook" or "Send Test" button:
1. Click it
2. Check your backend logs (Vercel/logging service)
3. You should see: `[Webhook] Received webhook: eventType=...`

### Step 4: Verify with Real Session Test

**Test Flow:**
1. **Start a session** in your app (as tutor)
   - This should call `POST /api/agora/recording/start`
   - Check `session_recordings` table → should have 1 row

2. **Join session** (as learner)
   - Both users should be in Agora channel

3. **End session** (as tutor)
   - This calls `POST /api/agora/recording/stop`
   - Agora starts processing and uploading files

4. **Wait 1-5 minutes** for Agora to:
   - Process the recording
   - Upload files to storage
   - Send webhook to your endpoint

5. **Check backend logs** for:
   ```
   [Webhook] Received webhook: eventType=recording_file_ready, notifyId=...
   [Webhook] Processing webhook for resourceId=..., sid=...
   [Webhook] Extracted X audio files for session ...
   ```

6. **Check database:**
   ```sql
   SELECT 
     session_id,
     recording_status,
     transcription_status,
     transcription_started_at
   FROM session_recordings
   WHERE session_id = '<your-test-session-id>';
   ```
   
   **Expected progression:**
   - After start: `recording_status = 'recording'`
   - After stop: `recording_status = 'stopped'`
   - After webhook: `transcription_status = 'processing'`, `transcription_started_at` set
   - After transcription: `transcription_status = 'completed'`

## Common Issues & Solutions

### Issue: Webhook Not Configured in Agora Console
**Symptom:** No webhook logs after ending sessions

**Solution:**
- Go to Agora Console → Cloud Recording → Webhooks
- Add webhook URL: `https://www.prepskul.com/api/webhooks/agora/recording`
- Enable `recording_file_ready` event
- Save configuration

### Issue: Wrong Event Subscribed
**Symptom:** Webhook received but ignored (logs show "Ignoring event type")

**Solution:**
- Ensure `recording_file_ready` is enabled (not just `recording_started` or `recording_stopped`)
- Check backend logs for: `[Webhook] Ignoring event type: ...`

### Issue: Webhook Configured But Not Receiving
**Symptom:** Webhook configured in Agora Console but no requests received

**Possible Causes:**
1. **Recording not actually starting:**
   - Check `session_recordings` table after starting session
   - Verify `recording_status = 'recording'`
   - Check backend logs for recording start errors

2. **Recording stopping before files ready:**
   - Agora needs time to process (1-5 minutes)
   - Very short sessions might not trigger webhook

3. **Agora storage not configured:**
   - Check Agora Console → Cloud Recording → Storage
   - Ensure storage is configured (Agora Cloud Storage or custom)

**Solution:**
- Verify recording actually starts (check database)
- Ensure session runs for at least 30 seconds
- Check Agora Console for recording status

### Issue: Webhook Received But Transcription Fails
**Symptom:** Webhook logs appear but `session_transcripts` empty

**Check:**
1. `DEEPGRAM_API_KEY` is set in backend environment
2. Deepgram API quota (check console.deepgram.com)
3. Backend logs for transcription errors:
   ```
   [TranscriptionService] Attempt X/3 failed: ...
   [DeepgramClient] Transcription failed: ...
   ```

## Verification Checklist

Use this to verify everything is working:

- [x] **Endpoint accessible** ✅ (You confirmed this)
- [ ] **Webhook URL configured in Agora Console**
- [ ] **Event `recording_file_ready` enabled**
- [ ] **Webhook status shows Active/Enabled**
- [ ] **Recording starts successfully** (check `session_recordings` table)
- [ ] **Webhook received after ending session** (check backend logs)
- [ ] **Transcription status changes** (check database)
- [ ] **Transcripts stored** (check `session_transcripts` table)

## Quick Test Commands

**Test endpoint (you already did this):**
```bash
curl https://www.prepskul.com/api/webhooks/agora/recording
```

**Test with detailed info:**
```bash
curl https://www.prepskul.com/api/webhooks/agora/recording?test=true
```

**Test webhook payload (will fail but shows endpoint works):**
```bash
curl -X POST https://www.prepskul.com/api/webhooks/agora/recording \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "recording_file_ready",
    "notifyId": "test-123",
    "payload": {
      "resourceId": "test-resource",
      "sid": "test-sid",
      "serverResponse": {
        "fileList": [
          {
            "fileName": "test.mp3",
            "trackType": "audio",
            "uid": "test-uid",
            "fileUrl": "https://example.com/test.mp3"
          }
        ]
      }
    },
    "timestamp": 1234567890
  }'
```

## Next Action Items

1. **✅ DONE:** Verify endpoint accessibility
2. **TODO:** Check Agora Console webhook configuration
3. **TODO:** Test with a real session
4. **TODO:** Monitor backend logs for webhook receipt
5. **TODO:** Verify transcription happens after webhook

## Summary

Your webhook endpoint is **working and accessible**. The next step is to:

1. **Verify Agora Console configuration** (most likely issue)
2. **Test with a real session** to see if webhooks are received
3. **Check backend logs** to confirm webhook processing

If webhooks still don't arrive after configuring in Agora Console, check:
- Recording is actually starting (database check)
- Agora storage is configured
- Session runs long enough for Agora to process
