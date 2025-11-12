/**
 * Scheduled Notifications Processor (Cron Job)
 * 
 * Processes pending scheduled notifications and sends them
 * Should be called every 5 minutes via Vercel Cron Jobs
 * 
 * To set up in Vercel:
 * 1. Add to vercel.json:
 *    {
 *      "crons": [{
 *        "path": "/api/cron/process-scheduled-notifications",
 *        "schedule": "0,5,10,15,20,25,30,35,40,45,50,55 * * * *"
 *      }]
 *    }
 * 
 * 2. Or use Vercel Dashboard > Settings > Cron Jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Verify cron secret (optional but recommended for security)
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if set
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get all pending notifications scheduled for now or earlier
    const now = new Date().toISOString();
    const { data: scheduledNotifications, error: fetchError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(100); // Process up to 100 at a time

    if (fetchError) {
      console.error('❌ Error fetching scheduled notifications:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled notifications' },
        { status: 500 }
      );
    }

    if (!scheduledNotifications || scheduledNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No scheduled notifications to process',
      });
    }

    console.log(`📅 Processing ${scheduledNotifications.length} scheduled notifications...`);

    let processed = 0;
    let failed = 0;

    // Process each scheduled notification
    for (const scheduled of scheduledNotifications) {
      try {
        // Send the notification using the send API
        const sendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: scheduled.user_id,
              type: scheduled.notification_type,
              title: scheduled.title,
              message: scheduled.message,
              metadata: scheduled.metadata,
              sendEmail: true,
            }),
          }
        );

        if (sendResponse.ok) {
          // Mark as sent
          await supabase
            .from('scheduled_notifications')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', scheduled.id);

          processed++;
          console.log(`✅ Sent scheduled notification: ${scheduled.id}`);
        } else {
          // Mark as failed
          const errorData = await sendResponse.json().catch(() => ({}));
          await supabase
            .from('scheduled_notifications')
            .update({
              status: 'failed',
              error_message: errorData.error || 'Failed to send notification',
            })
            .eq('id', scheduled.id);

          failed++;
          console.error(`❌ Failed to send scheduled notification: ${scheduled.id}`, errorData);
        }
      } catch (error: any) {
        // Mark as failed
        await supabase
          .from('scheduled_notifications')
          .update({
            status: 'failed',
            error_message: error.message || 'Unknown error',
          })
          .eq('id', scheduled.id);

        failed++;
        console.error(`❌ Error processing scheduled notification: ${scheduled.id}`, error);
      }
    }

    // Also cleanup expired notifications
    const { data: cleanupResult } = await supabase.rpc('cleanup_expired_notifications');

    return NextResponse.json({
      success: true,
      processed: processed,
      failed: failed,
      total: scheduledNotifications.length,
      expiredDeleted: cleanupResult || 0,
    });
  } catch (error: any) {
    console.error('❌ Error in scheduled notifications processor:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}






