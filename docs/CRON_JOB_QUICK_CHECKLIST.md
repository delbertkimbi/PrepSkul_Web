# ✅ Cron Job Setup - Quick Checklist

## Before Submitting Your Cron Job

### 1. ✅ URL Verification
- [ ] URL is correct: `https://www.prepskul.com/api/cron/process-scheduled-notifications`
- [ ] Test the URL in browser first (should return JSON, even if unauthorized)

### 2. 🔒 Security Header (IMPORTANT!)
- [ ] Generate `CRON_SECRET`:
  ```bash
  openssl rand -hex 32
  ```
- [ ] Add `CRON_SECRET` to Vercel Environment Variables
- [ ] Add Authorization header in cron-job.org:
  - Name: `Authorization`
  - Value: `Bearer [your-secret]`
- [ ] Redeploy Vercel after adding environment variable

### 3. ⚙️ Settings Check
- [ ] Schedule: "Every 5 minutes" (or your preference)
- [ ] Method: `GET`
- [ ] Job is enabled
- [ ] Timezone: UTC (recommended)

### 4. 🧪 Test Before Enabling
- [ ] Click "Execute now" or "Test" button
- [ ] Check response shows `"success": true`
- [ ] Verify no errors in execution log

### 5. 📊 After Submitting
- [ ] Monitor first few executions
- [ ] Check Vercel logs for any errors
- [ ] Verify notifications are being processed

---

## 🚨 Common Issues

**"Unauthorized" Error:**
- CRON_SECRET not set in Vercel, OR
- Authorization header missing/incorrect in cron-job.org

**"Cannot connect" Error:**
- URL is wrong, OR
- Vercel deployment failed, OR
- Domain not configured correctly

**No notifications processed:**
- Normal if no scheduled notifications are due
- Check Supabase `scheduled_notifications` table





## Before Submitting Your Cron Job

### 1. ✅ URL Verification
- [ ] URL is correct: `https://www.prepskul.com/api/cron/process-scheduled-notifications`
- [ ] Test the URL in browser first (should return JSON, even if unauthorized)

### 2. 🔒 Security Header (IMPORTANT!)
- [ ] Generate `CRON_SECRET`:
  ```bash
  openssl rand -hex 32
  ```
- [ ] Add `CRON_SECRET` to Vercel Environment Variables
- [ ] Add Authorization header in cron-job.org:
  - Name: `Authorization`
  - Value: `Bearer [your-secret]`
- [ ] Redeploy Vercel after adding environment variable

### 3. ⚙️ Settings Check
- [ ] Schedule: "Every 5 minutes" (or your preference)
- [ ] Method: `GET`
- [ ] Job is enabled
- [ ] Timezone: UTC (recommended)

### 4. 🧪 Test Before Enabling
- [ ] Click "Execute now" or "Test" button
- [ ] Check response shows `"success": true`
- [ ] Verify no errors in execution log

### 5. 📊 After Submitting
- [ ] Monitor first few executions
- [ ] Check Vercel logs for any errors
- [ ] Verify notifications are being processed

---

## 🚨 Common Issues

**"Unauthorized" Error:**
- CRON_SECRET not set in Vercel, OR
- Authorization header missing/incorrect in cron-job.org

**"Cannot connect" Error:**
- URL is wrong, OR
- Vercel deployment failed, OR
- Domain not configured correctly

**No notifications processed:**
- Normal if no scheduled notifications are due
- Check Supabase `scheduled_notifications` table










