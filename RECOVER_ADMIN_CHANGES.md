# 🔄 Recovery Plan: Restore Admin Panel Changes

**Status:** Ready to Execute  
**Goal:** Restore all admin panel features while keeping academy changes

---

## 📋 **Strategy**

We'll use a 3-way merge approach:
1. **Base:** Commit before the merge (b0e3a8e - has your admin features)
2. **Theirs:** Current HEAD (has academy changes)
3. **Ours:** Your admin changes (prioritized in conflicts)

---

## 🚀 **Step-by-Step Recovery**

### **Step 1: Create a Backup Branch (Safety First!)**

```bash
cd /Users/user/Desktop/PrepSkul/PrepSkul_Web
git branch backup-before-recovery
git checkout backup-before-recovery
# This creates a safety backup
```

### **Step 2: Go Back to Your Admin Features Commit**

```bash
git checkout main
git checkout -b recover-admin-features
git reset --hard b0e3a8e
```

This takes you back to commit `b0e3a8e` which has:
- ✅ Full admin navigation (Pricing, Notifications)
- ✅ Tutor management features
- ✅ Discount management
- ✅ All your admin UI improvements

### **Step 3: Merge Academy Changes (Prioritizing Your Admin Code)**

```bash
# Merge the academy changes, but prioritize your admin code
git merge -X ours 2e732cf --no-commit
```

The `-X ours` flag means: **"In conflicts, keep YOUR version (admin code)"**

### **Step 4: Manually Add Academy Files (Non-Conflicting)**

```bash
# Check what academy files were added
git show 2e732cf --name-only | grep academy

# Add academy files that don't conflict with admin
git checkout 2e732cf -- app/academy/
git checkout 2e732cf -- app/[locale]/academy/
```

### **Step 5: Review and Resolve Conflicts**

```bash
# Check for conflicts
git status

# For each conflict in admin files, keep YOUR version
# For conflicts in academy files, keep THEIR version
# For conflicts in shared files, prioritize YOUR admin changes
```

### **Step 6: Test Everything**

```bash
# Start dev server
pnpm dev

# Test:
# 1. Admin panel - all features should work
# 2. Academy section - should still work
# 3. Main site - should still work
```

### **Step 7: Commit the Recovery**

```bash
git add .
git commit -m "Recover admin panel features while keeping academy changes

- Restored full admin navigation (Pricing, Notifications)
- Restored tutor management and discount features
- Kept academy landing page enhancements
- Prioritized admin changes in conflicts"
```

---

## 🔍 **Alternative: Cherry-Pick Strategy (Safer)**

If the merge is too complex, use cherry-pick:

### **Option A: Cherry-Pick Your Admin Commits**

```bash
# Start from current state
git checkout main
git checkout -b recover-admin-features

# Cherry-pick your admin commits (in order)
git cherry-pick b0e3a8e
git cherry-pick 3f18887
git cherry-pick fda9fe1

# This adds your admin changes on top of current code
```

### **Option B: Selective File Recovery**

```bash
# Recover specific admin files
git checkout b0e3a8e -- app/admin/
git checkout b0e3a8e -- app/api/admin/

# Keep academy files from current
# (They won't conflict since they're in different directories)
```

---

## 📁 **Files to Recover**

Based on commit history, these admin files need to be restored:

### **Admin Navigation & UI:**
- `app/admin/components/AdminNav.tsx` - Full navigation with Pricing & Notifications
- `app/admin/page.tsx` - Dashboard with all metrics

### **Admin Features:**
- `app/admin/pricing/` - Pricing management (if exists)
- `app/admin/notifications/send/` - Notification sending (if exists)
- `app/admin/tutors/` - Full tutor management
- `app/api/admin/tutors/` - All tutor APIs

### **Other Admin Files:**
- Any discount management features
- Any other admin functionality you added

---

## ⚠️ **Important Notes**

1. **Academy files are in separate directories**, so they shouldn't conflict
2. **Admin files are in `/admin/`**, academy is in `/academy/` and `/[locale]/academy/`
3. **Shared files** (like layouts) might conflict - prioritize admin version

---

## 🎯 **Quick Recovery (Recommended)**

The safest approach:

```bash
cd /Users/user/Desktop/PrepSkul/PrepSkul_Web

# 1. Backup
git branch backup-$(date +%Y%m%d-%H%M%S)

# 2. Create recovery branch from your admin commit
git checkout -b recover-admin b0e3a8e

# 3. Cherry-pick academy commits (non-conflicting)
git cherry-pick 5ed4b96  # Academy enhancements

# 4. If conflicts, resolve by keeping admin version for admin files
#    and academy version for academy files

# 5. Test everything

# 6. Merge back to main
git checkout main
git merge recover-admin
```

---

## ✅ **Verification Checklist**

After recovery, verify:

- [ ] Admin navigation shows Pricing and Notifications links
- [ ] Admin dashboard shows all metrics
- [ ] Tutor management works (approve/reject with notes)
- [ ] Discount management works (if you had this)
- [ ] Academy landing page still works
- [ ] Main site still works
- [ ] No console errors

---

**Ready to execute?** Let me know which approach you prefer!

