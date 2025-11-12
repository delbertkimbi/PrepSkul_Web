# Update .env.local File

## 📝 Instructions

**You need to manually update your `.env.local` file** (I cannot edit it directly for security reasons).

## 🔧 What to Add/Update

Open `/Users/user/Desktop/PrepSkul/PrepSkul_Web/.env.local` and add/update these lines:

```env
# ======================================================
# EMAIL SERVICE (RESEND)
# ======================================================
RESEND_API_KEY=your-resend-api-key-here
RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>
RESEND_REPLY_TO=info@prepskul.com
RESEND_ACCOUNT_OWNER_EMAIL=prepskul@gmail.com
```

## 📋 Complete .env.local Example

Your `.env.local` file should include (at minimum):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cpzaxdfxbamdsshdgjyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Resend Email Service
RESEND_API_KEY=re_your-actual-api-key-here
RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>
RESEND_REPLY_TO=info@prepskul.com
RESEND_ACCOUNT_OWNER_EMAIL=prepskul@gmail.com
```

## ✅ After Updating

1. **Save the file**
2. **Restart your Next.js server:**
   ```bash
   cd /Users/user/Desktop/PrepSkul/PrepSkul_Web
   # Stop server (Ctrl+C if running)
   pnpm dev
   ```

## 🧪 Test

1. Go to admin dashboard
2. Approve a tutor
3. Email should send successfully! ✅

## ⚠️ Important Notes

- **RESEND_FROM_EMAIL:** Must be `info@mail.prepskul.com` (verified domain)
- **RESEND_REPLY_TO:** Can be `info@prepskul.com` (your actual business email)
- **RESEND_API_KEY:** Get from https://resend.com/api-keys
- **Never commit `.env.local` to Git** (it should be in `.gitignore`)

## 🎯 Quick Copy-Paste

Copy these lines into your `.env.local`:

```env
RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>
RESEND_REPLY_TO=info@prepskul.com
```

Then restart your server! 🚀






