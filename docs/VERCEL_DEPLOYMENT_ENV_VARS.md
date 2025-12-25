# 🚀 Vercel Deployment - Environment Variables Guide

## 📋 Complete List of Environment Variables for Vercel

When deploying to Vercel, add/update these environment variables in your project settings.

---

## 🔧 How to Add Environment Variables in Vercel

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard
2. **Select your project** (PrepSkul_Web)
3. **Go to:** Settings → Environment Variables
4. **Add each variable** with these settings:
   - **Environment:** Select **Production**, **Preview**, and **Development** (all three)
   - **Value:** Your actual key/value

---

## ✅ Required Environment Variables

### **1. PrepSkul Supabase (Main App)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://cpzaxdfxbamdsshdgjyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prepskul_anon_key_here
```

### **2. TichaAI Supabase (Presentation Generation)**
```env
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://your-ticha-project-id.supabase.co
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your-ticha-anon-key-here
TICHA_SUPABASE_SERVICE_KEY=your-ticha-service-role-key-here
```

### **3. OpenRouter API Keys (NEW - Separate Keys for Tracking)**
```env
SKULMATE_OPENROUTER_API_KEY=sk-or-v1-your-skulmate-api-key-here
TICHA_OPENROUTER_API_KEY=sk-or-v1-your-ticha-api-key-here
```

**Note:** You can also keep `OPENROUTER_API_KEY` as a fallback for TichaAI (optional).

### **4. Email Service (Resend)**
```env
RESEND_API_KEY=your_resend_api_key_here
```

### **5. Firebase (if using)**
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### **6. Site URL (for OpenRouter headers)**
```env
NEXT_PUBLIC_SITE_URL=https://www.prepskul.com
```

---

## 📝 Complete Vercel Environment Variables Checklist

Copy this checklist and check off each one as you add it:

### **Supabase (PrepSkul Main)**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (if used for admin operations)

### **Supabase (TichaAI)**
- [ ] `NEXT_PUBLIC_TICHA_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY`
- [ ] `TICHA_SUPABASE_SERVICE_KEY`

### **OpenRouter API Keys (NEW)**
- [ ] `SKULMATE_OPENROUTER_API_KEY` ⭐ **NEW - Required for skulMate**
- [ ] `TICHA_OPENROUTER_API_KEY` ⭐ **NEW - Required for TichaAI**
- [ ] `OPENROUTER_API_KEY` (optional - fallback for TichaAI)

### **Other Services**
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `FIREBASE_SERVICE_ACCOUNT_PATH` (if using Firebase)

---

## 🎯 What Changed (New Variables to Add)

### **NEW Variables (Must Add):**
1. ✅ `SKULMATE_OPENROUTER_API_KEY` - For skulMate game generation
2. ✅ `TICHA_OPENROUTER_API_KEY` - For TichaAI presentation generation

### **Existing Variables (Keep/Update):**
- All existing Supabase variables
- All existing service keys
- `NEXT_PUBLIC_SITE_URL` (if not already set)

---

## 🔄 Step-by-Step: Adding to Vercel

### **Step 1: Open Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Click on your **PrepSkul_Web** project

### **Step 2: Navigate to Environment Variables**
1. Click **Settings** (left sidebar)
2. Click **Environment Variables** (under Configuration)

### **Step 3: Add New Variables**

For each new variable:

1. **Click "Add New"**
2. **Enter:**
   - **Key:** `SKULMATE_OPENROUTER_API_KEY`
   - **Value:** `sk-or-v1-your-actual-key-here`
   - **Environment:** ✅ Production ✅ Preview ✅ Development
3. **Click "Save"**

Repeat for:
- `TICHA_OPENROUTER_API_KEY`
- Any other missing variables

### **Step 4: Update Existing Variables (if needed)**
- Check if `OPENROUTER_API_KEY` exists (can keep as fallback)
- Verify all Supabase keys are correct
- Verify `NEXT_PUBLIC_SITE_URL` is set

### **Step 5: Redeploy**
After adding variables:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
   - Or push a new commit to trigger deployment

---

## ⚠️ Important Notes

1. **Environment Selection:**
   - ✅ Always select **Production**, **Preview**, and **Development**
   - This ensures variables work in all environments

2. **Variable Names:**
   - Must match **exactly** (case-sensitive)
   - No extra spaces
   - No quotes needed in Vercel UI

3. **After Adding Variables:**
   - **Redeploy** your project for changes to take effect
   - Variables are only available after redeployment

4. **Security:**
   - Never commit API keys to git
   - Vercel encrypts environment variables
   - Only team members with access can see values

---

## 🧪 Verify After Deployment

After deploying, test:

1. **skulMate:**
   - Try generating a game
   - Should work without "Missing API key" errors

2. **TichaAI:**
   - Try generating a presentation
   - Should work without "Missing API key" errors

3. **Check Logs:**
   - Go to Vercel Dashboard → Deployments → Latest → Functions
   - Check for any environment variable errors

---

## 📊 Quick Reference

### **Minimum Required for skulMate:**
```env
SKULMATE_OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### **Minimum Required for TichaAI:**
```env
TICHA_OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_TICHA_SUPABASE_URL=...
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=...
```

---

## 🔗 Related Documentation

- **Setup Guide:** `docs/SKULMATE_OPENROUTER_SETUP.md`
- **Usage Tracking:** `docs/OPENROUTER_USAGE_TRACKING.md`
- **Deployment:** `docs/DEPLOY.md`

---

**Need help?** Check Vercel docs: https://vercel.com/docs/concepts/projects/environment-variables

