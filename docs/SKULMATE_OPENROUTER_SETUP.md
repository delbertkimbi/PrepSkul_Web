# skulMate OpenRouter API Key Setup

## 📋 Overview

skulMate uses OpenRouter API to generate interactive games from notes/documents. **skulMate has its own separate API key** to track usage independently from TichaAI.

---

## 🔑 Step 1: Get Your OpenRouter API Keys

You need **TWO separate API keys** for usage tracking:

### For skulMate:
1. **Go to OpenRouter:** https://openrouter.ai/
2. **Sign up or log in** to your account
3. **Go to:** https://openrouter.ai/keys
4. **Create a new API key** specifically for skulMate (e.g., name it "skulMate")
5. **Copy the API key** (it looks like: `sk-or-v1-...`)

### For TichaAI (if not already set):
1. **Create another API key** for TichaAI (e.g., name it "TichaAI")
2. **Copy this key as well**

**Note:** You may need to add credits to your OpenRouter account for the API to work. Check: https://openrouter.ai/credits

---

## 📝 Step 2: Add to `.env.local`

**Location:** `PrepSkul_Web/.env.local`

**Add these lines** to your existing `.env.local` file:

```env
# OpenRouter API Keys (separate keys for usage tracking)
SKULMATE_OPENROUTER_API_KEY=sk-or-v1-your-skulmate-api-key-here
TICHA_OPENROUTER_API_KEY=sk-or-v1-your-ticha-api-key-here

# Legacy support (optional - will use TICHA_OPENROUTER_API_KEY if set)
# OPENROUTER_API_KEY=sk-or-v1-fallback-key-here
```

---

## ✅ Complete Example `.env.local`

Your `.env.local` file should include:

```env
# PrepSkul Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cpzaxdfxbamdsshdgjyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prepskul_anon_key_here

# TichaAI Supabase Configuration (if using TichaAI)
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://your-ticha-project-id.supabase.co
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your-ticha-anon-key-here

# OpenRouter API Keys (separate keys for usage tracking)
SKULMATE_OPENROUTER_API_KEY=sk-or-v1-your-skulmate-api-key-here
TICHA_OPENROUTER_API_KEY=sk-or-v1-your-ticha-api-key-here

# Other existing vars
RESEND_API_KEY=your_resend_api_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

## 🎯 Why Separate Keys?

Using separate API keys allows you to:
- **Track usage separately** in OpenRouter dashboard
- **Monitor costs** for each feature independently
- **Set different limits** if needed
- **Analyze usage patterns** for skulMate vs TichaAI

---

## 🔄 Step 3: Restart Your Server

After adding the API key:

1. **Stop your dev server** (Ctrl+C if running)
2. **Restart it:**
   ```bash
   cd PrepSkul_Web
   npm run dev
   # or
   pnpm dev
   ```

---

## 🧪 Step 4: Test

1. **Open the Flutter app** (or web app)
2. **Navigate to skulMate** (FAB button on home screen)
3. **Upload a document or enter text**
4. **Generate a game**

If it works, you'll see the game generation succeed. If you get errors, check:
- API key is correct (no extra spaces)
- You have credits in your OpenRouter account
- Server was restarted after adding the key

---

## 🚀 For Production (Vercel/Deployment)

When deploying to production, add the same environment variable:

### Vercel:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add both keys:
   - **Name:** `SKULMATE_OPENROUTER_API_KEY`
     - **Value:** `sk-or-v1-your-skulmate-api-key-here`
     - **Environment:** Production, Preview, Development (select all)
   - **Name:** `TICHA_OPENROUTER_API_KEY`
     - **Value:** `sk-or-v1-your-ticha-api-key-here`
     - **Environment:** Production, Preview, Development (select all)

### Other Platforms:
Add `OPENROUTER_API_KEY` to your hosting platform's environment variables section.

---

## ⚠️ Important Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **API key is server-side only** - It's not exposed to the client
3. **Credits required** - OpenRouter requires credits for API usage. Free tier may have limits.
4. **Cost considerations** - Check OpenRouter pricing: https://openrouter.ai/models

---

## 🔍 Troubleshooting

### Error: "Missing SKULMATE_OPENROUTER_API_KEY environment variable"
- ✅ Check that `SKULMATE_OPENROUTER_API_KEY` is in `.env.local` (not `.env`)
- ✅ Restart your dev server after adding
- ✅ Check for typos in the variable name (must be `SKULMATE_OPENROUTER_API_KEY`)

### Error: "Missing TICHA_OPENROUTER_API_KEY environment variable" (for TichaAI)
- ✅ Check that `TICHA_OPENROUTER_API_KEY` is in `.env.local`
- ✅ Or use legacy `OPENROUTER_API_KEY` as fallback (for backward compatibility)

### Error: "402 Payment Required" or "Credits required"
- ✅ Add credits to your OpenRouter account: https://openrouter.ai/credits
- ✅ Check your account balance

### Error: "API error: 401"
- ✅ Verify your API key is correct
- ✅ Check that the key hasn't been revoked

---

## 📚 Related Files

- **API Route:** `PrepSkul_Web/app/api/skulmate/generate/route.ts`
- **OpenRouter Client:** `PrepSkul_Web/lib/ticha/openrouter.ts`
- **Environment Setup:** `PrepSkul_Web/docs/ENV_SETUP_INSTRUCTIONS.md`

---

**Need help?** Check OpenRouter docs: https://openrouter.ai/docs




## 📋 Overview

skulMate uses OpenRouter API to generate interactive games from notes/documents. **skulMate has its own separate API key** to track usage independently from TichaAI.

---

## 🔑 Step 1: Get Your OpenRouter API Keys

You need **TWO separate API keys** for usage tracking:

### For skulMate:
1. **Go to OpenRouter:** https://openrouter.ai/
2. **Sign up or log in** to your account
3. **Go to:** https://openrouter.ai/keys
4. **Create a new API key** specifically for skulMate (e.g., name it "skulMate")
5. **Copy the API key** (it looks like: `sk-or-v1-...`)

### For TichaAI (if not already set):
1. **Create another API key** for TichaAI (e.g., name it "TichaAI")
2. **Copy this key as well**

**Note:** You may need to add credits to your OpenRouter account for the API to work. Check: https://openrouter.ai/credits

---

## 📝 Step 2: Add to `.env.local`

**Location:** `PrepSkul_Web/.env.local`

**Add these lines** to your existing `.env.local` file:

```env
# OpenRouter API Keys (separate keys for usage tracking)
SKULMATE_OPENROUTER_API_KEY=sk-or-v1-your-skulmate-api-key-here
TICHA_OPENROUTER_API_KEY=sk-or-v1-your-ticha-api-key-here

# Legacy support (optional - will use TICHA_OPENROUTER_API_KEY if set)
# OPENROUTER_API_KEY=sk-or-v1-fallback-key-here
```

---

## ✅ Complete Example `.env.local`

Your `.env.local` file should include:

```env
# PrepSkul Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cpzaxdfxbamdsshdgjyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prepskul_anon_key_here

# TichaAI Supabase Configuration (if using TichaAI)
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://your-ticha-project-id.supabase.co
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your-ticha-anon-key-here

# OpenRouter API Keys (separate keys for usage tracking)
SKULMATE_OPENROUTER_API_KEY=sk-or-v1-your-skulmate-api-key-here
TICHA_OPENROUTER_API_KEY=sk-or-v1-your-ticha-api-key-here

# Other existing vars
RESEND_API_KEY=your_resend_api_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

## 🎯 Why Separate Keys?

Using separate API keys allows you to:
- **Track usage separately** in OpenRouter dashboard
- **Monitor costs** for each feature independently
- **Set different limits** if needed
- **Analyze usage patterns** for skulMate vs TichaAI

---

## 🔄 Step 3: Restart Your Server

After adding the API key:

1. **Stop your dev server** (Ctrl+C if running)
2. **Restart it:**
   ```bash
   cd PrepSkul_Web
   npm run dev
   # or
   pnpm dev
   ```

---

## 🧪 Step 4: Test

1. **Open the Flutter app** (or web app)
2. **Navigate to skulMate** (FAB button on home screen)
3. **Upload a document or enter text**
4. **Generate a game**

If it works, you'll see the game generation succeed. If you get errors, check:
- API key is correct (no extra spaces)
- You have credits in your OpenRouter account
- Server was restarted after adding the key

---

## 🚀 For Production (Vercel/Deployment)

When deploying to production, add the same environment variable:

### Vercel:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add both keys:
   - **Name:** `SKULMATE_OPENROUTER_API_KEY`
     - **Value:** `sk-or-v1-your-skulmate-api-key-here`
     - **Environment:** Production, Preview, Development (select all)
   - **Name:** `TICHA_OPENROUTER_API_KEY`
     - **Value:** `sk-or-v1-your-ticha-api-key-here`
     - **Environment:** Production, Preview, Development (select all)

### Other Platforms:
Add `OPENROUTER_API_KEY` to your hosting platform's environment variables section.

---

## ⚠️ Important Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **API key is server-side only** - It's not exposed to the client
3. **Credits required** - OpenRouter requires credits for API usage. Free tier may have limits.
4. **Cost considerations** - Check OpenRouter pricing: https://openrouter.ai/models

---

## 🔍 Troubleshooting

### Error: "Missing SKULMATE_OPENROUTER_API_KEY environment variable"
- ✅ Check that `SKULMATE_OPENROUTER_API_KEY` is in `.env.local` (not `.env`)
- ✅ Restart your dev server after adding
- ✅ Check for typos in the variable name (must be `SKULMATE_OPENROUTER_API_KEY`)

### Error: "Missing TICHA_OPENROUTER_API_KEY environment variable" (for TichaAI)
- ✅ Check that `TICHA_OPENROUTER_API_KEY` is in `.env.local`
- ✅ Or use legacy `OPENROUTER_API_KEY` as fallback (for backward compatibility)

### Error: "402 Payment Required" or "Credits required"
- ✅ Add credits to your OpenRouter account: https://openrouter.ai/credits
- ✅ Check your account balance

### Error: "API error: 401"
- ✅ Verify your API key is correct
- ✅ Check that the key hasn't been revoked

---

## 📚 Related Files

- **API Route:** `PrepSkul_Web/app/api/skulmate/generate/route.ts`
- **OpenRouter Client:** `PrepSkul_Web/lib/ticha/openrouter.ts`
- **Environment Setup:** `PrepSkul_Web/docs/ENV_SETUP_INSTRUCTIONS.md`

---

**Need help?** Check OpenRouter docs: https://openrouter.ai/docs

