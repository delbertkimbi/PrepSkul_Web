import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * Schedule payment reminders for a pending payment.
 *
 * Creates scheduled_notifications records for:
 * - 2 days before due date
 * - 1 day before due date
 * - 2 hours before due date
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentId,
      sessionId,
      sessionType,
      paymentDeadline,
      subject,
      amount,
      currency,
    } = body

    if (!studentId || !sessionId || !paymentDeadline) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, sessionId, paymentDeadline' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const deadline = new Date(paymentDeadline)
    const now = new Date()

    const reminders: Array<{
      time: Date
      reminderType: '2_days' | '1_day' | '2_hours'
      title: string
      message: string
      priority: 'normal' | 'high' | 'urgent'
      sendPush: boolean
    }> = []

    const twoDaysBefore = new Date(deadline.getTime() - 2 * 24 * 60 * 60 * 1000)
    if (twoDaysBefore > now) {
      reminders.push({
        time: twoDaysBefore,
        reminderType: '2_days',
        title: 'Payment Reminder',
        message: `Your ${sessionType || 'session'} payment for ${subject || 'your lesson'} (${Number(amount || 0).toFixed(0)} ${currency || 'XAF'}) is due in 2 days.`,
        priority: 'normal',
        sendPush: false,
      })
    }

    const oneDayBefore = new Date(deadline.getTime() - 24 * 60 * 60 * 1000)
    if (oneDayBefore > now) {
      reminders.push({
        time: oneDayBefore,
        reminderType: '1_day',
        title: 'Payment Due Tomorrow',
        message: `Your ${sessionType || 'session'} payment for ${subject || 'your lesson'} (${Number(amount || 0).toFixed(0)} ${currency || 'XAF'}) is due tomorrow.`,
        priority: 'high',
        sendPush: true,
      })
    }

    const twoHoursBefore = new Date(deadline.getTime() - 2 * 60 * 60 * 1000)
    if (twoHoursBefore > now) {
      reminders.push({
        time: twoHoursBefore,
        reminderType: '2_hours',
        title: 'Payment Due Soon',
        message: `Your ${sessionType || 'session'} payment for ${subject || 'your lesson'} (${Number(amount || 0).toFixed(0)} ${currency || 'XAF'}) is due in 2 hours.`,
        priority: 'urgent',
        sendPush: true,
      })
    }

    if (reminders.length === 0) {
      return NextResponse.json({
        success: true,
        remindersScheduled: 0,
        message: 'No future reminder windows available for this payment deadline.',
      })
    }

    const rows = reminders.map((r) => ({
      user_id: studentId,
      notification_type: 'payment_reminder',
      title: r.title,
      message: r.message,
      scheduled_for: r.time.toISOString(),
      status: 'pending',
      related_id: sessionId,
      metadata: {
        session_id: sessionId,
        session_type: sessionType || 'session',
        reminder_type: r.reminderType,
        deadline: deadline.toISOString(),
        amount: amount ?? 0,
        currency: currency || 'XAF',
        priority: r.priority,
        action_url: `/payments/${sessionId}`,
        action_text: 'Pay Now',
        sendEmail: true,
        sendPush: r.sendPush,
      },
    }))

    const { error } = await supabase.from('scheduled_notifications').insert(rows)
    if (error) {
      return NextResponse.json(
        { error: 'Failed to schedule payment reminders', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      remindersScheduled: rows.length,
      reminders: rows.map((r) => ({
        type: (r.metadata as Record<string, any>).reminder_type,
        scheduledFor: r.scheduled_for,
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to schedule payment reminders' },
      { status: 500 }
    )
  }
}
