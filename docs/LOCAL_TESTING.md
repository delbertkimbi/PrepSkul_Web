# Local Testing Before Vercel Deployment

This guide shows you how to test your code locally to ensure it will work when deployed to Vercel.

## Quick Test (Recommended)

Run the test script before pushing:

```bash
cd PrepSkul_Web
./scripts/test-build.sh
```

This script:
1. ✅ Checks TypeScript compilation
2. ✅ Runs the production build (same as Vercel)
3. ✅ Reports any errors

## Manual Testing Steps

### 1. TypeScript Check

Check for TypeScript errors:

```bash
cd PrepSkul_Web
npx tsc --noEmit
```

**What to look for:**
- ❌ Any errors = Fix before pushing
- ✅ No errors = Good to go

### 2. Production Build Test

Run the exact build command Vercel uses:

```bash
cd PrepSkul_Web
pnpm run build
```

**What to look for:**
- ❌ `Failed to compile` = Fix errors before pushing
- ❌ Syntax errors = Fix before pushing
- ✅ `Creating an optimized production build...` → `Compiled successfully` = Good!

### 3. Test Production Build Locally (Optional)

After a successful build, test the production version:

```bash
# Build first
pnpm run build

# Start production server
pnpm start

# Open http://localhost:3000 in browser
```

**What to test:**
- ✅ Pages load correctly
- ✅ API routes work (e.g., `/api/skulmate/generate`)
- ✅ No runtime errors in browser console

### 4. Environment Variables Check

Ensure required environment variables are set in Vercel:

**Required for build:**
- `SKULMATE_OPENROUTER_API_KEY` or `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Optional:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- Other service keys

**Check in Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Ensure all required variables are set for "Production" and "Preview"

## Common Issues & Fixes

### Issue: "Failed to compile" with syntax errors

**Fix:**
1. Check the error message for file and line number
2. Fix the syntax error
3. Run `pnpm run build` again
4. Repeat until build succeeds

### Issue: "Module not found" or import errors

**Fix:**
1. Check if the file exists
2. Check import paths (use `@/` for absolute imports)
3. Ensure dependencies are installed: `pnpm install`

### Issue: TypeScript errors

**Fix:**
1. Run `npx tsc --noEmit` to see all errors
2. Fix type errors
3. Re-run build

### Issue: Build works locally but fails on Vercel

**Possible causes:**
1. **Missing environment variables** - Check Vercel dashboard
2. **Different Node.js version** - Check `package.json` `engines` field
3. **Build cache issues** - Clear Vercel build cache
4. **File case sensitivity** - Ensure file names match exactly (Linux is case-sensitive)

## Pre-Push Checklist

Before pushing to `delbert` branch:

- [ ] Run `./scripts/test-build.sh` or `pnpm run build`
- [ ] Build completes without errors
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Test critical API routes locally (if possible)
- [ ] Check that environment variables are set in Vercel
- [ ] Review any warnings (they won't block deployment but should be addressed)

## Automated Testing (Future)

Consider adding:
- GitHub Actions to run build on every push
- Pre-commit hooks to run TypeScript check
- CI/CD pipeline for automated testing

## Need Help?

If build fails on Vercel but works locally:
1. Check Vercel build logs for specific error
2. Compare Node.js versions
3. Check environment variables
4. Review Vercel-specific configurations in `vercel.json`

