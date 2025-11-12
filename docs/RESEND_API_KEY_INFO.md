# Resend API Key Information

## Why `onboarding@resend.dev`?

I'm using `onboarding@resend.dev` as the default sender email because:

1. ✅ **No Setup Required**: Resend provides this test domain that works immediately
2. ✅ **No Domain Verification**: You can send emails right away without verifying your domain
3. ✅ **Perfect for Testing**: Ideal for development before you verify your own domain
4. ⚠️ **Limitation**: Emails from `@resend.dev` may be flagged as less trustworthy

## What You Need to Do

### 1. Get Your Resend API Key

Since you mentioned you can't access your Resend account, here's how to get/find your API key:

**Option A: Find Existing Key**
1. Go to https://resend.com/login
2. Log in to your Resend account
3. Click **"API Keys"** in the sidebar
4. You'll see a list of your API keys
5. **Note**: If you can't see the full key, you'll need to create a new one

**Option B: Create New Key**
1. Go to https://resend.com/login
2. Log in to your Resend account
3. Click **"API Keys"** → **"Create API Key"**
4. Give it a name (e.g., "PrepSkul Production")
5. **Copy it immediately** - you won't be able to see it again!
6. Save it securely (password manager, notes, etc.)

### 2. Add API Key to Environment

Once you have your API key (starts with `re_...`):

1. Open `/Users/user/Desktop/PrepSkul/PrepSkul_Web/.env.local`
2. Add or update:
   ```env
   RESEND_API_KEY=re_your-actual-api-key-here
   RESEND_FROM_EMAIL=PrepSkul <onboarding@resend.dev>
   ```
3. Save the file
4. Restart your Next.js dev server (`pnpm dev`)

### 3. Verify It Works

1. Start your Next.js server
2. Go to admin dashboard
3. Approve a tutor
4. Check the tutor's email (and spam folder)
5. You should receive the approval email!

## For Production: Verify Your Domain

To use `info@mail.prepskul.com` instead of `onboarding@resend.dev`:

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `prepskul.com`
4. Resend will show DNS records to add:
   - SPF record (TXT)
   - DKIM record (TXT)
   - DMARC record (TXT) - optional
5. Add these to your DNS provider (where `prepskul.com` is hosted)
6. Wait 5-30 minutes for DNS propagation
7. Resend will verify automatically
8. Once verified, update `.env.local`:
   ```env
   RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>
   ```

## Need Your API Key?

**I don't have access to your Resend API key from previous conversations.** 

You'll need to:
1. **Get it from Resend dashboard** (if you already have one)
2. **OR create a new one** in Resend dashboard
3. **Share it with me** so I can help you add it to your `.env.local`

**Important**: API keys are sensitive - only share them in secure channels and never commit them to Git!

## Resend Free Tier

- ✅ **3,000 emails/month** for free
- ✅ Perfect for development and small-scale production
- ✅ Upgrade plans available for more volume

## Troubleshooting

**Error: "RESEND_API_KEY is not configured"**
- Make sure you've added it to `.env.local`
- Make sure you've restarted your dev server
- Check that the key starts with `re_`

**Emails not sending**
- Check Resend dashboard for error logs
- Verify the API key is correct
- Check recipient email is valid
- Check spam folder






