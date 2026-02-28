# Agora recording with Supabase Storage – step-by-step

This guide tells you exactly what to do in Supabase and where to put each value in your project.

---

## Part 1: Supabase (Dashboard)

### Step 1 – Open your project

1. Go to **[Supabase Dashboard](https://supabase.com/dashboard)** and sign in.
2. Click your **project** (the one you use for PrepSkul – same as `NEXT_PUBLIC_SUPABASE_URL`).

### Step 2 – Get your Project Reference (for the endpoint URL)

You need this to build the S3 endpoint.

1. In the left sidebar, click the **gear icon** → **Project Settings** (or **Settings** → **General**).
2. On **General**, find **Reference ID** (or **Project ID**). It’s a short string like `cpzaxdfxbamdsshdgjyg`.
3. **Copy it** and keep it for Step 5.  
   - You can also get it from the browser URL when you’re in the project:  
     `https://supabase.com/dashboard/project/<THIS_IS_YOUR_PROJECT_REF>`.

### Step 3 – Create a bucket for recordings

1. In the left sidebar, open **Storage**.
2. Click **New bucket**.
3. **Name:** e.g. `agora-recordings` (use only letters, numbers, hyphens).
4. **Public bucket:**  
   - **Off (Private)** if only your backend should access files (recommended).  
   - **On (Public)** only if you need public URLs to the recordings.
5. Click **Create bucket**.  
   You’ll use this **bucket name** in the project env as `AGORA_RECORDING_STORAGE_BUCKET`.

### Step 4 – Get S3 Access Key and Secret Key

Agora uploads files via the S3 API, so Supabase needs to give you S3-style credentials.

1. In the left sidebar, go to **Storage**.
2. Open the **Configuration** (gear) or **S3** / **Settings** tab for Storage, or go to:  
   **Project Settings** (gear in sidebar) → **Storage**.
3. Find the section **“S3 Access Keys”** or **“S3 API”**.
4. Click **“Generate new key”** (or similar).  
   - **Important:** The **Secret Access Key** is shown **only once** when you create the key. Copy it immediately.
5. Copy and store safely:
   - **Access Key ID** → you’ll use this as `AGORA_RECORDING_STORAGE_ACCESS_KEY`.
   - **Secret Access Key** → you’ll use this as `AGORA_RECORDING_STORAGE_SECRET_KEY`.

If you don’t see “S3 Access Keys”, check Supabase’s current docs: [Storage S3 Authentication](https://supabase.com/docs/guides/storage/s3/authentication). The exact menu may be **Storage** → **Settings** or **Project Settings** → **Storage**.

### Step 5 – Build the S3 endpoint URL

Use this format:

```text
https://<PROJECT_REF>.storage.supabase.co/storage/v1/s3
```

Replace `<PROJECT_REF>` with the value from **Step 2** (e.g. `cpzaxdfxbamdsshdgjyg`).

**Example:**  
If your Reference ID is `cpzaxdfxbamdsshdgjyg`, the endpoint is:

```text
https://cpzaxdfxbamdsshdgjyg.storage.supabase.co/storage/v1/s3
```

You’ll use this full URL as `AGORA_RECORDING_STORAGE_ENDPOINT` in the project.

---

## Part 2: Your project (where to put the values)

The backend that starts Agora recording is in the **PrepSkul_Web** project. That’s where these env vars must be set.

### Where to set them

- **Local development:** in **PrepSkul_Web**’s env file:
  - **`.env.local`** (create it if it doesn’t exist), at the **root** of the PrepSkul_Web folder:  
    `C:\Users\TECH\Desktop\PREPSKUL\PrepSkul_Web\.env.local`
- **Production (Vercel / your host):** in the **environment variables** section of your hosting dashboard (e.g. Vercel → Project → Settings → Environment Variables). Use the same variable names and values below.

Do **not** commit `.env.local` (it should be in `.gitignore`). Only commit example files like `.env.example` without real secrets.

### Exact variables to add

Open **PrepSkul_Web**’s `.env.local` (or your host’s env config) and add these lines. Replace the placeholders with the values from Part 1.

| Variable | Where you got the value | Example value |
|----------|-------------------------|---------------|
| `AGORA_RECORDING_STORAGE_BUCKET` | Step 3 – bucket name you created | `agora-recordings` |
| `AGORA_RECORDING_STORAGE_ACCESS_KEY` | Step 4 – Access Key ID | Long string from Supabase |
| `AGORA_RECORDING_STORAGE_SECRET_KEY` | Step 4 – Secret Access Key | Long string (only shown once) |
| `AGORA_RECORDING_STORAGE_VENDOR` | Fixed for Supabase | `11` |
| `AGORA_RECORDING_STORAGE_ENDPOINT` | Step 5 – full URL you built | `https://cpzaxdfxbamdsshdgjyg.storage.supabase.co/storage/v1/s3` |
| `AGORA_RECORDING_STORAGE_REGION` | Fixed (Supabase S3) | `0` |

### Example `.env.local` block (PrepSkul_Web)

```env
# Agora Cloud Recording → Supabase Storage (S3-compatible)
AGORA_RECORDING_STORAGE_BUCKET=agora-recordings
AGORA_RECORDING_STORAGE_ACCESS_KEY=your_access_key_id_from_supabase_storage_settings
AGORA_RECORDING_STORAGE_SECRET_KEY=your_secret_access_key_from_supabase
AGORA_RECORDING_STORAGE_VENDOR=11
AGORA_RECORDING_STORAGE_ENDPOINT=https://YOUR_PROJECT_REF.storage.supabase.co/storage/v1/s3
AGORA_RECORDING_STORAGE_REGION=0
```

Replace:

- `agora-recordings` if you used a different bucket name.
- `your_access_key_id_...` and `your_secret_access_key_...` with the real keys from Step 4.
- `YOUR_PROJECT_REF` with your actual Reference ID from Step 2 (no angle brackets).

### File and project summary

| What | Where |
|------|--------|
| Env file (local) | **PrepSkul_Web** → `.env.local` (project root) |
| Full path (example) | `C:\Users\TECH\Desktop\PREPSKUL\PrepSkul_Web\.env.local` |
| Who reads these vars | Next.js API routes in PrepSkul_Web (e.g. `/api/agora/recording/start`) |
| Production | Same variable names in your host’s env (e.g. Vercel / Railway) |

---

## Part 3: After you’ve set the env vars

1. **Restart** the PrepSkul_Web dev server if it’s running (`npm run dev` or `yarn dev`), so it reloads `.env.local`.
2. **Redeploy** the web backend in production so the new env vars are used there.
3. **Test:** Start or join a session as tutor and trigger recording. If something fails, check:
   - Bucket name matches exactly (e.g. `agora-recordings`).
   - Endpoint URL has your real project ref and the path `/storage/v1/s3`.
   - No extra spaces or quotes around the values in `.env.local`.

---

## Quick checklist

- [ ] Supabase: Created bucket (e.g. `agora-recordings`).
- [ ] Supabase: Generated S3 Access Key + Secret and copied both (Secret only shown once).
- [ ] Supabase: Noted Project Reference ID.
- [ ] Project: Opened `PrepSkul_Web/.env.local` (or created it).
- [ ] Project: Added all six `AGORA_RECORDING_STORAGE_*` variables with your real values.
- [ ] Project: Restarted dev server (and redeployed if using production).
