import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const QA_WINDOW_HOURS = 24;
const BATCH_SIZE = 50;
const COMPLAINT_KEYWORDS = [
  'terrible', 'awful', 'horrible', 'waste', 'disappointed', 'complaint',
  'refund', 'unsatisfied', 'poor quality', 'not worth',
];

interface SessionIssues {
  isNoShow: boolean;
  isLate: boolean;
  lateMinutes: number;
  hasPoorRating: boolean;
  rating: number | null;
  hasComplaint: boolean;
}

async function detectIssues(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  sessionId: string
): Promise<SessionIssues> {
  const issues: SessionIssues = {
    isNoShow: false,
    isLate: false,
    lateMinutes: 0,
    hasPoorRating: false,
    rating: null,
    hasComplaint: false,
  };

  const { data: session } = await supabase
    .from('individual_sessions')
    .select('scheduled_date, scheduled_time, tutor_joined_at, status')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session) return issues;

  const tutorJoinedAt = session.tutor_joined_at as string | null;
  const status = session.status as string;

  if (!tutorJoinedAt && status === 'completed') {
    issues.isNoShow = true;
    return issues;
  }

  const scheduledDate = session.scheduled_date as string | null;
  const scheduledTime = session.scheduled_time as string | null;
  if (scheduledDate && scheduledTime && tutorJoinedAt) {
    try {
      const [h, m] = scheduledTime.split(':').map(Number);
      const scheduledDt = new Date(scheduledDate);
      scheduledDt.setHours(h || 0, m || 0, 0, 0);
      const joinedDt = new Date(tutorJoinedAt);
      const lateMs = joinedDt.getTime() - scheduledDt.getTime();
      const lateMinutes = Math.floor(lateMs / 60000);
      if (lateMinutes > 5) {
        issues.isLate = true;
        issues.lateMinutes = lateMinutes;
      }
    } catch {
      // ignore parse errors
    }
  }

  const { data: feedback } = await supabase
    .from('session_feedback')
    .select('student_rating, student_review, student_what_could_improve')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (feedback) {
    const rating = feedback.student_rating as number | null;
    if (rating != null && rating < 3) {
      issues.hasPoorRating = true;
      issues.rating = rating;
    }
    const review = (feedback.student_review as string) || '';
    const improve = (feedback.student_what_could_improve as string) || '';
    const text = (review + ' ' + improve).toLowerCase();
    if (COMPLAINT_KEYWORDS.some((kw) => text.includes(kw))) {
      issues.hasComplaint = true;
    }
  }

  return issues;
}

function hasIssues(issues: SessionIssues): boolean {
  return issues.isNoShow || issues.isLate || issues.hasPoorRating || issues.hasComplaint;
}

/**
 * Process Pending Earnings Cron Job
 *
 * After QA window (24h): detects issues (no-show, late, poor rating, complaint).
 * If no issues, moves tutor_earnings to active. If issues, leaves pending for review.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
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

    const supabase = getSupabaseAdmin();
    const now = new Date();
    const cutoff = new Date(now.getTime() - QA_WINDOW_HOURS * 60 * 60 * 1000);
    const cutoffIso = cutoff.toISOString();

    const { data: confirmedPayments, error: paymentsError } = await supabase
      .from('session_payments')
      .select('id, session_id, payment_confirmed_at')
      .eq('payment_status', 'paid')
      .not('payment_confirmed_at', 'is', null)
      .lt('payment_confirmed_at', cutoffIso)
      .eq('earnings_added_to_wallet', false)
      .limit(BATCH_SIZE);

    if (paymentsError) {
      console.error('❌ Error fetching confirmed payments:', paymentsError);
      return NextResponse.json(
        { error: 'Failed to fetch confirmed payments', details: paymentsError.message },
        { status: 500 }
      );
    }

    if (!confirmedPayments || confirmedPayments.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        skipped: 0,
        message: 'No pending earnings ready to move to active',
      });
    }

    const paymentIds = confirmedPayments.map((p) => p.id);
    const { data: pendingEarnings, error: earningsError } = await supabase
      .from('tutor_earnings')
      .select('id, tutor_id, session_id, tutor_earnings, session_payment_id')
      .eq('earnings_status', 'pending')
      .in('session_payment_id', paymentIds);

    if (earningsError) {
      console.error('❌ Error fetching pending earnings:', earningsError);
      return NextResponse.json(
        { error: 'Failed to fetch pending earnings', details: earningsError.message },
        { status: 500 }
      );
    }

    if (!pendingEarnings || pendingEarnings.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        skipped: 0,
        message: 'No pending earnings for confirmed payments',
      });
    }

    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let movedCount = 0;
    let skippedCount = 0;

    for (const earning of pendingEarnings) {
      const paymentId = earning.session_payment_id;
      const tutorId = earning.tutor_id;
      const sessionId = earning.session_id as string;
      const amount = earning.tutor_earnings as number;

      const issues = await detectIssues(supabase, sessionId);
      if (hasIssues(issues)) {
        console.log(`⚠️ QA issues for session ${sessionId}: noShow=${issues.isNoShow} late=${issues.isLate} poorRating=${issues.hasPoorRating} complaint=${issues.hasComplaint}`);
        skippedCount++;
        continue;
      }

      const { error: updateEarningsError } = await supabase
        .from('tutor_earnings')
        .update({
          earnings_status: 'active',
          added_to_active_balance: true,
          active_balance_added_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('session_payment_id', paymentId);

      if (updateEarningsError) {
        console.error(`⚠️ Error updating tutor_earnings for payment ${paymentId}:`, updateEarningsError);
        continue;
      }

      await supabase
        .from('session_payments')
        .update({
          earnings_added_to_wallet: true,
          wallet_updated_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', paymentId);

      try {
        await fetch(`${apiUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: tutorId,
            type: 'earnings_activated',
            title: 'Earnings Available',
            message: `${Math.round(amount)} XAF has been moved to your active balance and is now available for withdrawal.`,
            priority: 'normal',
            actionUrl: '/earnings',
            actionText: 'View Earnings',
            icon: '💰',
            metadata: {
              earning_id: earning.id,
              amount,
              payment_id: paymentId,
            },
            sendEmail: true,
            sendPush: true,
          }),
        });
      } catch (notifErr) {
        console.error('⚠️ Failed to send earnings notification:', notifErr);
      }

      movedCount++;
    }

    return NextResponse.json({
      success: true,
      processed: movedCount,
      skipped: skippedCount,
      message: `Moved ${movedCount} pending earnings to active, skipped ${skippedCount} with QA issues`,
    });
  } catch (error: any) {
    console.error('❌ Error in process-pending-earnings cron:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process pending earnings' },
      { status: 500 }
    );
  }
}
