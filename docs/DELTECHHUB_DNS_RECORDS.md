# Adding DNS Records for deltechhub.com

## ✅ Domain Added Successfully!

Your domain `deltechhub.com` is now in Resend and ready for DNS verification.

## 📋 DNS Records to Add

You need to add **4 DNS records** to your domain provider. Here's what you need:

### 1. DKIM Record (Required)
- **Type:** `TXT`
- **Name/Host:** `resend._domainkey`
- **Content/Value:** `p=MIGfMAOGCSqGSIb3DQEB...` (the full value from Resend)
- **TTL:** Auto (or 3600)

### 2. MX Record (Required for SPF/DMARC)
- **Type:** `MX`
- **Name/Host:** `send`
- **Content/Value:** `feedback-smtp.eu-west-...` (the full value from Resend)
- **Priority:** `10`
- **TTL:** Auto (or 3600)

### 3. SPF Record (Required)
- **Type:** `TXT`
- **Name/Host:** `send`
- **Content/Value:** `v=spf1 include:amazons...` (the full value from Resend)
- **TTL:** Auto (or 3600)

### 4. DMARC Record (Optional but Recommended)
- **Type:** `TXT`
- **Name/Host:** `_dmarc`
- **Content/Value:** `v=DMARC1; p=none;`
- **TTL:** Auto (or 3600)

---

## 🔍 Step 1: Find Your DNS Provider

**Where is `deltechhub.com` hosted?**

1. Go to [https://whois.net/](https://whois.net/)
2. Enter `deltechhub.com`
3. Look for **"Name Servers"** - this tells you where your DNS is hosted

Common providers:
- `cloudflare.com` → **Cloudflare**
- `namecheap.com` → **Namecheap**
- `godaddy.com` → **GoDaddy**
- `amazonaws.com` → **AWS Route 53**
- `google.com` → **Google Domains**

---

## 📝 Step 2: Add Records to Your DNS Provider

### If Using Cloudflare:

1. **Log in to Cloudflare**
2. **Select domain:** `deltechhub.com`
3. **Go to:** DNS → Records
4. **Click:** "Add record"

**Add each record:**

#### DKIM Record:
- **Type:** `TXT`
- **Name:** `resend._domainkey`
- **Content:** (copy full value from Resend)
- **TTL:** Auto
- Click **"Save"**

#### MX Record:
- **Type:** `MX`
- **Name:** `send`
- **Mail server:** (copy full value from Resend, e.g., `feedback-smtp.eu-west-1.amazonses.com`)
- **Priority:** `10`
- **TTL:** Auto
- Click **"Save"**

#### SPF Record:
- **Type:** `TXT`
- **Name:** `send`
- **Content:** (copy full value from Resend)
- **TTL:** Auto
- Click **"Save"**

#### DMARC Record (Optional):
- **Type:** `TXT`
- **Name:** `_dmarc`
- **Content:** `v=DMARC1; p=none;`
- **TTL:** Auto
- Click **"Save"**

---

### If Using Namecheap:

1. **Log in to Namecheap**
2. **Go to:** Domain List → Select `deltechhub.com`
3. **Click:** "Advanced DNS"
4. **Under "Host Records":** Click "Add New Record"

**Add each record:**
- Select **Type:** `TXT` (or `MX` for MX record)
- Enter **Host:** (e.g., `resend._domainkey` or `send`)
- Enter **Value:** (copy from Resend)
- For MX record, also set **Priority:** `10`
- Click **"Save All Changes"**

---

### If Using GoDaddy:

1. **Log in to GoDaddy**
2. **Go to:** My Products → **DNS** (next to `deltechhub.com`)
3. **Scroll to:** "Records" section
4. **Click:** "Add" button

**Add each record:**
- Select **Type:** `TXT` (or `MX`)
- Enter **Name:** (e.g., `resend._domainkey` or `send`)
- Enter **Value:** (copy from Resend)
- For MX record, set **Priority:** `10`
- Click **"Save"**

---

### If Using AWS Route 53:

1. **Go to:** AWS Route 53 Console
2. **Select:** Hosted zones → `deltechhub.com`
3. **Click:** "Create record"

**Add each record:**
- **Record name:** (e.g., `resend._domainkey` or `send`)
- **Record type:** `TXT` (or `MX`)
- **Value:** (copy from Resend)
- For MX record, set **Priority:** `10`
- Click **"Create records"**

---

### If Using Google Domains:

1. **Log in to Google Domains**
2. **Select:** `deltechhub.com`
3. **Go to:** DNS → Custom records
4. **Click:** "Add custom record"

**Add each record:**
- **Host name:** (e.g., `resend._domainkey` or `send`)
- **Type:** `TXT` (or `MX`)
- **Data:** (copy from Resend)
- For MX record, set **Priority:** `10`
- Click **"Save"**

---

## ⏱️ Step 3: Wait for Verification

1. **DNS Propagation:** Usually 5-30 minutes (can take up to 48 hours)
2. **Check Status:** Go back to [resend.com/domains](https://resend.com/domains)
3. **Resend will check automatically** - records will change from "Pending" to "Verified" ✅

---

## ✅ Step 4: Update Environment Variable

Once all records show as "Verified" in Resend:

1. **Open:** `/Users/user/Desktop/PrepSkul/PrepSkul_Web/.env.local`
2. **Update:**
   ```env
   RESEND_FROM_EMAIL=PrepSkul <info@deltechhub.com>
   ```
3. **Restart your Next.js server:**
   ```bash
   cd /Users/user/Desktop/PrepSkul/PrepSkul_Web
   # Stop server (Ctrl+C)
   pnpm dev
   ```

---

## 🧪 Step 5: Test Email Sending

1. Go to admin dashboard
2. Approve a tutor
3. Check the tutor's email - it should arrive! ✅

---

## ⚠️ Troubleshooting

### Records still showing "Pending" after 30 minutes?

1. **Double-check the values:**
   - Make sure you copied the **full value** from Resend (no truncation)
   - Check for typos
   - Ensure record names match exactly (case-sensitive)

2. **Verify DNS propagation:**
   - Use [https://mxtoolbox.com/](https://mxtoolbox.com/)
   - Enter the record name (e.g., `resend._domainkey.deltechhub.com`)
   - Check if the record appears

3. **Common mistakes:**
   - ❌ Adding records to wrong domain
   - ❌ Using wrong record type (TXT vs MX)
   - ❌ Missing parts of the value
   - ❌ Wrong priority for MX record

### Need help?

- Check Resend's guide: Click "How to add records" button in Resend dashboard
- Contact your DNS provider support
- Share which DNS provider you're using and I can provide specific steps

---

## 🎯 Quick Checklist

- [ ] Found DNS provider for `deltechhub.com`
- [ ] Added DKIM record (`resend._domainkey`)
- [ ] Added MX record (`send` with priority 10)
- [ ] Added SPF record (`send` TXT)
- [ ] Added DMARC record (`_dmarc` - optional)
- [ ] Waited 5-30 minutes for propagation
- [ ] Checked Resend dashboard - all records verified ✅
- [ ] Updated `.env.local` with `RESEND_FROM_EMAIL=PrepSkul <info@deltechhub.com>`
- [ ] Restarted Next.js server
- [ ] Tested sending an approval email

---

## 🚀 Once Verified

You'll be able to:
- ✅ Send emails to **any recipient** (not just account owner)
- ✅ Use professional sender: `info@deltechhub.com`
- ✅ Better deliverability (less spam)
- ✅ Recipients see "PrepSkul" as sender name

Good luck! 🎉






