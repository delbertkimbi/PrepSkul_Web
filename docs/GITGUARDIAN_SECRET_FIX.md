# 🔒 GitGuardian Secret Detection - Fix Guide

## 🚨 Issue

GitGuardian detected an API key in git history: `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`

**Status:** The secret has been removed from all current files, but it still exists in git history.

---

## ✅ Immediate Actions Required

### 1. **ROTATE THE API KEY** (CRITICAL)

Since the API key has been exposed in git history, you **MUST** rotate it:

1. **Go to OpenRouter Dashboard:** https://openrouter.ai/keys
2. **Delete or regenerate** the exposed API key
3. **Create a new API key** for TichaAI
4. **Update** the key in:
   - `.env.local` (local development)
   - Vercel Environment Variables (production)

---

## 🔧 Remove Secret from Git History (Optional)

If you want to remove the secret from git history completely, you have two options:

### **Option 1: Using git filter-branch (Recommended for small repos)**

```bash
cd PrepSkul_Web

# Remove the secret from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch docs/TICHA_BACKEND_SETUP.md" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This rewrites history!)
git push origin --force --all
git push origin --force --tags
```

### **Option 2: Using BFG Repo-Cleaner (Faster for large repos)**

```bash
# Install BFG (if not installed)
# brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

cd PrepSkul_Web

# Create a file with the secret to remove
echo "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" > secrets.txt

# Remove the secret
bfg --replace-text secrets.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history!)
git push origin --force --all
```

### **⚠️ Important Warnings:**

1. **Force push rewrites history** - All team members will need to re-clone the repo
2. **This affects all branches** - Make sure you're on the right branch
3. **Backup first** - Create a backup branch before proceeding
4. **Coordinate with team** - Everyone needs to be aware of the history rewrite

---

## ✅ Verification

After removing from history:

1. **Check GitGuardian** - The secret should no longer be detected
2. **Verify current files** - Ensure no secrets in current codebase:
   ```bash
   grep -r "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" PrepSkul_Web --exclude-dir=node_modules
   ```
   Should return: **No matches found**

3. **Check git history** (after cleanup):
   ```bash
   git log --all --source -S "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"
   ```
   Should return: **No commits found**

---

## 📋 Current Status

- ✅ **Current files:** Clean (no secrets)
- ✅ **Documentation:** Uses placeholders
- ⚠️ **Git history:** Contains secret (needs cleanup)
- ⚠️ **API key:** Needs rotation

---

## 🎯 Recommended Approach

1. **Rotate the API key immediately** (most important)
2. **Update Vercel environment variables** with new key
3. **Decide if you want to rewrite history:**
   - **If public repo:** Yes, remove from history
   - **If private repo:** Optional, but recommended
   - **If team is small:** Easier to coordinate history rewrite
   - **If team is large:** Consider just rotating the key

---

## 🔒 Prevention

To prevent this in the future:

1. ✅ **Use `.env.local`** - Already in `.gitignore`
2. ✅ **Use placeholders in docs** - Already implemented
3. ✅ **Pre-commit hooks** - Consider adding GitGuardian pre-commit hook
4. ✅ **Code review** - Always review for secrets before merging

---

## 📚 Resources

- **GitGuardian:** https://www.gitguardian.com/
- **OpenRouter API Keys:** https://openrouter.ai/keys
- **Git filter-branch docs:** https://git-scm.com/docs/git-filter-branch
- **BFG Repo-Cleaner:** https://rtyley.github.io/bfg-repo-cleaner/

