# Quick Webhook Verification Guide

## 1. Test Webhook Endpoint is Accessible

**Open in browser or use curl:**
```
https://www.prepskul.com/api/webhooks/agora/recording?test=true
```

**Expected Response:**
```json
{
  "message": "Agora recording webhook endpoint",
  "endpoint": "/api/webhooks/agora/recording",
  "method": "POST",
  "status": "active",
  "expectedEvent": "recording_file_ready",
  "timestamp": "2026-02-18T..."
}
```

**If you get 404:**
- Backend route not deployed → Redeploy PrepSkul_Web
- Check route exists: `app/api/webhooks/agora/recording/route.ts`

**If you get 500:**
- Check backend logs for errors
- Verify environment variables are set

## 2. Check Agora Console Configuration

**Required Settings:**
- ✅ Webhook URL: `https://www.prepskul.com/api/webhooks/agora/recording`
- ✅ Event: `recording_file_ready` enabled
- ✅ Status: Active/Enabled
- ✅ Method: POST

## 3. Test with a Real Session

1. **Start a session** (as tutor)
2. **Join as learner**
3. **End session**
4. **Wait 1-5 minutes** for Agora to process
5. **Check backend logs** for:
   ```
   [Webhook] Received webhook: eventType=recording_file_ready
   [Webhook] Extracted X audio files for session ...
   ```

## 4. Verify Database Updates

**After webhook processes, check:**
```sql
-- Should see transcription_status change
SELECT 
  session_id,
  recording_status,
  transcription_status,
  transcription_started_at
FROM session_recordings
WHERE session_id = '<your-test-session-id>';
```

**Expected:**
- `recording_status` = `'stopped'` (after session ends)
- `transcription_status` = `'processing'` (after webhook received)
- `transcription_status` = `'completed'` (after transcription done)
- `transcription_started_at` = timestamp (after webhook)

## 5. Common Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Webhook not configured | No logs after ending session | Configure in Agora Console |
| Wrong URL | 404 errors in Agora Console | Verify URL matches exactly |
| Wrong event | Webhook received but ignored | Enable `recording_file_ready` |
| Backend not deployed | 404 when testing endpoint | Redeploy PrepSkul_Web |
| Deepgram key missing | Transcription fails | Set `DEEPGRAM_API_KEY` |

## Quick Test Command

```bash
# Test endpoint accessibility
curl https://www.prepskul.com/api/webhooks/agora/recording?test=true

# Test webhook with sample payload (will fail but shows if endpoint works)
curl -X POST https://www.prepskul.com/api/webhooks/agora/recording \
  -H "Content-Type: application/json" \
  -d '{"eventType":"recording_file_ready","notifyId":"test","payload":{"resourceId":"test","sid":"test"}}'
```
