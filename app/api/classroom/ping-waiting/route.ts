import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateSessionAccess } from '@/lib/services/agora/session-service';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { buildCorsHeaders } from '@/lib/services/group-classes/cors';

export const runtime = 'nodejs';

const COOLDOWN_MS = 4 * 60 * 1000;

export async function OPTIONS(request: NextRequest) {
  // Use default allowHeaders (matches /api/agora/token) so Flutter web preflight
  // with X-Requested-With etc. is not rejected.
  const headers = buildCorsHeaders(request, { methods: 'POST, OPTIONS' });
  return new NextResponse(null, { status: 204, headers });
}

async function fetchSessionRow(sessionId: string) {
  const admin = getSupabaseAdmin();
  const ind = await admin
    .from('individual_sessions')
    .select('tutor_id, learner_id, parent_id, status')
    .eq('id', sessionId)
    .maybeSingle();
  if (ind.data) return ind.data;
  const trial = await admin
    .from('trial_sessions')
    .select('tutor_id, learner_id, parent_id, status')
    .eq('id', sessionId)
    .maybeSingle();
  return trial.data ?? null;
}

function recipientForCaller(
  callerId: string,
  row: { tutor_id: string | null; learner_id: string | null; parent_id: string | null },
): string | null {
  const tutor = row.tutor_id;
  const learner = row.learner_id ?? row.parent_id;
  if (callerId === tutor) return learner;
  if (callerId === learner || callerId === row.parent_id) return tutor;
  return null;
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request, { methods: 'POST, OPTIONS' });

  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '') || null;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401, headers: corsHeaders },
      );
    }

    let body: { sessionId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders });
    }

    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400, headers: corsHeaders });
    }

    const tempSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );

    const { data: authData, error: authErr } = await tempSupabase.auth.getUser(accessToken);
    const callerUser = authData?.user;
    if (authErr || !callerUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    const hasAccess = await validateSessionAccess(sessionId, callerUser.id, userSupabase);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    const admin = getSupabaseAdmin();
    const sessionRow = await fetchSessionRow(sessionId);
    if (!sessionRow) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404, headers: corsHeaders });
    }

    const status = (sessionRow.status as string)?.toLowerCase();
    if (status === 'cancelled' || status === 'completed') {
      return NextResponse.json(
        { error: 'Session has ended — join reminders are unavailable.' },
        { status: 409, headers: corsHeaders },
      );
    }

    const recipientId = recipientForCaller(callerUser.id, sessionRow as any);
    if (!recipientId) {
      return NextResponse.json({ error: 'Could not resolve other participant.' }, { status: 422, headers: corsHeaders });
    }

    const dedupeKey = `lesson_waiting_ping:${sessionId}:${callerUser.id}`;
    const cutoffIso = new Date(Date.now() - COOLDOWN_MS).toISOString();

    const { data: recentRows } = await admin
      .from('notifications')
      .select('id')
      .eq('user_id', recipientId)
      .eq('type', 'lesson_waiting_ping')
      .gte('created_at', cutoffIso)
      .contains('metadata', { dedupe_key: dedupeKey })
      .limit(1);

    if ((recentRows?.length ?? 0) > 0) {
      return NextResponse.json(
        {
          cooldown: true,
          retryAfterSeconds: Math.ceil(COOLDOWN_MS / 1000),
          message: 'Please wait before sending another reminder.',
        },
        { status: 429, headers: corsHeaders },
      );
    }

    const tutorPings = callerUser.id === sessionRow.tutor_id;

    const title = tutorPings ? 'Your student is waiting' : 'Your tutor is waiting';
    const friendlyMessage = tutorPings
      ? 'Your student is waiting in the lesson.'
      : 'Your tutor is waiting in the lesson.';

    const siteBase = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      (request.nextUrl && request.nextUrl.origin) ||
      'http://localhost:3000'
    ).replace(/\/$/, '');
    const sendUrl = `${siteBase}/api/notifications/send`;

    const pingRes = await fetch(sendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: recipientId,
        type: 'lesson_waiting_ping',
        title,
        message: friendlyMessage,
        priority: 'normal',
        actionUrl: `/sessions/${sessionId}`,
        actionText: 'Open lesson',
        sendEmail: true,
        sendPush: true,
        metadata: {
          session_id: sessionId,
          dedupe_key: dedupeKey,
          sender_user_id: callerUser.id,
        },
      }),
    });

    if (!pingRes.ok) {
      const text = await pingRes.text().catch(() => '');
      console.warn('[ping-waiting] notifications/send failed:', pingRes.status, text.slice(0, 300));
      return NextResponse.json(
        { error: 'Failed to dispatch notification.', detail: pingRes.status },
        { status: 502, headers: corsHeaders },
      );
    }

    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
  } catch (e: any) {
    console.error('[ping-waiting]', e?.message ?? e);
    const headers = buildCorsHeaders(request, { methods: 'POST, OPTIONS' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers });
  }
}
