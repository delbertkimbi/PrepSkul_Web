import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendOpsAlertEmail } from '@/lib/ops-email';

export const runtime = 'nodejs';

const schema = z.object({
  sessionId: z.string().uuid(),
  tutorUserId: z.string().uuid(),
  attended: z.boolean().default(true),
  topicsCovered: z.string().optional(),
  learnerEngagement: z.string().optional(),
  issues: z.string().optional(),
  token: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    if (payload.token) {
      const tokenHash = crypto.createHash('sha256').update(payload.token).digest('hex');
      const { data: tokenRow } = await supabase
        .from('session_portal_tokens')
        .select('id, expires_at, used_at')
        .eq('individual_session_id', payload.sessionId)
        .eq('purpose', 'tutor_report')
        .eq('token_hash', tokenHash)
        .maybeSingle();
      if (!tokenRow || tokenRow.used_at || new Date(tokenRow.expires_at).getTime() < Date.now()) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
      }
      await supabase
        .from('session_portal_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenRow.id);
    }

    const nowIso = new Date().toISOString();

    await supabase.from('session_tutor_completion_reports').upsert(
      {
        individual_session_id: payload.sessionId,
        tutor_user_id: payload.tutorUserId,
        attended: payload.attended,
        topics_covered: payload.topicsCovered || null,
        learner_engagement: payload.learnerEngagement || null,
        issues: payload.issues || null,
        completed_at: nowIso,
        created_at: nowIso,
      },
      { onConflict: 'individual_session_id' }
    );

    await supabase
      .from('individual_sessions')
      .update({
        status: payload.attended ? 'pending_admin_review' : 'scheduled',
        updated_at: nowIso,
      })
      .eq('id', payload.sessionId);

    await supabase.from('admin_operational_events').insert({
      event_type: 'tutor_session_report_submitted',
      subject: `Tutor report submitted for ${payload.sessionId}`,
      payload: {
        session_id: payload.sessionId,
        tutor_user_id: payload.tutorUserId,
        attended: payload.attended,
      },
    });

    await sendOpsAlertEmail(
      'Tutor session report submitted',
      `<p>Tutor report received for session <strong>${payload.sessionId}</strong>.</p>`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to submit tutor report' }, { status: 500 });
  }
}

