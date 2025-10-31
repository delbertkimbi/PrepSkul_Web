# Admin Subdomain Not Working - Debug & Fix

## Problem
`admin.prepskul.com` shows the landing page instead of the admin dashboard.

## Root Causes

### 1. **Vercel Deployment Not Connected**
Your GitHub repo might not be connected to Vercel for auto-deployment.

### 2. **DNS Pointing to Wrong Deployment**
`admin.prepskul.com` might be pointing to the main site deployment instead of a Vercel deployment.

### 3. **Middleware Not Applied Yet**
The fixes we pushed might not be deployed yet.

---

## Quick Checks

### Check 1: Is Vercel Connected to GitHub?
1. Go to: https://vercel.com/dashboard
2. Check if you see `PrepSkul_Web` project
3. Check if it's connected to `delbertkimbi/PrepSkul_Web` repo

### Check 2: What's the Vercel Production URL?
1. In Vercel Dashboard → Your Project → Deployments
2. Find the **Production** deployment
3. Copy the URL (should be like `prepskul-web.vercel.app`)

### Check 3: Where is `admin.prepskul.com` pointing?
```bash
dig admin.prepskul.com CNAME
# OR
nslookup admin.prepskul.com
```

Expected result: Should point to your Vercel deployment domain

---

## Solutions

### Solution 1: Connect Vercel to GitHub (If Not Connected)

#### A. Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import from Git
4. Select: `delbertkimbi/PrepSkul_Web`
5. Configure:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: pnpm build (or npm run build)
   Output Directory: .next
   Install Command: pnpm install
   ```
6. **Environment Variables** (Important!):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
7. Click **"Deploy"**

#### B. Wait for Deployment
- Takes 2-5 minutes
- You'll get a URL like: `prepskul-web.vercel.app`

---

### Solution 2: Add Custom Domain in Vercel

#### A. After Deployment Succeeds
1. Go to: Project → Settings → Domains
2. Click **"Add Domain"**
3. Enter: `admin.prepskul.com`
4. Vercel will show you DNS records to add

#### B. Add DNS Records
In your domain registrar, add:
```
Type:  CNAME
Name:  admin
Value: cname.vercel-dns.com  (or what Vercel gives you)
```

#### C. Wait for Verification
- 5-30 minutes for DNS propagation
- Vercel will auto-provision SSL certificate

---

### Solution 3: Quick Manual Deploy (If Auto-Deploy Not Working)

```bash
cd /Users/user/Desktop/PrepSkul/PrepSkul_Web

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Add custom domain
# Follow the prompts to add admin.prepskul.com
```

---

## Alternative: Check Current DNS

Let's see where `admin.prepskul.com` is actually pointing:

```bash
# Check CNAME
dig admin.prepskul.com CNAME +short

# Check A record
dig admin.prepskul.com A +short

# Full DNS info
nslookup admin.prepskul.com
```

Expected results:
- **If correct**: Points to Vercel (e.g., `cname.vercel-dns.com`)
- **If wrong**: Points somewhere else or doesn't exist

---

## Testing After Fix

### Test 1: Vercel Direct URL
```bash
curl -I https://prepskul-web.vercel.app/admin
# Should return: 200 OK
```

### Test 2: Custom Domain
```bash
curl -I https://admin.prepskul.com
# Should redirect to /admin/login
```

### Test 3: Browser (Incognito)
Open in incognito mode:
- https://admin.prepskul.com
- Should show admin login page

---

## Current Status Check

### Where is the site actually deployed?

Your main site `www.prepskul.com` is likely deployed to Vercel already.

Check these URLs:
1. **Main site**: https://www.prepskul.com → Landing page ✅
2. **Admin subdomain**: https://admin.prepskul.com → Landing page ❌ (should be admin dashboard)
3. **Vercel direct**: https://YOUR-PROJECT.vercel.app/admin → ???

The issue is that `admin.prepskul.com` is probably pointing to the same deployment as `www.prepskul.com`, and the middleware fix hasn't been applied to that deployment.

---

## Most Likely Solution

Based on the symptoms, here's what probably happened:

1. You deployed `www.prepskul.com` to Vercel ✅
2. You added `admin.prepskul.com` as a domain to the SAME project ✅
3. The middleware code we just fixed hasn't been deployed yet ❌

### Fix:
```bash
cd /Users/user/Desktop/PrepSkul/PrepSkul_Web

# Make sure you're logged into Vercel
vercel login

# Deploy the latest code with middleware fixes
vercel --prod

# This will update the existing deployment with the new middleware
```

After this completes (~2 minutes), `admin.prepskul.com` should work!

---

## Verification Steps

After deploying:

1. **Check deployment succeeded**:
   ```bash
   vercel ls
   # Look for your project with "READY" status
   ```

2. **Test middleware directly**:
   ```bash
   curl -I https://admin.prepskul.com
   # Should see: Location: /admin/login
   ```

3. **Browser test**:
   - Open incognito
   - Go to: https://admin.prepskul.com
   - Should redirect to login page

---

## Emergency Workaround

If nothing works, users can still access admin at:
- **https://www.prepskul.com/admin**

This works because the `/admin` route exists in your Next.js app, regardless of the subdomain.

---

## What to Do Right Now

**Option 1: Quick Deploy (Recommended)**
```bash
cd /Users/user/Desktop/PrepSkul/PrepSkul_Web
vercel login
vercel --prod
```
Wait 2 minutes, then test `admin.prepskul.com`

**Option 2: Check Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Find your project
3. Check latest deployment status
4. Manually trigger a redeploy if needed

**Option 3: Use Main Domain**
Access admin at: https://www.prepskul.com/admin
(This should work right now!)

---

## Next Steps

1. Deploy the middleware fixes to Vercel
2. Wait for DNS/cache to clear (5-30 min)
3. Test in incognito mode
4. If still not working, we'll check Vercel deployment logs

Let me know which option you want to try! 🚀

