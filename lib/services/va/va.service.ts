/**
 * PrepSkul VA Service
 *
 * Backend-only VA: aggregates transcript, generates session summary/analysis,
 * persists to session-level storage, and triggers notifications.
 * Idempotent: skips if session_summary already exists.
 *
 * Feature flag: PREPSKUL_VA_ENABLED (default: true; set to 'false' to disable).
 * Rollout: trial-first; enable for all sessions by default.
 */

import { createClient } from '@supabase/supabase-js';
import { callOpenRouterWithKey } from '@/lib/ticha/openrouter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VA_ENABLED = process.env.PREPSKUL_VA_ENABLED !== 'false';
const MAX_RETRIES = 2;

function getVaApiKey(): string | null {
  return process.env.SKULMATE_OPENROUTER_API_KEY ?? null;
}

interface TranscriptSegment {
  start_time: number;
  end_time: number;
  text: string;
  agora_uid: string;
}

/**
 * Aggregate transcript segments from session_transcripts in time order.
 */
export async function aggregateTranscript(sessionId: string): Promise<string> {
  const { data: segments, error } = await supabase
    .from('session_transcripts')
    .select('start_time, end_time, text, agora_uid')
    .eq('session_id', sessionId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error(`[VA] Error fetching transcript for ${sessionId}:`, error);
    throw error;
  }

  if (!segments || segments.length === 0) {
    return '';
  }

  const lines = (segments as TranscriptSegment[]).map((s) => {
    const time = formatTime(s.start_time);
    return `[${time}] (uid ${s.agora_uid}): ${(s.text || '').trim()}`;
  });

  return lines.join('\n');
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Generate session summary and analysis via OpenRouter.
 */
export async function generateSummary(transcript: string): Promise<string> {
  const apiKey = getVaApiKey();
  if (!apiKey) {
    console.warn('[VA] No OpenRouter API key; skipping summary generation');
    return '';
  }

  const prompt = `You are PrepSkul's session analysis assistant. Summarize this tutoring session transcript in 2-4 concise paragraphs. Focus on: topics covered, student progress, key takeaways, and any suggested next steps. Be encouraging and conversion-friendly. If the transcript is empty or very short, return a brief placeholder summary.`;
  const messages = [
    { role: 'system' as const, content: prompt },
    { role: 'user' as const, content: transcript || '(No transcript content)' },
  ];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await callOpenRouterWithKey(apiKey, {
        model: 'openai/gpt-4o-mini',
        messages,
        max_tokens: 600,
        temperature: 0.5,
      });

      const content = response.choices?.[0]?.message?.content?.trim();
      if (content) {
        return content;
      }
    } catch (e) {
      console.error(`[VA] LLM attempt ${attempt}/${MAX_RETRIES} failed:`, e);
      if (attempt === MAX_RETRIES) {
        throw e;
      }
    }
  }

  return '';
}

/**
 * Store summary to individual_sessions.session_summary.
 */
export async function storeSummary(sessionId: string, summary: string): Promise<void> {
  const { error } = await supabase
    .from('individual_sessions')
    .update({
      session_summary: summary,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error(`[VA] Error storing summary for ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Check if session already has a summary (idempotency).
 */
export async function hasSummary(sessionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('individual_sessions')
    .select('session_summary')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    console.warn(`[VA] Error checking summary for ${sessionId}:`, error);
    return false;
  }

  const summary = data?.session_summary as string | null | undefined;
  return Boolean(summary && summary.trim().length > 0);
}

/**
 * Run full VA pipeline: aggregate transcript, generate summary, store, optionally notify.
 * Idempotent: skips if summary already exists or VA is disabled.
 */
export async function processSession(sessionId: string): Promise<void> {
  if (!VA_ENABLED) {
    console.log('[VA] VA disabled via PREPSKUL_VA_ENABLED');
    return;
  }

  console.log(`[VA] Trigger: processing session ${sessionId}`);

  try {
    const alreadyHasSummary = await hasSummary(sessionId);
    if (alreadyHasSummary) {
      console.log(`[VA] Session ${sessionId} already has summary; skipping`);
      return;
    }

    console.log(`[VA] Transcript build: aggregating segments for ${sessionId}`);
    const transcript = await aggregateTranscript(sessionId);
    if (!transcript || transcript.trim().length < 10) {
      console.log(`[VA] Session ${sessionId} has insufficient transcript; skipping`);
      return;
    }
    console.log(`[VA] Transcript built: ${transcript.length} chars`);

    console.log(`[VA] LLM call: generating summary for ${sessionId}`);
    const summary = await generateSummary(transcript);
    if (!summary) {
      console.warn(`[VA] No summary generated for ${sessionId}`);
      return;
    }

    console.log(`[VA] DB write: storing summary for ${sessionId}`);
    await storeSummary(sessionId, summary);

    console.log(`[VA] Notification send: dispatching for ${sessionId}`);
    await sendSummaryNotifications(sessionId, summary);

    console.log(`[VA] Completed for session ${sessionId}`);
  } catch (e) {
    console.error(`[VA] Failed for session ${sessionId}:`, e);
    throw e;
  }
}

/**
 * Send summary-ready notifications to tutor, learner, and parent.
 * Normal sessions only: challenge-ready CTA. Trial sessions: skip (trial gets feedback flow).
 * Dedupe: only sends if no session_summary_ready already sent for this session.
 */
async function sendSummaryNotifications(sessionId: string, summaryPreview: string): Promise<void> {
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('type', 'session_summary_ready')
    .contains('metadata', { session_id: sessionId })
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`[VA] Dedupe: session_summary_ready already sent for ${sessionId}`);
    return;
  }

  const { data: session, error } = await supabase
    .from('individual_sessions')
    .select('tutor_id, learner_id, parent_id, recurring_session_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (error || !session) {
    console.warn(`[VA] Could not fetch session for notifications: ${sessionId}`);
    return;
  }

  const isNormalSession = session.recurring_session_id != null;
  if (!isNormalSession) {
    console.log(`[VA] Trial session ${sessionId}: skip challenge notification (trial gets feedback flow)`);
    return;
  }

  const preview = summaryPreview.length > 100 ? `${summaryPreview.slice(0, 100)}...` : summaryPreview;
  const userIds = [
    session.tutor_id,
    session.learner_id,
    session.parent_id,
  ].filter(Boolean) as string[];

  const uniqueIds = [...new Set(userIds)];

  for (const userId of uniqueIds) {
    try {
      const { error: insertError } = await supabase.from('notifications').insert({
        user_id: userId,
        type: 'session_summary_ready',
        notification_type: 'session_summary_ready',
        title: 'Your 5-Minute Revision Challenge is Ready',
        message: 'PrepSkul has prepared a revision challenge from your session.',
        data: { session_id: sessionId, summary_preview: preview, session_type: 'normal' },
        metadata: { session_id: sessionId, summary_preview: preview, session_type: 'normal' },
      });

      if (insertError) {
        console.warn(`[VA] Notification insert failed for user ${userId}:`, insertError.message);
      }
    } catch (e) {
      console.warn(`[VA] Could not notify user ${userId}:`, e);
    }
  }
}
