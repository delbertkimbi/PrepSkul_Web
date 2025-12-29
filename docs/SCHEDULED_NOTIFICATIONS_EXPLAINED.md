# 📚 Scheduled Notifications System - Complete Explanation

## 🎯 The Problem We're Solving

### **Real-World Scenario:**

Imagine a student books a tutoring session for **tomorrow at 2:00 PM**. You want to:

1. **Send a reminder 15 minutes before** (at 1:45 PM)
2. **Send a reminder 1 hour before** (at 1:00 PM)
3. **Send a reminder the day before** (today at 2:00 PM)

**The Challenge:**
- You can't send these notifications **right now** when the booking is made
- You need to send them **at specific times in the future**
- You need a system that "remembers" to send them at the right time

---

## 💡 The Solution: Scheduled Notifications

### **How It Works:**

1. **When a booking is made:**
   - System creates "scheduled notifications" in the database
   - Each notification has a `scheduled_for` timestamp (e.g., "Dec 26, 2025 1:45 PM")
   - Status is set to `pending`

2. **The Cron Job (What We Just Set Up):**
   - Runs **every 5 minutes**
   - Checks the database for notifications where `scheduled_for <= NOW()`
   - Processes them (sends emails, creates in-app notifications, etc.)
   - Marks them as `sent`

3. **Result:**
   - Notifications are sent at the right time automatically
   - No manual intervention needed
   - Works 24/7

---

## 🔄 Complete Flow Example

### **Step 1: User Books a Session**

**Date:** December 25, 2025, 10:00 AM  
**Session:** Tomorrow (Dec 26) at 2:00 PM

**System creates 3 scheduled notifications:**

```sql
INSERT INTO scheduled_notifications VALUES
  (1, 'user_123', 'Dec 26, 2025 1:00 PM', 'session_reminder_1h', 'pending'),
  (2, 'user_123', 'Dec 26, 2025 1:45 PM', 'session_reminder_15m', 'pending'),
  (3, 'user_123', 'Dec 26, 2025 2:00 PM', 'session_started', 'pending');
```

---

### **Step 2: Cron Job Runs Every 5 Minutes**

**At 1:00 PM on Dec 26:**
- Cron job runs
- Checks: "Are there any notifications scheduled for <= 1:00 PM?"
- Finds notification #1 (1:00 PM reminder)
- Sends email: "Your session starts in 1 hour!"
- Marks as `sent`

**At 1:45 PM on Dec 26:**
- Cron job runs again
- Finds notification #2 (1:45 PM reminder)
- Sends email: "Your session starts in 15 minutes!"
- Marks as `sent`

**At 2:00 PM on Dec 26:**
- Cron job runs
- Finds notification #3 (session started)
- Sends notification: "Your session has started!"
- Marks as `sent`

---

## 🛠️ Technology Stack Explained

### **1. Database (Supabase)**

**Table: `scheduled_notifications`**
- Stores all notifications that need to be sent in the future
- Fields:
  - `user_id`: Who to send to
  - `scheduled_for`: When to send it (timestamp)
  - `status`: `pending`, `sent`, or `failed`
  - `title`, `message`: What to send
  - `notification_type`: What kind (session_reminder, payment_due, etc.)

**Why we need it:**
- Persists notifications even if server restarts
- Can query "what needs to be sent now?"
- Tracks what's been sent

---

### **2. Cron Job (cron-job.org)**

**What it does:**
- Calls your API endpoint every 5 minutes
- Like a "wake-up call" for your server
- Ensures notifications are checked regularly

**Why external service?**
- Vercel's free plan only allows cron jobs once per day
- We need every 5 minutes for timely reminders
- External service (cron-job.org) is free and reliable

**How it works:**
```
Every 5 minutes:
  1. cron-job.org → Calls your endpoint
  2. Your endpoint → Checks database
  3. Your endpoint → Processes due notifications
  4. Your endpoint → Returns success/failure
```

---

### **3. API Endpoint (`/api/cron/process-scheduled-notifications`)**

**What it does:**
1. **Authenticates:** Checks `Authorization: Bearer [secret]` header
2. **Queries database:** Finds notifications where `scheduled_for <= NOW()` and `status = 'pending'`
3. **Processes each notification:**
   - Creates in-app notification
   - Sends email (if enabled)
   - Sends push notification (if enabled)
4. **Updates status:** Marks as `sent` or `failed`
5. **Returns result:** `{"success": true, "processed": 5}`

**Why it's secure:**
- Requires `CRON_SECRET` to access
- Only cron-job.org knows the secret
- Prevents unauthorized access

---

### **4. Notification Channels**

When a notification is processed, it can be sent via:

1. **In-App Notification:**
   - Stored in `notifications` table
   - Shows up in user's notification center
   - User sees it when they open the app

2. **Email:**
   - Sent via Resend service
   - Goes to user's email address
   - Includes action buttons/links

3. **Push Notification:**
   - Sent via Firebase
   - Shows on user's phone/device
   - Even when app is closed

---

## 📊 Real-World Use Cases in Your App

### **1. Session Reminders**

**Scenario:** Student books session for tomorrow at 2 PM

**Scheduled notifications created:**
- 24 hours before: "Don't forget your session tomorrow!"
- 1 hour before: "Your session starts in 1 hour"
- 15 minutes before: "Your session starts in 15 minutes"
- At start time: "Your session has started"

**Result:** Student never misses a session!

---

### **2. Payment Reminders**

**Scenario:** Payment is due in 3 days

**Scheduled notifications created:**
- 3 days before: "Payment due in 3 days"
- 1 day before: "Payment due tomorrow"
- On due date: "Payment is due today"
- After due date: "Payment overdue"

**Result:** Better payment collection!

---

### **3. Tutor Approval Notifications**

**Scenario:** Tutor submits profile, admin needs to review

**Scheduled notifications created:**
- Immediately: "Your profile is under review"
- After 24 hours (if not reviewed): "We're still reviewing your profile"
- When approved: "Your profile has been approved!"

**Result:** Better communication with tutors!

---

### **4. Session Feedback Requests**

**Scenario:** Session ends at 3 PM

**Scheduled notifications created:**
- Immediately after session: "How was your session?"
- 1 hour later (if no response): "Please rate your session"
- 24 hours later (if no response): "Last chance to rate your session"

**Result:** Higher feedback collection rates!

---

## 🎯 Why This Is Important

### **Without Scheduled Notifications:**

❌ **Manual Process:**
- Admin has to remember to send reminders
- Easy to forget
- Not scalable (can't handle 1000s of users)
- Time-consuming

❌ **No Reminders:**
- Users forget about sessions
- Missed sessions = lost revenue
- Poor user experience
- Lower engagement

---

### **With Scheduled Notifications:**

✅ **Automated:**
- Runs 24/7 without human intervention
- Never forgets
- Handles any number of users
- Saves time

✅ **Better User Experience:**
- Users get timely reminders
- Fewer missed sessions
- Better engagement
- Higher satisfaction

✅ **Business Benefits:**
- More sessions completed = more revenue
- Better payment collection
- Higher user retention
- Professional appearance

---

## 🔍 How It All Works Together

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTION                           │
│  (Books session, makes payment, etc.)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              YOUR APP / API                              │
│  Creates scheduled_notifications in database             │
│  scheduled_for = "Dec 26, 2025 1:45 PM"                 │
│  status = "pending"                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (Supabase)                         │
│  Stores scheduled notifications                          │
│  Waits for processing...                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ (Time passes...)
                     │
┌─────────────────────────────────────────────────────────┐
│         CRON JOB (cron-job.org)                          │
│  Every 5 minutes:                                        │
│  → Calls your API endpoint                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│    YOUR API ENDPOINT                                     │
│  /api/cron/process-scheduled-notifications              │
│                                                          │
│  1. Authenticates (checks CRON_SECRET)                  │
│  2. Queries: "What notifications are due?"              │
│  3. For each due notification:                          │
│     - Creates in-app notification                        │
│     - Sends email                                        │
│     - Sends push notification                            │
│  4. Marks as "sent"                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              NOTIFICATION CHANNELS                       │
│  - In-App: User sees in notification center             │
│  - Email: User receives email                            │
│  - Push: User gets notification on device                │
└─────────────────────────────────────────────────────────┘
```

---

## ⏰ Why Every 5 Minutes?

### **Timing Considerations:**

**Too Frequent (Every 1 minute):**
- ❌ Unnecessary server load
- ❌ Higher costs
- ❌ Not needed (notifications don't need to be instant)

**Too Infrequent (Every 1 hour):**
- ❌ "15 minutes before" reminder might be sent 10 minutes late
- ❌ Poor user experience
- ❌ Not timely enough

**Every 5 Minutes (Perfect Balance):**
- ✅ Timely enough for "15 minutes before" reminders
- ✅ Not too frequent (efficient)
- ✅ Free on cron-job.org
- ✅ Good balance of timeliness and efficiency

**Example:**
- Session at 2:00 PM
- Reminder scheduled for 1:45 PM
- Cron runs at 1:40 PM → Not due yet (skips)
- Cron runs at 1:45 PM → Due! (sends)
- User gets reminder at 1:45 PM ✅

---

## 🔒 Security: Why CRON_SECRET?

### **The Problem:**

Your endpoint is publicly accessible:
```
https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Without protection:**
- ❌ Anyone could call it
- ❌ Could spam your database
- ❌ Could cause server overload
- ❌ Security risk

### **The Solution: CRON_SECRET**

**With protection:**
- ✅ Only requests with correct `Authorization: Bearer [secret]` header work
- ✅ Only cron-job.org knows the secret
- ✅ Unauthorized requests are rejected
- ✅ Secure

**How it works:**
```typescript
// In your API endpoint
const authHeader = request.headers.get('authorization');
const cronSecret = process.env.CRON_SECRET;

if (authHeader !== `Bearer ${cronSecret}`) {
  return { error: 'Unauthorized' }; // Reject!
}

// Only reaches here if secret matches
// Process notifications...
```

---

## 📈 Monitoring & Debugging

### **How to Know It's Working:**

1. **Cron-job.org Dashboard:**
   - See execution history
   - Check if runs are successful
   - See response times

2. **Vercel Logs:**
   - Functions → `/api/cron/process-scheduled-notifications`
   - See when it's called
   - See how many notifications processed

3. **Supabase Database:**
   - Check `scheduled_notifications` table
   - See `status` changes: `pending` → `sent`
   - See `sent_at` timestamps

4. **User Experience:**
   - Users receive reminders on time
   - Emails arrive when expected
   - In-app notifications appear

---

## 🎓 Key Concepts Summary

### **Cron Job:**
- A scheduled task that runs automatically at set intervals
- Like an alarm clock for your server
- "Wake up every 5 minutes and check for work"

### **Scheduled Notifications:**
- Notifications that need to be sent in the future
- Stored in database with a timestamp
- Processed when that time arrives

### **Why Both?**
- **Scheduled notifications** = "What to send and when"
- **Cron job** = "The worker that checks and sends them"

**Analogy:**
- Scheduled notifications = Letters in a mailbox with delivery dates
- Cron job = Mail carrier who checks the mailbox every 5 minutes and delivers letters that are due

---

## 🚀 What You've Built

You now have a **fully automated notification system** that:

1. ✅ **Schedules** notifications for future delivery
2. ✅ **Stores** them securely in the database
3. ✅ **Processes** them automatically every 5 minutes
4. ✅ **Sends** via multiple channels (email, in-app, push)
5. ✅ **Tracks** what's been sent
6. ✅ **Runs 24/7** without human intervention

**This is a professional-grade feature** that:
- Improves user experience
- Increases engagement
- Reduces missed sessions
- Saves time and money
- Scales to any number of users

---

## 💡 Real Impact

**Before:**
- Users forget sessions → Missed sessions → Lost revenue
- No reminders → Poor experience
- Manual work → Time-consuming

**After:**
- Automated reminders → Fewer missed sessions → More revenue
- Timely notifications → Better experience
- Zero manual work → Time saved

**This system will handle thousands of notifications automatically, ensuring your users never miss important events!** 🎉





## 🎯 The Problem We're Solving

### **Real-World Scenario:**

Imagine a student books a tutoring session for **tomorrow at 2:00 PM**. You want to:

1. **Send a reminder 15 minutes before** (at 1:45 PM)
2. **Send a reminder 1 hour before** (at 1:00 PM)
3. **Send a reminder the day before** (today at 2:00 PM)

**The Challenge:**
- You can't send these notifications **right now** when the booking is made
- You need to send them **at specific times in the future**
- You need a system that "remembers" to send them at the right time

---

## 💡 The Solution: Scheduled Notifications

### **How It Works:**

1. **When a booking is made:**
   - System creates "scheduled notifications" in the database
   - Each notification has a `scheduled_for` timestamp (e.g., "Dec 26, 2025 1:45 PM")
   - Status is set to `pending`

2. **The Cron Job (What We Just Set Up):**
   - Runs **every 5 minutes**
   - Checks the database for notifications where `scheduled_for <= NOW()`
   - Processes them (sends emails, creates in-app notifications, etc.)
   - Marks them as `sent`

3. **Result:**
   - Notifications are sent at the right time automatically
   - No manual intervention needed
   - Works 24/7

---

## 🔄 Complete Flow Example

### **Step 1: User Books a Session**

**Date:** December 25, 2025, 10:00 AM  
**Session:** Tomorrow (Dec 26) at 2:00 PM

**System creates 3 scheduled notifications:**

```sql
INSERT INTO scheduled_notifications VALUES
  (1, 'user_123', 'Dec 26, 2025 1:00 PM', 'session_reminder_1h', 'pending'),
  (2, 'user_123', 'Dec 26, 2025 1:45 PM', 'session_reminder_15m', 'pending'),
  (3, 'user_123', 'Dec 26, 2025 2:00 PM', 'session_started', 'pending');
```

---

### **Step 2: Cron Job Runs Every 5 Minutes**

**At 1:00 PM on Dec 26:**
- Cron job runs
- Checks: "Are there any notifications scheduled for <= 1:00 PM?"
- Finds notification #1 (1:00 PM reminder)
- Sends email: "Your session starts in 1 hour!"
- Marks as `sent`

**At 1:45 PM on Dec 26:**
- Cron job runs again
- Finds notification #2 (1:45 PM reminder)
- Sends email: "Your session starts in 15 minutes!"
- Marks as `sent`

**At 2:00 PM on Dec 26:**
- Cron job runs
- Finds notification #3 (session started)
- Sends notification: "Your session has started!"
- Marks as `sent`

---

## 🛠️ Technology Stack Explained

### **1. Database (Supabase)**

**Table: `scheduled_notifications`**
- Stores all notifications that need to be sent in the future
- Fields:
  - `user_id`: Who to send to
  - `scheduled_for`: When to send it (timestamp)
  - `status`: `pending`, `sent`, or `failed`
  - `title`, `message`: What to send
  - `notification_type`: What kind (session_reminder, payment_due, etc.)

**Why we need it:**
- Persists notifications even if server restarts
- Can query "what needs to be sent now?"
- Tracks what's been sent

---

### **2. Cron Job (cron-job.org)**

**What it does:**
- Calls your API endpoint every 5 minutes
- Like a "wake-up call" for your server
- Ensures notifications are checked regularly

**Why external service?**
- Vercel's free plan only allows cron jobs once per day
- We need every 5 minutes for timely reminders
- External service (cron-job.org) is free and reliable

**How it works:**
```
Every 5 minutes:
  1. cron-job.org → Calls your endpoint
  2. Your endpoint → Checks database
  3. Your endpoint → Processes due notifications
  4. Your endpoint → Returns success/failure
```

---

### **3. API Endpoint (`/api/cron/process-scheduled-notifications`)**

**What it does:**
1. **Authenticates:** Checks `Authorization: Bearer [secret]` header
2. **Queries database:** Finds notifications where `scheduled_for <= NOW()` and `status = 'pending'`
3. **Processes each notification:**
   - Creates in-app notification
   - Sends email (if enabled)
   - Sends push notification (if enabled)
4. **Updates status:** Marks as `sent` or `failed`
5. **Returns result:** `{"success": true, "processed": 5}`

**Why it's secure:**
- Requires `CRON_SECRET` to access
- Only cron-job.org knows the secret
- Prevents unauthorized access

---

### **4. Notification Channels**

When a notification is processed, it can be sent via:

1. **In-App Notification:**
   - Stored in `notifications` table
   - Shows up in user's notification center
   - User sees it when they open the app

2. **Email:**
   - Sent via Resend service
   - Goes to user's email address
   - Includes action buttons/links

3. **Push Notification:**
   - Sent via Firebase
   - Shows on user's phone/device
   - Even when app is closed

---

## 📊 Real-World Use Cases in Your App

### **1. Session Reminders**

**Scenario:** Student books session for tomorrow at 2 PM

**Scheduled notifications created:**
- 24 hours before: "Don't forget your session tomorrow!"
- 1 hour before: "Your session starts in 1 hour"
- 15 minutes before: "Your session starts in 15 minutes"
- At start time: "Your session has started"

**Result:** Student never misses a session!

---

### **2. Payment Reminders**

**Scenario:** Payment is due in 3 days

**Scheduled notifications created:**
- 3 days before: "Payment due in 3 days"
- 1 day before: "Payment due tomorrow"
- On due date: "Payment is due today"
- After due date: "Payment overdue"

**Result:** Better payment collection!

---

### **3. Tutor Approval Notifications**

**Scenario:** Tutor submits profile, admin needs to review

**Scheduled notifications created:**
- Immediately: "Your profile is under review"
- After 24 hours (if not reviewed): "We're still reviewing your profile"
- When approved: "Your profile has been approved!"

**Result:** Better communication with tutors!

---

### **4. Session Feedback Requests**

**Scenario:** Session ends at 3 PM

**Scheduled notifications created:**
- Immediately after session: "How was your session?"
- 1 hour later (if no response): "Please rate your session"
- 24 hours later (if no response): "Last chance to rate your session"

**Result:** Higher feedback collection rates!

---

## 🎯 Why This Is Important

### **Without Scheduled Notifications:**

❌ **Manual Process:**
- Admin has to remember to send reminders
- Easy to forget
- Not scalable (can't handle 1000s of users)
- Time-consuming

❌ **No Reminders:**
- Users forget about sessions
- Missed sessions = lost revenue
- Poor user experience
- Lower engagement

---

### **With Scheduled Notifications:**

✅ **Automated:**
- Runs 24/7 without human intervention
- Never forgets
- Handles any number of users
- Saves time

✅ **Better User Experience:**
- Users get timely reminders
- Fewer missed sessions
- Better engagement
- Higher satisfaction

✅ **Business Benefits:**
- More sessions completed = more revenue
- Better payment collection
- Higher user retention
- Professional appearance

---

## 🔍 How It All Works Together

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTION                           │
│  (Books session, makes payment, etc.)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              YOUR APP / API                              │
│  Creates scheduled_notifications in database             │
│  scheduled_for = "Dec 26, 2025 1:45 PM"                 │
│  status = "pending"                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (Supabase)                         │
│  Stores scheduled notifications                          │
│  Waits for processing...                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ (Time passes...)
                     │
┌─────────────────────────────────────────────────────────┐
│         CRON JOB (cron-job.org)                          │
│  Every 5 minutes:                                        │
│  → Calls your API endpoint                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│    YOUR API ENDPOINT                                     │
│  /api/cron/process-scheduled-notifications              │
│                                                          │
│  1. Authenticates (checks CRON_SECRET)                  │
│  2. Queries: "What notifications are due?"              │
│  3. For each due notification:                          │
│     - Creates in-app notification                        │
│     - Sends email                                        │
│     - Sends push notification                            │
│  4. Marks as "sent"                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              NOTIFICATION CHANNELS                       │
│  - In-App: User sees in notification center             │
│  - Email: User receives email                            │
│  - Push: User gets notification on device                │
└─────────────────────────────────────────────────────────┘
```

---

## ⏰ Why Every 5 Minutes?

### **Timing Considerations:**

**Too Frequent (Every 1 minute):**
- ❌ Unnecessary server load
- ❌ Higher costs
- ❌ Not needed (notifications don't need to be instant)

**Too Infrequent (Every 1 hour):**
- ❌ "15 minutes before" reminder might be sent 10 minutes late
- ❌ Poor user experience
- ❌ Not timely enough

**Every 5 Minutes (Perfect Balance):**
- ✅ Timely enough for "15 minutes before" reminders
- ✅ Not too frequent (efficient)
- ✅ Free on cron-job.org
- ✅ Good balance of timeliness and efficiency

**Example:**
- Session at 2:00 PM
- Reminder scheduled for 1:45 PM
- Cron runs at 1:40 PM → Not due yet (skips)
- Cron runs at 1:45 PM → Due! (sends)
- User gets reminder at 1:45 PM ✅

---

## 🔒 Security: Why CRON_SECRET?

### **The Problem:**

Your endpoint is publicly accessible:
```
https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Without protection:**
- ❌ Anyone could call it
- ❌ Could spam your database
- ❌ Could cause server overload
- ❌ Security risk

### **The Solution: CRON_SECRET**

**With protection:**
- ✅ Only requests with correct `Authorization: Bearer [secret]` header work
- ✅ Only cron-job.org knows the secret
- ✅ Unauthorized requests are rejected
- ✅ Secure

**How it works:**
```typescript
// In your API endpoint
const authHeader = request.headers.get('authorization');
const cronSecret = process.env.CRON_SECRET;

if (authHeader !== `Bearer ${cronSecret}`) {
  return { error: 'Unauthorized' }; // Reject!
}

// Only reaches here if secret matches
// Process notifications...
```

---

## 📈 Monitoring & Debugging

### **How to Know It's Working:**

1. **Cron-job.org Dashboard:**
   - See execution history
   - Check if runs are successful
   - See response times

2. **Vercel Logs:**
   - Functions → `/api/cron/process-scheduled-notifications`
   - See when it's called
   - See how many notifications processed

3. **Supabase Database:**
   - Check `scheduled_notifications` table
   - See `status` changes: `pending` → `sent`
   - See `sent_at` timestamps

4. **User Experience:**
   - Users receive reminders on time
   - Emails arrive when expected
   - In-app notifications appear

---

## 🎓 Key Concepts Summary

### **Cron Job:**
- A scheduled task that runs automatically at set intervals
- Like an alarm clock for your server
- "Wake up every 5 minutes and check for work"

### **Scheduled Notifications:**
- Notifications that need to be sent in the future
- Stored in database with a timestamp
- Processed when that time arrives

### **Why Both?**
- **Scheduled notifications** = "What to send and when"
- **Cron job** = "The worker that checks and sends them"

**Analogy:**
- Scheduled notifications = Letters in a mailbox with delivery dates
- Cron job = Mail carrier who checks the mailbox every 5 minutes and delivers letters that are due

---

## 🚀 What You've Built

You now have a **fully automated notification system** that:

1. ✅ **Schedules** notifications for future delivery
2. ✅ **Stores** them securely in the database
3. ✅ **Processes** them automatically every 5 minutes
4. ✅ **Sends** via multiple channels (email, in-app, push)
5. ✅ **Tracks** what's been sent
6. ✅ **Runs 24/7** without human intervention

**This is a professional-grade feature** that:
- Improves user experience
- Increases engagement
- Reduces missed sessions
- Saves time and money
- Scales to any number of users

---

## 💡 Real Impact

**Before:**
- Users forget sessions → Missed sessions → Lost revenue
- No reminders → Poor experience
- Manual work → Time-consuming

**After:**
- Automated reminders → Fewer missed sessions → More revenue
- Timely notifications → Better experience
- Zero manual work → Time saved

**This system will handle thousands of notifications automatically, ensuring your users never miss important events!** 🎉



