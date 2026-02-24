# 🚨 Vercel Deployment Troubleshooting Guide

## 🔍 How to Check Deployment Errors

### **Step 1: View Deployment Logs**
1. Go to **Vercel Dashboard:** https://vercel.com/dashboard
2. Click on your **PrepSkul_Web** project
3. Go to **Deployments** tab
4. Click on the **failed deployment**
5. Click **"View Function Logs"** or **"Build Logs"**

### **Step 2: Common Error Types**

#### **Build Errors:**
- Syntax errors (TypeScript/JavaScript)
- Missing dependencies
- Import errors
- Configuration issues

#### **Runtime Errors:**
- Missing environment variables
- API connection failures
- Database connection issues
- Function timeout

---

## ✅ Common Fixes

### **1. Missing Environment Variables**

**Symptoms:**
- `Error: Missing environment variable`
- `process.env.XXX is undefined`
- API calls failing

**Fix:**
1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Add missing variables (see `docs/VERCEL_DEPLOYMENT_ENV_VARS.md`)
3. **Redeploy** after adding variables

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SKULMATE_OPENROUTER_API_KEY` (NEW)
- `TICHA_OPENROUTER_API_KEY` (NEW)
- `RESEND_API_KEY`
- `TICHA_SUPABASE_SERVICE_KEY` (if using TichaAI)

### **2. Build Timeout**

**Symptoms:**
- Build fails after 45 seconds
- "Build exceeded maximum duration"

**Fix:**
- Optimize build (remove unused dependencies)
- Check for large files in repo
- Consider upgrading Vercel plan

### **3. Function Errors**

**Symptoms:**
- API routes returning 500 errors
- Function logs show errors

**Fix:**
- Check function logs in Vercel Dashboard
- Verify environment variables are set
- Check API route code for errors

### **4. Cron Job Configuration**

**Symptoms:**
- Cron jobs not running
- Invalid cron schedule error

**Fix:**
- Verify `vercel.json` cron schedule format
- Ensure cron path exists (`/api/cron/...`)
- Check Vercel cron documentation

---

## 🔧 Quick Checklist

Before deploying, ensure:

- [ ] All environment variables are set in Vercel
- [ ] Build passes locally (`pnpm run build`)
- [ ] No TypeScript errors (`pnpm run lint`)
- [ ] `vercel.json` is valid JSON
- [ ] All API routes have proper error handling
- [ ] No hardcoded secrets in code

---

## 📋 Deployment Steps

### **1. Pre-Deployment:**
```bash
# Test build locally
cd PrepSkul_Web
pnpm run build

# Check for errors
pnpm run lint
```

### **2. Add Environment Variables:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Add all required variables (see checklist above)
- Select all environments (Production, Preview, Development)

### **3. Deploy:**
```bash
# Push to trigger deployment
git push origin main  # or your branch

# Or deploy manually
vercel --prod
```

### **4. Verify:**
- Check deployment status in Vercel Dashboard
- View build logs for any errors
- Test API endpoints after deployment

---

## 🐛 Specific Error Messages

### **"Module not found: firebase-admin"**
**Fix:** The import is now dynamic, but if you see this:
- Check that `firebase-admin` is in `package.json`
- Run `pnpm install` locally to verify

### **"Missing API key"**
**Fix:** 
- Add `SKULMATE_OPENROUTER_API_KEY` or `TICHA_OPENROUTER_API_KEY` to Vercel
- Redeploy after adding

### **"Invalid cron schedule"**
**Fix:**
- Check `vercel.json` cron format
- Vercel supports: `*/5 * * * *` (every 5 minutes)
- Or: `0 */6 * * *` (every 6 hours)

### **"Build failed: Syntax error"**
**Fix:**
- Check build logs for specific file/line
- Run `pnpm run build` locally to reproduce
- Fix syntax errors and push again

---

## 📞 Getting Help

1. **Check Vercel Logs:**
   - Dashboard → Deployments → Failed deployment → Logs

2. **Check Build Locally:**
   ```bash
   pnpm run build
   ```

3. **Check Environment Variables:**
   - Dashboard → Settings → Environment Variables
   - Verify all required vars are present

4. **Vercel Support:**
   - https://vercel.com/support
   - Include deployment URL and error logs

---

## 🔗 Related Docs

- **Environment Variables:** `docs/VERCEL_DEPLOYMENT_ENV_VARS.md`
- **GitGuardian Fix:** `docs/GITGUARDIAN_SECRET_FIX.md`
- **OpenRouter Setup:** `docs/SKULMATE_OPENROUTER_SETUP.md`





## 🔍 How to Check Deployment Errors

### **Step 1: View Deployment Logs**
1. Go to **Vercel Dashboard:** https://vercel.com/dashboard
2. Click on your **PrepSkul_Web** project
3. Go to **Deployments** tab
4. Click on the **failed deployment**
5. Click **"View Function Logs"** or **"Build Logs"**

### **Step 2: Common Error Types**

#### **Build Errors:**
- Syntax errors (TypeScript/JavaScript)
- Missing dependencies
- Import errors
- Configuration issues

#### **Runtime Errors:**
- Missing environment variables
- API connection failures
- Database connection issues
- Function timeout

---

## ✅ Common Fixes

### **1. Missing Environment Variables**

**Symptoms:**
- `Error: Missing environment variable`
- `process.env.XXX is undefined`
- API calls failing

**Fix:**
1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Add missing variables (see `docs/VERCEL_DEPLOYMENT_ENV_VARS.md`)
3. **Redeploy** after adding variables

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SKULMATE_OPENROUTER_API_KEY` (NEW)
- `TICHA_OPENROUTER_API_KEY` (NEW)
- `RESEND_API_KEY`
- `TICHA_SUPABASE_SERVICE_KEY` (if using TichaAI)

### **2. Build Timeout**

**Symptoms:**
- Build fails after 45 seconds
- "Build exceeded maximum duration"

**Fix:**
- Optimize build (remove unused dependencies)
- Check for large files in repo
- Consider upgrading Vercel plan

### **3. Function Errors**

**Symptoms:**
- API routes returning 500 errors
- Function logs show errors

**Fix:**
- Check function logs in Vercel Dashboard
- Verify environment variables are set
- Check API route code for errors

### **4. Cron Job Configuration**

**Symptoms:**
- Cron jobs not running
- Invalid cron schedule error

**Fix:**
- Verify `vercel.json` cron schedule format
- Ensure cron path exists (`/api/cron/...`)
- Check Vercel cron documentation

---

## 🔧 Quick Checklist

Before deploying, ensure:

- [ ] All environment variables are set in Vercel
- [ ] Build passes locally (`pnpm run build`)
- [ ] No TypeScript errors (`pnpm run lint`)
- [ ] `vercel.json` is valid JSON
- [ ] All API routes have proper error handling
- [ ] No hardcoded secrets in code

---

## 📋 Deployment Steps

### **1. Pre-Deployment:**
```bash
# Test build locally
cd PrepSkul_Web
pnpm run build

# Check for errors
pnpm run lint
```

### **2. Add Environment Variables:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Add all required variables (see checklist above)
- Select all environments (Production, Preview, Development)

### **3. Deploy:**
```bash
# Push to trigger deployment
git push origin main  # or your branch

# Or deploy manually
vercel --prod
```

### **4. Verify:**
- Check deployment status in Vercel Dashboard
- View build logs for any errors
- Test API endpoints after deployment

---

## 🐛 Specific Error Messages

### **"Module not found: firebase-admin"**
**Fix:** The import is now dynamic, but if you see this:
- Check that `firebase-admin` is in `package.json`
- Run `pnpm install` locally to verify

### **"Missing API key"**
**Fix:** 
- Add `SKULMATE_OPENROUTER_API_KEY` or `TICHA_OPENROUTER_API_KEY` to Vercel
- Redeploy after adding

### **"Invalid cron schedule"**
**Fix:**
- Check `vercel.json` cron format
- Vercel supports: `*/5 * * * *` (every 5 minutes)
- Or: `0 */6 * * *` (every 6 hours)

### **"Build failed: Syntax error"**
**Fix:**
- Check build logs for specific file/line
- Run `pnpm run build` locally to reproduce
- Fix syntax errors and push again

---

## 📞 Getting Help

1. **Check Vercel Logs:**
   - Dashboard → Deployments → Failed deployment → Logs

2. **Check Build Locally:**
   ```bash
   pnpm run build
   ```

3. **Check Environment Variables:**
   - Dashboard → Settings → Environment Variables
   - Verify all required vars are present

4. **Vercel Support:**
   - https://vercel.com/support
   - Include deployment URL and error logs

---

## 🔗 Related Docs

- **Environment Variables:** `docs/VERCEL_DEPLOYMENT_ENV_VARS.md`
- **GitGuardian Fix:** `docs/GITGUARDIAN_SECRET_FIX.md`
- **OpenRouter Setup:** `docs/SKULMATE_OPENROUTER_SETUP.md`











