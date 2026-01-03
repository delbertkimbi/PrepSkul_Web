# 🔒 CRON_SECRET Setup Guide

## ✅ Will It Work Without CRON_SECRET?

**Yes!** The cron job will work without `CRON_SECRET`, but it's **not recommended for security**.

### **Without CRON_SECRET:**
- ✅ Cron job will work
- ✅ Any external service can call your endpoint
- ⚠️ **Security risk:** Anyone who knows the URL can trigger your cron job
- ⚠️ Could be abused to spam your database

### **With CRON_SECRET:**
- ✅ Cron job will work
- ✅ Only requests with correct `Authorization: Bearer [secret]` header can access it
- ✅ **Secure:** Prevents unauthorized access
- ✅ **Recommended for production**

---

## 🔑 How to Generate CRON_SECRET

### **Option 1: Using OpenSSL (Recommended)**

**On macOS/Linux:**
```bash
openssl rand -hex 32
```

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**Copy this entire string** - this is your `CRON_SECRET`.

---

### **Option 2: Using Online Generator**

1. Go to: https://randomkeygen.com/
2. Use the **"CodeIgniter Encryption Keys"** section
3. Copy one of the generated keys (64 characters)
4. Or use any secure random string generator

---

### **Option 3: Using Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 Step-by-Step Setup

### **Step 1: Generate the Secret**

Run one of the commands above to generate a random string.

**Example:**
```bash
$ openssl rand -hex 32
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**Copy this value** - you'll need it in the next steps.

---

### **Step 2: Add to Vercel Environment Variables**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project (**PrepSkul_Web**)

2. **Navigate to Environment Variables:**
   - Click **Settings** (left sidebar)
   - Click **Environment Variables**

3. **Add New Variable:**
   - Click **"Add New"** or **"Add"** button
   - **Key:** `CRON_SECRET`
   - **Value:** Paste your generated secret (e.g., `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`)
   - **Environment:** Select all three:
     - ☑️ Production
     - ☑️ Preview
     - ☑️ Development
   - Click **Save**

4. **Redeploy:**
   - After adding the variable, Vercel will automatically redeploy
   - Or manually trigger: **Deployments** → **Redeploy**

---

### **Step 3: Add Authorization Header in Cron-job.org**

1. **Go to your cron job** in cron-job.org
2. **Find "Request headers" or "Headers" section**
3. **Add new header:**
   - **Name:** `Authorization`
   - **Value:** `Bearer [your-secret]`
   - **Example:** `Bearer a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

4. **Important:** 
   - Include the word `Bearer` followed by a space
   - Then paste your secret
   - No quotes needed

5. **Save the cron job**

---

## 🧪 Testing

### **Test Without Secret (If Not Set):**

```bash
curl https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Expected:** `{"success": true, ...}`

---

### **Test With Secret (If Set):**

```bash
curl https://www.prepskul.com/api/cron/process-scheduled-notifications \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected:** `{"success": true, ...}`

**Without header (should fail):**
```bash
curl https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Expected:** `{"error": "Unauthorized. Please provide Authorization: Bearer YOUR_CRON_SECRET header."}`

---

## ⚠️ Important Notes

1. **Keep Your Secret Safe:**
   - Don't commit it to git
   - Don't share it publicly
   - Store it securely

2. **If You Change the Secret:**
   - Update it in Vercel
   - Update it in cron-job.org header
   - Redeploy Vercel

3. **If You Forget the Secret:**
   - Generate a new one
   - Update both Vercel and cron-job.org
   - Old secret will stop working

---

## 🎯 Quick Answer

**Q: Will it work without CRON_SECRET?**
- ✅ Yes, but not secure

**Q: Where do I get the value?**
- Run: `openssl rand -hex 32`
- Copy the output
- Add to Vercel as `CRON_SECRET`
- Add to cron-job.org as `Authorization: Bearer [secret]`

---

## 📝 Checklist

- [ ] Generated secret using `openssl rand -hex 32`
- [ ] Added `CRON_SECRET` to Vercel environment variables
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Redeployed Vercel (or waited for auto-redeploy)
- [ ] Added `Authorization: Bearer [secret]` header in cron-job.org
- [ ] Tested the cron job
- [ ] Verified it works with the header

---

## 🔗 Related Docs

- `docs/EXTERNAL_CRON_SETUP.md` - Full cron setup guide
- `docs/CRON_404_TROUBLESHOOTING.md` - Troubleshooting 404 errors





## ✅ Will It Work Without CRON_SECRET?

**Yes!** The cron job will work without `CRON_SECRET`, but it's **not recommended for security**.

### **Without CRON_SECRET:**
- ✅ Cron job will work
- ✅ Any external service can call your endpoint
- ⚠️ **Security risk:** Anyone who knows the URL can trigger your cron job
- ⚠️ Could be abused to spam your database

### **With CRON_SECRET:**
- ✅ Cron job will work
- ✅ Only requests with correct `Authorization: Bearer [secret]` header can access it
- ✅ **Secure:** Prevents unauthorized access
- ✅ **Recommended for production**

---

## 🔑 How to Generate CRON_SECRET

### **Option 1: Using OpenSSL (Recommended)**

**On macOS/Linux:**
```bash
openssl rand -hex 32
```

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**Copy this entire string** - this is your `CRON_SECRET`.

---

### **Option 2: Using Online Generator**

1. Go to: https://randomkeygen.com/
2. Use the **"CodeIgniter Encryption Keys"** section
3. Copy one of the generated keys (64 characters)
4. Or use any secure random string generator

---

### **Option 3: Using Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 Step-by-Step Setup

### **Step 1: Generate the Secret**

Run one of the commands above to generate a random string.

**Example:**
```bash
$ openssl rand -hex 32
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**Copy this value** - you'll need it in the next steps.

---

### **Step 2: Add to Vercel Environment Variables**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project (**PrepSkul_Web**)

2. **Navigate to Environment Variables:**
   - Click **Settings** (left sidebar)
   - Click **Environment Variables**

3. **Add New Variable:**
   - Click **"Add New"** or **"Add"** button
   - **Key:** `CRON_SECRET`
   - **Value:** Paste your generated secret (e.g., `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`)
   - **Environment:** Select all three:
     - ☑️ Production
     - ☑️ Preview
     - ☑️ Development
   - Click **Save**

4. **Redeploy:**
   - After adding the variable, Vercel will automatically redeploy
   - Or manually trigger: **Deployments** → **Redeploy**

---

### **Step 3: Add Authorization Header in Cron-job.org**

1. **Go to your cron job** in cron-job.org
2. **Find "Request headers" or "Headers" section**
3. **Add new header:**
   - **Name:** `Authorization`
   - **Value:** `Bearer [your-secret]`
   - **Example:** `Bearer a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

4. **Important:** 
   - Include the word `Bearer` followed by a space
   - Then paste your secret
   - No quotes needed

5. **Save the cron job**

---

## 🧪 Testing

### **Test Without Secret (If Not Set):**

```bash
curl https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Expected:** `{"success": true, ...}`

---

### **Test With Secret (If Set):**

```bash
curl https://www.prepskul.com/api/cron/process-scheduled-notifications \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected:** `{"success": true, ...}`

**Without header (should fail):**
```bash
curl https://www.prepskul.com/api/cron/process-scheduled-notifications
```

**Expected:** `{"error": "Unauthorized. Please provide Authorization: Bearer YOUR_CRON_SECRET header."}`

---

## ⚠️ Important Notes

1. **Keep Your Secret Safe:**
   - Don't commit it to git
   - Don't share it publicly
   - Store it securely

2. **If You Change the Secret:**
   - Update it in Vercel
   - Update it in cron-job.org header
   - Redeploy Vercel

3. **If You Forget the Secret:**
   - Generate a new one
   - Update both Vercel and cron-job.org
   - Old secret will stop working

---

## 🎯 Quick Answer

**Q: Will it work without CRON_SECRET?**
- ✅ Yes, but not secure

**Q: Where do I get the value?**
- Run: `openssl rand -hex 32`
- Copy the output
- Add to Vercel as `CRON_SECRET`
- Add to cron-job.org as `Authorization: Bearer [secret]`

---

## 📝 Checklist

- [ ] Generated secret using `openssl rand -hex 32`
- [ ] Added `CRON_SECRET` to Vercel environment variables
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Redeployed Vercel (or waited for auto-redeploy)
- [ ] Added `Authorization: Bearer [secret]` header in cron-job.org
- [ ] Tested the cron job
- [ ] Verified it works with the header

---

## 🔗 Related Docs

- `docs/EXTERNAL_CRON_SETUP.md` - Full cron setup guide
- `docs/CRON_404_TROUBLESHOOTING.md` - Troubleshooting 404 errors






