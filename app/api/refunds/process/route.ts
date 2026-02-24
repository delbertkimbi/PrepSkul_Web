import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Process Refund API
 *
 * Marks a session payment as refunded and tutor_earnings as cancelled.
 * Notifies student/parent and tutor.
 *
 * TODO: Call Fapshi refund API when available to process actual money return.
 *
 * POST /api/refunds/process
 * Body: { paymentId: string, reason: string } or { sessionId: string, reason: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, sessionId, reason } = body;

    const supabase = getSupabaseAdmin();

    let payment: { id: string; session_id: string; session_fee: number } | null = null;

    if (paymentId) {
      const { data } = await supabase
        .from('session_payments')
        .select('id, session_id, session_fee')
        .eq('id', paymentId)
        .maybeSingle();
      payment = data;
    } else if (sessionId) {
      const { data } = await supabase
        .from('session_payments')
        .select('id, session_id, session_fee')
        .eq('session_id', sessionId)
        .maybeSingle();
      payment = data;
    }

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const pid = payment.id;
    const sid = payment.session_id;
    const refundAmount = payment.session_fee as number;

    const { data: sessionRow } = await supabase
      .from('individual_sessions')
      .select('learner_id, parent_id, tutor_id')
      .eq('id', sid)
      .maybeSingle();

    if (!sessionRow) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const learnerId = sessionRow.learner_id as string | null;
    const parentId = sessionRow.parent_id as string | null;
    const tutorId = sessionRow.tutor_id as string;

    const now = new Date().toISOString();

    await supabase
      .from('tutor_earnings')
      .update({
        earnings_status: 'cancelled',
        updated_at: now,
      })
      .eq('session_payment_id', pid);

    await supabase
      .from('session_payments')
      .update({
        payment_status: 'refunded',
        refunded_at: now,
        refund_reason: reason || 'Refund processed',
        refund_amount: refundAmount,
        updated_at: now,
      })
      .eq('id', pid);

    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const studentUserId = learnerId || parentId;

    if (studentUserId) {
      await fetch(`${apiUrl}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: studentUserId,
          type: 'refund_processed',
          title: 'Refund Processed',
          message: `A refund of ${Math.round(refundAmount)} XAF has been processed for your session. Reason: ${reason || 'Refund'}`,
          priority: 'normal',
          actionUrl: '/payments',
          actionText: 'View Payments',
          icon: '💰',
          metadata: { session_id: sid, payment_id: pid, refund_amount: refundAmount, reason },
          sendEmail: true,
          sendPush: true,
        }),
      }).catch((err) => console.error('⚠️ Failed to send refund notification to student:', err));
    }

    await fetch(`${apiUrl}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: tutorId,
        type: 'earnings_cancelled',
        title: 'Earnings Cancelled',
        message: `Earnings for this session were cancelled. Refund processed. Reason: ${reason || 'Refund'}`,
        priority: 'normal',
        actionUrl: '/earnings',
        actionText: 'View Earnings',
        icon: '⚠️',
        metadata: { session_id: sid, payment_id: pid, reason },
        sendEmail: true,
        sendPush: true,
      }),
    }).catch((err) => console.error('⚠️ Failed to send refund notification to tutor:', err));

    return NextResponse.json({
      success: true,
      message: 'Refund processed',
      paymentId: pid,
      refundAmount,
    });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process refund' },
      { status: 500 }
    );
  }
}
