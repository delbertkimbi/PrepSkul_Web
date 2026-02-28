/**
 * Agora Webhook Service
 * 
 * Handles parsing and processing Agora recording webhooks
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RECORDING_BUCKET = (process.env.AGORA_RECORDING_STORAGE_BUCKET ?? '').trim();

interface AudioFile {
  fileName: string;
  trackType: 'audio' | 'video';
  uid: string;
  mixedAllUser: boolean;
  isPlayable: boolean;
  sliceStartTime: number;
  fileUrl?: string;
}

/** Legacy format (some setups): eventType string, payload.serverResponse.fileList */
interface LegacyWebhookPayload {
  eventType: 'recording_file_ready';
  notifyId: string;
  payload: {
    resourceId: string;
    sid: string;
    serverResponse?: { fileList?: AudioFile[]; uploadingStatus?: string };
  };
}

/** Agora NCS format (actual): eventType 31|32, payload.details.fileList, payload.sid */
interface AgoraNcsWebhookPayload {
  noticeId: string;
  productId: number;
  eventType: 31 | 32; // 31=uploaded, 32=backuped
  notifyMs?: number;
  payload: {
    cname?: string;
    uid?: string;
    sid: string;
    sequence?: number;
    sendts?: number;
    serviceType?: number;
    details?: {
      msgName?: string;
      fileList?: AudioFile[];
      status?: number;
    };
  };
}

type WebhookPayload = LegacyWebhookPayload | AgoraNcsWebhookPayload;

export class WebhookService {
  private async getSignedRecordingUrl(objectPath: string): Promise<string> {
    if (!RECORDING_BUCKET) {
      throw new Error('AGORA_RECORDING_STORAGE_BUCKET is not set; cannot sign recording URLs');
    }

    // Agora sends S3 object keys in `fileName` (can include prefixes/folders).
    // Supabase Storage uses the same key-path inside the bucket.
    const normalizedPath = objectPath.replace(/^\/+/, '');
    const { data, error } = await supabase.storage
      .from(RECORDING_BUCKET)
      .createSignedUrl(normalizedPath, 60 * 60); // 1 hour

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to create signed URL for ${normalizedPath}: ${error?.message ?? 'unknown error'}`);
    }
    return data.signedUrl;
  }

  /**
   * Validate webhook payload structure.
   * Supports: (1) Legacy: eventType "recording_file_ready", notifyId, payload.resourceId/sid/serverResponse
   *          (2) Agora NCS: eventType 31|32, noticeId, payload.sid, payload.details.fileList
   */
  validateWebhookPayload(payload: any): payload is WebhookPayload {
    if (!payload || !payload.payload || typeof payload.payload.sid !== 'string') return false;
    // Legacy format
    if (payload.eventType === 'recording_file_ready' && payload.notifyId && payload.payload.resourceId) return true;
    // Agora NCS format (eventType 31 = uploaded, 32 = backuped)
    const notifyId = payload.notifyId ?? payload.noticeId;
    if ((payload.eventType === 31 || payload.eventType === 32) && notifyId) return true;
    return false;
  }

  /**
   * Extract audio files from webhook payload.
   * Handles both payload.serverResponse.fileList (legacy) and payload.details.fileList (Agora NCS).
   */
  extractAudioFiles(payload: WebhookPayload): AudioFile[] {
    const fileList =
      (payload as LegacyWebhookPayload).payload?.serverResponse?.fileList ||
      (payload as AgoraNcsWebhookPayload).payload?.details?.fileList ||
      [];
    
    // Log webhook payload for debugging
    const audioFiles = fileList.filter(file => file.trackType === 'audio');
    const firstFileName = fileList[0]?.fileName ?? '(none)';
    console.log('[WebhookService] Extracting: fileList total=', fileList.length, 'audio count=', audioFiles.length, 'first fileName=', firstFileName);
    
    return audioFiles;
  }

  /**
   * Map Agora UID to session participant
   */
  async mapAgoraUidToParticipant(
    sessionId: string,
    agoraUid: string
  ): Promise<{ participantId: string; userId: string; role: string } | null> {
    const { data: participant, error } = await supabase
      .from('session_participants')
      .select('id, user_id, role')
      .eq('session_id', sessionId)
      .eq('agora_uid', agoraUid)
      .single();

    if (error || !participant) {
      console.error(`[WebhookService] Participant not found for session ${sessionId}, uid ${agoraUid}`);
      return null;
    }

    return {
      participantId: participant.id,
      userId: participant.user_id,
      role: participant.role,
    };
  }

  /**
   * Check if webhook has already been processed (idempotency).
   * Lookup by sid (required); resourceId optional (Agora NCS may not include it).
   */
  async isWebhookProcessed(_notifyId: string, resourceId: string | null, sid: string): Promise<boolean> {
    let query = supabase.from('session_recordings').select('transcription_status').eq('recording_sid', sid);
    if (resourceId) query = query.eq('recording_resource_id', resourceId);
    const { data: recording } = await query.maybeSingle();
    return !!(recording && (recording.transcription_status === 'processing' || recording.transcription_status === 'completed'));
  }

  /**
   * Process webhook and extract audio file URLs
   */
  async processWebhook(payload: WebhookPayload): Promise<{
    sessionId: string;
    audioFiles: Array<{
      agoraUid: string;
      fileUrl: string;
      fileName: string;
      participantId?: string;
    }>;
  }> {
    const { sid } = payload.payload;
    const resourceId = (payload as LegacyWebhookPayload).payload?.resourceId;

    // Find session by sid (required); resourceId used if available
    let query = supabase.from('session_recordings').select('session_id').eq('recording_sid', sid);
    if (resourceId) query = query.eq('recording_resource_id', resourceId);
    const { data: recording, error: recordingError } = await query.single();

    if (recordingError || !recording) {
      console.error('[WebhookService] Recording not found for sid=', sid, 'resourceId=', resourceId ?? 'null', 'error=', recordingError?.message ?? recordingError);
      throw new Error(`Recording not found for sid: ${sid}${resourceId ? `, resourceId: ${resourceId}` : ''}`);
    }

    const sessionId = recording.session_id;

    // Extract audio files
    const audioFiles = this.extractAudioFiles(payload);

    // Map UIDs to participants and get file URLs
    const mappedFiles = await Promise.all(
      audioFiles.map(async (file) => {
        const participant = await this.mapAgoraUidToParticipant(sessionId, file.uid);
        
        // For private buckets, we must use a signed URL for transcription downloads.
        // Agora may (or may not) provide `fileUrl`. Prefer signing by `fileName` which is the S3 object key.
        let fileUrl = file.fileUrl;
        try {
          fileUrl = await this.getSignedRecordingUrl(file.fileName);
        } catch (e) {
          console.warn(
            `[WebhookService] Failed to sign URL for ${file.fileName} (uid=${file.uid}). ` +
              `Falling back to fileUrl from payload (if any). Error: ${String(e)}`
          );
        }

        if (!fileUrl) {
          throw new Error(`No usable URL for recording object: ${file.fileName} (uid=${file.uid})`);
        }

        console.log(`[WebhookService] Processing audio file: ${file.fileName}, URL: ${fileUrl}, UID: ${file.uid}`);

        return {
          agoraUid: file.uid,
          fileUrl,
          fileName: file.fileName,
          participantId: participant?.participantId,
        };
      })
    );

    return {
      sessionId,
      audioFiles: mappedFiles,
    };
  }

  /**
   * Update recording status after webhook received
   */
  async updateRecordingStatus(
    sessionId: string,
    status: 'uploaded' | 'failed'
  ): Promise<void> {
    await supabase
      .from('session_recordings')
      .update({
        recording_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId);
  }
}
