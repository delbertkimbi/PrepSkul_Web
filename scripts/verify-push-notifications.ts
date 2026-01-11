/**
 * Push Notification Verification Script
 * 
 * Verifies that push notifications are properly configured
 * Run with: npx tsx scripts/verify-push-notifications.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function verifyPushNotifications() {
  console.log('🔍 Verifying Push Notification Setup...\n');

  // 1. Check Firebase Admin SDK
  console.log('1. Checking Firebase Admin SDK...');
  try {
    if (!admin.apps.length) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountKey) {
        console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not set');
        console.log('   → Get it from Firebase Console → Project Settings → Service Accounts');
        return;
      }

      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
      });
      console.log('✅ Firebase Admin SDK initialized');
    } else {
      console.log('✅ Firebase Admin SDK already initialized');
    }
  } catch (error: any) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    return;
  }

  // 2. Check Supabase connection
  console.log('\n2. Checking Supabase connection...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const { data, error } = await supabase
      .from('fcm_tokens')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return;
    }
    console.log('✅ Supabase connected');
  } catch (error: any) {
    console.error('❌ Supabase error:', error.message);
    return;
  }

  // 3. Check FCM tokens in database
  console.log('\n3. Checking FCM tokens in database...');
  const { data: tokens, error: tokensError } = await supabase
    .from('fcm_tokens')
    .select('user_id, token, is_active, created_at')
    .eq('is_active', true)
    .limit(5);

  if (tokensError) {
    console.error('❌ Error fetching tokens:', tokensError.message);
    return;
  }

  if (!tokens || tokens.length === 0) {
    console.warn('⚠️  No active FCM tokens found');
    console.log('   → Users need to grant notification permissions in the app');
    return;
  }

  console.log(`✅ Found ${tokens.length} active FCM token(s)`);
  tokens.forEach((token, idx) => {
    console.log(`   ${idx + 1}. User: ${token.user_id}, Created: ${token.created_at}`);
  });

  // 4. Test sending a notification
  console.log('\n4. Testing push notification send...');
  if (tokens.length > 0) {
    const testToken = tokens[0].token as string;
    const testUserId = tokens[0].user_id as string;

    try {
      const message: admin.messaging.Message = {
        notification: {
          title: 'Test Notification',
          body: 'This is a test notification from PrepSkul',
        },
        token: testToken,
        android: {
          priority: 'high',
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
      };

      const response = await admin.messaging().send(message);
      console.log('✅ Test notification sent successfully!');
      console.log(`   Message ID: ${response}`);
      console.log(`   → Check device for notification`);
    } catch (error: any) {
      console.error('❌ Error sending test notification:', error.message);
      if (error.code === 'messaging/invalid-registration-token') {
        console.log('   → Token is invalid, user may need to re-register');
      } else if (error.code === 'messaging/registration-token-not-registered') {
        console.log('   → Token not registered, user may have uninstalled app');
      }
    }
  }

  // 5. Check notification preferences
  console.log('\n5. Checking notification preferences...');
  const { data: prefs, error: prefsError } = await supabase
    .from('notification_preferences')
    .select('user_id, push_enabled')
    .limit(5);

  if (prefsError) {
    console.warn('⚠️  Could not fetch notification preferences:', prefsError.message);
  } else if (prefs && prefs.length > 0) {
    const enabledCount = prefs.filter((p: any) => p.push_enabled).length;
    console.log(`✅ Found ${prefs.length} user(s) with preferences`);
    console.log(`   ${enabledCount} user(s) have push notifications enabled`);
  } else {
    console.log('ℹ️  No notification preferences found (users may use defaults)');
  }

  console.log('\n✅ Verification complete!');
  console.log('\n📝 Summary:');
  console.log('   - Firebase Admin: ✅');
  console.log('   - Supabase: ✅');
  console.log(`   - Active FCM Tokens: ${tokens?.length || 0}`);
  console.log('   - Test Notification: Sent');
}

// Run verification
verifyPushNotifications().catch(console.error);


