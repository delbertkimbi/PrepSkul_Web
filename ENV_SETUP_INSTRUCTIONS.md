# Environment Variables Setup for TichaAI

## ✅ Use the EXISTING `.env.local` file

**Do NOT create a new file** - just add to your existing `.env.local`

## Step 1: Get Your TichaAI Supabase Credentials

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard
2. **Select TichaAI organization** → **Your TichaAI project**
3. **Go to Settings → API**
4. **Copy these two values:**
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 2: Add to `.env.local`

Open your `.env.local` file and **add these lines** at the end:

```env
# TichaAI Supabase Configuration
# Get these from: https://supabase.com/dashboard (TichaAI project)
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://your-ticha-project-id.supabase.co
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your-ticha-anon-key-here
```

## Complete Example `.env.local`

Your file should look like this:

```env
# Supabase Configuration (PrepSkul - existing)
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://cpzaxdfxbamdsshdgjyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemF4ZGZ4YmFtZHNzaGRnanlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDUwMDYsImV4cCI6MjA3NzA4MTAwNn0.FWBFrseEeYqFaJ7FGRUAYtm10sz0JqPyerJ0BfoYnCU

# TichaAI Supabase Configuration (NEW - add these)
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://your-ticha-project-id.supabase.co
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your-ticha-anon-key-here

# Other existing vars
RESEND_API_KEY=re_TR8La2Cz_NPaDo8YektBvwiM8URFSGYoe
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

## Step 3: Replace Placeholder Values

**Replace:**
- `https://your-ticha-project-id.supabase.co` with your actual TichaAI Project URL
- `your-ticha-anon-key-here` with your actual TichaAI anon/public key

## Step 4: Save and Restart

1. **Save the file** (`.env.local`)
2. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C if running)
   npm run dev
   ```

## Important Notes

✅ **Both projects will work:**
- PrepSkul uses: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- TichaAI uses: `NEXT_PUBLIC_TICHA_SUPABASE_URL` and `NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY`

✅ **Files are gitignored:** `.env.local` is already in `.gitignore`, so your credentials won't be committed

✅ **For production:** Add the same variables to Vercel/your hosting platform's environment variables

## Where to Find TichaAI Credentials

1. **Supabase Dashboard:** https://supabase.com/dashboard
2. **Select:** TichaAI organization
3. **Click:** Your project name
4. **Go to:** Settings (gear icon) → API
5. **Copy:**
   - **Project URL** under "Project URL" section
   - **anon public** key under "Project API keys" section

---

**After adding credentials, restart your dev server and test:**
- `/ticha/signup` - Create account
- `/ticha/signin` - Sign in
- `/ticha/dashboard` - View dashboard

