# 🎙️ Complete Recording & Transcription Flow

## Overview

This document explains the **exact flow** of how sessions are recorded, transcribed, and stored in Supabase.

---

## 📋 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SESSION START (Flutter App)                  │
│  User joins Agora video session                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: START RECORDING                                        │
│  ────────────────────────────────────────────────────────────   │
│  • Flutter: AgoraRecordingService.startRecording(sessionId)     │
│  • Calls: POST /api/agora/recording/start                       │
│  • Backend: RecordingService.startRecording()                   │
│    - Acquires Agora recording resource                          │
│    - Starts Individual Mode recording (audio only)              │
│    - Subscribes to tutor + learner audio streams                │
│    - Stores resourceId & sid in session_recordings table        │
│    - Maps Agora UIDs to participants in session_participants   │
│                                                                  │
│  ✅ Recording Status: "recording"                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: RECORDING IN PROGRESS                                  │
│  ────────────────────────────────────────────────────────────   │
│  • Agora Cloud Recording captures audio from BOTH participants │
│  • Audio streams are recorded separately (Individual Mode)       │
│  • Recording happens on Agora's servers (not your servers)     │
│  • Session continues normally - recording is transparent        │
│                                                                  │
│  ⏺️  Recording Status: "recording"                             │
│  📊 Audio captured: Tutor + Learner (separate tracks)          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: SESSION ENDS                                           │
│  ────────────────────────────────────────────────────────────   │
│  • User clicks "End Session" button                             │
│  • Flutter: AgoraRecordingService.stopRecording(sessionId)      │
│  • Calls: POST /api/agora/recording/stop                        │
│  • Backend: RecordingService.stopRecording()                    │
│    - Stops Agora Cloud Recording                                │
│    - Updates recording_status to "stopped"                      │
│                                                                  │
│  ⏹️  Recording Status: "stopped"                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: AGORA PROCESSES RECORDING                             │
│  ────────────────────────────────────────────────────────────   │
│  • Agora processes the recorded audio files                      │
│  • Generates separate audio files for each participant:        │
│    - tutor_audio.mp3 (tutor's audio track)                      │
│    - learner_audio.mp3 (learner's audio track)                  │
│  • Uploads audio files to Agora Cloud Storage                  │
│  • This takes a few seconds to minutes depending on length     │
│                                                                  │
│  ⏳ Processing Status: "processing"                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: WEBHOOK RECEIVED                                       │
│  ────────────────────────────────────────────────────────────   │
│  • Agora sends webhook to:                                      │
│    POST /api/webhooks/agora/recording                           │
│  • Event Type: "recording_file_ready"                          │
│  • Payload contains:                                            │
│    - Audio file URLs (one per participant)                      │
│    - File metadata (duration, format, etc.)                    │
│    - Session identifiers (resourceId, sid)                      │
│                                                                  │
│  ✅ Webhook Status: "received"                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: WEBHOOK PROCESSING                                    │
│  ────────────────────────────────────────────────────────────   │
│  • WebhookService.processWebhook() extracts:                   │
│    - sessionId                                                 │
│    - Audio file URLs (tutor + learner)                        │
│    - Agora UIDs                                                │
│  • Maps Agora UIDs to participant records                      │
│  • Updates session_recordings:                                  │
│    - recording_status: "uploaded"                              │
│    - transcription_status: "processing"                        │
│  • Idempotency check (prevents duplicate processing)           │
│                                                                  │
│  ✅ Status: "uploaded" → "processing"                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 7: TRANSCRIPTION TRIGGERED (Async)                       │
│  ────────────────────────────────────────────────────────────   │
│  • For EACH audio file (tutor + learner):                      │
│    - TranscriptionService.transcribeAndStore()                │
│    - DeepgramClient.transcribeFromUrl(audioUrl)                │
│      • Calls Deepgram API with audio URL                       │
│      • Deepgram downloads & transcribes audio                  │
│      • Returns transcript with timestamps                       │
│    - Formats segments (start_time, end_time, text)              │
│    - Stores in session_transcripts table                       │
│                                                                  │
│  📝 Transcription Status: "processing"                         │
│  💾 Storing: Transcript segments with timestamps               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 8: CLEANUP (After Each Transcription)                    │
│  ────────────────────────────────────────────────────────────   │
│  • After successful transcription:                             │
│    - CleanupService.deleteAudioFile()                          │
│    - Logs cleanup attempt in media_cleanup_logs                │
│    - Marks audio file for deletion                              │
│  • Note: Agora handles actual file deletion                     │
│                                                                  │
│  🗑️  Cleanup Status: "pending" → "success"                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 9: FINAL STATUS UPDATE                                    │
│  ────────────────────────────────────────────────────────────   │
│  • After ALL transcriptions complete:                          │
│    - CleanupService.cleanupAfterTranscription()                │
│    - Checks if all participants transcribed                     │
│    - Updates session_recordings:                               │
│      - transcription_status: "completed"                       │
│      - transcription_completed_at: timestamp                    │
│                                                                  │
│  ✅ Final Status: "completed"                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Step-by-Step

### **Step 1: Recording Starts**
**When:** Immediately when an online session starts (user joins Agora channel)

**What Happens:**
1. Flutter app calls `AgoraRecordingService.startRecording(sessionId)`
2. Makes POST request to `/api/agora/recording/start`
3. Backend:
   - Acquires Agora recording resource
   - Starts Individual Mode recording (audio only, separate tracks)
   - Stores `resourceId` and `sid` in `session_recordings` table
   - Maps tutor/learner to Agora UIDs in `session_participants` table
   - Updates `individual_sessions.recording_status = 'recording'`

**Database Updates:**
- `session_recordings`: New record with `recording_status = 'recording'`
- `session_participants`: Tutor + Learner records with Agora UIDs
- `individual_sessions`: `recording_status = 'recording'`

---

### **Step 2: Recording in Progress**
**Duration:** Entire session duration (e.g., 61 minutes)

**What Happens:**
- Agora Cloud Recording captures audio from both participants
- Audio is recorded separately (Individual Mode)
- Recording happens on Agora's servers (not your infrastructure)
- Users don't notice anything - recording is transparent

**No Database Updates** - Recording is happening externally

---

### **Step 3: Recording Stops**
**When:** User clicks "End Session" button

**What Happens:**
1. Flutter app calls `AgoraRecordingService.stopRecording(sessionId)`
2. Makes POST request to `/api/agora/recording/stop`
3. Backend:
   - Stops Agora Cloud Recording
   - Updates `session_recordings.recording_status = 'stopped'`
   - Updates `individual_sessions.recording_status = 'stopped'`

**Database Updates:**
- `session_recordings`: `recording_status = 'stopped'`
- `individual_sessions`: `recording_status = 'stopped'`

---

### **Step 4: Agora Processing**
**Duration:** Usually 10-60 seconds (depends on session length)

**What Happens:**
- Agora processes the recorded audio
- Generates separate audio files:
  - `tutor_audio.mp3` (tutor's audio track)
  - `learner_audio.mp3` (learner's audio track)
- Uploads files to Agora Cloud Storage
- Prepares webhook notification

**No Database Updates** - Processing happens on Agora's side

---

### **Step 5: Webhook Received**
**When:** Agora sends webhook after files are ready

**What Happens:**
- Agora POSTs to `/api/webhooks/agora/recording`
- Payload includes:
  - Audio file URLs (one per participant)
  - File metadata
  - Session identifiers

**Database Updates:** None yet (webhook handler processes first)

---

### **Step 6: Webhook Processing**
**Duration:** < 1 second (synchronous)

**What Happens:**
1. Validates webhook payload
2. Checks idempotency (prevents duplicate processing)
3. Extracts audio file URLs and session info
4. Maps Agora UIDs to participant records
5. Updates `session_recordings`:
   - `recording_status = 'uploaded'`
   - `transcription_status = 'processing'`
   - `transcription_started_at = now()`

**Database Updates:**
- `session_recordings`: Status updates

---

### **Step 7: Transcription (Async)**
**Duration:** ~30 seconds to 5 minutes (depends on audio length)

**What Happens (for EACH audio file):**
1. `TranscriptionService.transcribeAndStore()` called
2. `DeepgramClient.transcribeFromUrl(audioUrl)`:
   - Calls Deepgram API with audio URL
   - Deepgram downloads audio from Agora
   - Transcribes audio with timestamps
   - Returns segments (start_time, end_time, text, confidence)
3. Formats segments for database
4. Stores in `session_transcripts` table (batched inserts)

**Database Updates:**
- `session_transcripts`: Multiple records (one per segment)
  - `session_id`
  - `participant_id` (links to session_participants)
  - `agora_uid`
  - `start_time`, `end_time`
  - `text`
  - `confidence`

---

### **Step 8: Cleanup (After Each Transcription)**
**Duration:** < 1 second

**What Happens:**
- After successful transcription:
  - `CleanupService.deleteAudioFile()` called
  - Logs cleanup attempt in `media_cleanup_logs`
  - Marks audio file for deletion
  - Agora handles actual file deletion

**Database Updates:**
- `media_cleanup_logs`: New record with cleanup status

---

### **Step 9: Final Status Update**
**When:** After ALL participants' audio is transcribed

**What Happens:**
- `CleanupService.cleanupAfterTranscription()` checks:
  - Are all participants transcribed?
  - If yes: Updates `session_recordings.transcription_status = 'completed'`

**Database Updates:**
- `session_recordings`: `transcription_status = 'completed'`, `transcription_completed_at = now()`

---

## 📊 Database Tables Involved

1. **`individual_sessions`**
   - `recording_status`: 'recording' → 'stopped'
   - `recording_resource_id`, `recording_sid`

2. **`session_recordings`**
   - `recording_status`: 'recording' → 'stopped' → 'uploaded'
   - `transcription_status`: 'pending' → 'processing' → 'completed'
   - `transcription_started_at`, `transcription_completed_at`

3. **`session_participants`**
   - Maps Agora UIDs to users
   - Stores `agora_uid`, `user_id`, `role`

4. **`session_transcripts`**
   - Stores transcript segments
   - Links to `session_participants` via `participant_id`
   - Contains `start_time`, `end_time`, `text`, `confidence`

5. **`media_cleanup_logs`**
   - Logs audio file cleanup attempts
   - Tracks deletion status

---

## ⚡ Key Points

1. **Recording starts automatically** when session starts (no manual trigger needed)
2. **Recording captures BOTH participants** simultaneously (Individual Mode = separate tracks)
3. **Transcription happens AFTER** recording stops and files are ready
4. **Transcription is async** - doesn't block the webhook response
5. **Each participant's audio** is transcribed separately
6. **Audio files are deleted** immediately after successful transcription
7. **Idempotency checks** prevent duplicate processing
8. **Retry logic** handles transcription failures (3 attempts with exponential backoff)

---

## 🔄 Timeline Example (61-minute session)

```
00:00 - Session starts → Recording starts
00:01 - Recording in progress...
61:00 - Session ends → Recording stops
61:10 - Agora processes files (10 seconds)
61:10 - Webhook received → Transcription starts
61:15 - Tutor audio transcribed (5 seconds)
61:20 - Learner audio transcribed (5 seconds)
61:20 - Cleanup triggered
61:21 - Status: "completed"
```

**Total time from session end to transcripts ready: ~1-2 minutes**

---

## 🐛 Troubleshooting

### Recording doesn't start
- Check `AgoraRecordingService.startRecording()` is called
- Verify API endpoint is accessible
- Check Agora credentials in `.env.local`

### Webhook not received
- Verify webhook URL in Agora Console
- Check server logs for webhook requests
- Ensure endpoint is publicly accessible

### Transcription fails
- Check `DEEPGRAM_API_KEY` is set
- Verify audio URL is accessible
- Check Deepgram API quota/limits
- Review error logs

### Transcripts missing
- Check `session_transcripts` table
- Verify `transcription_status` in `session_recordings`
- Check webhook processing logs

---

## ✅ Summary

**Recording:** Starts automatically when session starts, captures both participants' audio simultaneously, stops when session ends.

**Transcription:** Happens automatically after recording stops, processes each participant separately, stores timestamped segments in Supabase, deletes raw audio after transcription.

**Storage:** All transcripts stored in `session_transcripts` table with full timestamps and participant mapping.
