# Agora Cloud Recording – Storage configuration

Agora Cloud Recording **requires third-party cloud storage**. The API does not accept an empty bucket. You can use **AWS S3** or **Supabase Storage** (S3-compatible).

## Required environment variables

Add these to `.env.local` (or your deployment env) to enable session recording:

| Variable | Description | Example |
|----------|-------------|---------|
| `AGORA_RECORDING_STORAGE_BUCKET` | Bucket name | `recordings` or your Supabase bucket name |
| `AGORA_RECORDING_STORAGE_ACCESS_KEY` | Storage access key | Your key |
| `AGORA_RECORDING_STORAGE_SECRET_KEY` | Storage secret key | Your secret |

## Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `AGORA_RECORDING_STORAGE_VENDOR` | `1` = AWS S3, `11` = S3-compatible (Supabase) | `1` |
| `AGORA_RECORDING_STORAGE_REGION` | Region code (vendor-specific) | `0` |
| `AGORA_RECORDING_STORAGE_ENDPOINT` | **Required for vendor 11:** custom S3 endpoint URL | (none) |

---

## Step-by-step Supabase setup

For a full walkthrough (what to click in Supabase, where to get each value, and exactly where to put it in the project), see:

- **[docs/AGORA_RECORDING_SUPABASE_SETUP.md](docs/AGORA_RECORDING_SUPABASE_SETUP.md)**

---

## Using Supabase Storage (recommended if you already use Supabase)

Yes, you can use a bucket in **Supabase**. Supabase Storage is S3-compatible; Agora supports it via vendor `11` and a custom endpoint.

### 1. Create a bucket in Supabase

1. In the [Supabase Dashboard](https://supabase.com/dashboard), open your project.
2. Go to **Storage** and create a new bucket, e.g. `agora-recordings`.
3. Set the bucket to **Private** if you want access only via signed URLs or your backend; or **Public** if recordings are public. Agora will upload using the S3 API.

### 2. Get S3 credentials and endpoint

1. Go to **Project Settings** → **Storage** (or **Storage** → **Settings** in the sidebar).
2. Under **S3 Access Keys**, generate or copy your **Access Key ID** and **Secret Access Key** (server-side only; keep them secret).
3. Note your **S3 endpoint**. It is:
   - `https://<project_ref>.storage.supabase.co/storage/v1/s3`
   - Replace `<project_ref>` with your project reference (e.g. `abcdefghijklmnop` from the project URL).

### 3. Set environment variables

```env
AGORA_RECORDING_STORAGE_BUCKET=agora-recordings
AGORA_RECORDING_STORAGE_ACCESS_KEY=<your Supabase S3 access key id>
AGORA_RECORDING_STORAGE_SECRET_KEY=<your Supabase S3 secret access key>
AGORA_RECORDING_STORAGE_VENDOR=11
AGORA_RECORDING_STORAGE_ENDPOINT=https://<project_ref>.storage.supabase.co/storage/v1/s3
AGORA_RECORDING_STORAGE_REGION=0
```

Replace `<project_ref>` with your actual project reference (no angle brackets).

### 4. Redeploy

Redeploy the web backend so it picks up the new env vars. Recording will then upload to your Supabase bucket.

## If not set

If these are not set, the recording start API returns **503** with a message like:  
`Recording storage not configured. Set AGORA_RECORDING_STORAGE_* ...`  
Sessions still work; only recording is disabled until storage is configured.

## AWS S3 example

1. Create an S3 bucket (e.g. `prepskul-recordings`).
2. Create an IAM user with `s3:PutObject` (and list if needed) on that bucket.
3. Set in env:
   - `AGORA_RECORDING_STORAGE_BUCKET=prepskul-recordings`
   - `AGORA_RECORDING_STORAGE_ACCESS_KEY=<access key>`
   - `AGORA_RECORDING_STORAGE_SECRET_KEY=<secret key>`
   - `AGORA_RECORDING_STORAGE_VENDOR=1`
   - `AGORA_RECORDING_STORAGE_REGION=0` (US); see Agora docs for other region codes.

No `AGORA_RECORDING_STORAGE_ENDPOINT` is needed for AWS S3.
