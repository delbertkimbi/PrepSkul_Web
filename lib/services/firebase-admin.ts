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
}: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: 'normal' | 'high';
}): Promise<{ success: boolean; sent: number; errors: number }> {
  try {
    // Initialize and get admin module
    const admin = await initializeFirebaseAdmin();

    if (!admin || admin.apps.length === 0) {
      console.warn('⚠️ Firebase Admin not initialized - skipping push notification');
      return { success: false, sent: 0, errors: 0 };
    }

    // Get FCM tokens from Supabase
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();

    const { data: tokens, error } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching FCM tokens:', error);
      return { success: false, sent: 0, errors: 0 };
    }

    if (!tokens || tokens.length === 0) {
      console.log(`ℹ️ No FCM tokens found for user ${userId}`);
      return { success: true, sent: 0, errors: 0 };
    }

    // Prepare notification payload
    const message = {
      notification: {
        title,
        body,
      },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ) : undefined,
      android: {
        priority: priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: 'default',
          channelId: 'prepskul_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      tokens: tokens.map(t => t.token as string),
    };

    // Send notification
    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(`✅ Push notification sent: ${response.successCount} successful, ${response.failureCount} failed`);

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


























