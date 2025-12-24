# How to Configure Redirect URL in Supabase

## Step-by-Step Guide

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Sign in with your account

### Step 2: Select Your TichaAI Project
1. Select **TichaAI** organization (click on it)
2. Click your **TichaAI project** (the one you created)

### Step 3: Navigate to Authentication → URL Configuration
1. In the **left sidebar**, click **"Authentication"** (🔐 lock icon)
2. Click **"URL Configuration"** (or look for "Redirect URLs" section)
   - It might be under "Settings" → "URL Configuration"
   - Or directly under "Authentication" menu

### Step 4: Configure Site URL
Look for **"Site URL"** field:

**For Development:**
```
http://localhost:3000
```

**For Production:**
```
https://yourdomain.com
```
(Replace with your actual production domain)

### Step 5: Add Redirect URLs
Look for **"Redirect URLs"** section or **"Redirect URLs"** field:

**Click "Add URL"** or add each URL on a new line:

**For Development (Local):**
```
http://localhost:3000/ticha/auth/callback
```

**For Production:**
```
https://yourdomain.com/ticha/auth/callback
```

**You can also add wildcard for localhost:**
```
http://localhost:3000/**
```

### Step 6: Save Changes
1. Click **"Save"** button (usually at bottom or top of the form)
2. Wait a few seconds for changes to apply

## What You Should See

### Site URL Section:
```
Site URL: http://localhost:3000
```

### Redirect URLs Section:
```
Redirect URLs:
http://localhost:3000/ticha/auth/callback
http://localhost:3000/**
```

Or for production:
```
Redirect URLs:
https://yourdomain.com/ticha/auth/callback
```

## Alternative Locations (If Not in URL Configuration)

If you don't see "URL Configuration", check these places:

### Option A: Authentication → Settings
1. **Authentication** → **Settings**
2. Look for **"Redirect URLs"** or **"Allowed Redirect URLs"**
3. Add your callback URL there

### Option B: Authentication → Providers → Email
1. **Authentication** → **Providers**
2. Click on **"Email"** provider
3. Look for **"Redirect URLs"** section
4. Add your callback URL

### Option C: Project Settings → API
1. **Settings** (gear icon) → **API**
2. Scroll down to **"Redirect URLs"** section
3. Add your callback URL

## Quick Checklist

- [ ] Site URL set to `http://localhost:3000` (dev) or production URL
- [ ] Redirect URL added: `http://localhost:3000/ticha/auth/callback`
- [ ] Changes saved
- [ ] Ready to test!

## Testing After Configuration

1. **Sign up** at `/ticha/signup`
2. **Check email** for confirmation link
3. **Click link** → Should redirect to `/ticha/auth/callback`
4. **Auto-confirms** and redirects to `/ticha/dashboard`

## Troubleshooting

### Issue: "Redirect URL not allowed" error
**Solution:** Make sure you added the exact callback URL to the Redirect URLs list

### Issue: Email link doesn't work
**Solution:** 
- Check Site URL is correct
- Verify Redirect URL is in the allowed list
- Check email template uses `{{ .ConfirmationURL }}`

### Issue: Can't find URL Configuration
**Solution:** Look in:
- Authentication → Settings
- Authentication → Configuration  
- Project Settings → Authentication

---

**Once configured, test the flow and let me know if it works!** 🚀

