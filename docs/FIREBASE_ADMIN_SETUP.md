# 🔥 Firebase Admin SDK Setup Guide

**For Push Notifications in Next.js API**

---

## 🎯 **Purpose**

Firebase Admin SDK allows the Next.js API server to send push notifications via Firebase Cloud Messaging (FCM) to user devices.

---

## 📋 **Setup Steps**

### **Step 1: Get Firebase Service Account Key**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `operating-axis-420213`
3. Go to **Project Settings** (gear icon)
4. Click on **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file (e.g., `firebase-service-account.json`)

### **Step 2: Add Service Account Key to Environment Variables**

#### **Option A: JSON String (Recommended for Vercel)**

1. Open the downloaded JSON file
2. Copy the entire JSON content
3. Add to `.env.local` (or Vercel environment variables):

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"operating-axis-420213",...}
```

**Important:** The entire JSON must be on one line, with all quotes properly escaped.

#### **Option B: File Path (For Local Development)**

1. Place the JSON file in your Next.js project root: `firebase-service-account.json`
2. Add to `.env.local`:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

3. Add `firebase-service-account.json` to `.gitignore`:

```
firebase-service-account.json
```

### **Step 3: Verify Installation**

The Firebase Admin SDK is already installed:

```bash
cd /Users/user/Desktop/PrepSkul/PrepSkul_Web
npm list firebase-admin
```

---

## 🔧 **How It Works**

### **1. Firebase Admin Service**

**File:** `lib/services/firebase-admin.ts`

- Initializes Firebase Admin SDK
- Provides functions to send push notifications
- Handles invalid tokens

### **2. Notification Send API**

**File:** `app/api/notifications/send/route.ts`

- Gets user's FCM tokens from Supabase
- Sends push notification via Firebase Admin SDK
- Handles errors gracefully

### **3. Flow**

```
1. Flutter app triggers notification
2. Next.js API receives request
3. Gets FCM tokens from Supabase
4. Sends push notification via Firebase Admin SDK
5. Firebase sends to user's device
6. User receives notification with sound
```

---

## 📝 **Environment Variables**

Add to `.env.local`:

```env
# Firebase Admin (for Push Notifications)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"operating-axis-420213","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

Or:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

---

## 🧪 **Testing**

### **Test Push Notification**

1. Make sure a user has an active FCM token in database
2. Call the notification send API:

```bash
curl -X POST https://app.prepskul.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "type": "test",
    "title": "Test Notification",
    "message": "This is a test push notification",
    "sendEmail": false
  }'
```

3. Check if push notification appears on device
4. Verify sound plays
5. Verify notification tap works

---

## ⚠️ **Important Notes**

### **Security:**
- ✅ Service account key is kept in environment variables
- ✅ Never commit service account key to git
- ✅ Use Vercel environment variables for production

### **Token Management:**
- ✅ Invalid tokens are automatically detected
- ✅ Tokens are deactivated on logout
- ✅ Old tokens are automatically deactivated when new ones are added

### **Error Handling:**
- ✅ Push notification failures don't break the request
- ✅ Invalid tokens are logged for cleanup
- ✅ Errors are handled gracefully

---

## 🔍 **Troubleshooting**

### **Error: Firebase Admin initialization failed**

**Solution:**
1. Check if `FIREBASE_SERVICE_ACCOUNT_KEY` is set in environment variables
2. Verify the JSON is valid (no newlines, proper escaping)
3. Check if service account key has proper permissions

### **Error: Invalid FCM token**

**Solution:**
1. This is normal - tokens can expire
2. The system automatically detects invalid tokens
3. Tokens are deactivated in the database

### **Error: Permission denied**

**Solution:**
1. Check if service account has "Firebase Cloud Messaging API Admin" permission
2. Verify the service account key is correct
3. Check Firebase project settings

---

## ✅ **Summary**

**Setup Complete:**
- ✅ Firebase Admin SDK installed
- ✅ Firebase Admin service created
- ✅ Notification send API updated
- ⏳ Need to add Firebase service account key to environment variables

**Next Steps:**
1. Get Firebase service account key
2. Add to `.env.local` (or Vercel environment variables)
3. Test push notification sending
4. Verify notifications appear on devices

---

**Ready to test push notifications! 🚀**






