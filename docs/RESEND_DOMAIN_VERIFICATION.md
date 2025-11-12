# Resend Domain Verification Guide

## 🎯 Goal
Verify your domain with Resend so you can send emails to **any recipient** (not just the account owner).

## ⚠️ Current Limitation
- **Can send to:** Only `prepskul@gmail.com` (account owner)
- **Cannot send to:** Any other email addresses (e.g., tutor emails like `delbertkimbi237@gmail.com`)

## ✅ Solution: Verify Your Domain

**You can use ANY domain you own!** For example:
- `deltechhub.com` ✅ (Recommended - easier to verify)
- `prepskul.com` ✅ (If you can verify it)

Once you verify your domain, you can send emails from:
- `info@deltechhub.com` (or `info@mail.prepskul.com`)
- `notifications@deltechhub.com`
- `noreply@deltechhub.com`
- Or any email address on your verified domain

## 🤔 Why Do I Need Domain Verification?

**Domain verification is NOT about having an email address** - it's about **email authentication**:

1. **SPF (Sender Policy Framework)**: Proves emails are authorized from your domain
2. **DKIM (DomainKeys)**: Cryptographic signature that prevents email spoofing
3. **DMARC**: Policy that tells email providers how to handle your emails

**Benefits:**
- ✅ Better deliverability (less likely to go to spam)
- ✅ Professional appearance (emails from your domain)
- ✅ Security (prevents others from spoofing your domain)
- ✅ Trust (recipients see emails from your verified domain)

**Without verification:**
- ❌ Can only send to account owner
- ❌ Emails may be marked as spam
- ❌ Less trustworthy appearance

---

## Step-by-Step Domain Verification

### Step 1: Log in to Resend

1. Go to [https://resend.com/login](https://resend.com/login)
2. Sign in with your account (the one associated with `prepskul@gmail.com`)

### Step 2: Add Your Domain

1. Navigate to [https://resend.com/domains](https://resend.com/domains)
2. Click **"Add Domain"** button
3. Enter your domain: **`deltechhub.com`** (or `prepskul.com` if you prefer)
4. Click **"Add Domain"**

> **💡 Tip:** Use `deltechhub.com` if you're having issues verifying `prepskul.com` - any domain you own works!

### Step 3: Get DNS Records

Resend will show you DNS records that need to be added to your domain. You'll typically see:

#### Required Records:

1. **SPF Record** (TXT)
   - **Name/Host:** `@` or `prepskul.com`
   - **Type:** `TXT`
   - **Value:** Something like `v=spf1 include:resend.com ~all`

2. **DKIM Record** (TXT)
   - **Name/Host:** `resend._domainkey` or similar
   - **Type:** `TXT`
   - **Value:** A long string like `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...`

3. **DMARC Record** (TXT) - Optional but Recommended
   - **Name/Host:** `_dmarc`
   - **Type:** `TXT`
   - **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@prepskul.com`

### Step 4: Add DNS Records to Your Domain

**Where is `prepskul.com` hosted?** (Common providers: Namecheap, GoDaddy, Cloudflare, AWS Route 53, Google Domains)

#### If using Cloudflare:
1. Log in to Cloudflare
2. Select your domain **`deltechhub.com`** (or `prepskul.com`)
3. Go to **DNS** → **Records**
4. Click **"Add record"**
5. Add each record from Resend:
   - Select **Type:** `TXT`
   - Enter **Name:** (from Resend, e.g., `@` or `resend._domainkey`)
   - Enter **Content:** (the full value from Resend)
   - Click **"Save"**
6. Repeat for all records

#### If using Namecheap:
1. Log in to Namecheap
2. Go to **Domain List** → Select **`deltechhub.com`** (or `prepskul.com`)
3. Click **"Advanced DNS"**
4. Under **"Host Records"**, click **"Add New Record"**
5. Add each TXT record from Resend
6. Click **"Save All Changes"**

#### If using GoDaddy:
1. Log in to GoDaddy
2. Go to **My Products** → **DNS** (next to your domain)
3. Select **`deltechhub.com`** (or `prepskul.com`)
4. Scroll to **"Records"**
5. Click **"Add"** to add each TXT record
6. Enter the values from Resend
7. Click **"Save"**

#### If using AWS Route 53:
1. Go to AWS Route 53 Console
2. Select **Hosted zones** → **`deltechhub.com`** (or `prepskul.com`)
3. Click **"Create record"**
4. Add each TXT record from Resend
5. Click **"Create records"**

#### If using Google Domains:
1. Log in to Google Domains
2. Select **`deltechhub.com`** (or `prepskul.com`)
3. Go to **DNS** → **Custom records**
4. Add each TXT record from Resend
5. Click **"Save"**

### Step 5: Wait for DNS Propagation

- **Usually takes:** 5-30 minutes
- **Can take up to:** 48 hours (rare)
- **Check status:** Go back to [resend.com/domains](https://resend.com/domains)

### Step 6: Verify Domain in Resend

1. Go back to [resend.com/domains](https://resend.com/domains)
2. You should see your domain status change from "Pending" to "Verified" ✅
3. Once verified, you'll see a green checkmark

### Step 7: Update Environment Variables

Once your domain is verified:

1. Open `/Users/user/Desktop/PrepSkul/PrepSkul_Web/.env.local`
2. Update the `RESEND_FROM_EMAIL`:
   ```env
   RESEND_FROM_EMAIL=PrepSkul <info@deltechhub.com>
   ```
   Or if you prefer:
   ```env
   RESEND_FROM_EMAIL=PrepSkul <notifications@deltechhub.com>
   ```
   
   > **Note:** You can use `info@deltechhub.com` even though your business email is `info@mail.prepskul.com`. The domain verification is just for sending authentication - recipients will see "PrepSkul" as the sender name.
3. **Restart your Next.js server:**
   ```bash
   cd /Users/user/Desktop/PrepSkul/PrepSkul_Web
   # Stop the server (Ctrl+C)
   # Start it again
   pnpm dev
   ```

### Step 8: Test Email Sending

1. Go to admin dashboard
2. Approve a tutor
3. The email should now send successfully to any recipient! ✅

---

## Quick Checklist

- [ ] Log in to Resend
- [ ] Go to [resend.com/domains](https://resend.com/domains)
- [ ] Click "Add Domain"
- [ ] Enter `prepskul.com`
- [ ] Copy all DNS records from Resend
- [ ] Log in to your DNS provider (where `prepskul.com` is hosted)
- [ ] Add all TXT records to your DNS
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Check Resend dashboard - domain should show as "Verified"
- [ ] Update `.env.local` with `RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>`
- [ ] Restart Next.js server
- [ ] Test sending an approval email

---

## Troubleshooting

### "Domain verification pending" for more than 24 hours
- Double-check that all DNS records are added correctly
- Make sure there are no typos in the record values
- Try using a DNS checker tool: [https://mxtoolbox.com/](https://mxtoolbox.com/)
- Contact your DNS provider support

### "DNS records not found"
- Wait longer (DNS propagation can take up to 48 hours)
- Check that you added the records to the correct domain
- Verify you're adding TXT records (not A or CNAME)
- Make sure the record names match exactly (case-sensitive)

### Still can't send emails after verification
- Make sure you updated `.env.local` with the new `RESEND_FROM_EMAIL`
- Restart your Next.js server
- Check Resend dashboard for any error messages
- Verify the email address format: `PrepSkul <info@mail.prepskul.com>`

### Need help finding your DNS provider?
1. Go to [https://whois.net/](https://whois.net/)
2. Enter **`deltechhub.com`** (or `prepskul.com`)
3. Look for "Name Servers" - this tells you where your DNS is hosted
4. Common name servers:
   - `cloudflare.com` → Cloudflare
   - `namecheap.com` → Namecheap
   - `godaddy.com` → GoDaddy
   - `amazonaws.com` → AWS Route 53

---

## Alternative: Temporary Workaround

If you need to test immediately and can't verify the domain right now:

1. **Use the account owner email for testing:**
   - Change the tutor's email in the database to `prepskul@gmail.com` temporarily
   - Send the approval email
   - Verify it works
   - Change the email back

2. **Use a different email service** (not recommended for production):
   - Consider using SendGrid, Mailgun, or AWS SES
   - These require similar domain verification but might be faster

---

## Need Help?

If you're stuck:
1. Check Resend's documentation: [https://resend.com/docs](https://resend.com/docs)
2. Contact Resend support: [https://resend.com/support](https://resend.com/support)
3. Share your DNS provider and I can help you with specific steps

---

## Expected Result

Once verified, you should be able to:
- ✅ Send emails to **any recipient** (not just account owner)
- ✅ Use professional email addresses like `info@mail.prepskul.com`
- ✅ Improve email deliverability (less likely to go to spam)
- ✅ Build trust with recipients (emails from your domain)

Good luck! 🚀

