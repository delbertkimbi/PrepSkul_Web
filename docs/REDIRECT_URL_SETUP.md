# Redirect URL Setup - Localhost & Production

## ✅ Add BOTH URLs Now (Recommended)

You can add **multiple redirect URLs** in Supabase, so add both:

### For Development (Localhost):
```
http://localhost:3000/ticha/auth/callback
http://localhost:3000/**
```

### For Production (Add when you deploy):
```
https://yourdomain.com/ticha/auth/callback
```

**You can have BOTH active at the same time!** Supabase will use the correct one based on where the request comes from.

---

## Option 1: Add Both Now (Recommended)

### Step 1: Go to Authentication → URL Configuration
1. Supabase Dashboard → TichaAI project
2. **Authentication** → **URL Configuration**

### Step 2: Set Site URL
**For now (development):**
```
Site URL: http://localhost:3000
```

**Later (production):** Change to:
```
Site URL: https://yourdomain.com
```

### Step 3: Add ALL Redirect URLs (Both)
In **Redirect URLs** field, add **one per line**:

```
http://localhost:3000/ticha/auth/callback
http://localhost:3000/**
https://yourdomain.com/ticha/auth/callback
```

**Save** - Now both work! ✅

---

## Option 2: Start with Localhost, Add Production Later

### Now (Local Development):
1. **Site URL:** `http://localhost:3000`
2. **Redirect URLs:**
   ```
   http://localhost:3000/ticha/auth/callback
   ```

### When Deploying:
1. **Update Site URL** to: `https://yourdomain.com`
2. **Add production Redirect URL:**
   ```
   https://yourdomain.com/ticha/auth/callback
   ```
3. **Keep localhost URLs** too (if you want to test locally)

---

## Recommended Setup

### Development + Production Together:
```
Site URL: https://yourdomain.com
(Use production as main, but localhost URLs still work)

Redirect URLs:
http://localhost:3000/ticha/auth/callback
http://localhost:3000/**
https://yourdomain.com/ticha/auth/callback
```

This way:
- ✅ Works locally (localhost:3000)
- ✅ Works in production (yourdomain.com)
- ✅ No need to change anything when deploying

---

## What to Do Now

### Step 1: Add Localhost URLs (For Testing Now)
1. Go to **Authentication → URL Configuration**
2. **Site URL:** `http://localhost:3000`
3. **Redirect URLs:** Add:
   ```
   http://localhost:3000/ticha/auth/callback
   ```
4. **Save**

### Step 2: Test Locally
- Sign up → Get email → Click link → Should work!

### Step 3: When Deploying (Add Production)
1. **Update Site URL** to: `https://yourdomain.com`
2. **Add production URL** to Redirect URLs:
   ```
   https://yourdomain.com/ticha/auth/callback
   ```
3. **Keep localhost URLs** (or remove if you don't need them)

---

## Best Practice

**Keep both URLs configured:**
- Development team can test locally
- Production works for users
- No switching needed

---

## Quick Answer

**Yes, add localhost first!** Then when you deploy, just:
1. Change Site URL to production domain
2. Add production redirect URL (keep localhost URLs too)

**Or add both now** - Supabase supports multiple redirect URLs, so you can have both active simultaneously.

