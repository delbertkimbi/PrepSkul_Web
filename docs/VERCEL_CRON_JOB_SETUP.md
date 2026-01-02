# ⏰ Vercel Cron Job Setup Guide

## 🚨 Important: Plan Limitations

### **Vercel Plan Limits:**

| Plan | Cron Jobs | Schedule | Notes |
|------|-----------|----------|-------|
| **Hobby (Free)** | 2 cron jobs | **Once per day only** | ⚠️ Cannot run every 5 minutes |
| **Pro ($20/mo)** | 40 cron jobs | **Unlimited** | ✅ Can run every 5 minutes |
| **Enterprise** | 100 cron jobs | **Unlimited** | ✅ Can run every 5 minutes |

**Current Configuration:**
- **Schedule:** `0 0 * * *` (runs once per day at midnight UTC)
- **Reason:** Hobby plan limitation - cannot run every 5 minutes

---

## 🔧 Current Setup

### **Cron Job Configuration (`vercel.json`):**

```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled-notifications",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**What this does:**
- Runs **once per day** at midnight UTC
- Processes all scheduled notifications that are due
- Processes up to 100 notifications per run

---

## ⚠️ Limitations on Hobby Plan

### **Problem:**
- Hobby plan only allows cron jobs to run **once per day**
- Cannot run every 5 minutes as originally planned
- This means scheduled notifications might be delayed up to 24 hours

### **Impact:**
- Session reminders scheduled for "15 minutes before" might be sent late
- Notifications will be processed in batches once per day
- Not ideal for time-sensitive notifications

---

## ✅ Solutions

### **Option 1: Upgrade to Pro Plan (Recommended)**

**Benefits:**
- Unlimited cron invocations
- Can run every 5 minutes: `*/5 * * * *`
- Better for time-sensitive notifications
- Cost: $20/month

**After upgrading:**
1. Update `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/process-scheduled-notifications",
         "schedule": "*/5 * * * *"
       }
     ]
   }
   ```
2. Redeploy

---

### **Option 2: Use External Cron Service (Free Alternative)**

**Services:**
- **Cron-job.org** (free, runs every 5 minutes)
- **EasyCron** (free tier available)
- **GitHub Actions** (free for public repos)

**Setup with Cron-job.org:**

1. **Go to:** https://cron-job.org
2. **Create account** (free)
3. **Add new cron job:**
   - **URL:** `https://your-domain.vercel.app/api/cron/process-scheduled-notifications`
   - **Schedule:** Every 5 minutes
   - **Method:** GET
   - **Headers:** `Authorization: Bearer YOUR_CRON_SECRET` (optional, for security)
4. **Save**

**Update code to accept external calls:**

```typescript
// In route.ts
export async function GET(request: NextRequest) {
  // Verify cron secret (if using external service)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow Vercel cron (no auth header) or external with correct secret
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel');
    if (!isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // ... rest of cron logic
}
```

---

### **Option 3: Keep Daily Schedule (Current)**

**Pros:**
- Works on free Hobby plan
- No additional costs
- Simple setup

**Cons:**
- Notifications might be delayed
- Not ideal for time-sensitive reminders

**Best for:**
- Non-critical notifications
- Batch processing
- Development/testing

---

## 🔄 Alternative: Real-time Processing

Instead of cron jobs, process notifications in real-time:

### **Option A: Process on Event**

When scheduling a notification, also check if it's due immediately:

```typescript
// In schedule-session-reminders/route.ts
export async function POST(request: NextRequest) {
  // ... schedule notifications ...
  
  // Also check if any are due now and send immediately
  const now = new Date();
  const dueNotifications = scheduledNotifications.filter(
    n => new Date(n.scheduled_for) <= now
  );
  
  if (dueNotifications.length > 0) {
    // Send immediately via API
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/send`, {
      method: 'POST',
      body: JSON.stringify(dueNotifications),
    });
  }
}
```

### **Option B: Supabase Database Functions**

Use Supabase database functions with triggers:

```sql
-- Create function to process due notifications
CREATE OR REPLACE FUNCTION process_due_notifications()
RETURNS void AS $$
BEGIN
  -- Process notifications due in the last 5 minutes
  -- This can be called by a cron job or trigger
END;
$$ LANGUAGE plpgsql;
```

---

## 📋 Recommended Approach

### **For Production:**

1. **Upgrade to Vercel Pro** ($20/month)
   - Best solution
   - Reliable
   - No external dependencies

2. **Or use external cron service** (free)
   - Good for MVP
   - Works on Hobby plan
   - Requires external service setup

### **For Development:**

- Keep daily schedule (current setup)
- Test with manual API calls
- Upgrade when ready for production

---

## 🧪 Testing Cron Jobs

### **Manual Test:**

```bash
# Test the cron endpoint manually
curl https://your-domain.vercel.app/api/cron/process-scheduled-notifications \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### **Check Vercel Logs:**

1. Go to **Vercel Dashboard** → **Deployments**
2. Click on latest deployment
3. Go to **Functions** tab
4. Check cron job execution logs

---

## 🔗 Resources

- **Vercel Cron Docs:** https://vercel.com/docs/cron-jobs
- **Vercel Pricing:** https://vercel.com/pricing
- **Cron Expression Guide:** https://crontab.guru/





## 🚨 Important: Plan Limitations

### **Vercel Plan Limits:**

| Plan | Cron Jobs | Schedule | Notes |
|------|-----------|----------|-------|
| **Hobby (Free)** | 2 cron jobs | **Once per day only** | ⚠️ Cannot run every 5 minutes |
| **Pro ($20/mo)** | 40 cron jobs | **Unlimited** | ✅ Can run every 5 minutes |
| **Enterprise** | 100 cron jobs | **Unlimited** | ✅ Can run every 5 minutes |

**Current Configuration:**
- **Schedule:** `0 0 * * *` (runs once per day at midnight UTC)
- **Reason:** Hobby plan limitation - cannot run every 5 minutes

---

## 🔧 Current Setup

### **Cron Job Configuration (`vercel.json`):**

```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled-notifications",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**What this does:**
- Runs **once per day** at midnight UTC
- Processes all scheduled notifications that are due
- Processes up to 100 notifications per run

---

## ⚠️ Limitations on Hobby Plan

### **Problem:**
- Hobby plan only allows cron jobs to run **once per day**
- Cannot run every 5 minutes as originally planned
- This means scheduled notifications might be delayed up to 24 hours

### **Impact:**
- Session reminders scheduled for "15 minutes before" might be sent late
- Notifications will be processed in batches once per day
- Not ideal for time-sensitive notifications

---

## ✅ Solutions

### **Option 1: Upgrade to Pro Plan (Recommended)**

**Benefits:**
- Unlimited cron invocations
- Can run every 5 minutes: `*/5 * * * *`
- Better for time-sensitive notifications
- Cost: $20/month

**After upgrading:**
1. Update `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/process-scheduled-notifications",
         "schedule": "*/5 * * * *"
       }
     ]
   }
   ```
2. Redeploy

---

### **Option 2: Use External Cron Service (Free Alternative)**

**Services:**
- **Cron-job.org** (free, runs every 5 minutes)
- **EasyCron** (free tier available)
- **GitHub Actions** (free for public repos)

**Setup with Cron-job.org:**

1. **Go to:** https://cron-job.org
2. **Create account** (free)
3. **Add new cron job:**
   - **URL:** `https://your-domain.vercel.app/api/cron/process-scheduled-notifications`
   - **Schedule:** Every 5 minutes
   - **Method:** GET
   - **Headers:** `Authorization: Bearer YOUR_CRON_SECRET` (optional, for security)
4. **Save**

**Update code to accept external calls:**

```typescript
// In route.ts
export async function GET(request: NextRequest) {
  // Verify cron secret (if using external service)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow Vercel cron (no auth header) or external with correct secret
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel');
    if (!isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // ... rest of cron logic
}
```

---

### **Option 3: Keep Daily Schedule (Current)**

**Pros:**
- Works on free Hobby plan
- No additional costs
- Simple setup

**Cons:**
- Notifications might be delayed
- Not ideal for time-sensitive reminders

**Best for:**
- Non-critical notifications
- Batch processing
- Development/testing

---

## 🔄 Alternative: Real-time Processing

Instead of cron jobs, process notifications in real-time:

### **Option A: Process on Event**

When scheduling a notification, also check if it's due immediately:

```typescript
// In schedule-session-reminders/route.ts
export async function POST(request: NextRequest) {
  // ... schedule notifications ...
  
  // Also check if any are due now and send immediately
  const now = new Date();
  const dueNotifications = scheduledNotifications.filter(
    n => new Date(n.scheduled_for) <= now
  );
  
  if (dueNotifications.length > 0) {
    // Send immediately via API
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/send`, {
      method: 'POST',
      body: JSON.stringify(dueNotifications),
    });
  }
}
```

### **Option B: Supabase Database Functions**

Use Supabase database functions with triggers:

```sql
-- Create function to process due notifications
CREATE OR REPLACE FUNCTION process_due_notifications()
RETURNS void AS $$
BEGIN
  -- Process notifications due in the last 5 minutes
  -- This can be called by a cron job or trigger
END;
$$ LANGUAGE plpgsql;
```

---

## 📋 Recommended Approach

### **For Production:**

1. **Upgrade to Vercel Pro** ($20/month)
   - Best solution
   - Reliable
   - No external dependencies

2. **Or use external cron service** (free)
   - Good for MVP
   - Works on Hobby plan
   - Requires external service setup

### **For Development:**

- Keep daily schedule (current setup)
- Test with manual API calls
- Upgrade when ready for production

---

## 🧪 Testing Cron Jobs

### **Manual Test:**

```bash
# Test the cron endpoint manually
curl https://your-domain.vercel.app/api/cron/process-scheduled-notifications \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### **Check Vercel Logs:**

1. Go to **Vercel Dashboard** → **Deployments**
2. Click on latest deployment
3. Go to **Functions** tab
4. Check cron job execution logs

---

## 🔗 Resources

- **Vercel Cron Docs:** https://vercel.com/docs/cron-jobs
- **Vercel Pricing:** https://vercel.com/pricing
- **Cron Expression Guide:** https://crontab.guru/






