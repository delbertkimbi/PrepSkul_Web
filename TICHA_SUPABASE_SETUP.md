# TichaAI Supabase Setup Guide

## Current Status

✅ **Supabase is already configured in this project:**
- Packages installed: `@supabase/ssr` and `@supabase/supabase-js`
- Client files exist: `lib/supabase.ts` and `lib/supabase-server.ts`
- Environment variables needed: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Note:** Your existing project uses Supabase for PrepSkul (tutor/learner profiles, sessions, etc.). We'll create a **separate Supabase project** for TichaAI to keep it isolated.

## Step 1: Check Current Supabase Connection

1. **Check if you have a `.env.local` file:**
   ```bash
   # Run in your terminal (in project root)
   ls -la | grep .env
   ```

2. **If `.env.local` exists, check current Supabase URL:**
   ```bash
   cat .env.local
   ```
   
   You should see something like:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   ```

## Step 2: Create New Supabase Project for TichaAI

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Sign in** with your account
3. **Click "New Project"**
4. **Fill in the details:**
   - **Name:** `ticha` (or `ticha-ai`)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine to start

5. **Wait for project to be created** (2-3 minutes)

### Option B: Using Supabase CLI

If you have Supabase CLI installed:
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Create new project
supabase projects create ticha
```

## Step 3: Get Your Supabase Credentials

1. **In Supabase Dashboard → Your Project → Settings → API**
2. **Copy these values:**
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 4: Create Database Schema

1. **In Supabase Dashboard → SQL Editor**
2. **Run the SQL script** (see `supabase/ticha_schema.sql` file we'll create)

Or use the SQL below:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TichaAI Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS ticha_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- TichaAI Presentations Table
CREATE TABLE IF NOT EXISTS ticha_presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES ticha_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT, -- Original file URL if uploaded
  file_name TEXT,
  file_type TEXT, -- pdf, txt, docx, etc.
  prompt TEXT, -- User's prompt/instructions
  status TEXT NOT NULL DEFAULT 'processing', -- processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- TichaAI Presentation Slides Table (if you want to store slide data)
CREATE TABLE IF NOT EXISTS ticha_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID NOT NULL REFERENCES ticha_presentations(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  title TEXT,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ticha_presentations_user_id ON ticha_presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_ticha_presentations_status ON ticha_presentations(status);
CREATE INDEX IF NOT EXISTS idx_ticha_presentations_created_at ON ticha_presentations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticha_slides_presentation_id ON ticha_slides(presentation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE ticha_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticha_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticha_slides ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see/edit their own data
CREATE POLICY "Users can view own profile"
  ON ticha_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON ticha_users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON ticha_users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own presentations"
  ON ticha_presentations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own presentations"
  ON ticha_presentations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentations"
  ON ticha_presentations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentations"
  ON ticha_presentations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own slides"
  ON ticha_slides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ticha_presentations
      WHERE ticha_presentations.id = ticha_slides.presentation_id
      AND ticha_presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create slides for own presentations"
  ON ticha_slides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ticha_presentations
      WHERE ticha_presentations.id = ticha_slides.presentation_id
      AND ticha_presentations.user_id = auth.uid()
    )
  );

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_ticha_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ticha_users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_ticha_user();
```

## Step 5: Set Up Environment Variables

### For Development:

Create or update `.env.local` in your project root:

```env
# TichaAI Supabase Project
NEXT_PUBLIC_SUPABASE_URL=https://your-ticha-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side admin operations (if needed later)
TICHA_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** 
- Keep your existing PrepSkul Supabase credentials if you need both projects
- You may want to rename them for clarity (e.g., `NEXT_PUBLIC_TICHA_SUPABASE_URL`)
- Or create separate env files (`.env.ticha.local`)

### For Production (Vercel):

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your TichaAI project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your TichaAI anon key

## Step 6: Configure Storage (Optional - for file uploads)

1. **In Supabase Dashboard → Storage**
2. **Create a new bucket:**
   - **Name:** `ticha-files`
   - **Public:** No (private bucket)
   - **File size limit:** 50MB (adjust as needed)

3. **Create Storage Policies:**

```sql
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ticha-files' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ticha-files'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ticha-files'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

## Step 7: Test Connection

Create a test file to verify everything works:

```typescript
// lib/ticha-supabase.ts
import { createBrowserClient } from '@supabase/ssr';

const tichaSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const tichaSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const tichaSupabase = createBrowserClient(tichaSupabaseUrl, tichaSupabaseAnonKey);
```

## Next Steps

1. ✅ Verify database schema is created
2. ✅ Test signup/signin functionality
3. ✅ Implement file upload to Supabase Storage
4. ✅ Create presentation generation logic
5. ✅ Store presentation data in database

## Troubleshooting

### Issue: Environment variables not loading
- **Solution:** Restart your dev server after adding `.env.local`
- Ensure variables start with `NEXT_PUBLIC_` for client-side access

### Issue: RLS policies blocking queries
- **Solution:** Check that user is authenticated and policies are correctly set
- Test in Supabase Dashboard → Table Editor → Test with auth user

### Issue: Trigger not creating user profile
- **Solution:** Verify trigger is created and function has `SECURITY DEFINER`
- Check Supabase logs for errors

## Security Notes

✅ **Row Level Security (RLS)** is enabled - users can only access their own data
✅ **Passwords** are hashed by Supabase Auth (bcrypt)
✅ **API keys** are environment-specific (never commit to git)
✅ **File uploads** are user-scoped with folder structure: `{userId}/{filename}`

