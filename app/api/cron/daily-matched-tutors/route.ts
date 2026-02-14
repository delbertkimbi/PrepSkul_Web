import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const BATCH_SIZE = 40; // keep safe for serverless timeouts

function hoursAgoIso(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function normalizeSubjects(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === 'string') return [value.trim()].filter(Boolean);
  return [];
}

function overlap(a: string[], b: string[]): string[] {
  const setB = new Set(b.map((s) => s.toLowerCase()));
  const matches: string[] = [];
  for (const s of a) {
    if (setB.has(String(s).toLowerCase())) matches.push(s);
  }
  return matches;
}

async function hasActiveRecurring(supabase: any, userId: string): Promise<boolean> {
  try {
    // recurring_sessions in this codebase commonly has learner_id; some schemas also have parent_id.
    // We treat anything not cancelled/archived/completed as "active enough" to skip daily digests.
    const { data, error } = await supabase
      .from('recurring_sessions')
      .select('id, status')
      .or(`learner_id.eq.${userId},parent_id.eq.${userId}`)
      .not('status', 'in', '("cancelled","archived","completed")')
      .limit(1);
    if (error) return false; // fail-open: don't block digests if schema differs
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      const isVercelCron =
        request.headers.get('user-agent')?.includes('vercel-cron') ||
        request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized. Please provide Authorization: Bearer YOUR_CRON_SECRET header.' },
          { status: 401 }
        );
      }
    }

    if (String(process.env.ENABLE_DAILY_MATCHED_TUTORS || '').toLowerCase() !== 'true') {
      return NextResponse.json({
        success: true,
        enabled: false,
        processedUsers: 0,
        message: 'Daily matched tutors digest disabled (set ENABLE_DAILY_MATCHED_TUTORS=true)',
      });
    }

    const supabase = getSupabaseAdmin();
    const sinceIso = hoursAgoIso(26); // give some slack for cron drift

    // 1) Fetch newly approved tutors (last ~day).
    // We prefer `updated_at` as it's widely present. If your schema has `approved_at`, you can switch later.
    const { data: newTutors, error: tutorErr } = await supabase
      .from('tutor_profiles')
      .select('user_id, id, subjects, updated_at, status')
      .eq('status', 'approved')
      .gte('updated_at', sinceIso)
      .limit(300);

    if (tutorErr) {
      console.error('❌ daily-matched-tutors: tutor fetch error', tutorErr);
      return NextResponse.json({ error: 'Failed to fetch tutors' }, { status: 500 });
    }

    const tutorSubjects = newTutors
      ? newTutors.flatMap((t: any) => normalizeSubjects(t.subjects))
      : [];

    // Nothing new today → do nothing.
    if (!tutorSubjects.length) {
      return NextResponse.json({
        success: true,
        enabled: true,
        processedUsers: 0,
        message: 'No newly approved tutors in the last day',
      });
    }

    // 2) Candidate users: survey completed learners/parents.
    const { data: candidates, error: candErr } = await supabase
      .from('profiles')
      .select('id, user_type, survey_completed')
      .in('user_type', ['student', 'learner', 'parent'])
      .eq('survey_completed', true)
      .limit(BATCH_SIZE);

    if (candErr) {
      console.error('❌ daily-matched-tutors: candidate fetch error', candErr);
      return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    }

    let processedUsers = 0;
    let notifiedUsers = 0;
    let skippedActive = 0;
    let skippedNoMatch = 0;
    let skippedRecent = 0;

    const sinceRecentIso = hoursAgoIso(20);

    for (const c of candidates || []) {
      processedUsers += 1;
      const userId = c.id as string;

      // Skip if they already got a digest recently (avoid nuisance).
      const { data: recentNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'daily_match_tutors')
        .gte('created_at', sinceRecentIso)
        .limit(1);

      if (recentNotif && recentNotif.length > 0) {
        skippedRecent += 1;
        continue;
      }

      // Skip if user already has an active recurring session (Preply-style: focus on unattached learners).
      const activeRecurring = await hasActiveRecurring(supabase, userId);
      if (activeRecurring) {
        skippedActive += 1;
        continue;
      }

      // Get learner subjects (for parents, we still use learner_profiles if present).
      let learnerSubjects: string[] = [];
      try {
        const { data: learnerProfile, error: lpErr } = await supabase
          .from('learner_profiles')
          .select('subjects')
          .eq('user_id', userId)
          .maybeSingle();
        if (!lpErr) learnerSubjects = normalizeSubjects((learnerProfile as any)?.subjects);
      } catch {
        // ignore
      }

      const matched = learnerSubjects.length ? overlap(learnerSubjects, tutorSubjects) : [];
      if (!matched.length) {
        skippedNoMatch += 1;
        continue;
      }

      const title = 'New tutors match your interests';
      const message = `We approved new tutors for ${matched.slice(0, 3).join(', ')}. Tap to explore and book a session.`;

      // Create in-app notification row.
      const { data: notif, error: notifErr } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'daily_match_tutors',
          notification_type: 'daily_match_tutors',
          title,
          message,
          priority: 'low',
          is_read: false,
          action_url: '/find-tutors',
          action_text: 'Explore tutors',
          metadata: {
            matched_subjects: matched.slice(0, 10),
            digest_since: sinceIso,
          },
        })
        .select('id')
        .maybeSingle();

      if (notifErr) {
        console.warn('⚠️ daily-matched-tutors: failed to insert in-app notification', notifErr?.message);
        continue;
      }

      // Send push (best-effort; respects app-level preferences in client UI and token availability).
      try {
        const { sendPushNotification } = await import('@/lib/services/firebase-admin');
        await sendPushNotification({
          userId,
          title,
          body: message,
          data: {
            type: 'daily_match_tutors',
            ...(notif?.id ? { notificationId: notif.id } : {}),
            actionUrl: '/find-tutors',
          },
          priority: 'normal',
        });
      } catch (e: any) {
        console.warn('⚠️ daily-matched-tutors: push skipped/failed', e?.message || e);
      }

      notifiedUsers += 1;
    }

    return NextResponse.json({
      success: true,
      enabled: true,
      processedUsers,
      notifiedUsers,
      skipped: {
        recentDigest: skippedRecent,
        activeRecurring: skippedActive,
        noMatch: skippedNoMatch,
      },
    });
  } catch (e: any) {
    console.error('❌ daily-matched-tutors error:', e);
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}

