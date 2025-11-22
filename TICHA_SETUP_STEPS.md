# TichaAI Setup Steps - Quick Guide

## ✅ You're Already Set Up!

You have **TichaAI** organization created. Here's what to do next:

### Step 1: Create Project in TichaAI Organization

1. **Click on "TichaAI" organization** in Supabase Dashboard
2. **Click "New Project"** button
3. **Fill in details:**
   - **Name:** `ticha` or `ticha-production`
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine to start

4. **Wait 2-3 minutes** for project to be provisioned

### Step 2: Run the Database Schema

Once your project is ready:

1. **In TichaAI project → SQL Editor**
2. **Copy and paste** the contents of `supabase/ticha_schema.sql`
3. **Click "Run"**
4. **Verify tables are created:**
   - Go to **Table Editor**
   - You should see: `ticha_users`, `ticha_presentations`, `ticha_slides`

### Step 3: Get Your Credentials

1. **In TichaAI project → Settings → API**
2. **Copy these values:**
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 4: Update Environment Variables

You have **TWO OPTIONS**:

#### Option A: Use Separate Environment Variables (Recommended for keeping both projects)

Update your code to use different env vars for TichaAI:

1. **Create/update `.env.local`:**
   ```env
   # PrepSkul Supabase (existing)
   NEXT_PUBLIC_PREPSKUL_SUPABASE_URL=https://your-prepskul-project.supabase.co
   NEXT_PUBLIC_PREPSKUL_SUPABASE_ANON_KEY=your-prepskul-key

   # TichaAI Supabase (new)
   NEXT_PUBLIC_TICHA_SUPABASE_URL=https://your-ticha-project.supabase.co
   NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your-ticha-key
   ```

2. **Update `lib/ticha-supabase.ts`** to use TichaAI-specific vars:
   ```typescript
   const tichaSupabaseUrl = process.env.NEXT_PUBLIC_TICHA_SUPABASE_URL!;
   const tichaSupabaseAnonKey = process.env.NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY!;
   ```

#### Option B: Replace Existing Values (Simpler but PrepSkul breaks)

If you only want to use TichaAI now:

1. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-ticha-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-ticha-key
   ```

   ⚠️ **Warning:** This will break PrepSkul functionality until you switch back!

### Step 5: Test the Connection

After setting up env vars:

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Test in browser console:**
   ```javascript
   // This should work without errors
   import { tichaSupabase } from '@/lib/ticha-supabase';
   console.log(tichaSupabase);
   ```

## Current Setup

- ✅ **TichaAI organization** created
- ⏳ **TichaAI project** - Need to create in organization
- ⏳ **Database schema** - Need to run SQL
- ⏳ **Environment variables** - Need to set

## Next Steps After Setup

Once database is ready, I'll help you create:
1. ✅ Sign Up UI (`/ticha/signup`)
2. ✅ Sign In UI (`/ticha/signin`)
3. ✅ Authentication logic
4. ✅ Dashboard with user's presentations
5. ✅ File upload to Supabase Storage

---

**Let me know when:**
- ✅ Project is created in TichaAI organization
- ✅ SQL schema is run
- ✅ You have the credentials

Then we can proceed with building the UI! 🚀

