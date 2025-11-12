# Email Sender Configuration Explained

## ⚠️ Important Limitations

**Resend ONLY allows sending from:**
1. ✅ **Verified domains** (like `deltechhub.com`, `prepskul.com`)
2. ❌ **NOT from Gmail** (`deltechhub237@gmail.com`, `prepskul@gmail.com`, etc.)
3. ❌ **NOT from other email providers** (Yahoo, Outlook, etc.)
4. ⚠️ **Default test domain** (`onboarding@resend.dev`) - can only send to account owner

**You CANNOT send FROM `info@mail.prepskul.com` unless you verify `prepskul.com` domain.**

Resend requires domain verification to send emails. You can only send FROM addresses on verified domains.

## ✅ Current Setup (Recommended)

Since you're verifying `deltechhub.com`:

- **Send FROM:** `info@deltechhub.com` ✅ (verified domain)
- **Reply-To:** `info@mail.prepskul.com` ✅ (replies go to your business email)
- **Display Name:** "PrepSkul" ✅ (recipients see "PrepSkul" as sender)

## 📧 What Recipients Will See

When tutors receive emails:

- **From:** PrepSkul <info@deltechhub.com>
- **Reply-To:** info@prepskul.com
- **When they click Reply:** Email goes to `info@mail.prepskul.com` ✅

## 🔧 Configuration

### Environment Variables (`.env.local`)

```env
# Send FROM verified domain (MUST be a verified domain, NOT Gmail!)
RESEND_FROM_EMAIL=PrepSkul <info@deltechhub.com>

# Replies can go to ANY email address (Gmail, business email, etc.)
RESEND_REPLY_TO=info@prepskul.com
```

### ❌ Cannot Use Gmail as Sender

**Resend does NOT support sending from Gmail addresses:**
- ❌ `deltechhub237@gmail.com` - NOT supported
- ❌ `prepskul@gmail.com` - NOT supported
- ❌ Any `@gmail.com` address - NOT supported

**Why?** Resend requires domain verification for security and deliverability. Gmail domains cannot be verified by third parties.

## 🤔 Why This Works

1. **Sending:** Resend sends from `info@deltechhub.com` (verified domain)
2. **Display:** Recipients see "PrepSkul" as the sender name
3. **Replying:** When recipients reply, emails go to `info@mail.prepskul.com` (your business email)

## ✅ Alternative: Verify Both Domains

If you want to send FROM `info@mail.prepskul.com`:

1. **Verify `prepskul.com` in Resend:**
   - Go to [resend.com/domains](https://resend.com/domains)
   - Add `prepskul.com`
   - Add DNS records for `prepskul.com`
   - Wait for verification

2. **Update environment:**
   ```env
   RESEND_FROM_EMAIL=PrepSkul <info@mail.prepskul.com>
   RESEND_REPLY_TO=info@prepskul.com
   ```

3. **Restart server**

## 🎯 Recommended Approach

**Use `deltechhub.com` for sending** (easier, already in progress):
- ✅ Quicker setup (already adding DNS records)
- ✅ Same functionality
- ✅ Replies still go to `info@mail.prepskul.com`
- ✅ Recipients see "PrepSkul" as sender name

## 📋 Summary

| Setting | Value | Why |
|---------|-------|-----|
| **Send From** | `info@deltechhub.com` | ✅ Verified domain required (cannot use Gmail) |
| **Reply-To** | `info@mail.prepskul.com` | ✅ Can be ANY email (Gmail, business, etc.) |
| **Display Name** | `PrepSkul` | ✅ Professional branding |
| **Business Email** | `info@mail.prepskul.com` | ✅ Unchanged, works normally |

## ❓ FAQ

### Q: Can I send from `deltechhub237@gmail.com`?

**A:** No. Resend does NOT support sending from Gmail addresses. You can only send from:
- Verified domains (like `deltechhub.com`)
- Resend's test domain (limited to account owner)

### Q: Can replies go to `info@mail.prepskul.com` even if sending from `info@deltechhub.com`?

**A:** Yes! The `Reply-To` header can be set to ANY email address, including:
- `info@mail.prepskul.com` ✅
- `deltechhub237@gmail.com` ✅
- Any email address ✅

### Q: What do recipients see?

**A:** 
- **From:** PrepSkul <info@deltechhub.com>
- **Reply-To:** info@prepskul.com
- **When they click Reply:** Email goes to `info@mail.prepskul.com` ✅

## ✅ No Challenges!

This setup works perfectly:
- ✅ Sends emails from verified domain
- ✅ Replies go to your business email
- ✅ Professional appearance
- ✅ No functionality issues

The only difference is the "from" address is `deltechhub.com` instead of `prepskul.com`, but recipients will see "PrepSkul" as the sender name and replies will go to `info@mail.prepskul.com`!

