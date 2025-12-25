# Fix "Email Not Confirmed" Error

## Quick Fix: Disable Email Confirmation (For Development)

Supabase requires email confirmation by default. Here's how to disable it:

### Step 1: Go to Authentication Settings
1. **Supabase Dashboard:** https://supabase.com/dashboard
2. Select **TichaAI organization**
3. Click your **TichaAI project**
4. In left sidebar, click **"Authentication"** (lock icon 🔐)
5. Click **"Providers"** tab

### Step 2: Disable Email Confirmation
1. Find **"Email"** provider (should be enabled)
2. Look for **"Confirm email"** or **"Enable email confirmations"** toggle
3. **Turn it OFF** (disable/uncheck)
4. Click **"Save"** if there's a save button

### Alternative Location:
If not in Providers:
- Go to **Authentication** → **Settings** (or **Configuration**)
- Scroll to **"Email Auth"** section
- Find **"Enable email confirmations"**
- **Uncheck/disable** it

### Step 3: Test Again
1. Go back to `/ticha/signup`
2. Create a new account (or use existing one)
3. Try signing in at `/ticha/signin`
4. Should work immediately now! ✅

---

## Option 2: Keep Email Confirmation (For Production)

If you want to keep email confirmation:

### Configure Email Provider
1. Go to **Authentication** → **Email Templates**
2. Set up SMTP (Gmail, SendGrid, Resend, etc.)
3. Users will receive confirmation emails

### Or Manually Confirm Users
1. Go to **Authentication** → **Users**
2. Find the user
3. Click **"Confirm"** button to manually confirm them

---

## For Development:
**Recommended: Disable email confirmation** - it's the fastest way to test!

After disabling:
- ✅ Sign up works immediately
- ✅ Sign in works immediately
- ✅ No email needed

Let me know once you've disabled it and we can test!

