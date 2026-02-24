import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Agora Cloud Recording Service
 * 
 * Manages Agora Cloud Recording API calls for starting, stopping, and querying recordings.
 * Uses individual recording mode (720p, audio fallback).
 */

export interface RecordingConfig {
  appId: string;
  channelName: string;
  uid: string;
  customerId: string;
  customerSecret: string;
  recordingMode: 'individual' | 'mix';
  videoQuality: '720p' | '1080p';
  audioOnlyFallback: boolean;
}

export interface StartRecordingResponse {
  resourceId: string;
  sid: string;
  serverResponse: any;
}

export interface RecordingStatus {
  status: 'recording' | 'stopped' | 'uploaded' | 'failed';
  fileList?: Array<{
    fileName: string;
    trackType: 'audio' | 'video';
    uid: string;
    mixedAllUser: boolean;
    isPlayable: boolean;
    sliceStartTime: number;
  }>;
}

/**
 * Start Agora Cloud Recording
 * 
 * @param config Recording configuration
 * @returns Recording resource ID and SID
 */
export async function startRecording(
  config: RecordingConfig
): Promise<StartRecordingResponse> {
  const {
    appId,
    channelName,
    uid,
    customerId,
    customerSecret,
    recordingMode,
    videoQuality,
    audioOnlyFallback,
  } = config;

  // Agora Cloud Recording API endpoint
  const baseUrl = 'https://api.agora.io/v1/apps';
  const url = `${baseUrl}/${appId}/cloud_recording/acquire`;

  // Step 1: Acquire resource
  const acquireResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`,
    },
    body: JSON.stringify({
      cname: channelName,
      uid: uid,
      clientRequest: {},
    }),
  });

  if (!acquireResponse.ok) {
    const error = await acquireResponse.json();
    throw new Error(`Failed to acquire recording resource: ${error.message || acquireResponse.statusText}`);
  }

  const acquireData = await acquireResponse.json();
  const resourceId = acquireData.resourceId;

  // Step 2: Start recording
  const startUrl = `${baseUrl}/${appId}/cloud_recording/resourceid/${resourceId}/mode/${recordingMode}/start`;

  // Configure recording settings
  const recordingConfig: any = {
    cname: channelName,
    uid: uid,
    clientRequest: {
      token: '', // Token will be generated separately if needed
      recordingConfig: {
        maxIdleTime: 30, // Max idle time in seconds
        streamTypes: 2, // 0: audio only, 1: video only, 2: audio and video
        audioProfile: 1, // 0: sample rate 48k, 1: sample rate 48k with high quality
        channelType: 0, // 0: communication, 1: live broadcast
        videoStreamType: 0, // 0: low stream, 1: high stream
        subscribeVideoUids: [], // Empty = record all users
        subscribeAudioUids: [], // Empty = record all users
      },
      storageConfig: {
        vendor: 0, // 0: Agora Cloud Storage (temporary), will upload to Supabase later
        region: 0, // 0: US, 1: CN, 2: EU (use EU for EU data center)
        bucket: '', // Not needed for Agora Cloud Storage
        accessKey: '',
        secretKey: '',
        fileNamePrefix: [`session_${channelName}`],
      },
    },
  };

  // Set video quality
  if (videoQuality === '720p') {
    recordingConfig.clientRequest.recordingConfig.width = 1280;
    recordingConfig.clientRequest.recordingConfig.height = 720;
    recordingConfig.clientRequest.recordingConfig.fps = 30;
    recordingConfig.clientRequest.recordingConfig.bitrate = 2000;
  } else if (videoQuality === '1080p') {
    recordingConfig.clientRequest.recordingConfig.width = 1920;
    recordingConfig.clientRequest.recordingConfig.height = 1080;
    recordingConfig.clientRequest.recordingConfig.fps = 30;
    recordingConfig.clientRequest.recordingConfig.bitrate = 4000;
  }

  // Enable audio-only fallback
  if (audioOnlyFallback) {
    recordingConfig.clientRequest.recordingConfig.audioOnlyFallback = true;
  }

  const startResponse = await fetch(startUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`,
    },
    body: JSON.stringify(recordingConfig),
  });

  if (!startResponse.ok) {
    const error = await startResponse.json();
    throw new Error(`Failed to start recording: ${error.message || startResponse.statusText}`);
  }

  const startData = await startResponse.json();
  const sid = startData.sid;

  return {
    resourceId,
    sid,
    serverResponse: startData,
  };
}

/**
 * Stop Agora Cloud Recording
 * 
 * @param appId Agora App ID
 * @param resourceId Recording resource ID
 * @param sid Recording SID
 * @param channelName Channel name
 * @param uid User ID
 * @param customerId Agora Customer ID
 * @param customerSecret Agora Customer Secret
 * @param recordingMode Recording mode ('individual' or 'mix')
 */
export async function stopRecording(
  appId: string,
  resourceId: string,
  sid: string,
  channelName: string,
  uid: string,
  customerId: string,
  customerSecret: string,
  recordingMode: 'individual' | 'mix'
): Promise<void> {
  const baseUrl = 'https://api.agora.io/v1/apps';
  const url = `${baseUrl}/${appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/${recordingMode}/stop`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`,
    },
    body: JSON.stringify({
      cname: channelName,
      uid: uid,
      clientRequest: {},
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to stop recording: ${error.message || response.statusText}`);
  }
}

/**
 * Query recording status
 * 
 * @param appId Agora App ID
 * @param resourceId Recording resource ID
 * @param sid Recording SID
 * @param customerId Agora Customer ID
 * @param customerSecret Agora Customer Secret
 * @param recordingMode Recording mode
 * @returns Recording status and file list
 */
export async function queryRecordingStatus(
  appId: string,
  resourceId: string,
  sid: string,
  customerId: string,
  customerSecret: string,
  recordingMode: 'individual' | 'mix'
): Promise<RecordingStatus> {
  const baseUrl = 'https://api.agora.io/v1/apps';
  const url = `${baseUrl}/${appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/${recordingMode}/query`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to query recording status: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  
  // Determine status from server response
  let status: 'recording' | 'stopped' | 'uploaded' | 'failed' = 'recording';
  if (data.serverResponse?.status === 2) {
    status = 'stopped';
  } else if (data.serverResponse?.fileList && data.serverResponse.fileList.length > 0) {
    status = 'uploaded';
  }

  return {
    status,
    fileList: data.serverResponse?.fileList,
  };
}

/**
 * Get Agora recording configuration from environment
 */
export function getAgoraRecordingConfig() {
  const customerId = process.env.AGORA_CUSTOMER_ID;
  const customerSecret = process.env.AGORA_CUSTOMER_SECRET;

  if (!customerId || !customerSecret) {
    throw new Error(
      'Agora recording configuration missing. Please set AGORA_CUSTOMER_ID and AGORA_CUSTOMER_SECRET environment variables.'
    );
  }

  return {
    customerId,
    customerSecret,
  };
}

