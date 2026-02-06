# How to Get Your OpenAI API Key

## Step-by-Step Guide

### 1. Create/Login to OpenAI Account
- Go to: **https://platform.openai.com/signup**
- Sign up for a new account OR login if you already have one
- You'll need to provide payment information (OpenAI charges per usage)

### 2. Navigate to API Keys
- Once logged in, go to: **https://platform.openai.com/api-keys**
- Or click on your profile icon (top right) → **API keys**

### 3. Create a New Secret Key
- Click the **"+ Create new secret key"** button
- Give it a name (e.g., "PrepSkul Transcription")
- Click **"Create secret key"**
- **IMPORTANT**: Copy the key immediately - you won't be able to see it again!

### 4. Add to .env.local
- Open `PrepSkul_Web/.env.local`
- Find the line: `OPENAI_API_KEY=sk-your-openai-api-key-here`
- Replace `sk-your-openai-api-key-here` with your actual API key
- Save the file

### 5. Restart Your Development Server
- If your Next.js server is running, restart it to load the new environment variable

## Pricing Information

**OpenAI Whisper API:** $0.006 per minute ($0.36 per hour)
- Per 61-minute session: ~$0.37
- 100 sessions/month: ~$37/month
- 500 sessions/month: ~$185/month

**Free Credits:**
- New accounts often get $5-10 in free credits to start
- Check your usage at: https://platform.openai.com/usage

## Security Notes

- **Never commit your API key to Git**
- The `.env.local` file should be in `.gitignore`
- For production (Vercel), add the key as an environment variable in Vercel dashboard

## Troubleshooting

### "Invalid API key" error
- Make sure you copied the entire key (starts with `sk-`)
- Check for extra spaces before/after the key
- Verify the key is active in OpenAI dashboard

### "Insufficient quota" error
- Add payment method in OpenAI dashboard
- Check your usage limits at: https://platform.openai.com/account/billing

### Testing Your Key
You can test if your key works by running:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Alternative: Free Options

If costs are a concern, consider:
1. **Deepgram Free Tier**: 12,000 minutes/month free
2. **Google Cloud Speech-to-Text**: 60 minutes/month free
3. **Self-hosted Whisper**: Free but requires GPU infrastructure
