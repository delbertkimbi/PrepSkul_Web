# 🔐 Required Environment Variables for Vercel Deployment

## ❌ **Current Status: Missing Critical Variables**

You mentioned you only have **AGORA_APP_ID** and **AGORA_APP_CERTIFICATE** in Vercel. However, **these are NOT sufficient** for the recording and transcription features to work.

---

## ✅ **Required Environment Variables**

### **1. Agora Cloud Recording (REQUIRED)**
```env
AGORA_APP_ID=your_app_id                    # ✅ You have this
AGORA_CUSTOMER_ID=your_customer_id           # ❌ MISSING - CRITICAL!
AGORA_CUSTOMER_SECRET=your_customer_secret   # ❌ MISSING - CRITICAL!
```

**Why these are needed:**
- `AGORA_APP_ID`: Used to identify your Agora app
- `AGORA_CUSTOMER_ID`: Required for Cloud Recording API authentication
- `AGORA_CUSTOMER_SECRET`: Required for Cloud Recording API authentication

**Note:** `AGORA_APP_CERTIFICATE` is **NOT** used for Cloud Recording. It's only used for generating tokens in the Flutter app.

---

### **2. Deepgram Transcription (REQUIRED)**
```env
DEEPGRAM_API_KEY=your-deepgram-api-key      # ❌ MISSING - CRITICAL!
```

**Why this is needed:**
- Required for transcribing audio files after recording

---

### **3. Supabase (Should already exist)**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url  # ✅ Should already exist
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # ✅ Should already exist
```

---

### **4. SkulMate Generation (REQUIRED for /api/skulmate/generate)**
```env
SKULMATE_OPENROUTER_API_KEY=sk-or-v1-...    # ✅ Required (primary)
OPENROUTER_API_KEY=sk-or-v1-...             # Optional fallback
```

**Optional debug-only variables (leave unset in production unless needed):**
```env
SKULMATE_DEBUG_INGEST_URL=https://...        # Optional debug sink
SKULMATE_DEBUG_SESSION_ID=your-session-id    # Optional debug label
```

---

## 🔍 **What Each Variable Is Used For**

### **AGORA_APP_ID**
- Used in: `AgoraClient` constructor
- Purpose: Identifies your Agora application
- Used for: All Agora API calls (acquire, start, stop recording)

### **AGORA_CUSTOMER_ID**
- Used in: `AgoraClient` constructor
- Purpose: Authentication for Cloud Recording API
- Used for: Basic Auth header (`customerId:customerSecret`)

### **AGORA_CUSTOMER_SECRET**
- Used in: `AgoraClient` constructor
- Purpose: Authentication for Cloud Recording API
- Used for: Basic Auth header (`customerId:customerSecret`)

### **AGORA_APP_CERTIFICATE**
- Used in: `token-generator.ts` (Flutter app token generation)
- Purpose: Signing tokens for Flutter app to join channels
- **NOT used in:** Cloud Recording API (uses Customer ID/Secret instead)

### **DEEPGRAM_API_KEY**
- Used in: `DeepgramClient` constructor
- Purpose: Authentication for Deepgram transcription API
- Used for: Transcribing audio files

---

## 📋 **How to Get Missing Variables**

### **1. Get Agora Customer ID & Secret**

1. **Log in to Agora Console:**
   - Go to: https://console.agora.io/

2. **Navigate to Cloud Recording:**
   - Go to: **Projects** → Select your project
   - Go to: **Cloud Recording** → **RESTful API**

3. **Get Credentials:**
   - **Customer ID**: Found in the RESTful API section
   - **Customer Secret**: Found in the RESTful API section
   - These are different from App ID and App Certificate!

4. **Enable Cloud Recording:**
   - Make sure Cloud Recording is enabled for your project
   - You may need to enable it in project settings

### **2. Get Deepgram API Key**

1. **Sign up for Deepgram:**
   - Go to: https://console.deepgram.com/signup
   - No credit card required for free tier ($200 credit)

2. **Get API Key:**
   - Go to: **Projects** → Select your project
   - Go to: **API Keys** → **Create API Key**
   - Copy the key

---

## ⚠️ **What Will Break Without These Variables**

### **Without AGORA_CUSTOMER_ID & AGORA_CUSTOMER_SECRET:**
```
❌ Recording will NOT start
❌ Error: "Missing required Agora credentials: AGORA_CUSTOMER_ID, AGORA_CUSTOMER_SECRET, AGORA_APP_ID"
❌ All recording API calls will fail with 401 Unauthorized
```

### **Without DEEPGRAM_API_KEY:**
```
❌ Transcription will NOT work
❌ Error: "DEEPGRAM_API_KEY environment variable is required"
❌ Audio files will be recorded but never transcribed
```

---

## ✅ **Complete Vercel Environment Variables Checklist**

Add these to your Vercel project settings:

```env
# Agora (Video Calls)
AGORA_APP_ID=your_app_id                    # ✅ You have this
AGORA_APP_CERTIFICATE=your_app_certificate   # ✅ You have this (for Flutter tokens)
AGORA_DATA_CENTER=EU                        # Optional, defaults to EU

# Agora Cloud Recording (REQUIRED for recording feature)
AGORA_CUSTOMER_ID=your_customer_id           # ❌ ADD THIS!
AGORA_CUSTOMER_SECRET=your_customer_secret   # ❌ ADD THIS!

# Deepgram Transcription (REQUIRED for transcription feature)
DEEPGRAM_API_KEY=your-deepgram-api-key      # ❌ ADD THIS!

# Supabase (Should already exist)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url  # ✅ Should exist
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # ✅ Should exist
```

---

## 🚀 **Quick Setup Steps**

1. **Get Agora Customer ID & Secret:**
   - Agora Console → Cloud Recording → RESTful API
   - Copy Customer ID and Customer Secret

2. **Get Deepgram API Key:**
   - Deepgram Console → API Keys → Create API Key

3. **Add to Vercel:**
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all missing variables
   - **Important:** Make sure to add them to **Production**, **Preview**, and **Development** environments

4. **Redeploy:**
   - After adding variables, trigger a new deployment
   - Or wait for next automatic deployment

---

## 🔍 **Verification**

After adding the variables, check your Vercel deployment logs for:

✅ **Success indicators:**
- No errors about missing environment variables
- Recording API calls succeed (check `/api/agora/recording/start` logs)
- Transcription API calls succeed (check webhook logs)

❌ **Failure indicators:**
- "Missing required Agora credentials" errors
- "DEEPGRAM_API_KEY environment variable is required" errors
- 401 Unauthorized errors from Agora API

---

## **Session feedback portals (optional overrides)**

Admin “Generate secure links” uses public subdomain URLs. Defaults match production:

- `https://tutor.prepskul.com`
- `https://learner.prepskul.com`

Override if needed:

```env
NEXT_PUBLIC_TUTOR_PORTAL_URL=https://tutor.prepskul.com
NEXT_PUBLIC_LEARNER_PORTAL_URL=https://learner.prepskul.com
```

---

## 📝 **Summary**

**You need to add to Vercel:**
1. ✅ `AGORA_APP_ID` - Already have
2. ✅ `AGORA_APP_CERTIFICATE` - Already have (but not used for recording)
3. ❌ `AGORA_CUSTOMER_ID` - **MISSING - ADD THIS!**
4. ❌ `AGORA_CUSTOMER_SECRET` - **MISSING - ADD THIS!**
5. ❌ `DEEPGRAM_API_KEY` - **MISSING - ADD THIS!**

**Without these 3 missing variables, recording and transcription will NOT work.**
