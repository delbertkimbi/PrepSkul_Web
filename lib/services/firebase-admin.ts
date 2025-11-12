/**
 * Firebase Admin SDK Service
 * 
 * Initializes Firebase Admin for server-side operations
 * Used for sending push notifications via FCM
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin
let firebaseAdmin: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  // Check if Firebase Admin is already initialized
  if (admin.apps.length > 0) {
    firebaseAdmin = admin.apps[0] as admin.app.App;
    return firebaseAdmin;
  }

  // Initialize Firebase Admin
  // Option 1: Use service account key from environment variable (JSON string)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      console.log('✅ Firebase Admin initialized from service account key');
      return firebaseAdmin;
    } catch (error) {
      console.error('❌ Error parsing Firebase service account key:', error);
    }
  }

  // Option 2: Use service account file path
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    try {
      // Read the file and parse JSON
      const fs = require('fs');
      const path = require('path');
      const filePath = path.resolve(process.cwd(), serviceAccountPath);
      const serviceAccountJson = fs.readFileSync(filePath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountJson);
      
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      console.log('✅ Firebase Admin initialized from service account file');
      return firebaseAdmin;
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin from file:', error);
    }
  }

  // Option 3: Use default credentials (for Google Cloud environments)
  try {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('✅ Firebase Admin initialized with default credentials');
    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    // Don't throw - allow the app to continue without push notifications
    // Push notifications will fail gracefully
    throw new Error('Firebase Admin initialization failed. Please provide FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH environment variable.');
  }
}

/**
 * Send push notification via FCM
 */
export async function sendPushNotification(
  fcmToken: string,
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>,
  options?: {
    sound?: string;
    priority?: 'normal' | 'high';
    badge?: number;
  },
): Promise<string> {
  try {
    const admin = getFirebaseAdmin();
    const messaging = admin.messaging();

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ) : undefined,
      android: {
        priority: options?.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: options?.sound || 'default',
          channelId: 'prepskul_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: options?.sound || 'default',
            badge: options?.badge,
          },
        },
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: '/icon-192x192.png',
        },
      },
    };

    const response = await messaging.send(message);
    console.log('✅ Push notification sent successfully:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error sending push notification:', error);
    
    // Handle invalid token errors
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      console.log('⚠️ Invalid FCM token, should be deactivated:', fcmToken);
      // You can return a special error code to handle token cleanup
      throw new Error('INVALID_TOKEN');
    }
    
    throw error;
  }
}

/**
 * Send push notification to multiple tokens
 */
export async function sendPushNotificationToMultiple(
  fcmTokens: string[],
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>,
  options?: {
    sound?: string;
    priority?: 'normal' | 'high';
    badge?: number;
  },
): Promise<admin.messaging.BatchResponse> {
  try {
    const admin = getFirebaseAdmin();
    const messaging = admin.messaging();

    const message: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ) : undefined,
      android: {
        priority: options?.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: options?.sound || 'default',
          channelId: 'prepskul_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: options?.sound || 'default',
            badge: options?.badge,
          },
        },
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: '/icon-192x192.png',
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`✅ Push notifications sent: ${response.successCount}/${fcmTokens.length} successful`);
    
    // Handle invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (error?.code === 'messaging/invalid-registration-token' || 
              error?.code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(fcmTokens[idx]);
          }
        }
      });
      
      if (invalidTokens.length > 0) {
        console.log(`⚠️ Found ${invalidTokens.length} invalid tokens that should be deactivated`);
        // TODO: Deactivate invalid tokens in database
      }
    }
    
    return response;
  } catch (error: any) {
    console.error('❌ Error sending push notifications:', error);
    throw error;
  }
}
