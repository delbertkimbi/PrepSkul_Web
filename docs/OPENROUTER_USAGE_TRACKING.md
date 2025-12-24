# OpenRouter Usage Tracking Guide

## 📊 Overview

PrepSkul uses **separate OpenRouter API keys** for skulMate and TichaAI to track usage and costs independently.

---

## 🔑 API Key Setup

### Environment Variables

Add these to your `.env.local` file:

```env
# skulMate - Game Generation
SKULMATE_OPENROUTER_API_KEY=sk-or-v1-your-skulmate-key-here

# TichaAI - Presentation Generation
TICHA_OPENROUTER_API_KEY=sk-or-v1-your-ticha-key-here

# Legacy fallback (optional - TichaAI will use this if TICHA_OPENROUTER_API_KEY not set)
OPENROUTER_API_KEY=sk-or-v1-fallback-key-here
```

---

## 📈 Tracking Usage in OpenRouter Dashboard

### Step 1: Access OpenRouter Dashboard

1. Go to: https://openrouter.ai/
2. Log in to your account
3. Navigate to: https://openrouter.ai/activity

### Step 2: Filter by API Key

In the OpenRouter dashboard, you can:

1. **View all activity** - See all API calls
2. **Filter by API key** - Click on a specific key to see only its usage
3. **View costs** - See spending per key
4. **Export data** - Download usage reports

### Step 3: Identify Usage

- **skulMate usage** - Filter by `SKULMATE_OPENROUTER_API_KEY`
- **TichaAI usage** - Filter by `TICHA_OPENROUTER_API_KEY`

---

## 💰 Cost Analysis

### skulMate Costs

- **Model used:** `openai/gpt-4o-mini` (cheaper model)
- **Typical cost:** ~$0.01-0.05 per game generation
- **Factors:** Number of questions, text length

### TichaAI Costs

- **Models used:** Multiple models with fallback chain
- **Typical cost:** ~$0.10-0.50 per presentation
- **Factors:** File size, number of slides, model selection

---

## 📊 Usage Patterns

### Expected Usage

**skulMate:**
- Students/parents generating games from notes
- Multiple games per user
- Lower cost per generation

**TichaAI:**
- Users creating presentations
- Fewer generations per user
- Higher cost per generation

---

## 🔍 Monitoring Best Practices

1. **Set up alerts** in OpenRouter for high usage
2. **Review weekly** to identify trends
3. **Compare costs** between features
4. **Optimize models** if costs are high
5. **Set spending limits** per API key if needed

---

## 🛠️ Implementation Details

### Code Structure

- **skulMate:** Uses `SKULMATE_OPENROUTER_API_KEY` via `callOpenRouterWithKey()`
- **TichaAI:** Uses `TICHA_OPENROUTER_API_KEY` (or `OPENROUTER_API_KEY` fallback) via `callOpenRouter()`

### Files

- `lib/ticha/openrouter.ts` - OpenRouter client with separate key functions
- `app/api/skulmate/generate/route.ts` - skulMate game generation
- `app/api/ticha/generate/route.ts` - TichaAI presentation generation

---

## 📝 Notes

- **Separate keys = Separate tracking** - Each feature's usage is isolated
- **Dashboard visibility** - See exactly which feature is using credits
- **Cost allocation** - Easier to attribute costs to specific features
- **Future analytics** - Can build internal dashboards using OpenRouter API

---

**For more info:** See `docs/SKULMATE_OPENROUTER_SETUP.md` for setup instructions.

