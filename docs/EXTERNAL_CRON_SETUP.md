# ⏰ External Cron Job Setup Guide - Cron-job.org

## 🎯 Your Cron Job URL

**For your domain (`prepskul.com`):**

```
https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Alternative (if you have a different subdomain):**
- If using `admin.prepskul.com`: `https://admin.prepskul.com/api/cron/process-scheduled-notifications`
- If using `app.prepskul.com`: `https://app.prepskul.com/api/cron/process-scheduled-notifications`

**To confirm your exact URL:**
1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on the latest deployment
3. Check the **Domains** section
4. Use the domain that shows as **"Production"** or **"Primary"**

---

## 📋 Step-by-Step Setup

### **Step 1: Generate a Cron Secret (Recommended for Security)**

1. **Generate a secure random string:**
   ```bash
   # On macOS/Linux:
   openssl rand -hex 32
   
   # Or use an online generator:
   # https://randomkeygen.com/
   ```

2. **Add to Vercel Environment Variables:**
   - Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
   - Add:
     - **Name:** `CRON_SECRET`
     - **Value:** `[your-generated-secret]` (e.g., `a1b2c3d4e5f6...`)
     - **Environment:** Select **Production**, **Preview**, and **Development**
   - Click **Save**

3. **Redeploy** (or wait for next deployment)

---

### **Step 2: Set Up Cron Job on Cron-job.org**

1. **Go to:** https://cron-job.org
2. **Log in** to your account
3. **Click:** "Create cronjob" (or "+" button)

4. **Fill in the form:**

   **Basic Settings:**
   - **Title:** `PrepSkul - Process Scheduled Notifications`
   - **Address (URL):** `https://www.prepskul.com/api/cron/process-scheduled-notifications`
   - **Request method:** `GET`

   **Schedule:**
   - **Execution:** `Every 5 minutes` (or your preferred interval)
   - **Timezone:** `UTC` (recommended)

   **Security (Important!):**
   - **Request headers:** Click "Add header"
     - **Name:** `Authorization`
     - **Value:** `Bearer YOUR_CRON_SECRET` (replace `YOUR_CRON_SECRET` with the secret you generated in Step 1)
   - **Example:** `Bearer a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

   **Advanced (Optional):**
   - **Request timeout:** `60` seconds
   - **Status code:** `200` (expected success code)
   - **Notification on failure:** Enable if you want email alerts

5. **Click:** "Create cronjob"

---

### **Step 3: Test the Cron Job**

1. **Manual Test:**
   ```bash
   curl https://www.prepskul.com/api/cron/process-scheduled-notifications \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

   **Expected Response:**
   ```json
   {
     "success": true,
     "processed": 0,
     "message": "No scheduled notifications to process"
   }
   ```

2. **Test from Cron-job.org:**
   - Go to your cron job in cron-job.org
   - Click **"Execute now"** or **"Test"**
   - Check the **"Last execution"** log
   - Should show **Status: 200 OK**

---

### **Step 4: Remove Vercel Cron (Optional)**

Since you're using an external cron service, you can remove the Vercel cron job:

1. **Edit `vercel.json`:**
   ```json
   {
     "crons": []
   }
   ```
   Or delete the `crons` array entirely.

2. **Commit and push:**
   ```bash
   git add vercel.json
   git commit -m "Remove Vercel cron - using external service"
   git push
   ```

**Note:** You can keep both if you want a backup, but it's not necessary.

---

## 🔍 Troubleshooting

### **Error: "Unauthorized"**

**Problem:** The `CRON_SECRET` doesn't match or isn't set.

**Solution:**
1. Check that `CRON_SECRET` is set in Vercel environment variables
2. Verify the header value in cron-job.org matches exactly: `Bearer [your-secret]`
3. Make sure there are no extra spaces in the header value
4. Redeploy after adding the environment variable

---

### **Error: "Cannot connect" or Timeout**

**Problem:** The URL is incorrect or the server is down.

**Solution:**
1. **Verify the URL:**
   - Test in browser: `https://www.prepskul.com/api/cron/process-scheduled-notifications`
   - Should return JSON (even if unauthorized, you'll get an error response)
   
2. **Check Vercel deployment:**
   - Go to Vercel Dashboard → Deployments
   - Ensure latest deployment is successful
   - Check if domain is correctly configured

3. **Check DNS:**
   - Verify `www.prepskul.com` points to Vercel
   - Use: `nslookup www.prepskul.com` or `dig www.prepskul.com`

---

### **Cron Job Runs But No Notifications Sent**

**Problem:** No scheduled notifications are due, or there's an error processing them.

**Solution:**
1. **Check the response:**
   - Look at cron-job.org execution logs
   - Response should show `"processed": X` where X > 0
   
2. **Check Supabase:**
   - Go to Supabase Dashboard → Table Editor → `scheduled_notifications`
   - Filter by `status = 'pending'`
   - Check if any have `scheduled_for <= NOW()`

3. **Check Vercel logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on `/api/cron/process-scheduled-notifications`
   - Check execution logs for errors

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

## ✅ Verification Checklist

- [ ] Generated `CRON_SECRET` and added to Vercel environment variables
- [ ] Created cron job on cron-job.org with correct URL
- [ ] Added `Authorization: Bearer [secret]` header
- [ ] Tested manually with `curl` command
- [ ] Tested from cron-job.org "Execute now"
- [ ] Verified response shows `"success": true`
- [ ] Checked cron-job.org shows successful executions
- [ ] (Optional) Removed Vercel cron from `vercel.json`

---

## 🔗 Quick Reference

**Your Cron Job URL:**
```
https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Required Header (if CRON_SECRET is set):**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Test Command:**
```bash
curl https://www.prepskul.com/api/cron/process-scheduled-notifications \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Cron-job.org:** https://cron-job.org

**Vercel Dashboard:** https://vercel.com/dashboard

---

## 🎉 Done!

Your cron job is now set up and will run every 5 minutes (or your chosen interval) to process scheduled notifications!





## 🎯 Your Cron Job URL

**For your domain (`prepskul.com`):**

```
https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Alternative (if you have a different subdomain):**
- If using `admin.prepskul.com`: `https://admin.prepskul.com/api/cron/process-scheduled-notifications`
- If using `app.prepskul.com`: `https://app.prepskul.com/api/cron/process-scheduled-notifications`

**To confirm your exact URL:**
1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on the latest deployment
3. Check the **Domains** section
4. Use the domain that shows as **"Production"** or **"Primary"**

---

## 📋 Step-by-Step Setup

### **Step 1: Generate a Cron Secret (Recommended for Security)**

1. **Generate a secure random string:**
   ```bash
   # On macOS/Linux:
   openssl rand -hex 32
   
   # Or use an online generator:
   # https://randomkeygen.com/
   ```

2. **Add to Vercel Environment Variables:**
   - Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
   - Add:
     - **Name:** `CRON_SECRET`
     - **Value:** `[your-generated-secret]` (e.g., `a1b2c3d4e5f6...`)
     - **Environment:** Select **Production**, **Preview**, and **Development**
   - Click **Save**

3. **Redeploy** (or wait for next deployment)

---

### **Step 2: Set Up Cron Job on Cron-job.org**

1. **Go to:** https://cron-job.org
2. **Log in** to your account
3. **Click:** "Create cronjob" (or "+" button)

4. **Fill in the form:**

   **Basic Settings:**
   - **Title:** `PrepSkul - Process Scheduled Notifications`
   - **Address (URL):** `https://www.prepskul.com/api/cron/process-scheduled-notifications`
   - **Request method:** `GET`

   **Schedule:**
   - **Execution:** `Every 5 minutes` (or your preferred interval)
   - **Timezone:** `UTC` (recommended)

   **Security (Important!):**
   - **Request headers:** Click "Add header"
     - **Name:** `Authorization`
     - **Value:** `Bearer YOUR_CRON_SECRET` (replace `YOUR_CRON_SECRET` with the secret you generated in Step 1)
   - **Example:** `Bearer a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

   **Advanced (Optional):**
   - **Request timeout:** `60` seconds
   - **Status code:** `200` (expected success code)
   - **Notification on failure:** Enable if you want email alerts

5. **Click:** "Create cronjob"

---

### **Step 3: Test the Cron Job**

1. **Manual Test:**
   ```bash
   curl https://www.prepskul.com/api/cron/process-scheduled-notifications \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

   **Expected Response:**
   ```json
   {
     "success": true,
     "processed": 0,
     "message": "No scheduled notifications to process"
   }
   ```

2. **Test from Cron-job.org:**
   - Go to your cron job in cron-job.org
   - Click **"Execute now"** or **"Test"**
   - Check the **"Last execution"** log
   - Should show **Status: 200 OK**

---

### **Step 4: Remove Vercel Cron (Optional)**

Since you're using an external cron service, you can remove the Vercel cron job:

1. **Edit `vercel.json`:**
   ```json
   {
     "crons": []
   }
   ```
   Or delete the `crons` array entirely.

2. **Commit and push:**
   ```bash
   git add vercel.json
   git commit -m "Remove Vercel cron - using external service"
   git push
   ```

**Note:** You can keep both if you want a backup, but it's not necessary.

---

## 🔍 Troubleshooting

### **Error: "Unauthorized"**

**Problem:** The `CRON_SECRET` doesn't match or isn't set.

**Solution:**
1. Check that `CRON_SECRET` is set in Vercel environment variables
2. Verify the header value in cron-job.org matches exactly: `Bearer [your-secret]`
3. Make sure there are no extra spaces in the header value
4. Redeploy after adding the environment variable

---

### **Error: "Cannot connect" or Timeout**

**Problem:** The URL is incorrect or the server is down.

**Solution:**
1. **Verify the URL:**
   - Test in browser: `https://www.prepskul.com/api/cron/process-scheduled-notifications`
   - Should return JSON (even if unauthorized, you'll get an error response)
   
2. **Check Vercel deployment:**
   - Go to Vercel Dashboard → Deployments
   - Ensure latest deployment is successful
   - Check if domain is correctly configured

3. **Check DNS:**
   - Verify `www.prepskul.com` points to Vercel
   - Use: `nslookup www.prepskul.com` or `dig www.prepskul.com`

---

### **Cron Job Runs But No Notifications Sent**

**Problem:** No scheduled notifications are due, or there's an error processing them.

**Solution:**
1. **Check the response:**
   - Look at cron-job.org execution logs
   - Response should show `"processed": X` where X > 0
   
2. **Check Supabase:**
   - Go to Supabase Dashboard → Table Editor → `scheduled_notifications`
   - Filter by `status = 'pending'`
   - Check if any have `scheduled_for <= NOW()`

3. **Check Vercel logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on `/api/cron/process-scheduled-notifications`
   - Check execution logs for errors

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

## ✅ Verification Checklist

- [ ] Generated `CRON_SECRET` and added to Vercel environment variables
- [ ] Created cron job on cron-job.org with correct URL
- [ ] Added `Authorization: Bearer [secret]` header
- [ ] Tested manually with `curl` command
- [ ] Tested from cron-job.org "Execute now"
- [ ] Verified response shows `"success": true`
- [ ] Checked cron-job.org shows successful executions
- [ ] (Optional) Removed Vercel cron from `vercel.json`

---

## 🔗 Quick Reference

**Your Cron Job URL:**
```
https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Required Header (if CRON_SECRET is set):**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Test Command:**
```bash
curl https://www.prepskul.com/api/cron/process-scheduled-notifications \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Cron-job.org:** https://cron-job.org

**Vercel Dashboard:** https://vercel.com/dashboard

---

## 🎉 Done!

Your cron job is now set up and will run every 5 minutes (or your chosen interval) to process scheduled notifications!






