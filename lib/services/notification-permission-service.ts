import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateSessionAccess } from '@/lib/services/agora/session-service';

/**
 * Notification Permission Service
 * 
 * Validates whether a user should receive a notification based on:
 * - Role (tutor vs student)
 * - Relationship to content (session, booking, etc.)
 * - Privacy/permissions
 * - Notification preferences
 * - Status (don't notify about completed/archived items)
 */

interface NotificationPermissionCheck {
  userId: string;
  type: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
}

/**
 * Check if user should receive a notification
 */
export async function shouldReceiveNotification({
  userId,
  type,
  metadata,
  actionUrl,
}: NotificationPermissionCheck): Promise<{ allowed: boolean; reason?: string }> {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // 1. Get user profile to check role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_type')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      return { allowed: false, reason: 'User profile not found' };
    }

    const userRole = profile.user_type as string | null;

    // 2. Role-based filtering
    const roleFilterResult = checkRoleBasedPermissions(type, userRole);
    if (!roleFilterResult.allowed) {
      return roleFilterResult;
    }

    // 3. Relationship-based filtering (session, booking, etc.)
    const relationshipResult = await checkRelationshipPermissions({
      userId,
      type,
      metadata,
      actionUrl,
      supabaseAdmin,
    });
    if (!relationshipResult.allowed) {
      return relationshipResult;
    }

    // 4. Status-based filtering (don't notify about completed/archived items)
    const statusResult = await checkStatusPermissions({
      type,
      metadata,
      supabaseAdmin,
    });
    if (!statusResult.allowed) {
      return statusResult;
    }

    // 5. Notification preferences check
    const preferencesResult = await checkNotificationPreferences({
      userId,
      type,
      supabaseAdmin,
    });
    if (!preferencesResult.allowed) {
      return preferencesResult;
    }

    return { allowed: true };
  } catch (error: any) {
    console.error('Error checking notification permissions:', error);
    // Fail open - allow notification if check fails (better UX than blocking)
    return { allowed: true };
  }
}

/**
 * Check role-based permissions
 */
function checkRoleBasedPermissions(
  notificationType: string,
  userRole: string | null
): { allowed: boolean; reason?: string } {
  // Tutor-specific notification types
  const tutorOnlyTypes = [
    'profile_approved',
    'profile_rejected',
    'profile_improvement',
    'profile_complete',
    'earnings_added',
    'earnings_activated',
    'payout_status',
    'tutor_request_matched',
  ];

  // Student-specific notification types
  const studentOnlyTypes = [
    'trial_payment_completed',
    'trial_payment_failed',
    'payment_request_paid',
    'payment_request_failed',
  ];

  // Check tutor-only types
  if (tutorOnlyTypes.includes(notificationType)) {
    if (userRole !== 'tutor') {
      return {
        allowed: false,
        reason: `Notification type '${notificationType}' is tutor-only`,
      };
    }
  }

  // Check student-only types
  if (studentOnlyTypes.includes(notificationType)) {
    if (userRole !== 'student' && userRole !== 'parent') {
      return {
        allowed: false,
        reason: `Notification type '${notificationType}' is student-only`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Check relationship-based permissions
 * Ensures users only get notifications about content they're part of
 */
async function checkRelationshipPermissions({
  userId,
  type,
  metadata,
  actionUrl,
  supabaseAdmin,
}: {
  userId: string;
  type: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  supabaseAdmin: any;
}): Promise<{ allowed: boolean; reason?: string }> {
  // Session-related notifications
  if (type.includes('session') || metadata?.session_id) {
    const sessionId = metadata?.session_id || extractIdFromUrl(actionUrl, 'sessions');
    if (sessionId) {
      const hasAccess = await validateSessionAccess(sessionId, userId, supabaseAdmin);
      if (!hasAccess) {
        return {
          allowed: false,
          reason: `User does not have access to session ${sessionId}`,
        };
      }
    }
  }

  // Booking-related notifications
  if (type.includes('booking') || metadata?.booking_id || metadata?.booking_request_id) {
    const bookingId =
      metadata?.booking_id ||
      metadata?.booking_request_id ||
      extractIdFromUrl(actionUrl, 'bookings');
    if (bookingId) {
      const hasAccess = await checkBookingAccess(bookingId, userId, supabaseAdmin);
      if (!hasAccess) {
        return {
          allowed: false,
          reason: `User does not have access to booking ${bookingId}`,
        };
      }
    }
  }

  // Payment-related notifications
  if (type.includes('payment') || metadata?.payment_id) {
    const paymentId = metadata?.payment_id || extractIdFromUrl(actionUrl, 'payments');
    if (paymentId) {
      const hasAccess = await checkPaymentAccess(paymentId, userId, supabaseAdmin);
      if (!hasAccess) {
        return {
          allowed: false,
          reason: `User does not have access to payment ${paymentId}`,
        };
      }
    }
  }

  // Trial session notifications
  if (type.includes('trial') || metadata?.trial_session_id) {
    const trialId = metadata?.trial_session_id || extractIdFromUrl(actionUrl, 'trials');
    if (trialId) {
      const hasAccess = await checkTrialAccess(trialId, userId, supabaseAdmin);
      if (!hasAccess) {
        return {
          allowed: false,
          reason: `User does not have access to trial session ${trialId}`,
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Check status-based permissions
 * Don't notify about completed/archived/cancelled items
 */
async function checkStatusPermissions({
  type,
  metadata,
  supabaseAdmin,
}: {
  type: string;
  metadata?: Record<string, any>;
  supabaseAdmin: any;
}): Promise<{ allowed: boolean; reason?: string }> {
  // Check session status
  if (metadata?.session_id) {
    const { data: session } = await supabaseAdmin
      .from('individual_sessions')
      .select('status')
      .eq('id', metadata.session_id)
      .maybeSingle();

    if (session && ['cancelled', 'archived'].includes(session.status)) {
      return {
        allowed: false,
        reason: `Session is ${session.status}`,
      };
    }
  }

  // Check booking status
  if (metadata?.booking_request_id) {
    const { data: booking } = await supabaseAdmin
      .from('booking_requests')
      .select('status')
      .eq('id', metadata.booking_request_id)
      .maybeSingle();

    if (booking && ['cancelled', 'archived'].includes(booking.status)) {
      return {
        allowed: false,
        reason: `Booking is ${booking.status}`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Check notification preferences
 */
async function checkNotificationPreferences({
  userId,
  type,
  supabaseAdmin,
}: {
  userId: string;
  type: string;
  supabaseAdmin: any;
}): Promise<{ allowed: boolean; reason?: string }> {
  const { data: preferences } = await supabaseAdmin
    .from('notification_preferences')
    .select('in_app_enabled, type_preferences')
    .eq('user_id', userId)
    .maybeSingle();

  // If no preferences, allow (default is enabled)
  if (!preferences) {
    return { allowed: true };
  }

  // Check if in-app notifications are disabled globally
  if (preferences.in_app_enabled === false) {
    return {
      allowed: false,
      reason: 'In-app notifications are disabled',
    };
  }

  // Check type-specific preferences
  if (preferences.type_preferences) {
    const typePref = preferences.type_preferences[type];
    if (typePref && typePref.in_app === false) {
      return {
        allowed: false,
        reason: `Notification type '${type}' is disabled in preferences`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Helper: Extract ID from action URL
 */
function extractIdFromUrl(url: string | undefined, pathSegment: string): string | null {
  if (!url) return null;
  try {
    const match = url.match(new RegExp(`/${pathSegment}/([^/]+)`));
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Check if user has access to a booking
 */
async function checkBookingAccess(
  bookingId: string,
  userId: string,
  supabaseAdmin: any
): Promise<boolean> {
  const { data: booking } = await supabaseAdmin
    .from('booking_requests')
    .select('tutor_id, student_id, parent_id')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) return false;

  return (
    booking.tutor_id === userId ||
    booking.student_id === userId ||
    booking.parent_id === userId
  );
}

/**
 * Check if user has access to a payment
 */
async function checkPaymentAccess(
  paymentId: string,
  userId: string,
  supabaseAdmin: any
): Promise<boolean> {
  // Check session_payments
  const { data: sessionPayment } = await supabaseAdmin
    .from('session_payments')
    .select('session_id')
    .eq('id', paymentId)
    .maybeSingle();

  if (sessionPayment) {
    return validateSessionAccess(sessionPayment.session_id, userId, supabaseAdmin);
  }

  // Check payment_requests
  const { data: paymentRequest } = await supabaseAdmin
    .from('payment_requests')
    .select('student_id, tutor_id')
    .eq('id', paymentId)
    .maybeSingle();

  if (paymentRequest) {
    return (
      paymentRequest.student_id === userId || paymentRequest.tutor_id === userId
    );
  }

  return false;
}

/**
 * Check if user has access to a trial session
 */
async function checkTrialAccess(
  trialId: string,
  userId: string,
  supabaseAdmin: any
): Promise<boolean> {
  const { data: trial } = await supabaseAdmin
    .from('trial_sessions')
    .select('tutor_id, learner_id, parent_id')
    .eq('id', trialId)
    .maybeSingle();

  if (!trial) return false;

  return (
    trial.tutor_id === userId ||
    trial.learner_id === userId ||
    trial.parent_id === userId
  );
}

