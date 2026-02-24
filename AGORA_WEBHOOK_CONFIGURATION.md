# Agora Webhook Configuration Guide

## Current Webhook Endpoint

**Your webhook endpoint URL:**
```
https://www.prepskul.com/api/webhooks/agora/recording
```

**Endpoint Details:**
- **Method:** `POST`
- **Path:** `/api/webhooks/agora/recording`
- **Handler:** `app/api/webhooks/agora/recording/route.ts`
- **GET Support:** Yes (for verification) - Returns `{ message: 'Agora recording webhook endpoint' }`

## How to Configure in Agora Console

### Step 1: Access Agora Console
1. Go to https://console.agora.io
2. Log in with your Agora account
3. Select your project (the one with `AGORA_APP_ID`)

### Step 2: Navigate to Cloud Recording Settings
1. In the left sidebar, click **"Cloud Recording"**
2. Click **"Webhooks"** or **"Recording Webhooks"**
3. You should see webhook configuration options

### Step 3: Configure Webhook URL
1. **Webhook URL:** Enter `https://www.prepskul.com/api/webhooks/agora/recording`
2. **Events to Subscribe:** Enable `recording_file_ready`
3. **HTTP Method:** `POST`
4. **Save** the configuration

### Step 4: Verify Webhook is Active
- Look for a status indicator (usually green/active)
- Some consoles show "Last webhook sent" timestamp
- Check if there's a "Test Webhook" button (if available)

## Expected Webhook Payload Structure

Your webhook handler expects this payload format:

```json
{
  "eventType": "recording_file_ready",
  "notifyId": "unique-notification-id",
  "payload": {
    "resourceId": "recording-resource-id",
    "sid": "recording-session-id",
    "serverResponse": {
      "fileList": [
        {
          "fileName": "audio_file.mp3",
          "trackType": "audio",
          "uid": "agora-user-id",
          "mixedAllUser": false,
          "isPlayable": true,
          "sliceStartTime": 0,
          "fileUrl": "https://agora-storage-url/audio_file.mp3"
        }
      ],
      "uploadingStatus": "uploaded"
    }
  },
  "timestamp": 1234567890
}
```

## Testing the Webhook

### Option 1: Test via Agora Console
If Agora Console provides a "Test Webhook" button:
1. Click it
2. Check your backend logs for the webhook request
3. Verify the response is `200 OK`

### Option 2: Manual Test with curl
```bash
curl -X POST https://www.prepskul.com/api/webhooks/agora/recording \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "recording_file_ready",
    "notifyId": "test-notify-id",
    "payload": {
      "resourceId": "test-resource-id",
      "sid": "test-sid",
      "serverResponse": {
        "fileList": [
          {
            "fileName": "test_audio.mp3",
            "trackType": "audio",
            "uid": "test-uid",
            "mixedAllUser": false,
            "isPlayable": true,
            "sliceStartTime": 0,
            "fileUrl": "https://example.com/test_audio.mp3"
          }
        ],
        "uploadingStatus": "uploaded"
      }
    },
    "timestamp": 1234567890
  }'
```

**Expected Response:**
```json
{
  "message": "Webhook processed successfully",
  "sessionId": "...",
  "audioFilesCount": 1
}
```

### Option 3: Check Backend Logs
After starting and ending a session:
1. Wait 1-5 minutes for Agora to process and upload files
2. Check your backend logs (Vercel/logging service)
3. Look for: `[Webhook] Received webhook: eventType=recording_file_ready`

## Common Webhook Configuration Issues

### Issue 1: Webhook Not Receiving Requests
**Symptoms:**
- No webhook logs after ending sessions
- `session_recordings.transcription_status` stays `pending`

**Possible Causes:**
1. Webhook URL not configured in Agora Console
2. Webhook URL incorrect (typo, wrong domain)
3. Webhook disabled in Agora Console
4. Wrong event subscribed (need `recording_file_ready`)

**Fix:**
- Verify webhook URL in Agora Console matches exactly: `https://www.prepskul.com/api/webhooks/agora/recording`
- Ensure `recording_file_ready` event is enabled
- Check webhook status is "Active" or "Enabled"

### Issue 2: Webhook Returns 404
**Symptoms:**
- Agora Console shows webhook failures
- Backend logs show 404 errors

**Possible Causes:**
1. Backend route not deployed
2. Incorrect URL path
3. Backend not accessible from internet

**Fix:**
- Verify route exists: `PrepSkul_Web/app/api/webhooks/agora/recording/route.ts`
- Test endpoint manually: `GET https://www.prepskul.com/api/webhooks/agora/recording`
- Should return: `{ message: 'Agora recording webhook endpoint' }`
- Redeploy backend if route doesn't exist

### Issue 3: Webhook Returns 400 (Invalid Payload)
**Symptoms:**
- Backend logs show: `[Webhook] Invalid webhook payload`
- Webhook handler rejects the request

**Possible Causes:**
1. Agora sending payload in different format
2. Missing required fields in payload

**Fix:**
- Check backend logs for full payload structure
- Update `webhook.service.ts` validation if Agora format differs
- Contact Agora support if payload structure changed

### Issue 4: Webhook Received But No Transcription
**Symptoms:**
- Webhook logs show successful receipt
- But `session_transcripts` table remains empty

**Possible Causes:**
1. `DEEPGRAM_API_KEY` not set
2. Audio file URLs not accessible
3. Deepgram API quota exceeded
4. Transcription service errors

**Fix:**
- Check backend logs for transcription errors
- Verify `DEEPGRAM_API_KEY` is set
- Check Deepgram API quota at console.deepgram.com
- Verify audio URLs from webhook are accessible

## Verification Checklist

Use this checklist to verify your webhook is configured correctly:

- [ ] Webhook URL configured in Agora Console: `https://www.prepskul.com/api/webhooks/agora/recording`
- [ ] Event `recording_file_ready` is enabled
- [ ] Webhook status shows "Active" or "Enabled"
- [ ] Backend endpoint accessible: `GET https://www.prepskul.com/api/webhooks/agora/recording` returns success
- [ ] Test webhook (if available) succeeds
- [ ] After ending a session, webhook logs appear within 1-5 minutes
- [ ] Webhook payload structure matches expected format
- [ ] `session_recordings.transcription_status` changes from `pending` to `processing` after webhook

## Monitoring Webhook Health

### Check Webhook Activity
1. **Agora Console:**
   - Look for "Last webhook sent" timestamp
   - Check webhook delivery status/history (if available)

2. **Backend Logs:**
   - Search for `[Webhook]` log entries
   - Should see: `[Webhook] Received webhook: eventType=recording_file_ready`
   - Should see: `[Webhook] Extracted X audio files for session ...`

3. **Database:**
   ```sql
   -- Check if webhooks are being processed
   SELECT 
     session_id,
     recording_status,
     transcription_status,
     transcription_started_at
   FROM session_recordings
   WHERE recording_status = 'stopped'
   ORDER BY updated_at DESC
   LIMIT 10;
   ```
   
   - If `transcription_status` is `pending` for stopped recordings, webhook not received
   - If `transcription_status` is `processing`, webhook received but transcription may be failing

## Next Steps After Configuration

1. **Test with Real Session:**
   - Start a test session as tutor
   - Join as learner
   - End session
   - Wait 1-5 minutes
   - Check backend logs for webhook

2. **Verify Records:**
   - Check `session_recordings` table
   - Check `session_transcripts` table
   - Verify transcription status progresses

3. **Monitor for Issues:**
   - Set up alerts for webhook failures (if possible)
   - Regularly check backend logs
   - Monitor Deepgram API usage

## Support Resources

- **Agora Documentation:** https://docs.agora.io/en/cloud-recording/restfulapi/
- **Agora Console:** https://console.agora.io
- **Backend Logs:** Check your hosting provider (Vercel, etc.)
- **Deepgram Console:** https://console.deepgram.com
