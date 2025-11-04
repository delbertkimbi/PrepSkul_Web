# 📧 Resend Email Setup for Tutor Notifications

## ✅ **What's Done:**
1. ✅ Installed Resend: `pnpm add resend`
2. ✅ Updated `lib/notifications.ts` with email templates
3. ✅ Integrated into admin approve/reject API routes

## 🔧 **What You Need to Do:**

### **1. Get Resend API Key**
1. Go to: https://resend.com/signup
2. Sign up for free (100 emails/day)
3. Go to: https://resend.com/api-keys
4. Create new API key
5. Copy the key (starts with `re_`)

### **2. Add to Environment**
In `../PrepSkul_Web/.env.local`:
```bash
RESEND_API_KEY=re_your_actual_key_here
```

### **3. Verify Domain (Optional)**
For production:
1. Go to: https://resend.com/domains
2. Add `prepskul.com`
3. Add DNS records (they provide)
4. Wait for verification

**Without domain verification:** Emails will show "via resend.net"

### **4. Restart Dev Server**
```bash
cd ../PrepSkul_Web
pnpm dev
```

---

## 🧪 **Test It:**
1. Go to admin dashboard
2. Approve a tutor
3. Check console logs for `✅ Approval email sent`
4. Check tutor's email inbox

---

## 📊 **What You Get:**
- ✅ Beautiful HTML emails
- ✅ Approval emails (green design)
- ✅ Rejection emails (red design)
- ✅ Professional templates
- ✅ Mobile responsive
- ✅ Branded with PrepSkul colors

---

**Free tier:** 100 emails/day - Perfect for MVP testing!




## ✅ **What's Done:**
1. ✅ Installed Resend: `pnpm add resend`
2. ✅ Updated `lib/notifications.ts` with email templates
3. ✅ Integrated into admin approve/reject API routes

## 🔧 **What You Need to Do:**

### **1. Get Resend API Key**
1. Go to: https://resend.com/signup
2. Sign up for free (100 emails/day)
3. Go to: https://resend.com/api-keys
4. Create new API key
5. Copy the key (starts with `re_`)

### **2. Add to Environment**
In `../PrepSkul_Web/.env.local`:
```bash
RESEND_API_KEY=re_your_actual_key_here
```

### **3. Verify Domain (Optional)**
For production:
1. Go to: https://resend.com/domains
2. Add `prepskul.com`
3. Add DNS records (they provide)
4. Wait for verification

**Without domain verification:** Emails will show "via resend.net"

### **4. Restart Dev Server**
```bash
cd ../PrepSkul_Web
pnpm dev
```

---

## 🧪 **Test It:**
1. Go to admin dashboard
2. Approve a tutor
3. Check console logs for `✅ Approval email sent`
4. Check tutor's email inbox

---

## 📊 **What You Get:**
- ✅ Beautiful HTML emails
- ✅ Approval emails (green design)
- ✅ Rejection emails (red design)
- ✅ Professional templates
- ✅ Mobile responsive
- ✅ Branded with PrepSkul colors

---

**Free tier:** 100 emails/day - Perfect for MVP testing!



