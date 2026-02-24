/**
 * Firebase Admin Service
 * 
 * Handles push notifications via Firebase Cloud Messaging
 * Uses Firebase Admin SDK to send notifications to devices
 * 
 * NOTE: This module is optional - if firebase-admin is not installed,
 * push notifications will be skipped gracefully.
 */

let firebaseAdminInitialized = false;
let adminModule: typeof import('firebase-admin') | null = null;

/**
 * Initialize Firebase Admin SDK
 * Uses dynamic import to avoid build issues
 */
async function initializeFirebaseAdmin(): Promise<typeof import('firebase-admin') | null> {
  if (firebaseAdminInitialized && adminModule) {
    return adminModule;
  }

  try {
    // Dynamically import firebase-admin
    if (!adminModule) {
      try {
        adminModule = await import('firebase-admin');
      } catch (importError: any) {
        console.warn('⚠️ firebase-admin not installed:', importError.message);
        firebaseAdminInitialized = true;
        return null;
      }
    }

    // Check if already initialized
    if (adminModule.apps.length > 0) {
      firebaseAdminInitialized = true;
      return adminModule;
    }

    // Get service account key from environment
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not set - push notifications disabled');
      firebaseAdminInitialized = true;
      return null;
    }

    // Parse service account key
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (e) {
      console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', e);
      firebaseAdminInitialized = true;
      return null;
    }

    // Initialize Firebase Admin
    adminModule.initializeApp({
      credential: adminModule.credential.cert(serviceAccount as import('firebase-admin').ServiceAccount),
    });

    firebaseAdminInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
    return adminModule;
  } catch (error: any) {
    console.error('❌ Error initializing Firebase Admin:', error);
    firebaseAdminInitialized = true;
    return null;
  }
}

/**
 * Send push notification to user
 * 
 * Gets FCM tokens from Supabase and sends notification via Firebase Admin SDK
 */
export async function sendPushNotification({
  userId,
  title,
  body,
  data,
  priority = 'normal',
  imageUrl,
}: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: 'normal' | 'high';
  imageUrl?: string;
}): Promise<{ success: boolean; sent: number; errors: number }> {
  try {
    const type = (data as any)?.type ? String((data as any).type) : 'general';
    try {
      const titlePreview = String(title ?? '').slice(0, 80);
      console.log(
        `ℹ️ PUSH attempt user=${userId} type=${type} priority=${priority} title="${titlePreview}"`
      );
    } catch {
      // ignore
    }

    // Initialize and get admin module
    const admin = await initializeFirebaseAdmin();

    if (!admin || admin.apps.length === 0) {
      console.warn('⚠️ Firebase Admin not initialized - skipping push notification');
      return { success: false, sent: 0, errors: 0 };
    }

    // Get FCM tokens from Supabase (service role; bypass RLS)
    // This route runs server-to-server, so relying on cookie/session auth will often return 0 rows.
    const { getSupabaseAdmin } = await import('@/lib/supabase-admin');
    const supabase = getSupabaseAdmin();

    // Fetch tokens with helpful device metadata (fallback to token-only if schema differs)
    let tokens: any[] | null = null;
    let error: any | null = null;
    {
      const rich = await supabase
        .from('fcm_tokens')
        .select('token, platform, device_name, app_version, updated_at')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (rich.error) {
        // Some older schemas may not have these optional columns.
        const fallback = await supabase
          .from('fcm_tokens')
          .select('token')
          .eq('user_id', userId)
          .eq('is_active', true);
        tokens = fallback.data as any[] | null;
        error = fallback.error;
      } else {
        tokens = rich.data as any[] | null;
        error = rich.error;
      }
    }

    if (error) {
      console.error('❌ Error fetching FCM tokens:', error);
      return { success: false, sent: 0, errors: 0 };
    }

    // Helpful diagnostics (safe): confirms which Supabase project this deployment uses.
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const ref = supabaseUrl.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1] || 'unknown-ref';
      console.log(`ℹ️ FCM token lookup: user=${userId} tokens=${tokens?.length ?? 0} supabase_ref=${ref}`);
    } catch {
      // ignore logging failures
    }

    if (!tokens || tokens.length === 0) {
      console.log(`ℹ️ PUSH skipped user=${userId} type=${type} reason=no_tokens`);
      return { success: true, sent: 0, errors: 0 };
    }

    // Log which devices/tokens we are targeting (safe: only suffix).
    try {
      const summary = tokens
        .map((t) => {
          const tok = String((t as any)?.token ?? '');
          const suffix = tok.length > 10 ? tok.slice(-10) : tok;
          const platform = (t as any)?.platform ? String((t as any).platform) : 'unknown';
          const deviceName = (t as any)?.device_name ? String((t as any).device_name) : 'unknown-device';
          const appVersion = (t as any)?.app_version ? String((t as any).app_version) : '';
          const updatedAt = (t as any)?.updated_at ? String((t as any).updated_at) : '';
          return `${platform}/${deviceName}${appVersion ? `@${appVersion}` : ''}${updatedAt ? ` (${updatedAt})` : ''} …${suffix}`;
        })
        .join(' | ');
      console.log(`ℹ️ PUSH targets user=${userId} count=${tokens.length} ${summary}`);
    } catch {
      // ignore
    }

    // Prepare notification payload with rich image support
    const notificationPayload: import('firebase-admin').messaging.Notification = {
      title,
      body,
      ...(imageUrl ? { imageUrl } : {}), // Rich notification image (Android & iOS)
    };

    // WhatsApp-style collapse/grouping:
    // Keep only ONE system notification per conversation (or per entity),
    // replacing older ones instead of stacking duplicates.
    const actionUrl = (data as any)?.actionUrl ? String((data as any).actionUrl) : '';
    const conversationIdFromData =
      (data as any)?.conversation_id ? String((data as any).conversation_id) : '';
    const conversationIdFromActionUrl = (() => {
      const m = actionUrl.match(/\/messages\/([^/?#]+)/i);
      return m?.[1] || '';
    })();
    const collapseId =
      type === 'message'
        ? `msg_${conversationIdFromData || conversationIdFromActionUrl || 'inbox'}`
        : (data as any)?.session_id
          ? `sess_${String((data as any).session_id)}`
          : (data as any)?.booking_id
            ? `book_${String((data as any).booking_id)}`
            : undefined;

    const message: import('firebase-admin').messaging.MulticastMessage = {
      notification: notificationPayload,
      data: data ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ) : undefined,
      android: {
        priority: priority === 'high' ? 'high' : 'normal',
        ...(collapseId ? { collapseKey: collapseId } : {}),
        notification: {
          sound: 'default',
          channelId: 'prepskul_notifications',
          ...(collapseId ? { tag: collapseId } : {}), // replaces previous notification with same tag
          ...(imageUrl ? { imageUrl } : {}), // Android rich notification image
        },
      },
      apns: {
        ...(collapseId ? { headers: { 'apns-collapse-id': collapseId } } : {}),
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'mutable-content': imageUrl ? 1 : undefined, // Enable rich content for iOS
          },
          ...(imageUrl ? { fcm_options: { image: imageUrl } } : {}), // iOS rich notification image
        },
      },
      tokens: tokens.map((t: any) => t.token as string),
    };

    // Send notification
    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(
      `✅ PUSH result user=${userId} type=${type} sent=${response.successCount} errors=${response.failureCount}`
    );

    // Helpful failure diagnostics (safe): which token suffix failed and why.
    if (response.failureCount > 0) {
      try {
        response.responses.forEach((r, idx) => {
          if (r.success) return;
          const tok = String((tokens?.[idx] as any)?.token ?? '');
          const suffix = tok.length > 10 ? tok.slice(-10) : tok;
          const code = (r.error as any)?.code || 'unknown';
          const msg = (r.error as any)?.message || 'unknown';
          console.warn(`⚠️ PUSH failure user=${userId} type=${type} tokenSuffix=…${suffix} code=${code} msg=${msg}`);
        });
      } catch {
        // ignore
      }
    }

    // Deactivate failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx].token as string);
        }
      });

      if (failedTokens.length > 0) {
        await supabase
          .from('fcm_tokens')
          .update({ is_active: false })
          .in('token', failedTokens);
      }
    }

    return {
      success: response.successCount > 0,
      sent: response.successCount,
      errors: response.failureCount,
    };
  } catch (error: any) {
    console.error('❌ Error sending push notification:', error);
    return { success: false, sent: 0, errors: 0 };
  }
}


























