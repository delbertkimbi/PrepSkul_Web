# 🚨 Security Incident Response - Exposed Firebase Service Account Key

**Date:** 2025-01-17  
**Severity:** CRITICAL  
**Status:** ⚠️ ACTION REQUIRED

---

## 🔴 **What Happened**

The file `firebase-service-account.json` containing the full Firebase service account credentials (including private key) was committed to the git repository and pushed to main branch.

**Exposed Credentials:**
- Firebase Service Account Private Key
- Client Email: `firebase-adminsdk-ikh86@operating-axis-420213.iam.gserviceaccount.com`
- Project ID: `operating-axis-420213`

---

## ✅ **Immediate Actions Taken**

1. ✅ Removed file from git index (`git rm --cached`)
2. ✅ Added to `.gitignore` to prevent future commits
3. ✅ File still exists locally (for app to work) but won't be tracked

---

## ⚠️ **CRITICAL: You Must Do These Steps**

### **Step 1: Revoke the Exposed Key in Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `operating-axis-420213`
3. Go to **Project Settings** → **Service Accounts** tab
4. Find the service account: `firebase-adminsdk-ikh86@operating-axis-420213.iam.gserviceaccount.com`
5. Click **"Delete"** or **"Revoke Key"** for the exposed key
6. **This will invalidate the exposed key immediately**

### **Step 2: Generate a New Service Account Key**

1. In Firebase Console → **Service Accounts** tab
2. Click **"Generate new private key"**
3. Download the new JSON file
4. **DO NOT commit this file to git!**

### **Step 3: Update Environment Variables**

**Option A: Use Environment Variable (Recommended)**

1. Open the new JSON file
2. Copy the entire JSON content
3. Minify it to a single line (use https://www.jsonformatter.org/json-minify)
4. Add to `.env.local`:
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```

**Option B: Keep File Locally (Not Recommended)**

1. Place the new JSON file in the project root
2. Make sure it's in `.gitignore` (already added)
3. Update code to read from environment variable instead of file

### **Step 4: Remove from Git History (Important!)**

The file is still in git history. To completely remove it:

```bash
cd /Users/user/Desktop/PrepSkul/PrepSkul_Web

# Remove from all git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch firebase-service-account.json" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

**⚠️ WARNING:** Force pushing rewrites git history. Coordinate with your team first!

**Alternative (Safer):** Use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or GitHub's secret scanning to invalidate the key.

### **Step 5: Update All Deployments**

If you've deployed this code anywhere:
1. Update environment variables in Vercel/Netlify/etc.
2. Remove the file from any deployed instances
3. Restart services

---

## 🔒 **Prevention Measures**

### **Already Done:**
- ✅ Added `firebase-service-account.json` to `.gitignore`
- ✅ Added pattern `*service-account*.json` to `.gitignore`

### **Best Practices Going Forward:**

1. **Never commit service account keys to git**
   - Always use environment variables
   - Store keys in `.env.local` (already in `.gitignore`)

2. **Use Environment Variables:**
   ```typescript
   // ✅ GOOD: Read from environment
   const serviceAccount = JSON.parse(
     process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
   );
   
   // ❌ BAD: Read from file
   const serviceAccount = require('./firebase-service-account.json');
   ```

3. **Enable GitGuardian or Similar:**
   - Already enabled (that's how we caught this!)
   - Review alerts immediately

4. **Use Secret Scanning:**
   - GitHub Secret Scanning (if using GitHub)
   - GitGuardian (already active)

---

## 📋 **Checklist**

- [ ] Revoke exposed key in Firebase Console
- [ ] Generate new service account key
- [ ] Update `.env.local` with new key (as JSON string)
- [ ] Update code to use environment variable instead of file
- [ ] Remove file from git history (if safe to do so)
- [ ] Update all deployments with new key
- [ ] Test that push notifications still work
- [ ] Verify `.gitignore` includes the file
- [ ] Document this incident for future reference

---

## 🔍 **How to Verify It's Fixed**

1. **Check git status:**
   ```bash
   git status
   # Should NOT show firebase-service-account.json
   ```

2. **Check .gitignore:**
   ```bash
   cat .gitignore | grep firebase
   # Should show the file is ignored
   ```

3. **Test app:**
   - Verify push notifications still work
   - Check that Firebase Admin SDK initializes correctly

---

## 📞 **If You Need Help**

1. **Firebase Support:** https://firebase.google.com/support
2. **GitGuardian:** Review their recommendations
3. **Team:** Coordinate before force-pushing to main

---

## ⏰ **Timeline**

- **Detected:** 2025-01-17 (via GitGuardian)
- **File Removed from Index:** 2025-01-17
- **Key Revocation:** ⏳ PENDING (YOU MUST DO THIS)
- **New Key Generated:** ⏳ PENDING
- **Git History Cleaned:** ⏳ PENDING (if needed)

---

**🚨 URGENT: Revoke the exposed key in Firebase Console immediately!**

