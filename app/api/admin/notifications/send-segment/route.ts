import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendNotificationEmail } from '@/lib/notifications';

export const runtime = 'nodejs';

type SegmentKey =
  | 'all_users'
  | 'approved_tutors'
  | 'non_approved_tutors'
  | 'active_tutors'
  | 'inactive_tutors'
  | 'active_students'
  | 'inactive_students'
  | 'active_parents'
  | 'inactive_parents';

const DEFAULT_ACTIVE_DAYS = 30;
const DEFAULT_LIMIT = 200; // guardrail (serverless)

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function uniq(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

async function getActiveUserIds(supabase: any, userType: 'student' | 'parent' | 'tutor', sinceIso: string) {
  // We define "active" as having activity in the last N days in at least one of:
  // - conversations.updated_at
  // - booking_requests.created_at
  // - individual_sessions.created_at
  //
  // This is intentionally simple + scalable (no heavy joins) and is good enough for segmentation.
  const ids: string[] = [];

  // conversations
  try {
    const { data: convs } = await supabase
      .from('conversations')
      .select('student_id, tutor_id, updated_at')
      .gte('updated_at', sinceIso)
      .limit(1000);
    for (const c of convs || []) {
      if (userType === 'tutor') ids.push(String(c.tutor_id || ''));
      else ids.push(String(c.student_id || ''));
    }
  } catch {
    // ignore
  }

  // booking_requests
  try {
    const { data: bookings } = await supabase
      .from('booking_requests')
      .select('student_id, parent_id, tutor_id, created_at')
      .gte('created_at', sinceIso)
      .limit(1000);
    for (const b of bookings || []) {
      if (userType === 'tutor') ids.push(String(b.tutor_id || ''));
      if (userType === 'parent') ids.push(String(b.parent_id || ''));
      if (userType === 'student') ids.push(String(b.student_id || ''));
    }
  } catch {
    // ignore
  }

  // individual_sessions
  try {
    const { data: sessions } = await supabase
      .from('individual_sessions')
      .select('tutor_id, learner_id, parent_id, created_at')
      .gte('created_at', sinceIso)
      .limit(1000);
    for (const s of sessions || []) {
      if (userType === 'tutor') ids.push(String(s.tutor_id || ''));
      if (userType === 'parent') ids.push(String(s.parent_id || ''));
      if (userType === 'student') ids.push(String(s.learner_id || ''));
    }
  } catch {
    // ignore
  }

  return uniq(ids);
}

async function resolveSegmentUserIds(supabase: any, segment: SegmentKey, activeDays: number): Promise<string[]> {
  const sinceIso = daysAgoIso(activeDays);

  if (segment === 'all_users') {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .in('user_type', ['student', 'learner', 'parent', 'tutor'])
      .neq('is_admin', true)
      .limit(5000);
    return uniq((data || []).map((r: any) => String(r.id)));
  }

  if (segment === 'approved_tutors' || segment === 'non_approved_tutors') {
    const { data } = await supabase
      .from('tutor_profiles')
      .select('user_id, status, is_hidden')
      .neq('is_hidden', true)
      .limit(5000);
    const filtered = (data || []).filter((t: any) =>
      segment === 'approved_tutors' ? t.status === 'approved' : t.status !== 'approved'
    );
    return uniq(filtered.map((t: any) => String(t.user_id)));
  }

  if (segment === 'active_tutors' || segment === 'inactive_tutors') {
    const { data: tutors } = await supabase
      .from('tutor_profiles')
      .select('user_id, status, is_hidden')
      .eq('status', 'approved')
      .neq('is_hidden', true)
      .limit(5000);
    const tutorIds = uniq((tutors || []).map((t: any) => String(t.user_id)));
    const activeIds = await getActiveUserIds(supabase, 'tutor', sinceIso);
    const activeSet = new Set(activeIds);
    const finalIds = tutorIds.filter((id) => (segment === 'active_tutors' ? activeSet.has(id) : !activeSet.has(id)));
    return uniq(finalIds);
  }

  if (segment === 'active_students' || segment === 'inactive_students') {
    const { data: students } = await supabase
      .from('profiles')
      .select('id')
      .in('user_type', ['student', 'learner'])
      .limit(5000);
    const ids = uniq((students || []).map((r: any) => String(r.id)));
    const activeIds = await getActiveUserIds(supabase, 'student', sinceIso);
    const activeSet = new Set(activeIds);
    const finalIds = ids.filter((id) => (segment === 'active_students' ? activeSet.has(id) : !activeSet.has(id)));
    return uniq(finalIds);
  }

  if (segment === 'active_parents' || segment === 'inactive_parents') {
    const { data: parents } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_type', 'parent')
      .limit(5000);
    const ids = uniq((parents || []).map((r: any) => String(r.id)));
    const activeIds = await getActiveUserIds(supabase, 'parent', sinceIso);
    const activeSet = new Set(activeIds);
    const finalIds = ids.filter((id) => (segment === 'active_parents' ? activeSet.has(id) : !activeSet.has(id)));
    return uniq(finalIds);
  }

  return [];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const segment = (body?.segment ? String(body.segment) : '') as SegmentKey;

    const type = body?.type ? String(body.type) : 'admin_message';
    const title = body?.title ? String(body.title) : '';
    const message = body?.message ? String(body.message) : '';
    const priority = body?.priority ? String(body.priority) : 'normal';
    const actionUrl = body?.actionUrl ? String(body.actionUrl) : '';
    const actionText = body?.actionText ? String(body.actionText) : '';
    const sendPush = body?.sendPush === true;
    const sendEmail = body?.sendEmail === true;

    const activeDays = Number(body?.activeDays || DEFAULT_ACTIVE_DAYS);
    const limit = Math.min(Number(body?.limit || DEFAULT_LIMIT), 500); // hard cap
    const dryRun = body?.dryRun === true;

    if (!segment) return NextResponse.json({ error: 'Missing segment' }, { status: 400 });
    if (!title || !message) return NextResponse.json({ error: 'Missing title/message' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const allIds = await resolveSegmentUserIds(supabase, segment, activeDays);
    const userIds = allIds.slice(0, limit);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        segment,
        activeDays,
        totalMatched: allIds.length,
        willSend: userIds.length,
      });
    }

    // Insert in-app notifications for all recipients (fast).
    const rows = userIds.map((uid) => ({
      user_id: uid,
      type,
      notification_type: type,
      title,
      message,
      priority,
      is_read: false,
      action_url: actionUrl || null,
      action_text: actionText || null,
      metadata: {
        admin_broadcast: true,
        segment,
        active_days: activeDays,
        created_by_admin: user.id,
        created_at_server: new Date().toISOString(),
      },
    }));

    const { error: insertErr } = await supabase.from('notifications').insert(rows);
    if (insertErr) {
      console.error('❌ segment send insert error:', insertErr);
      return NextResponse.json({ error: 'Failed to insert notifications', details: insertErr.message }, { status: 500 });
    }

    let push = { attempted: false, sentUsers: 0, errors: 0, error: '' as string | null };
    if (sendPush) {
      push.attempted = true;
      try {
        const { sendPushNotification } = await import('@/lib/services/firebase-admin');
        // For scalability, send push per user (each resolves tokens); capped to `limit`.
        // This is acceptable for admin broadcasts up to a few hundred recipients.
        for (const uid of userIds) {
          try {
            const r = await sendPushNotification({
              userId: uid,
              title,
              body: message,
              data: {
                type,
                ...(actionUrl ? { actionUrl } : {}),
                admin_broadcast: 'true',
                segment,
              },
              priority: priority === 'urgent' || priority === 'high' ? 'high' : 'normal',
            });
            if (r.sent > 0 && r.errors === 0) push.sentUsers += 1;
            if (r.errors > 0) push.errors += r.errors;
          } catch (e: any) {
            push.errors += 1;
          }
        }
      } catch (e: any) {
        push.error = e?.message || String(e);
      }
    }

    // Send email to each recipient who has an email and (optionally) has not disabled email channel
    let emailResult = { attempted: false, sent: 0, errors: 0, error: '' as string | null };
    if (sendEmail && userIds.length > 0) {
      emailResult.attempted = true;
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      const profileById = new Map((profiles || []).map((p: any) => [String(p.id), p]));

      for (const uid of userIds) {
        const profile = profileById.get(uid);
        if (!profile?.email) continue;
        try {
          const { success } = await sendNotificationEmail({
            recipientEmail: profile.email,
            recipientName: profile.full_name || 'User',
            subject: title,
            title,
            message,
            actionUrl: actionUrl || undefined,
            actionText: actionText || undefined,
          });
          if (success) emailResult.sent += 1;
          else emailResult.errors += 1;
        } catch (e: any) {
          emailResult.errors += 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      segment,
      activeDays,
      totalMatched: allIds.length,
      sentTo: userIds.length,
      push,
      email: emailResult,
      note: limit < allIds.length ? `Capped at ${limit}. Increase limit carefully or implement queued sending.` : undefined,
    });
  } catch (e: any) {
    console.error('❌ admin segment send error:', e);
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}

