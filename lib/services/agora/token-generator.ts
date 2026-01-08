import { RtcTokenBuilder, RtcRole } from 'agora-token';

/**
 * Agora Token Generator Service
 * 
 * Generates RTC tokens for Agora video sessions using certificate-based authentication.
 * Tokens expire after 1 hour (3600 seconds) as per requirements.
 */

export interface AgoraTokenConfig {
  appId: string;
  appCertificate: string;
  channelName: string;
  uid: string | number;
  role?: RtcRole;
  expirationTimeInSeconds?: number;
}

/**
 * Generate Agora RTC token
 * 
 * @param config Token configuration
 * @returns RTC token string
 */
export function generateAgoraToken(config: AgoraTokenConfig): string {
  const {
    appId,
    appCertificate,
    channelName,
    uid,
    role = RtcRole.PUBLISHER, // Allow publishing (sending video/audio)
    expirationTimeInSeconds = 3600, // 1 hour default
  } = config;

  // Validate required fields
  if (!appId || !appCertificate || !channelName || uid === undefined) {
    throw new Error('Missing required Agora token configuration');
  }

  // Calculate expiration timestamp (current time + expiration seconds)
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  // Generate token
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    typeof uid === 'string' ? parseInt(uid, 10) : uid,
    role,
    privilegeExpiredTs
  );

  return token;
}

/**
 * Generate unique UID for a user in a session
 * 
 * Format: {sessionId}_{userId}_{role}
 * Converted to numeric hash for Agora compatibility
 * 
 * @param sessionId Session ID
 * @param userId User ID
 * @param role User role ('tutor' or 'learner')
 * @returns Numeric UID
 */
export function generateSessionUID(
  sessionId: string,
  userId: string,
  role: 'tutor' | 'learner'
): number {
  // Create a unique string identifier
  const uidString = `${sessionId}_${userId}_${role}`;
  
  // Convert to numeric hash (simple hash function)
  // Agora requires numeric UIDs, so we hash the string
  let hash = 0;
  for (let i = 0; i < uidString.length; i++) {
    const char = uidString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Ensure positive number and within Agora's UID range
  // Agora UIDs can be 0-2^32-1, but we'll use a smaller range for safety
  const numericUID = Math.abs(hash) % 2147483647; // Max 32-bit signed int
  
  return numericUID;
}

/**
 * Get Agora configuration from environment variables
 */
export function getAgoraConfig() {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const dataCenter = process.env.AGORA_DATA_CENTER || 'EU'; // Default to EU

  if (!appId || !appCertificate) {
    throw new Error(
      'Agora configuration missing. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables.'
    );
  }

  return {
    appId,
    appCertificate,
    dataCenter,
  };
}

