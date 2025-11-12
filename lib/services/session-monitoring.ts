import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Session Monitoring Service
 * 
 * Analyzes session transcripts for irregular behavior
 * Creates admin flags for review
 * 
 * This service runs automatically when Fathom webhook receives meeting content
 */

export interface AdminFlag {
  session_id: string;
  session_type: 'trial' | 'recurring';
  flag_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  transcript_excerpt?: string;
  resolved?: boolean;
  created_at?: string;
}

/**
 * Analyze session for admin flags
 * 
 * Scans transcript and summary for irregular behavior patterns
 */
export async function analyzeSessionForFlags(
  supabase: SupabaseClient,
  params: {
    sessionId: string;
    sessionType: 'trial' | 'recurring';
    transcript: string;
    summary: string;
  }
): Promise<AdminFlag[]> {
  try {
    const flags: AdminFlag[] = [];

    // Check for payment bypass attempts
    if (detectsPaymentBypass(params.transcript, params.summary)) {
      flags.push(createFlag({
        sessionId: params.sessionId,
        sessionType: params.sessionType,
        flagType: 'payment_bypass_attempt',
        severity: 'critical',
        description: 'Possible attempt to bypass payment system or discuss off-platform payments',
        transcriptExcerpt: extractRelevantExcerpt(params.transcript, [
          'pay',
          'money',
          'cash',
          'direct',
          'outside',
          'bypass',
        ]),
      }));
    }

    // Check for inappropriate language
    if (detectsInappropriateLanguage(params.transcript)) {
      flags.push(createFlag({
        sessionId: params.sessionId,
        sessionType: params.sessionType,
        flagType: 'inappropriate_language',
        severity: 'high',
        description: 'Inappropriate or unprofessional language detected',
        transcriptExcerpt: extractRelevantExcerpt(params.transcript, [
          'curse',
          'profanity',
          'inappropriate',
        ]),
      }));
    }

    // Check for contact information sharing
    if (detectsContactSharing(params.transcript)) {
      flags.push(createFlag({
        sessionId: params.sessionId,
        sessionType: params.sessionType,
        flagType: 'contact_information_shared',
        severity: 'medium',
        description: 'Phone numbers, email, or social media shared outside platform',
        transcriptExcerpt: extractRelevantExcerpt(params.transcript, [
          'phone',
          'email',
          'whatsapp',
          'instagram',
          'facebook',
          'contact',
        ]),
      }));
    }

    // Check for session quality issues
    if (detectsQualityIssues(params.transcript, params.summary)) {
      flags.push(createFlag({
        sessionId: params.sessionId,
        sessionType: params.sessionType,
        flagType: 'session_quality_issue',
        severity: 'low',
        description: 'Session quality concerns detected (short duration, lack of engagement)',
        transcriptExcerpt: extractRelevantExcerpt(params.transcript, []),
      }));
    }

    // Store flags in database
    if (flags.length > 0) {
      for (const flag of flags) {
        await supabase.from('admin_flags').insert(flag);
      }

      // Notify admins if critical flags
      const criticalFlags = flags.filter(f => f.severity === 'critical');
      if (criticalFlags.length > 0) {
        await notifyAdmins(supabase, params.sessionId, criticalFlags);
      }

      console.log(`✅ Created ${flags.length} admin flags for session: ${params.sessionId}`);
    }

    return flags;
  } catch (error) {
    console.error('❌ Error analyzing session for flags:', error);
    return [];
  }
}

/**
 * Detect payment bypass attempts
 */
function detectsPaymentBypass(transcript: string, summary: string): boolean {
  const lowerTranscript = transcript.toLowerCase();
  const lowerSummary = summary.toLowerCase();

  const bypassKeywords = [
    'pay outside',
    'pay directly',
    'bypass payment',
    'skip payment',
    'pay cash',
    'pay offline',
    'pay later',
    'no need to pay',
    'free session',
    'direct payment',
  ];

  return bypassKeywords.some(keyword =>
    lowerTranscript.includes(keyword) || lowerSummary.includes(keyword)
  );
}

/**
 * Detect inappropriate language
 */
function detectsInappropriateLanguage(transcript: string): boolean {
  // Basic profanity detection (expand as needed)
  // This is a placeholder - implement proper detection
  // For now, return false - implement proper detection
  return false;
}

/**
 * Detect contact information sharing
 */
function detectsContactSharing(transcript: string): boolean {
  const lowerTranscript = transcript.toLowerCase();

  // Check for phone number patterns
  const phonePattern = /\b\d{8,15}\b/;
  if (phonePattern.test(transcript)) {
    return true;
  }

  // Check for email patterns
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i;
  if (emailPattern.test(transcript)) {
    // Exclude PrepSkul emails
    if (!lowerTranscript.includes('@prepskul.com')) {
      return true;
    }
  }

  // Check for social media mentions
  const socialKeywords = [
    'whatsapp',
    'instagram',
    'facebook',
    'telegram',
    'snapchat',
  ];

  return socialKeywords.some(keyword => lowerTranscript.includes(keyword));
}

/**
 * Detect session quality issues
 */
function detectsQualityIssues(transcript: string, summary: string): boolean {
  // Check for very short sessions (less than 10 minutes of content)
  const wordCount = transcript.split(' ').length;
  if (wordCount < 100) {
    return true; // Very short session
  }

  // Check for lack of engagement indicators
  const lowerTranscript = transcript.toLowerCase();
  const engagementKeywords = [
    'question',
    'answer',
    'explain',
    'understand',
    'practice',
  ];

  const engagementCount = engagementKeywords.filter(keyword =>
    lowerTranscript.includes(keyword)
  ).length;

  // If very few engagement indicators, flag as quality issue
  return engagementCount < 3;
}

/**
 * Create admin flag object
 */
function createFlag(params: {
  sessionId: string;
  sessionType: 'trial' | 'recurring';
  flagType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  transcriptExcerpt?: string;
}): AdminFlag {
  return {
    session_id: params.sessionId,
    session_type: params.sessionType,
    flag_type: params.flagType,
    severity: params.severity,
    description: params.description,
    transcript_excerpt: params.transcriptExcerpt,
    resolved: false,
    created_at: new Date().toISOString(),
  };
}

/**
 * Extract relevant excerpt from transcript
 */
function extractRelevantExcerpt(transcript: string, keywords: string[]): string | undefined {
  if (keywords.length === 0) {
    // Return first 200 characters
    return transcript.length > 200
      ? `${transcript.substring(0, 200)}...`
      : transcript;
  }

  // Find first occurrence of any keyword
  const lowerTranscript = transcript.toLowerCase();
  for (const keyword of keywords) {
    const index = lowerTranscript.indexOf(keyword.toLowerCase());
    if (index !== -1) {
      const start = Math.max(0, index - 50);
      const end = Math.min(transcript.length, index + 200);
      return transcript.substring(start, end);
    }
  }

  return undefined;
}

/**
 * Notify admins about critical flags
 */
async function notifyAdmins(
  supabase: SupabaseClient,
  sessionId: string,
  flags: AdminFlag[]
): Promise<void> {
  try {
    // Get all admin users
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true);

    if (!admins) return;

    for (const admin of admins) {
      await supabase.from('notifications').insert({
        user_id: admin.id,
        type: 'critical_session_flag',
        title: 'Critical Flag Detected',
        message: `${flags.length} critical flag(s) detected in session ${sessionId}`,
        data: {
          session_id: sessionId,
          flag_count: flags.length,
          flags: flags,
        },
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    console.log('✅ Notified admins about critical flags');
  } catch (error) {
    console.error('❌ Error notifying admins:', error);
  }
}






