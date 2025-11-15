# Quick Deployment Guide

## Deploy to Vercel

```bash
# From PrepSkul_Web directory
cd /Users/user/Desktop/PrepSkul/PrepSkul_Web

# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel --prod
```

## After Deployment

### 1. Add Admin Subdomain
- Go to Vercel Dashboard → Your Project → Settings → Domains
- Add: `admin.prepskul.com`
- Copy the CNAME value they give you

### 2. Update DNS
Go to your domain registrar and add:
```
Type:  CNAME
Name:  admin
Value: [paste value from Vercel]
```

### 3. Test (after 5-30 minutes)
- https://admin.prepskul.com → Admin login
- https://www.prepskul.com → Main site

## Environment Variables
Make sure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side admin operations)

Done! 🚀

