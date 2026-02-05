# Testing Push Notifications

Complete guide for testing Firebase Cloud Messaging (FCM) push notifications.

---

## Prerequisites ✅

Before testing push notifications, ensure:

1. **Firebase Admin SDK is installed:**
   ```bash
   npm install firebase-admin
   # or
   pnpm add firebase-admin
   ```

2. **Firebase Service Account Key is configured:**
   - Get your Firebase service account JSON from Firebase Console
   - Set environment variable: `FIREBASE_SERVICE_ACCOUNT_KEY` (as JSON string)
   - Or use `GOOGLE_APPLICATION_CREDENTIALS` pointing to the JSON file

3. **User has FCM token registered:**
   - User must have logged into the mobile app
   - Mobile app must register FCM token in `fcm_tokens` table
   - Token must be active (`is_active = true`)

---

## Step 1: Verify Firebase Configuration 🔧

### Check Environment Variables

```bash
# Check if Firebase Admin is configured
echo $FIREBASE_SERVICE_ACCOUNT_KEY | jq .project_id

# Or if using file path
cat $GOOGLE_APPLICATION_CREDENTIALS | jq .project_id
```

### Verify Firebase Admin Initialization

Check server logs when sending a notification. You should see:
- ✅ `Firebase Admin initialized successfully` (if configured)
- ⚠️ `FIREBASE_SERVICE_ACCOUNT_KEY not set - push notifications disabled` (if not configured)
- ⚠️ `firebase-admin not installed` (if package missing)

---

## Step 2: Check User Has FCM Token 📱

### Query FCM Tokens from Database

```sql
-- Check if user has active FCM tokens
SELECT 
  user_id,
  token,
  device_type,
  is_active,
  created_at,
  updated_at
FROM fcm_tokens
WHERE user_id = 'USER_UUID_HERE'
  AND is_active = true;
```

### Via Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor → `fcm_tokens`
2. Filter by `user_id` = your test user ID
3. Verify `is_active` = `true`

### Via API (if you have an endpoint)

```bash
# Check user's FCM tokens
curl https://your-domain.com/api/admin/users/USER_ID/fcm-tokens \
  -H "Cookie: your-session-cookie"
```

---

## Step 3: Register FCM Token (Mobile App) 📲

If testing with a real device, the mobile app should register the token:

### Flutter Example (from mobile app)

```dart
// In your Flutter app
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> registerFCMToken() async {
  final fcmToken = await FirebaseMessaging.instance.getToken();
  
  if (fcmToken != null) {
    // Register token with your backend
    await supabase
      .from('fcm_tokens')
      .upsert({
        'user_id': currentUserId,
        'token': fcmToken,
        'device_type': Platform.isAndroid ? 'android' : 'ios',
        'is_active': true,
      });
  }
}
```

---

## Step 4: Send Test Push Notification 🚀

### Method 1: Admin UI

1. Navigate to: `https://your-domain.com/admin/notifications/send`
2. Select a user with FCM token registered
3. Fill in notification form
4. **Toggle "Send Push" to ON** ✅
5. Click "Send Notification"
6. Check response - should show push notification sent count

### Method 2: API with cURL

```bash
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "userId": "USER_UUID_HERE",
    "type": "test",
    "title": "Push Notification Test",
    "message": "Testing push notifications!",
    "priority": "high",
    "sendEmail": false,
    "sendPush": true,
    "actionUrl": "prepskul://notifications/test",
    "actionText": "Open App"
  }'
```

### Method 3: Browser Console

```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    userId: 'USER_UUID_HERE',
    type: 'test',
    title: 'Push Test',
    message: 'Testing push from browser!',
    priority: 'high',
    sendEmail: false,
    sendPush: true  // ← Enable push
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Response:', data);
  if (data.channels?.push) {
    console.log('Push sent:', data.channels.push.sent);
    console.log('Push errors:', data.channels.push.errors);
  }
});
```

---

## Step 5: Verify Push Notification 📬

### Check API Response

Successful response should include:

```json
{
  "success": true,
  "notificationId": "uuid-here",
  "channels": {
    "inApp": { "success": true, "notificationId": "uuid" },
    "email": { "success": false, "sent": false },
    "push": {
      "success": true,
      "sent": 1,        // ← Number of devices notified
      "errors": 0       // ← Number of failed sends
    }
  }
}
```

### Check Server Logs

Look for:
- ✅ `Push notification sent: 1 successful, 0 failed`
- ⚠️ `No FCM tokens found for user USER_ID` (user has no tokens)
- ⚠️ `Firebase Admin not initialized` (Firebase not configured)
- ❌ `Error sending push notification: ...` (error details)

### Check Mobile Device

1. **Device should receive notification:**
   - Notification appears in notification tray
   - Sound plays (if enabled)
   - Badge count updates (iOS)
   - Rich image displays (if `imageUrl` provided)

2. **Tapping notification:**
   - Opens app (if `actionUrl` provided, navigates to that)
   - App handles notification data

---

## Testing Different Scenarios 🧪

### Test 1: Basic Push Notification

```bash
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "title": "Hello!",
    "message": "This is a test push notification",
    "sendPush": true
  }'
```

**Expected:** Notification appears on device

---

### Test 2: High Priority Push

```bash
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "title": "Urgent!",
    "message": "High priority notification",
    "priority": "high",
    "sendPush": true
  }'
```

**Expected:** Notification appears immediately, even if device is in Do Not Disturb

---

### Test 3: Push with Rich Image

```bash
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "title": "New Message",
    "message": "You have a new message",
    "imageUrl": "https://your-domain.com/avatars/user.jpg",
    "sendPush": true
  }'
```

**Expected:** Notification shows image preview

---

### Test 4: Push with Action Button

```bash
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "title": "Booking Accepted",
    "message": "Your booking has been accepted",
    "actionUrl": "prepskul://bookings/123",
    "actionText": "View Booking",
    "sendPush": true
  }'
```

**Expected:** Notification has action button that opens deep link

---

### Test 5: Multiple Devices (Same User)

If user has multiple devices with FCM tokens:

```bash
# Send notification
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "title": "Multi-Device Test",
    "message": "This should appear on all your devices",
    "sendPush": true
  }'
```

**Expected:** 
- Response shows `"sent": 2` (or number of active tokens)
- All devices receive notification

---

## Troubleshooting 🔍

### Issue: "No FCM tokens found for user"

**Solution:**
1. Verify user logged into mobile app
2. Check `fcm_tokens` table for user's tokens
3. Ensure tokens are active (`is_active = true`)
4. Re-register token from mobile app

**Query to check:**
```sql
SELECT * FROM fcm_tokens 
WHERE user_id = 'USER_ID' 
ORDER BY created_at DESC;
```

---

### Issue: "Firebase Admin not initialized"

**Solution:**
1. Install firebase-admin: `pnpm add firebase-admin`
2. Set `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable
3. Verify JSON is valid: `echo $FIREBASE_SERVICE_ACCOUNT_KEY | jq .`
4. Restart server

**Check logs:**
- Look for initialization errors
- Verify service account has correct permissions

---

### Issue: "Push sent: 0 successful, 1 failed"

**Possible causes:**
1. **Invalid FCM token** - Token expired or app uninstalled
   - Solution: Token will be auto-deactivated, user needs to re-register

2. **Firebase quota exceeded** - Too many notifications sent
   - Solution: Wait and retry, or upgrade Firebase plan

3. **Invalid payload** - Notification data too large
   - Solution: Reduce payload size, check data field sizes

**Check failed token:**
```sql
-- Find recently deactivated tokens
SELECT * FROM fcm_tokens 
WHERE is_active = false 
  AND updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

---

### Issue: Notification not appearing on device

**Check:**
1. ✅ Device has internet connection
2. ✅ App has notification permissions enabled
3. ✅ Device not in Do Not Disturb mode (for normal priority)
4. ✅ App is not force-stopped
5. ✅ FCM token is valid and active

**Test FCM token directly:**
```bash
# Use Firebase Console → Cloud Messaging → Send test message
# Or use Firebase Admin SDK directly
```

---

### Issue: Rich image not showing

**Check:**
1. Image URL is publicly accessible (not behind auth)
2. Image URL uses HTTPS
3. Image format is supported (JPEG, PNG)
4. Image size is reasonable (< 5MB recommended)

**Test image URL:**
```bash
curl -I https://your-domain.com/image.jpg
# Should return 200 OK
```

---

## Testing Checklist ✅

- [ ] Firebase Admin SDK installed
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable set
- [ ] User has at least one active FCM token
- [ ] Sent test push notification via API
- [ ] Verified API response shows `push.sent > 0`
- [ ] Notification appeared on device
- [ ] Notification sound played (if enabled)
- [ ] Tapping notification opens app
- [ ] Deep link works (if `actionUrl` provided)
- [ ] Rich image displays (if `imageUrl` provided)
- [ ] Multiple devices receive notification (if user has multiple tokens)
- [ ] Failed tokens are deactivated automatically

---

## Quick Test Script 🚀

Save as `test-push.sh`:

```bash
#!/bin/bash

# Configuration
DOMAIN="https://your-domain.com"
USER_ID="USER_UUID_HERE"
SESSION_COOKIE="your-session-cookie"

echo "🧪 Testing Push Notifications..."
echo ""

# Send push notification
RESPONSE=$(curl -s -X POST "${DOMAIN}/api/notifications/send" \
  -H "Content-Type: application/json" \
  -H "Cookie: ${SESSION_COOKIE}" \
  -d "{
    \"userId\": \"${USER_ID}\",
    \"type\": \"test\",
    \"title\": \"Push Test\",
    \"message\": \"Testing push notifications!\",
    \"priority\": \"high\",
    \"sendEmail\": false,
    \"sendPush\": true
  }")

echo "📤 Response:"
echo "$RESPONSE" | jq .

# Extract push results
PUSH_SENT=$(echo "$RESPONSE" | jq -r '.channels.push.sent // 0')
PUSH_ERRORS=$(echo "$RESPONSE" | jq -r '.channels.push.errors // 0')

echo ""
if [ "$PUSH_SENT" -gt 0 ]; then
  echo "✅ Push notification sent successfully to $PUSH_SENT device(s)"
else
  echo "❌ Push notification failed or no tokens found"
  echo "   Errors: $PUSH_ERRORS"
fi

echo ""
echo "📱 Check your device for the notification!"
```

Make executable:
```bash
chmod +x test-push.sh
./test-push.sh
```

---

## Advanced: Testing with Firebase Console 🔥

You can also test directly from Firebase Console:

1. Go to Firebase Console → Cloud Messaging
2. Click "Send test message"
3. Enter FCM token (from `fcm_tokens` table)
4. Enter notification title and message
5. Click "Test"

This bypasses your API and tests FCM directly.

---

## Monitoring Push Notifications 📊

### Check Notification Analytics

```bash
curl https://your-domain.com/api/notifications/analytics \
  -H "Cookie: your-session-cookie"
```

### Monitor Server Logs

Watch for:
- Push notification success/failure counts
- FCM token registration/deactivation
- Firebase initialization errors

### Firebase Console Metrics

Check Firebase Console → Cloud Messaging → Reports for:
- Messages sent
- Messages delivered
- Open rates
- Error rates

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `No FCM tokens found` | User has no active tokens | Register token from mobile app |
| `Firebase Admin not initialized` | Firebase not configured | Set `FIREBASE_SERVICE_ACCOUNT_KEY` |
| `firebase-admin not installed` | Package missing | Run `pnpm add firebase-admin` |
| `Invalid registration token` | Token expired/invalid | Token auto-deactivated, re-register |
| `MismatchSenderId` | Wrong Firebase project | Check service account matches project |
| `MessageTooBig` | Payload too large | Reduce notification data size |

---

## Next Steps 🎯

After successful testing:

1. ✅ Monitor push notification delivery rates
2. ✅ Set up error alerts for failed pushes
3. ✅ Implement retry logic for failed notifications
4. ✅ Add analytics tracking for push opens
5. ✅ Test on both Android and iOS devices
6. ✅ Test with different notification priorities
7. ✅ Test quiet hours behavior
