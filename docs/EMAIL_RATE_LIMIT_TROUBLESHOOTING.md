# 📧 Email Rate Limit Troubleshooting Guide

## 🚨 The Problem

Emails sometimes stop being sent during authentication, then come back later. This is **almost always due to rate limiting**.

---

## 🔍 Root Causes

### **1. Supabase Email Rate Limits (Most Common)**

**If you're using Supabase's built-in email service:**

| Tier | Limit | Impact |
|------|-------|--------|
| **Free** | **2 emails/hour per user** | ❌ Very restrictive |
| **Pro** | **4 emails/hour per user** | ⚠️ Still restrictive |
| **Team** | Custom limits | ✅ Better |
| **Enterprise** | Custom limits | ✅ Best |

**What counts as "1 email":**
- Signup confirmation email
- Password reset email
- Email change confirmation
- Magic link email
- **All share the same limit per user**

**Example:**
- User requests password reset → 1 email sent
- User requests another password reset 30 min later → **BLOCKED** (rate limit)
- After 1 hour → ✅ Works again

---

### **2. Resend API Rate Limits**

**If you're using Resend SMTP (configured in Supabase):**

| Tier | Limit | Notes |
|------|-------|-------|
| **Free** | 3,000 emails/month | ~100/day average |
| **Pro ($20/mo)** | 50,000 emails/month | ~1,667/day |
| **Scale ($90/mo)** | 100,000 emails/month | ~3,333/day |

**Rate Limits:**
- **Per-second:** ~10 emails/second (burst)
- **Per-minute:** ~100 emails/minute
- **Per-hour:** ~1,000 emails/hour
- **Per-day:** Based on monthly quota

**What happens when limit is hit:**
- Returns `429 Too Many Requests` error
- Emails are **silently dropped** (no error shown to user)
- After cooldown period → ✅ Works again

---

### **3. Silent Failures**

**Problem:** Rate limit errors are often **silent** - no error message shown to user.

**Why:**
- Supabase doesn't always return clear rate limit errors
- Resend errors might not be properly caught
- Error handling might not surface rate limit messages

---

## ✅ Solutions

### **Solution 1: Configure Resend as Supabase SMTP (RECOMMENDED)**

This bypasses Supabase's restrictive email limits:

**Steps:**

1. **Get Resend API Key:**
   - Go to: https://resend.com/api-keys
   - Copy your API key

2. **Configure in Supabase:**
   - Go to: **Supabase Dashboard** → **Authentication** → **SMTP Settings**
   - **Enable Custom SMTP:** Toggle ON
   - **SMTP Host:** `smtp.resend.com`
   - **SMTP Port:** `587`
   - **SMTP Username:** `resend`
   - **SMTP Password:** `[Your Resend API Key]`
   - **Sender Email:** `noreply@mail.prepskul.com` (must be verified domain)
   - **Sender Name:** `PrepSkul`
   - Click **Save**

3. **Verify Domain in Resend:**
   - Go to: https://resend.com/domains
   - Add domain: `mail.prepskul.com`
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification

**Benefits:**
- ✅ **3,000 emails/month** (free) vs 2 emails/hour (Supabase free)
- ✅ **No per-user limits** - just total monthly quota
- ✅ **Better deliverability**
- ✅ **Professional sender address**

---

### **Solution 2: Add Rate Limit Handling (Code Fix)**

Add retry logic and error handling for rate limits:

**For Web Project (Next.js):**

```typescript
// lib/email-rate-limit-handler.ts
export async function sendEmailWithRetry(
  sendFn: () => Promise<any>,
  maxRetries = 3
): Promise<{ success: boolean; error?: string }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await sendFn();
      
      // Check for rate limit error
      if (result.error) {
        const errorMsg = result.error.message || result.error.toString();
        
        // Check if it's a rate limit error
        if (
          errorMsg.includes('429') ||
          errorMsg.includes('rate limit') ||
          errorMsg.includes('too many requests') ||
          errorMsg.includes('quota exceeded')
        ) {
          // Calculate backoff delay (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
          
          console.warn(`⚠️ Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry
          } else {
            return {
              success: false,
              error: 'Email service is temporarily unavailable due to rate limits. Please try again in a few minutes.',
            };
          }
        }
        
        // Other errors - return immediately
        return {
          success: false,
          error: errorMsg,
        };
      }
      
      // Success
      return { success: true };
    } catch (error: any) {
      // Check for rate limit in exception
      const errorMsg = error.message || error.toString();
      
      if (
        errorMsg.includes('429') ||
        errorMsg.includes('rate limit') ||
        errorMsg.includes('too many requests')
      ) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // Last attempt or non-rate-limit error
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
  
  return {
    success: false,
    error: 'Failed to send email after multiple attempts',
  };
}
```

**Usage:**

```typescript
// In your email sending code
import { sendEmailWithRetry } from '@/lib/email-rate-limit-handler';

const result = await sendEmailWithRetry(async () => {
  return await resend.emails.send({
    from: fromEmail,
    to: tutorEmail,
    subject: subject,
    html: body,
  });
});

if (!result.success) {
  console.error('Email failed:', result.error);
  // Show user-friendly error
}
```

---

### **Solution 3: Add User-Friendly Error Messages**

**Current Problem:** Users don't know why emails aren't sending.

**Fix:** Show clear error messages:

```typescript
// In email sending functions
if (error) {
  const errorMsg = error.message || error.toString().toLowerCase();
  
  let userMessage = 'Failed to send email. Please try again.';
  
  if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
    userMessage = 'Email service is temporarily busy. Please try again in a few minutes.';
  } else if (errorMsg.includes('quota') || errorMsg.includes('limit exceeded')) {
    userMessage = 'Email quota exceeded. Please contact support or try again later.';
  } else if (errorMsg.includes('invalid') || errorMsg.includes('unauthorized')) {
    userMessage = 'Email service configuration error. Please contact support.';
  }
  
  return {
    success: false,
    error: userMessage,
  };
}
```

---

### **Solution 4: Monitor Email Sending**

**Add logging to track email failures:**

```typescript
// Track email sending attempts
const emailLog = {
  timestamp: new Date().toISOString(),
  to: tutorEmail,
  subject: subject,
  success: false,
  error: null,
  retryCount: 0,
};

try {
  const result = await sendEmail();
  emailLog.success = true;
} catch (error) {
  emailLog.error = error.message;
  emailLog.retryCount = retryCount;
}

// Log to database or monitoring service
await logEmailAttempt(emailLog);
```

---

## 🔧 Quick Fixes

### **Immediate Actions:**

1. **Check Resend Dashboard:**
   - Go to: https://resend.com/dashboard
   - Check **Usage** tab
   - See if you've hit monthly quota
   - Check **Rate Limits** section

2. **Check Supabase Logs:**
   - Go to: **Supabase Dashboard** → **Authentication** → **Logs**
   - Look for rate limit errors
   - Check email sending attempts

3. **Verify SMTP Configuration:**
   - Go to: **Supabase Dashboard** → **Authentication** → **SMTP Settings**
   - Ensure Custom SMTP is enabled
   - Verify Resend credentials are correct

4. **Check Domain Verification:**
   - Go to: https://resend.com/domains
   - Ensure `mail.prepskul.com` is verified
   - Check DNS records are correct

---

## 📊 Rate Limit Comparison

### **Supabase (Built-in Email Service):**
- ❌ **2-4 emails/hour per user** (very restrictive)
- ❌ **Per-user limit** (each user has separate limit)
- ❌ **Silent failures** (no clear error messages)

### **Resend (Custom SMTP):**
- ✅ **3,000 emails/month** (free tier)
- ✅ **No per-user limit** (just total quota)
- ✅ **Better error messages**
- ✅ **Better deliverability**

**Recommendation:** ✅ **Use Resend SMTP** for production

---

## 🎯 Best Practices

1. **Always use Resend SMTP** (not Supabase built-in)
2. **Add retry logic** with exponential backoff
3. **Show user-friendly errors** for rate limits
4. **Monitor email sending** (log failures)
5. **Set up alerts** for quota warnings
6. **Upgrade Resend plan** if hitting limits frequently

---

## 🚨 Emergency: Emails Completely Stopped

**If emails have completely stopped:**

1. **Check Resend quota:**
   ```bash
   # Check via API or dashboard
   curl https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. **Check Supabase SMTP:**
   - Verify SMTP credentials are correct
   - Test SMTP connection
   - Check if domain is verified

3. **Temporary Workaround:**
   - Disable email confirmations temporarily
   - Use phone OTP instead
   - Or manually send emails

4. **Upgrade Plan:**
   - Resend Pro: $20/month for 50,000 emails
   - Or Supabase Pro: $25/month (but still restrictive)

---

## 📚 Related Documentation

- **Resend Setup:** `docs/SKULMATE_OPENROUTER_SETUP.md` (has Resend info)
- **Supabase SMTP:** `docs/EMAIL_VERIFICATION_NOT_WORKING.md`
- **Rate Limits:** `docs/SCALABILITY_ANALYSIS.md`

---

## 🔗 Useful Links

- **Resend Dashboard:** https://resend.com/dashboard
- **Resend API Docs:** https://resend.com/docs
- **Supabase SMTP Settings:** https://app.supabase.com → Authentication → SMTP
- **Resend Domain Setup:** https://resend.com/domains



