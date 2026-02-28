# Agora Cloud Recording – Full Flow & Webhook Guide

## What You Saw When Visiting the URL

When you open `https://www.prepskul.com/api/webhooks/agora/recording` in a browser, you perform a **GET** request. The endpoint returns:

```json
{
  "message": "Agora recording webhook endpoint",
  "endpoint": "/api/webhooks/agora/recording",
  "method": "POST",
  "status": "active"
}
```

That confirms the route exists and is reachable. **Agora does not use GET** – it sends **POST** requests when recording events occur. So the endpoint is fine; the next step is configuring Agora to send POST requests to it.

---

## End-to-End Flow

### 1. Session Start (Your Backend → Agora)

1. Tutor starts session in the app.
2. App calls `POST /api/agora/recording/start` with `sessionId`.
3. Backend:
   - Fetches Agora token, channel name, tutor/learner UIDs.
   - Calls Agora REST API: **acquire** → **start**.
   - Sends storage config (Supabase S3-compatible) so Agora knows where to upload files.
   - Inserts/updates `session_recordings` with `recording_resource_id`, `recording_sid`, `recording_status = 'recording'`.
   - Inserts `session_participants` with Agora UIDs.

### 2. During the Call (Agora Cloud)

1. Agora Cloud Recording joins the channel as a separate user.
2. Records audio from tutor and learner.
3. Writes files to your storage (Supabase) using the config from step 1.

### 3. Session End (Your Backend → Agora)

1. Session ends (timer or user leaves).
2. App calls `POST /api/agora/recording/stop` with `sessionId`.
3. Backend calls Agora REST API: **stop**.
4. Backend updates `session_recordings` and `individual_sessions` to `recording_status = 'stopped'`.

### 4. After Stop (Agora Cloud → Your Backend)

1. Agora finishes uploading files to your storage (can take 1–5 minutes).
2. Agora sends a **webhook POST** to your URL when files are ready.
3. Your webhook handler:
   - Finds the session by `resourceId` + `sid`.
   - Reads `fileList` from the payload.
   - Updates `session_recordings` with `audio_file_url`, `transcription_status`, etc.
   - Triggers transcription (Deepgram) for each audio file.

---

## Agora Console – What to Configure

### Step 1: Open Agora Console

1. Go to [https://console.agora.io](https://console.agora.io).
2. Log in and select the project that matches your `AGORA_APP_ID`.

### Step 2: Enable Notifications (Webhooks)

1. Go to **Projects** → select your project → **Edit**.
2. In **All Features**, open the **Notifications** tab.
3. Click the **Cloud Recording** (or equivalent) service.
4. Configure:
   - **Event:** Subscribe to **event 31 (uploaded)** and optionally **32 (backuped)**.  
     These are the events that fire when all recorded files are uploaded to your storage.
   - **Receiving Server URL:**  
     `https://www.prepskul.com/api/webhooks/agora/recording`
   - **Receiving Server Region:** Choose the region closest to your backend.
5. Click **Check** – Agora will send a test POST to your URL.
6. If the test succeeds (your server returns 200 within 10 seconds), click **Apply Settings**.
7. Copy the **Secret** shown – you may need it for signature verification.

### Step 3: Verify Storage Configuration

Your backend must provide valid storage when starting recording. In PrepSkul_Web `.env`:

```env
AGORA_RECORDING_STORAGE_BUCKET=your-supabase-bucket-name
AGORA_RECORDING_STORAGE_ACCESS_KEY=your-s3-access-key
AGORA_RECORDING_STORAGE_SECRET_KEY=your-s3-secret-key
AGORA_RECORDING_STORAGE_VENDOR=11
AGORA_RECORDING_STORAGE_ENDPOINT=https://your-project.supabase.co/storage/v1/s3
```

If these are wrong, Agora cannot upload files and the webhook will never fire.

---

## Agora Webhook Payload Format

Agora uses **numeric** `eventType` values, not strings like `"recording_file_ready"`:

| eventType | Meaning |
|-----------|---------|
| **31** | All files uploaded to your third-party storage |
| **32** | All files uploaded (some via Agora Cloud Backup) |

Top-level structure:

```json
{
  "noticeId": "unique-id",
  "productId": 3,
  "eventType": 31,
  "notifyMs": 1234567890,
  "payload": {
    "cname": "channel_name",
    "uid": "999999999",
    "sid": "recording-session-id",
    "sequence": 0,
    "sendts": 1234567890,
    "serviceType": 2,
    "details": {
      "msgName": "uploaded",
      "fileList": [
        {
          "fileName": "session_xxx_123/audio_uid.m3u8",
          "trackType": "audio",
          "uid": "57297",
          "mixedAllUser": false,
          "isPlayable": true,
          "sliceStartTime": 1619172871089
        }
      ],
      "status": 0
    }
  }
}
```

`resourceId` comes from the Agora REST API; it may be in the payload or you may need to look up the session by `sid` only.

---

## Checklist – Why Records Stay NULL

| Check | What to verify |
|-------|----------------|
| **1. Webhook configured in Agora** | Notifications → Cloud Recording → URL = `https://www.prepskul.com/api/webhooks/agora/recording` |
| **2. Correct events subscribed** | Event **31 (uploaded)** and optionally **32 (backuped)** enabled |
| **3. Health check passed** | Agora Console “Check” returned success (200 within 10 seconds) |
| **4. Storage config valid** | `AGORA_RECORDING_STORAGE_*` env vars correct; Agora can write to your bucket |
| **5. session_recordings row exists** | After start, there is a row with `recording_resource_id` and `recording_sid` |
| **6. session_participants populated** | Rows exist with `agora_uid` for tutor and learner |
| **7. Backend logs** | After ending a session, wait 2–5 minutes and search logs for `[Webhook]` |

---

## How to Test

### 1. Run a Real Session

1. Start a session as tutor.
2. Join as learner.
3. Talk for at least 30 seconds.
4. End the session (timer or leave).

### 2. Wait and Inspect

- Wait **2–5 minutes** for Agora to upload and send the webhook.
- Check backend logs (Vercel, etc.) for:
  - `[Webhook] Received webhook: eventType=...`
  - `[Webhook] Extracted X audio files for session ...`
- Check Supabase `session_recordings`:
  - `audio_file_url` should be set.
  - `transcription_status` should move from `pending` → `processing` → `completed`.

### 3. Manual Webhook Test (Optional)

```bash
curl -X POST https://www.prepskul.com/api/webhooks/agora/recording \
  -H "Content-Type: application/json" \
  -d '{
    "noticeId": "test-123",
    "productId": 3,
    "eventType": 31,
    "payload": {
      "sid": "YOUR_ACTUAL_SID_FROM_SESSION_RECORDINGS",
      "details": {
        "msgName": "uploaded",
        "fileList": [],
        "status": 0
      }
    }
  }'
```

Replace `YOUR_ACTUAL_SID_FROM_SESSION_RECORDINGS` with a real `recording_sid` from `session_recordings` for a recent session.

---

## References

- [Agora Cloud Recording – Receive Notifications](https://docs.agora.io/en/cloud-recording/develop/receive-notifications)
- [Agora Cloud Recording – REST API Overview](https://docs.agora.io/en/cloud-recording/reference/rest-api-overview)
- [Agora Console](https://console.agora.io)
