# Resend Email Setup Guide

## ⚠️ Important: Default Email Limitations

**Resend's default email (`onboarding@resend.dev`) can ONLY send to the account owner's email address.**

- ✅ **Can send to:** Your account owner email (the email you signed up with Resend, e.g., `prepskul@gmail.com`)
- ❌ **Cannot send to:** Any other email addresses (like tutor emails)

**To send emails to other recipients, you MUST verify a domain.**

### Why `onboarding@resend.dev`?

I'm using `onboarding@resend.dev` as the default sender email because:

1. **No Domain Verification Required**: Resend provides this test domain (`@resend.dev`) that works immediately without any setup
2. **Works Out of the Box**: You can send emails immediately after getting your API key
3. **Testing**: Perfect for development and testing before you verify your own domain
4. **Limitations**: 
   - Can only send to account owner's email
   - Emails from `@resend.dev` may be marked as less trustworthy by email providers

## What You Need to Do on Resend

### Step 1: Get Your Resend API Key

1. Go to [Resend Dashboard](https://resend.com/login)
2. Sign in (or create an account if you don't have one)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Give it a name (e.g., "PrepSkul Production" or "PrepSkul Development")
6. Copy the API key (it starts with `re_...`)
7. ⚠️ **Important**: Save it immediately - you can't see it again!

### Step 2: Add API Key to Your Environment

**For Next.js (PrepSkul_Web):**

1. Open `/Users/user/Desktop/PrepSkul/PrepSkul_Web/.env.local`
2. Add or update:
   ```env
   RESEND_API_KEY=re_your-actual-api-key-here
   RESEND_FROM_EMAIL=PrepSkul <onboarding@resend.dev>
   ```
3. Restart your Next.js dev server

**For Flutter (prepskul_app):**

The Flutter app doesn't send emails directly - emails are sent from the Next.js API, so you only need to configure it in the Next.js `.env.local` file.

### Step 3: Test Email Sending

1. Start your Next.js server: `cd PrepSkul_Web && pnpm dev`
2. Go to admin dashboard
3. Approve a tutor
4. Check the tutor's email inbox (and spam folder)
5. You should receive the approval email!

### Step 4: Verify Your Domain (For Production)

**You can use ANY domain you own!** For example:
- `deltechhub.com` ✅ (Recommended if `prepskul.com` has verification issues)
- `prepskul.com` ✅

**To use `info@deltechhub.com` (or `info@prepskul.com`):**

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter your domain: **`deltechhub.com`** (or `prepskul.com`)
4. Resend will provide DNS records to add:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT) - Optional but recommended
5. Add these records to your DNS provider (wherever your domain is hosted)
6. Wait for DNS propagation (usually 5-30 minutes)
7. Resend will verify automatically
8. Once verified, update your `.env.local`:
   ```env
   RESEND_FROM_EMAIL=PrepSkul <info@deltechhub.com>
   ```
   or
   ```env
   RESEND_FROM_EMAIL=PrepSkul <notifications@deltechhub.com>
   ```
   
   > **Note:** Even though you use `info@deltechhub.com` for sending, recipients will see "PrepSkul" as the sender name. The domain is just for email authentication.

## Resend API Key - Where to Find It

If you've already created a Resend account but can't find your API key:

1. **Log in to Resend**: https://resend.com/login
2. **Go to API Keys**: Click on "API Keys" in the sidebar
3. **View Existing Keys**: You'll see a list of API keys you've created
4. **Create New Key**: If you don't see any keys or can't access them:
   - Click **"Create API Key"**
   - Name it (e.g., "PrepSkul Production")
   - **Copy it immediately** (it won't be shown again!)
   - Save it in a secure password manager

## Quick Setup Checklist

- [ ] Sign up/Login to Resend
- [ ] Create an API key
- [ ] Copy the API key (starts with `re_...`)
- [ ] Add to `.env.local`: `RESEND_API_KEY=re_your-key-here`
- [ ] Test sending an approval email
- [ ] (Optional) Verify your domain for production

## Troubleshooting

### "RESEND_API_KEY is not configured"
- Make sure you've added `RESEND_API_KEY` to `.env.local`
- Make sure you've restarted your Next.js dev server
- Check that the key starts with `re_`

### Emails not sending
- Check your Resend dashboard for error logs
- Verify the API key is correct
- Check that the recipient email is valid
- Check spam folder

### Domain verification issues
- Make sure DNS records are added correctly
- Wait for DNS propagation (can take up to 48 hours)
- Check Resend dashboard for verification status
- Make sure you're using the exact records Resend provides

## Current Configuration

Based on your `env.template`, you need to:

1. **Get your Resend API key** from https://resend.com
2. **Add it to `.env.local`** in the `PrepSkul_Web` directory:
   ```env
   RESEND_API_KEY=re_your-actual-api-key-here
   RESEND_FROM_EMAIL=PrepSkul <onboarding@resend.dev>
   ```

## Need Your API Key?

If you've shared your Resend API key with me before but I don't have access to it:
1. Please share it again, OR
2. Create a new API key in Resend dashboard
3. Share the new key with me
4. I'll help you add it to your `.env.local` file

**Note**: I cannot access your Resend dashboard or retrieve keys that were shared in previous conversations. You'll need to either:
- Find it in your password manager/notes
- Create a new one from Resend dashboard
- Share it with me again

