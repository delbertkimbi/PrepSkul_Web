import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Admin Flag Service
 * 
 * Analyzes session transcripts and summaries for irregular behavior
 * Creates admin flags for review
 */

/**
 * Analyze session for admin flags
 */
export async function analyzeSessionForFlags({
  supabase,
  sessionId,
  sessionType,
  transcript,
  summary,
}: {
  supabase: any;
  sessionId: string;
  sessionType: 'trial' | 'recurring';
  transcript: string;
  summary: string;
}): Promise<any[]> {
  try {
    const flags: any[] = [];

    // Check for payment bypass attempts
    if (detectsPaymentBypass(transcript, summary)) {
      flags.push({
        session_id: sessionId,
        session_type: sessionType,
        flag_type: 'payment_bypass_attempt',
        severity: 'critical',
        description: 'Possible attempt to bypass payment system or discuss off-platform payments',
        transcript_excerpt: extractRelevantExcerpt(transcript, [
          'pay',
          'money',
          'cash',
          'direct',
          'outside',
          'bypass',
        ]),
      });
    }

    // Check for inappropriate language
    if (detectsInappropriateLanguage(transcript)) {
      flags.push({
        session_id: sessionId,
        session_type: sessionType,
        flag_type: 'inappropriate_language',
        severity: 'high',
        description: 'Inappropriate or unprofessional language detected',
        transcript_excerpt: extractRelevantExcerpt(transcript, [
          'curse',
          'profanity',
          'inappropriate',
        ]),
      });
    }

    // Check for contact information sharing
    if (detectsContactSharing(transcript)) {
      flags.push({
        session_id: sessionId,
        session_type: sessionType,
        flag_type: 'contact_information_shared',
        severity: 'medium',
        description: 'Phone numbers, email, or social media shared outside platform',
        transcript_excerpt: extractRelevantExcerpt(transcript, [
          'phone',
          'email',
          'whatsapp',
          'instagram',
          'facebook',
          'contact',
        ]),
      });
    }

    // Create flags in database
    if (flags.length > 0) {
      for (const flag of flags) {
        const { error } = await supabase
          .from('admin_flags')
          .insert({
            ...flag,
            status: 'pending',
            created_at: new Date().toISOString(),
          });

        if (error) {
          console.error(`⚠️ Error creating admin flag: ${error.message}`);
        }
      }
    }

    return flags;
  } catch (error: any) {
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
    'pay cash',
    'bypass payment',
    'skip payment',
    'off platform',
    'outside platform',
    'direct payment',
    'cash payment',
  ];

  return bypassKeywords.some(keyword => 
    lowerTranscript.includes(keyword) || lowerSummary.includes(keyword)
  );
}

/**
 * Detect inappropriate language
 */
function detectsInappropriateLanguage(transcript: string): boolean {
  const lowerTranscript = transcript.toLowerCase();

  // Basic profanity detection (expand as needed)
  const profanityPatterns = [
    /\b(fuck|shit|damn|hell|bitch|ass)\b/i,
    // Add more patterns as needed
  ];

  return profanityPatterns.some(pattern => pattern.test(lowerTranscript));
}

/**
 * Detect contact information sharing
 */
function detectsContactSharing(transcript: string): boolean {
  const lowerTranscript = transcript.toLowerCase();

  // Phone number pattern
  const phonePattern = /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;
  
  // Email pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

  // Social media mentions
  const socialKeywords = [
    'whatsapp',
    'instagram',
    'facebook',
    'twitter',
    'snapchat',
    'telegram',
  ];

  const hasPhone = phonePattern.test(transcript);
  const hasEmail = emailPattern.test(transcript);
  const hasSocial = socialKeywords.some(keyword => lowerTranscript.includes(keyword));

  return hasPhone || hasEmail || hasSocial;
}

/**
 * Extract relevant excerpt from transcript
 */
function extractRelevantExcerpt(transcript: string, keywords: string[]): string {
  const lines = transcript.split('\n');
  const relevantLines: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (keywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
      relevantLines.push(line);
      if (relevantLines.length >= 3) break; // Limit to 3 lines
    }
  }

  return relevantLines.join('\n') || transcript.substring(0, 200);
}

