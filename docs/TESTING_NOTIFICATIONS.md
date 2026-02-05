# Testing Notifications After Deployment

This guide shows you how to test the notification system after deployment.

## Method 1: Admin UI (Easiest) 🎯

1. **Navigate to Admin Panel:**
   ```
   https://your-domain.com/admin/notifications/send
   ```

2. **Steps:**
   - Search for a user by name or email
   - Select the user from results
   - Fill in the notification form:
     - **Type**: Choose notification type (e.g., "Test Notification")
     - **Title**: Notification title
     - **Message**: Notification body
     - **Priority**: Low, Normal, High, or Urgent
     - **Send Email**: Toggle to send email notification
     - **Send Push**: Toggle to send push notification (if FCM configured)
     - **Action URL**: Optional deep link or web URL
     - **Action Text**: Button text (e.g., "View Details")
   - Click "Send Notification"

3. **Verify:**
   - Check user's in-app notifications
   - Check email inbox (if email enabled)
   - Check mobile app (if push enabled)

---

## Method 2: API Testing with cURL 🔧

### Basic Test Notification

```bash
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "userId": "USER_UUID_HERE",
    "type": "test",
    "title": "Test Notification",
    "message": "This is a test notification to verify the system is working.",
    "priority": "normal",
    "sendEmail": true,
    "sendPush": false
  }'
```

### With Action Button

```bash
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "userId": "USER_UUID_HERE",
    "type": "booking_accepted",
    "title": "Booking Accepted! 🎉",
    "message": "Your booking request has been accepted by the tutor.",
    "priority": "high",
    "actionUrl": "https://app.prepskul.com/bookings/123",
    "actionText": "View Booking",
    "sendEmail": true,
    "sendPush": true
  }'
```

### With Rich Preview Image

```bash
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "userId": "USER_UUID_HERE",
    "type": "message",
    "title": "New Message",
    "message": "You have a new message from John Doe",
    "priority": "normal",
    "imageUrl": "https://your-domain.com/avatars/john.jpg",
    "metadata": {
      "sender_name": "John Doe",
      "sender_avatar_url": "https://your-domain.com/avatars/john.jpg",
      "message_preview": "Hey, are you available for a session?"
    },
    "actionUrl": "https://app.prepskul.com/messages/123",
    "actionText": "Reply",
    "sendEmail": true
  }'
```

---

## Method 3: Browser Console (Quick Test) 🌐

1. **Open your deployed site** and log in as admin
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Run this code:**

```javascript
// Replace USER_UUID_HERE with actual user ID
fetch('/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies for auth
  body: JSON.stringify({
    userId: 'USER_UUID_HERE',
    type: 'test',
    title: 'Browser Console Test',
    message: 'This notification was sent from the browser console!',
    priority: 'normal',
    sendEmail: true,
    sendPush: false
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Notification sent:', data);
  if (data.success) {
    console.log('Notification ID:', data.notificationId);
    console.log('Channels:', data.channels);
  }
})
.catch(err => console.error('❌ Error:', err));
```

---

## Method 4: Postman/Insomnia 📮

### Setup:
1. Create a new POST request
2. URL: `https://your-domain.com/api/notifications/send`
3. Headers:
   - `Content-Type: application/json`
   - `Cookie: your-session-cookie` (if needed)

### Body (JSON):
```json
{
  "userId": "USER_UUID_HERE",
  "type": "test",
  "title": "Postman Test",
  "message": "Testing notifications via Postman",
  "priority": "normal",
  "sendEmail": true,
  "sendPush": false,
  "actionUrl": "https://app.prepskul.com",
  "actionText": "Open App"
}
```

---

## Method 5: Check Notification Analytics 📊

After sending notifications, check analytics:

```bash
curl https://your-domain.com/api/notifications/analytics \
  -H "Cookie: your-session-cookie"
```

Or visit in browser (as admin):
```
https://your-domain.com/api/notifications/analytics
```

---

## Required Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `userId` | ✅ Yes | string (UUID) | User ID to send notification to |
| `title` | ✅ Yes | string | Notification title |
| `message` | ✅ Yes | string | Notification message body |
| `type` | ❌ No | string | Notification type (default: 'general') |
| `priority` | ❌ No | string | Priority: 'low', 'normal', 'high', 'urgent' |
| `sendEmail` | ❌ No | boolean | Send email notification (default: false) |
| `sendPush` | ❌ No | boolean | Send push notification (default: false) |
| `actionUrl` | ❌ No | string | Deep link or web URL for action button |
| `actionText` | ❌ No | string | Text for action button |
| `imageUrl` | ❌ No | string | Rich preview image URL |
| `metadata` | ❌ No | object | Additional metadata (e.g., sender info) |

---

## Notification Types

Available notification types:
- `admin_message` - Admin announcements
- `booking_request` - New booking request
- `booking_accepted` - Booking accepted
- `booking_rejected` - Booking rejected
- `trial_request` - Trial session request
- `trial_accepted` - Trial accepted
- `trial_rejected` - Trial rejected
- `payment_received` - Payment confirmation
- `payment_failed` - Payment failure
- `session_reminder` - Session reminder
- `session_completed` - Session completed
- `profile_approved` - Profile approved
- `profile_rejected` - Profile rejected
- `profile_improvement` - Profile needs improvement
- `message` - New message received
- `test` - Test notification

---

## Response Format

### Success Response:
```json
{
  "success": true,
  "notificationId": "uuid-here",
  "channels": {
    "inApp": {
      "success": true,
      "notificationId": "uuid-here"
    },
    "email": {
      "success": true,
      "sent": true
    },
    "push": {
      "success": true,
      "sent": 1,
      "errors": 0
    }
  }
}
```

### Error Response:
```json
{
  "error": "Missing required fields: userId, title, message",
  "status": 400
}
```

### Rate Limit Response:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many notifications sent. Please try again later.",
  "retryAfter": 45
}
```

---

## Testing Checklist ✅

- [ ] Send test notification via admin UI
- [ ] Send test notification via API (cURL/Postman)
- [ ] Verify in-app notification appears
- [ ] Verify email notification sent (check inbox)
- [ ] Verify push notification sent (if FCM configured)
- [ ] Test with different priorities (low, normal, high, urgent)
- [ ] Test with action button (actionUrl + actionText)
- [ ] Test with rich preview image (imageUrl)
- [ ] Test rate limiting (send 11+ notifications quickly)
- [ ] Test quiet hours (if user has quiet hours set)
- [ ] Test duplicate prevention (send same notification twice)
- [ ] Check notification analytics endpoint

---

## Troubleshooting 🔍

### Notification not appearing?
1. Check user's notification preferences
2. Check if user is in quiet hours
3. Check rate limits
4. Check permission service logs
5. Verify user ID is correct

### Email not sending?
1. Check email service configuration (Resend/SendGrid)
2. Check user's email preferences
3. Check email service logs
4. Verify recipient email exists

### Push not sending?
1. Check Firebase Admin SDK configuration
2. Check user has FCM token registered
3. Check user's push preferences
4. Verify Firebase service account credentials

---

## Quick Test Script

Save this as `test-notification.sh`:

```bash
#!/bin/bash

# Configuration
DOMAIN="https://your-domain.com"
USER_ID="USER_UUID_HERE"
SESSION_COOKIE="your-session-cookie"

# Send test notification
curl -X POST "${DOMAIN}/api/notifications/send" \
  -H "Content-Type: application/json" \
  -H "Cookie: ${SESSION_COOKIE}" \
  -d "{
    \"userId\": \"${USER_ID}\",
    \"type\": \"test\",
    \"title\": \"Deployment Test\",
    \"message\": \"Testing notifications after deployment.\",
    \"priority\": \"normal\",
    \"sendEmail\": true,
    \"sendPush\": false
  }" | jq .

echo ""
echo "✅ Test notification sent!"
echo "Check the user's notifications and email inbox."
```

Make it executable:
```bash
chmod +x test-notification.sh
./test-notification.sh
```
