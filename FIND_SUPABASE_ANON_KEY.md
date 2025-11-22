# How to Find Supabase Anon Key - Step by Step

## Step-by-Step Guide to Find Your Anon Key

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. **Sign in** with your account

### Step 2: Select TichaAI Organization
1. You should see "Your Organizations" page
2. **Click on "TichaAI"** organization (should be one of the cards)

### Step 3: Select Your Project
1. Inside TichaAI organization, you'll see your project(s)
2. **Click on your TichaAI project** (the one you created)

### Step 4: Navigate to Settings → API
1. In the **left sidebar**, look for a **gear icon** (⚙️) labeled **"Settings"**
2. **Click on "Settings"**
3. In the settings menu, look for **"API"** and click it
   - It might be under "Project Settings" or "Configuration"

### Step 5: Find the Anon Key
You should see a section called **"Project API keys"** or **"API Keys"**

Look for:
- **"anon"** or **"public"** key
- It's a **very long string** starting with `eyJ...`
- Usually displayed in a box/card

### If You See the Key:
1. **Look for an eye icon** 👁️ or **copy icon** 📋
2. Click it to **reveal/copy the key**
3. The key looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY...` (very long!)

### Alternative: Check These Sections
If you don't see it under Settings → API, check:
1. **Settings → General** - Sometimes credentials are here
2. **Project Settings → API** - Another common location
3. **Dashboard → Project Overview** - Look for API credentials card

### What to Copy
You need **TWO things:**
1. **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - Usually displayed prominently at the top
   
2. **anon/public key**: Long string starting with `eyJ...`
   - Found under "Project API keys" → "anon public"

### Still Can't Find It?
Try this:
1. **Look at the top of the Settings → API page**
2. Check if there's a tab/section switcher (Settings, API, Database, etc.)
3. The anon key should be visible without clicking anything (it's public by design)

### Visual Guide Locations:
- ✅ **Left sidebar** → ⚙️ **Settings** → **API**
- ✅ Look for **"Project API keys"** section
- ✅ Find **"anon"** or **"public"** key
- ✅ Copy the long string (starts with `eyJ...`)

---

**Once you have both:**
- Project URL
- anon/public key

Add them to your `.env.local` file as:
```env
NEXT_PUBLIC_TICHA_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your-anon-key-here
```

Let me know what you see on your Settings → API page if you're still stuck!

