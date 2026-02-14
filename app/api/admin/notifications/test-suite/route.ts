import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

type TestResult = {
  key: string;
  type: string;
  title: string;
  actionUrl?: string;
  inApp: { ok: boolean; notificationId?: string; error?: string };
  push: { ok: boolean; sent: number; errors: number; error?: string };
};

function nowIso() {
  return new Date().toISOString();
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const targetUserId = body?.userId ? String(body.userId) : '';
    const sendPush = body?.sendPush !== false; // default true

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Role for tailoring test set
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, user_type, full_name')
      .eq('id', targetUserId)
      .maybeSingle();

    const userType = (targetProfile?.user_type as string | null) || 'student';

    // Try to find real IDs for deep links (so it exercises permission + navigation end-to-end)
    const { data: convo } = await supabase
      .from('conversations')
      .select('id')
      .or(`student_id.eq.${targetUserId},tutor_id.eq.${targetUserId}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: booking } = await supabase
      .from('booking_requests')
      .select('id')
      .or(`student_id.eq.${targetUserId},parent_id.eq.${targetUserId},tutor_id.eq.${targetUserId}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: individualSession } = await supabase
      .from('individual_sessions')
      .select('id')
      .or(`learner_id.eq.${targetUserId},parent_id.eq.${targetUserId},tutor_id.eq.${targetUserId}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const sessionId: string | null = (individualSession?.id as string | undefined) || null;
    const bookingId: string | null = (booking?.id as string | undefined) || null;
    const conversationId: string | null = (convo?.id as string | undefined) || null;

    const cases: Array<{
      key: string;
      type: string;
      title: string;
      message: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      actionUrl?: string;
      metadata?: Record<string, any>;
    }> = [
      {
        key: 'admin_message',
        type: 'admin_message',
        title: '✅ Test Suite: Admin Message',
        message: 'This is a test notification from the admin test suite.',
        priority: 'normal',
        actionUrl: '/notifications',
      },
      {
        key: 'message',
        type: 'message',
        title: '✅ Test Suite: Message',
        message: 'New message test (tap should open Messages).',
        priority: 'normal',
        actionUrl: conversationId ? `/messages/${conversationId}` : '/messages',
        metadata: conversationId ? { conversation_id: conversationId } : {},
      },
      {
        key: 'booking',
        type: 'booking_request',
        title: '✅ Test Suite: Booking Update',
        message: 'Booking notification test (tap should open Bookings).',
        priority: 'normal',
        actionUrl: bookingId ? `/bookings/${bookingId}` : '/bookings',
        metadata: bookingId ? { booking_request_id: bookingId } : {},
      },
      {
        key: 'session_reminder',
        type: 'session_reminder',
        title: '✅ Test Suite: Session Reminder',
        message: 'Session reminder test (tap should open the session).',
        priority: 'high',
        actionUrl: sessionId ? `/sessions/${sessionId}` : '/sessions',
        metadata: sessionId ? { session_id: sessionId, reminder_type: '1_hour' } : { reminder_type: '1_hour' },
      },
      {
        key: 'feedback_reminder',
        type: 'feedback_reminder',
        title: '✅ Test Suite: Feedback Reminder',
        message: 'Feedback reminder test (tap should open feedback).',
        priority: 'normal',
        actionUrl: sessionId ? `/sessions/${sessionId}/feedback` : '/sessions',
        metadata: sessionId ? { session_id: sessionId } : {},
      },
    ];

    // Tutor-only test (only send when target is tutor)
    if (userType === 'tutor') {
      cases.push({
        key: 'onboarding_reminder',
        type: 'onboarding_reminder',
        title: '✅ Test Suite: Onboarding Reminder',
        message: 'Tutor onboarding reminder test (tap should open onboarding).',
        priority: 'high',
        actionUrl: '/tutor-onboarding',
        metadata: { reminder_stage: 'missing_statement', onboarding_reminder_test: true },
      });
    }

    const results: TestResult[] = [];

    let sendPushNotification:
      | ((
          args: any
        ) => Promise<{ success: boolean; sent: number; errors: number; error?: string }>)
      | null = null;
    if (sendPush) {
      try {
        const mod = await import('@/lib/services/firebase-admin');
        sendPushNotification = mod.sendPushNotification;
      } catch (e: any) {
        // We'll still create in-app notifications; push results will show the error.
        sendPushNotification = null;
      }
    }

    for (const c of cases) {
      const inApp: TestResult['inApp'] = { ok: false };
      const push: TestResult['push'] = { ok: false, sent: 0, errors: 0 };

      try {
        const { data: notif, error: notifErr } = await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            type: c.type,
            notification_type: c.type,
            title: c.title,
            message: c.message,
            priority: c.priority || 'normal',
            is_read: false,
            action_url: c.actionUrl,
            action_text: 'Open',
            metadata: {
              ...(c.metadata || {}),
              test_suite: true,
              test_key: c.key,
              created_by_admin: user.id,
              created_at_client: nowIso(),
            },
          })
          .select('id')
          .maybeSingle();

        if (notifErr) {
          inApp.ok = false;
          inApp.error = notifErr.message;
        } else {
          inApp.ok = true;
          inApp.notificationId = notif?.id;
        }
      } catch (e: any) {
        inApp.ok = false;
        inApp.error = e?.message || String(e);
      }

      if (sendPush) {
        if (!sendPushNotification) {
          push.ok = false;
          push.error = 'Firebase Admin not configured';
        } else {
          try {
            const pr = await sendPushNotification({
              userId: targetUserId,
              title: c.title,
              body: c.message,
              data: {
                type: c.type,
                ...(inApp.notificationId ? { notificationId: inApp.notificationId } : {}),
                ...(c.actionUrl ? { actionUrl: c.actionUrl } : {}),
                ...(c.metadata || {}),
                test_suite: 'true',
                test_key: c.key,
              },
              priority: c.priority === 'urgent' || c.priority === 'high' ? 'high' : 'normal',
            });
            push.ok = pr.sent > 0 && pr.errors === 0;
            push.sent = pr.sent || 0;
            push.errors = pr.errors || 0;
            if ((pr as any).error) push.error = String((pr as any).error);
          } catch (e: any) {
            push.ok = false;
            push.error = e?.message || String(e);
          }
        }
      }

      results.push({
        key: c.key,
        type: c.type,
        title: c.title,
        actionUrl: c.actionUrl,
        inApp,
        push,
      });
    }

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      userType,
      usedIds: { conversationId, bookingId, sessionId },
      results,
    });
  } catch (e: any) {
    console.error('❌ admin test-suite error:', e);
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}

