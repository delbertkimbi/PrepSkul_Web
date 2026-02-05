import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendNotificationEmail } from '@/lib/notifications';

/**
 * Process Abandoned Booking Reminders Cron Job
 *
 * Sends reminder notifications to users who reached the review screen
 * but didn't complete their booking (trial or normal).
 *
 * Runs every 2-4 hours to check for abandoned bookings that need reminders.
 * Uses Supabase admin client so external cron can run without user session.
 */
const BATCH_SIZE = 50; // Safe for Vercel free tier timeout
const HOURS_SINCE_REVIEW = 2; // Send reminder 2 hours after reaching review screen

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
    
    // Fetch abandoned bookings that need reminders using the database function
    // This ensures we get bookings that are 2+ hours old and haven't been reminded yet
    const { data: abandonedBookingsData, error: fetchError } = await supabase
      .rpc('get_abandoned_bookings_for_reminder');

    if (fetchError) {
      console.error('❌ Error fetching abandoned bookings:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch abandoned bookings', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!abandonedBookingsData || abandonedBookingsData.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No abandoned bookings need reminders',
      });
    }

    // Fetch full booking details with user and tutor info
    const abandonedBookingIds = abandonedBookingsData.map((b: any) => b.id);

    const { data: abandonedBookings, error: detailsError } = await supabase
      .from('abandoned_bookings')
      .select(`
        *,
        user:profiles!abandoned_bookings_user_id_fkey(id, full_name, email),
        tutor:profiles!abandoned_bookings_tutor_id_fkey(id, full_name)
      `)
      .in('id', abandonedBookingIds)
      .limit(BATCH_SIZE);

    if (detailsError) {
      console.error('❌ Error fetching booking details:', detailsError);
      return NextResponse.json(
        { error: 'Failed to fetch booking details', details: detailsError.message },
        { status: 500 }
      );
    }

    if (fetchError) {
      console.error('❌ Error fetching abandoned bookings:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch abandoned bookings', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!abandonedBookings || abandonedBookings.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No abandoned bookings need reminders',
      });
    }

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process each abandoned booking
    for (const booking of abandonedBookings) {
      try {
        const userId = booking.user_id as string;
        const tutorId = booking.tutor_id as string;
        const tutorName = (booking.tutor as any)?.full_name || 'Tutor';
        const bookingType = booking.booking_type as string;
        const bookingData = booking.booking_data as Record<string, any> || {};
        
        // Extract subject from booking_data
        const subject = bookingData.subject as string | null;
        
        // Create deep link to tutor profile: /tutor/{tutorId}
        const tutorProfileDeepLink = `/tutor/${tutorId}`;

        const title = bookingType === 'trial'
          ? '⏰ Complete Your Trial Booking'
          : '⏰ Complete Your Booking Request';
        const message = bookingType === 'trial'
          ? `You started booking a trial session with ${tutorName}${subject ? ` for ${subject}` : ''}. Complete your booking to secure your spot!`
          : `You started booking sessions with ${tutorName}${subject ? ` for ${subject}` : ''}. Complete your booking request to get started!`;

        // Create in-app notification
        const notificationData = {
          user_id: userId,
          type: 'abandoned_booking_reminder',
          notification_type: 'abandoned_booking_reminder',
          title,
          message,
          priority: 'normal',
          is_read: false,
          action_url: tutorProfileDeepLink,
          action_text: 'View Tutor Profile',
          icon: '⏰',
          metadata: {
            tutor_id: tutorId,
            tutor_name: tutorName,
            booking_type: bookingType,
            tutor_profile_deep_link: tutorProfileDeepLink,
            abandoned_booking_id: booking.id,
            ...(subject && { subject }),
          },
        };

        const { data: notification, error: notifError } = await supabase
          .from('notifications')
          .insert(notificationData)
          .select()
          .maybeSingle();

        if (notifError) {
          throw new Error(`Failed to create in-app notification: ${notifError.message}`);
        }

        // Send email notification
        if (notification) {
          try {
            const userProfile = booking.user as any;
            const userEmail = userProfile?.email;
            const userName = userProfile?.full_name || 'User';

            if (userEmail) {
              await sendNotificationEmail({
                recipientEmail: userEmail,
                recipientName: userName,
                subject: title,
                title,
                message,
                actionUrl: tutorProfileDeepLink,
                actionText: 'View Tutor Profile',
              });
            }
          } catch (emailError: any) {
            console.error(`⚠️ Failed to send email for abandoned booking ${booking.id}:`, emailError);
            // Don't fail the whole process if email fails
          }

          // Send push notification
          try {
            const { sendPushNotification } = await import('@/lib/services/firebase-admin');
            await sendPushNotification({
              userId,
              title,
              body: message,
              data: {
                notificationId: notification.id,
                type: 'abandoned_booking_reminder',
                actionUrl: tutorProfileDeepLink,
              },
              priority: 'normal',
            });
          } catch (pushError: any) {
            console.error(`⚠️ Failed to send push notification for abandoned booking ${booking.id}:`, pushError);
            // Don't fail the whole process if push fails
          }
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('abandoned_bookings')
          .update({
            reminder_sent_at: new Date().toISOString(),
            reminder_count: 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id);

        if (updateError) {
          throw new Error(`Failed to mark reminder as sent: ${updateError.message}`);
        }

        processed++;
        console.log(`✅ Sent reminder for abandoned booking: ${booking.id} (${bookingType})`);
      } catch (e: any) {
        failed++;
        const errorMsg = e?.message || String(e);
        errors.push(`Booking ${booking.id}: ${errorMsg}`);
        console.error(`❌ Error processing abandoned booking ${booking.id}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      total: abandonedBookings.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e: any) {
    console.error('❌ Error in process-abandoned-booking-reminders:', e);
    return NextResponse.json(
      {
        error: 'Failed to process abandoned booking reminders',
        details: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}
