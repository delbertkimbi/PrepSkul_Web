# Final Email Setup Checklist - app.prepskul.com

## ✅ You're Using: `app.prepskul.com`

Perfect choice! This is already set up in Resend and ready to go.

## 📋 Setup Checklist

### Step 1: Resend Domain Settings ✅

- [x] Domain `app.prepskul.com` added to Resend
- [ ] **Enable Sending:** ON (Green toggle) ✅
- [ ] **Enable Receiving:** OFF (Gray toggle) ❌
- [ ] All DNS records added to your DNS provider
- [ ] Clicked "I've added the records" button
- [ ] Domain verified (all records show "Verified" ✅)

### Step 2: DNS Records Added

Make sure you've added these records for `app.prepskul.com`:

- [ ] **DKIM Record (TXT):** `resend._domainkey.app`
- [ ] **SPF Record (TXT):** `send.app`
- [ ] **MX Record:** `send.app` (Priority: 10)
- [ ] **DMARC Record (TXT):** `_dmarc.app` (Optional but recommended)

### Step 3: Environment Variables

**⚠️ Manual Update Required:** Open `/Users/user/Desktop/PrepSkul/PrepSkul_Web/.env.local` and add/update:

```env
RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>
RESEND_REPLY_TO=info@prepskul.com
```

**Note:** Make sure you also have `RESEND_API_KEY` set in your `.env.local` file!

**Full example:**
```env
RESEND_API_KEY=re_your-actual-api-key-here
RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>
RESEND_REPLY_TO=info@prepskul.com
RESEND_ACCOUNT_OWNER_EMAIL=prepskul@gmail.com
```

### Step 4: Restart Server

```bash
cd /Users/user/Desktop/PrepSkul/PrepSkul_Web
# Stop server (Ctrl+C if running)
pnpm dev
```

### Step 5: Test Email Sending

- [ ] Go to admin dashboard
- [ ] Approve a tutor
- [ ] Check tutor's email inbox
- [ ] Email should arrive successfully! ✅

## ✅ Expected Result

**Recipients will see:**
- **From:** PrepSkul <info@mail.prepskul.com>
- **Reply-To:** info@prepskul.com
- **When they reply:** Email goes to `info@prepskul.com`

## 🎯 Quick Reference

| Setting | Value | Status |
|---------|-------|--------|
| Domain | `app.prepskul.com` | ✅ Verified in Resend |
| Send FROM | `info@mail.prepskul.com` | ✅ (doesn't need to exist) |
| Reply-To | `info@prepskul.com` | ✅ (your actual email) |
| Enable Sending | ON | ✅ Required |
| Enable Receiving | OFF | ✅ Not needed |

## 🚀 You're All Set!

Once DNS records are verified, you'll be able to send emails to any recipient! 🎉

