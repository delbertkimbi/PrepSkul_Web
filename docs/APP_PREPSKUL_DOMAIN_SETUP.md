# Using app.prepskul.com for Resend Email

## ✅ Great Discovery!

**You can use `app.prepskul.com` as a subdomain!** This is actually a better approach than using the root domain.

## 🎯 What You Need

### ✅ Enable (Required for Sending):
1. **Domain Verification (DKIM)** - Required
2. **Enable Sending (SPF & DMARC)** - Required ✅ (Keep ON)

### ❌ Disable (Not Needed):
3. **Enable Receiving** - ❌ Turn OFF (Not needed for sending emails)

## 📋 Step-by-Step Setup

### Step 1: Add DNS Records

Add these records to your DNS provider for `app.prepskul.com`:

#### 1. DKIM Record (Domain Verification)
- **Type:** `TXT`
- **Name:** `resend._domainkey.app`
- **Content:** `p=MIGfMA0GCSqGSIb3DQEB...` (full value from Resend)
- **TTL:** Auto

#### 2. SPF Record (Enable Sending)
- **Type:** `TXT`
- **Name:** `send.app`
- **Content:** `v=spf1 include:amazons...` (full value from Resend)
- **TTL:** Auto

#### 3. MX Record (Enable Sending)
- **Type:** `MX`
- **Name:** `send.app`
- **Content:** `feedback-smtp.eu-west-...` (full value from Resend)
- **Priority:** `10`
- **TTL:** Auto

#### 4. DMARC Record (Optional but Recommended)
- **Type:** `TXT`
- **Name:** `_dmarc.app` (or just `_dmarc` depending on your DNS provider)
- **Content:** `v=DMARC1; p=none;`
- **TTL:** Auto

### Step 2: Configure Resend Settings

1. **Keep "Enable Sending" ON** ✅ (Green toggle)
2. **Turn "Enable Receiving" OFF** ❌ (Gray toggle)

**Why disable receiving?**
- You only need to SEND emails (tutor approvals, etc.)
- Enabling receiving would change where emails TO `app.prepskul.com` are delivered
- This could break existing email setup
- Not needed for your use case

### Step 3: Wait for Verification

1. Add all DNS records to your DNS provider
2. Wait 5-30 minutes for DNS propagation
3. Resend will automatically check and verify
4. Records will change from "Pending" to "Verified" ✅

### Step 4: Click "I've added the records"

Once you've added all DNS records to your DNS provider:
1. Click the **"I've added the records"** button at the bottom
2. Resend will start checking for the records
3. Wait for verification (usually 5-30 minutes)

### Step 5: Update Environment Variables

Once verified, update `.env.local`:

```env
RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>
RESEND_REPLY_TO=info@prepskul.com
```

Then restart your Next.js server.

## 🤔 Important: You Don't Need an Actual Email Account!

**Common Misconception:** "I don't own `info@mail.prepskul.com` - can I still use it?"

**Answer: YES!** ✅

### How It Works:

1. **Domain Verification = DNS Control**
   - Resend only checks if you control the DNS for `app.prepskul.com`
   - It does NOT check if you have an actual email account
   - You verify domain ownership via DNS records, not email accounts

2. **You Can Use ANY Email Address on the Domain**
   - `info@mail.prepskul.com` ✅
   - `notifications@app.prepskul.com` ✅
   - `noreply@app.prepskul.com` ✅
   - `hello@app.prepskul.com` ✅
   - Any address you want! ✅

3. **The Email Address Doesn't Need to Exist**
   - The address is just used in the "From" header
   - It doesn't need to be a real mailbox
   - Replies go to `Reply-To` address anyway (`info@prepskul.com`)

### What Recipients See:

- **From:** PrepSkul <info@mail.prepskul.com>
- **Reply-To:** info@prepskul.com
- **When they reply:** Email goes to `info@prepskul.com` (your actual business email)

### Alternative Addresses You Can Use:

If you prefer a different address, you can use:

```env
# Option 1: info@mail.prepskul.com (recommended)
RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>

# Option 2: notifications@app.prepskul.com
RESEND_FROM_EMAIL=PrepSkul <notifications@app.prepskul.com>

# Option 3: noreply@app.prepskul.com
RESEND_FROM_EMAIL=PrepSkul <noreply@app.prepskul.com>

# Option 4: hello@app.prepskul.com
RESEND_FROM_EMAIL=PrepSkul <hello@app.prepskul.com>

# All work the same! Just pick one you like.
RESEND_REPLY_TO=info@prepskul.com
```

**Bottom line:** As long as you control the DNS for `app.prepskul.com`, you can send from ANY email address on that domain! 🎯

## ⚠️ Important: Enable Receiving Warning

**The warning says:**
> "MX record update: Routing emails to Resend will disable old MX records. Use a subdomain to avoid issues and improve deliverability."

**What this means:**
- If you enable receiving, Resend will add an MX record for `@` (root domain)
- This changes where emails TO `app.prepskul.com` are delivered
- Could break existing email setup

**Solution:**
- ✅ Keep "Enable Receiving" OFF
- ✅ You're already using a subdomain (`app.prepskul.com`) - perfect!
- ✅ This avoids any conflicts with root domain email

## ✅ Benefits of Using app.prepskul.com

1. **Subdomain isolation:** Doesn't affect root domain email
2. **Better organization:** Separates transactional emails from main domain
3. **Easier management:** Can manage separately from main domain
4. **Professional:** Still looks professional (`info@mail.prepskul.com`)

## 📧 Final Configuration

```env
# .env.local
RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>
RESEND_REPLY_TO=info@prepskul.com
```

**Result:**
- ✅ Sends from verified subdomain
- ✅ Recipients see "PrepSkul" as sender
- ✅ Replies go to `info@prepskul.com`
- ✅ No conflicts with root domain

## 🎯 Summary

| Setting | Action | Why |
|---------|--------|-----|
| Domain Verification | ✅ Add DKIM record | Required for sending |
| Enable Sending | ✅ Keep ON | Required for sending |
| Enable Receiving | ❌ Turn OFF | Not needed, avoids conflicts |
| "I've added the records" | ✅ Click after adding DNS | Confirms records added |

Perfect setup! 🚀

