# How to Disable Email Confirmation in Supabase (For Development)

## Quick Fix: Disable Email Confirmation

When you sign up, Supabase sends a confirmation email by default. To skip this during development:

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select **TichaAI organization**
3. Click your **TichaAI project**

### Step 2: Navigate to Authentication Settings
1. In the **left sidebar**, click **"Authentication"** (🔐 icon)
2. Click **"Providers"** or **"Settings"**

### Step 3: Disable Email Confirmation
1. Look for **"Email Auth"** or **"Email"** section
2. Find **"Enable email confirmations"** or **"Confirm email"** toggle
3. **Turn it OFF** (disable the toggle)

### Alternative: Disable in Auth Settings
If you don't see it under Providers:
1. Go to **Authentication** → **Settings** (or **Configuration**)
2. Scroll to **"Email Auth"** settings
3. Find **"Enable email confirmations"**
4. **Uncheck/disable** it

### Step 4: Save Changes
1. Click **"Save"** or changes auto-save
2. Wait a few seconds for changes to apply

### Step 5: Test Again
1. Try signing up again at `/ticha/signup`
2. Try signing in immediately - it should work now!

---

## Option 2: Keep Email Confirmation (For Production)

If you want to keep email confirmation enabled:

### Configure SMTP Settings
1. Go to **Authentication** → **Email Templates**
2. Configure SMTP settings (Gmail, SendGrid, etc.)
3. Users will receive confirmation emails

### Or Use Magic Links
1. Users can use "Forgot Password" to get a login link
2. Or configure email provider properly

---

## For Now (Development):
**Disable email confirmation** - it's the quickest way to test signup/signin functionality.

Once you've disabled it, try:
1. Sign up again: `/ticha/signup`
2. Sign in immediately: `/ticha/signin`
3. Should work without email confirmation!

Let me know if you need help finding the toggle in Supabase!

