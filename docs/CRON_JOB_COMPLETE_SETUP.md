# ⏰ Complete Cron Job Setup Guide - Step by Step

## 🎯 Goal
Set up an external cron job to run every 5 minutes and process scheduled notifications.

---

## ✅ Prerequisites
- ✅ PR merged to `main` (or ready to merge)
- ✅ Vercel deployment successful
- ✅ Route deployed: `/api/cron/process-scheduled-notifications`

---

## 📋 Step-by-Step Setup

### **Step 1: Generate CRON_SECRET**

Generate a secure random secret:

```bash
openssl rand -hex 32
```

**Copy the output** - you'll need it in the next steps.

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

---

### **Step 2: Add CRON_SECRET to Vercel**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project (**v0-prep-skul-website-build** or **PrepSkul_Web**)

2. **Navigate to Environment Variables:**
   - Click **Settings** (left sidebar)
   - Click **Environment Variables**

3. **Add New Variable:**
   - Click **"Add New"** or **"Add"** button
   - **Key:** `CRON_SECRET`
   - **Value:** Paste your generated secret from Step 1
   - **Environment:** Select all three:
     - ☑️ Production
     - ☑️ Preview
     - ☑️ Development
   - Click **Save**

4. **Redeploy (Important!):**
   - After adding the variable, go to **Deployments**
   - Click **"..."** on latest deployment → **"Redeploy"**
   - OR wait for next auto-deploy (if you just merged to main)

---

### **Step 3: Confirm Your Cron Endpoint URL**

Your cron endpoint will be available at:

**Production URL:**
```
https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Alternative (Vercel default domain):**
```
https://prepskul.vercel.app/api/cron/process-scheduled-notifications
```

**Test it first:**
1. Open in browser: `https://www.prepskul.com/api/cron/process-scheduled-notifications`
2. Should return: `{"error": "Unauthorized. Please provide Authorization: Bearer YOUR_CRON_SECRET header."}`
3. This confirms the route is working! ✅

---

### **Step 4: Set Up Cron Job on Cron-job.org**

1. **Go to:** https://cron-job.org
2. **Log in** to your account (or create one if you haven't)

3. **Create New Cron Job:**
   - Click **"Create cronjob"** or **"+"** button

4. **Fill in the Form:**

   **Basic Settings:**
   - **Title:** `PrepSkul - Process Scheduled Notifications`
   - **Address (URL):** `https://www.prepskul.com/api/cron/process-scheduled-notifications`
   - **Request method:** `GET`

   **Schedule:**
   - **Execution:** `Every 5 minutes`
   - **Timezone:** `UTC` (recommended)

   **Security (IMPORTANT!):**
   - Click **"Add header"** or find **"Request headers"** section
   - **Name:** `Authorization`
   - **Value:** `Bearer [your-secret-from-step-1]`
   - **Example:** `Bearer a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`
   - ⚠️ **Important:** Include the word `Bearer` followed by a space, then your secret

   **Advanced (Optional):**
   - **Request timeout:** `60` seconds
   - **Status code:** `200` (expected success code)
   - **Notification on failure:** Enable if you want email alerts

5. **Save:**
   - Click **"Create cronjob"** or **"Save"**

---

### **Step 5: Test the Cron Job**

1. **In cron-job.org:**
   - Find your newly created cron job
   - Click **"Execute now"** or **"Test"** button
   - Wait a few seconds

2. **Check the Result:**
   - Should show **Status: 200 OK**
   - Response should be:
     ```json
     {
       "success": true,
       "processed": 0,
       "message": "No scheduled notifications to process"
     }
     ```

3. **If you see "Unauthorized":**
   - Check that the `Authorization` header is correct
   - Make sure it includes `Bearer ` (with space) before the secret
   - Verify `CRON_SECRET` is set in Vercel and deployment is complete

---

### **Step 6: Enable and Monitor**

1. **Enable the Cron Job:**
   - In cron-job.org, make sure the cron job is **enabled** (toggle should be ON)

2. **Monitor First Few Executions:**
   - Check cron-job.org dashboard
   - Look at execution logs
   - Should show successful runs every 5 minutes

3. **Check Vercel Logs:**
   - Vercel Dashboard → Your Project → **Functions**
   - Click on `/api/cron/process-scheduled-notifications`
   - Check execution logs to see if it's being called

---

## 🧪 Testing Checklist

- [ ] Generated `CRON_SECRET` using `openssl rand -hex 32`
- [ ] Added `CRON_SECRET` to Vercel environment variables (all environments)
- [ ] Redeployed Vercel (or waited for auto-deploy)
- [ ] Tested endpoint in browser (should show "Unauthorized" without header)
- [ ] Created cron job on cron-job.org
- [ ] Added `Authorization: Bearer [secret]` header
- [ ] Set schedule to "Every 5 minutes"
- [ ] Tested cron job manually ("Execute now")
- [ ] Verified response shows `"success": true`
- [ ] Enabled cron job
- [ ] Monitored first few executions

---

## 🔍 Troubleshooting

### **Error: "Unauthorized"**

**Problem:** The `CRON_SECRET` doesn't match or header is incorrect.

**Solution:**
1. Verify `CRON_SECRET` in Vercel matches the one in cron-job.org header
2. Check header format: `Bearer [secret]` (with space after Bearer)
3. Make sure Vercel deployment completed after adding the env var
4. Try testing with curl:
   ```bash
   curl https://www.prepskul.com/api/cron/process-scheduled-notifications \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

---

### **Error: "404 Not Found"**

**Problem:** URL is incorrect or route not deployed.

**Solution:**
1. Test URL in browser first
2. Check Vercel Functions tab - route should be there
3. Verify domain is correct (`www.prepskul.com`)
4. Try Vercel default domain: `prepskul.vercel.app`

---

### **Cron Job Runs But No Notifications Processed**

**Problem:** No scheduled notifications are due, or there's an error processing them.

**Solution:**
1. Check Supabase `scheduled_notifications` table:
   - Filter by `status = 'pending'`
   - Check if any have `scheduled_for <= NOW()`
2. Check Vercel logs for errors
3. Verify response shows `"processed": X` where X > 0

---

## 📊 Monitoring

### **Cron-job.org Dashboard:**
- **Last execution:** Shows when it last ran
- **Status:** Shows success/failure
- **Response time:** Shows how long it took
- **Logs:** Shows full response from your API

### **Vercel Dashboard:**
- **Functions tab:** Shows execution logs
- **Analytics:** Shows request count and errors

### **Supabase:**
- **Table Editor:** Check `scheduled_notifications` table
- Filter by `status` to see:
  - `pending`: Waiting to be processed
  - `sent`: Successfully processed
  - `failed`: Failed to process (check `error_message` column)

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Cron-job.org shows successful executions every 5 minutes
2. ✅ Vercel Functions shows incoming requests
3. ✅ Supabase `scheduled_notifications` table shows `status = 'sent'` for processed notifications
4. ✅ Users receive their scheduled notifications (emails, in-app, etc.)

---

## 🎉 You're Done!

Once everything is set up:
- ✅ Cron job runs every 5 minutes
- ✅ Processes scheduled notifications automatically
- ✅ Sends emails, in-app notifications, and push notifications
- ✅ All monitored and logged

**Your scheduled notification system is now fully automated!** 🚀





## 🎯 Goal
Set up an external cron job to run every 5 minutes and process scheduled notifications.

---

## ✅ Prerequisites
- ✅ PR merged to `main` (or ready to merge)
- ✅ Vercel deployment successful
- ✅ Route deployed: `/api/cron/process-scheduled-notifications`

---

## 📋 Step-by-Step Setup

### **Step 1: Generate CRON_SECRET**

Generate a secure random secret:

```bash
openssl rand -hex 32
```

**Copy the output** - you'll need it in the next steps.

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

---

### **Step 2: Add CRON_SECRET to Vercel**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project (**v0-prep-skul-website-build** or **PrepSkul_Web**)

2. **Navigate to Environment Variables:**
   - Click **Settings** (left sidebar)
   - Click **Environment Variables**

3. **Add New Variable:**
   - Click **"Add New"** or **"Add"** button
   - **Key:** `CRON_SECRET`
   - **Value:** Paste your generated secret from Step 1
   - **Environment:** Select all three:
     - ☑️ Production
     - ☑️ Preview
     - ☑️ Development
   - Click **Save**

4. **Redeploy (Important!):**
   - After adding the variable, go to **Deployments**
   - Click **"..."** on latest deployment → **"Redeploy"**
   - OR wait for next auto-deploy (if you just merged to main)

---

### **Step 3: Confirm Your Cron Endpoint URL**

Your cron endpoint will be available at:

**Production URL:**
```
https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Alternative (Vercel default domain):**
```
https://prepskul.vercel.app/api/cron/process-scheduled-notifications
```

**Test it first:**
1. Open in browser: `https://www.prepskul.com/api/cron/process-scheduled-notifications`
2. Should return: `{"error": "Unauthorized. Please provide Authorization: Bearer YOUR_CRON_SECRET header."}`
3. This confirms the route is working! ✅

---

### **Step 4: Set Up Cron Job on Cron-job.org**

1. **Go to:** https://cron-job.org
2. **Log in** to your account (or create one if you haven't)

3. **Create New Cron Job:**
   - Click **"Create cronjob"** or **"+"** button

4. **Fill in the Form:**

   **Basic Settings:**
   - **Title:** `PrepSkul - Process Scheduled Notifications`
   - **Address (URL):** `https://www.prepskul.com/api/cron/process-scheduled-notifications`
   - **Request method:** `GET`

   **Schedule:**
   - **Execution:** `Every 5 minutes`
   - **Timezone:** `UTC` (recommended)

   **Security (IMPORTANT!):**
   - Click **"Add header"** or find **"Request headers"** section
   - **Name:** `Authorization`
   - **Value:** `Bearer [your-secret-from-step-1]`
   - **Example:** `Bearer a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`
   - ⚠️ **Important:** Include the word `Bearer` followed by a space, then your secret

   **Advanced (Optional):**
   - **Request timeout:** `60` seconds
   - **Status code:** `200` (expected success code)
   - **Notification on failure:** Enable if you want email alerts

5. **Save:**
   - Click **"Create cronjob"** or **"Save"**

---

### **Step 5: Test the Cron Job**

1. **In cron-job.org:**
   - Find your newly created cron job
   - Click **"Execute now"** or **"Test"** button
   - Wait a few seconds

2. **Check the Result:**
   - Should show **Status: 200 OK**
   - Response should be:
     ```json
     {
       "success": true,
       "processed": 0,
       "message": "No scheduled notifications to process"
     }
     ```

3. **If you see "Unauthorized":**
   - Check that the `Authorization` header is correct
   - Make sure it includes `Bearer ` (with space) before the secret
   - Verify `CRON_SECRET` is set in Vercel and deployment is complete

---

### **Step 6: Enable and Monitor**

1. **Enable the Cron Job:**
   - In cron-job.org, make sure the cron job is **enabled** (toggle should be ON)

2. **Monitor First Few Executions:**
   - Check cron-job.org dashboard
   - Look at execution logs
   - Should show successful runs every 5 minutes

3. **Check Vercel Logs:**
   - Vercel Dashboard → Your Project → **Functions**
   - Click on `/api/cron/process-scheduled-notifications`
   - Check execution logs to see if it's being called

---

## 🧪 Testing Checklist

- [ ] Generated `CRON_SECRET` using `openssl rand -hex 32`
- [ ] Added `CRON_SECRET` to Vercel environment variables (all environments)
- [ ] Redeployed Vercel (or waited for auto-deploy)
- [ ] Tested endpoint in browser (should show "Unauthorized" without header)
- [ ] Created cron job on cron-job.org
- [ ] Added `Authorization: Bearer [secret]` header
- [ ] Set schedule to "Every 5 minutes"
- [ ] Tested cron job manually ("Execute now")
- [ ] Verified response shows `"success": true`
- [ ] Enabled cron job
- [ ] Monitored first few executions

---

## 🔍 Troubleshooting

### **Error: "Unauthorized"**

**Problem:** The `CRON_SECRET` doesn't match or header is incorrect.

**Solution:**
1. Verify `CRON_SECRET` in Vercel matches the one in cron-job.org header
2. Check header format: `Bearer [secret]` (with space after Bearer)
3. Make sure Vercel deployment completed after adding the env var
4. Try testing with curl:
   ```bash
   curl https://www.prepskul.com/api/cron/process-scheduled-notifications \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

---

### **Error: "404 Not Found"**

**Problem:** URL is incorrect or route not deployed.

**Solution:**
1. Test URL in browser first
2. Check Vercel Functions tab - route should be there
3. Verify domain is correct (`www.prepskul.com`)
4. Try Vercel default domain: `prepskul.vercel.app`

---

### **Cron Job Runs But No Notifications Processed**

**Problem:** No scheduled notifications are due, or there's an error processing them.

**Solution:**
1. Check Supabase `scheduled_notifications` table:
   - Filter by `status = 'pending'`
   - Check if any have `scheduled_for <= NOW()`
2. Check Vercel logs for errors
3. Verify response shows `"processed": X` where X > 0

---

## 📊 Monitoring

### **Cron-job.org Dashboard:**
- **Last execution:** Shows when it last ran
- **Status:** Shows success/failure
- **Response time:** Shows how long it took
- **Logs:** Shows full response from your API

### **Vercel Dashboard:**
- **Functions tab:** Shows execution logs
- **Analytics:** Shows request count and errors

### **Supabase:**
- **Table Editor:** Check `scheduled_notifications` table
- Filter by `status` to see:
  - `pending`: Waiting to be processed
  - `sent`: Successfully processed
  - `failed`: Failed to process (check `error_message` column)

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Cron-job.org shows successful executions every 5 minutes
2. ✅ Vercel Functions shows incoming requests
3. ✅ Supabase `scheduled_notifications` table shows `status = 'sent'` for processed notifications
4. ✅ Users receive their scheduled notifications (emails, in-app, etc.)

---

## 🎉 You're Done!

Once everything is set up:
- ✅ Cron job runs every 5 minutes
- ✅ Processes scheduled notifications automatically
- ✅ Sends emails, in-app notifications, and push notifications
- ✅ All monitored and logged

**Your scheduled notification system is now fully automated!** 🚀






