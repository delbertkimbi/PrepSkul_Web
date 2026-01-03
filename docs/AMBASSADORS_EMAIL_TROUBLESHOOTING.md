# Ambassador Approval Email Troubleshooting

## Issue: Emails Not Being Received

If approval emails are not being received by applicants, follow these steps:

### 1. Check Server Logs

When you click "Send Approval Email", check your terminal/console for:
- `✅ [Ambassadors] Approval email sent successfully:` - Email was sent
- `❌ [Ambassadors] Resend API error:` - Email failed to send
- `⚠️ RESEND_API_KEY not set` - API key missing

### 2. Verify Resend Configuration

**Check Environment Variables:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@mail.prepskul.com
RESEND_REPLY_TO=info@prepskul.com
```

**Verify Domain in Resend:**
1. Go to https://resend.com/domains
2. Check if `mail.prepskul.com` is verified
3. If not verified:
   - Add the domain
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification (can take up to 24 hours)

### 3. Common Issues

#### Issue: "Domain not verified" error
**Solution:** Verify `mail.prepskul.com` in Resend dashboard

#### Issue: Email sent but not received
**Possible causes:**
- Email went to spam/junk folder
- Email address is incorrect
- Email provider is blocking the email

**Solutions:**
1. Ask applicant to check spam folder
2. Verify email address in application
3. Check Resend dashboard for delivery status: https://resend.com/emails

#### Issue: "RESEND_API_KEY not set"
**Solution:** Add `RESEND_API_KEY` to your `.env.local` file and restart the server

### 4. Test Email Sending

You can test if Resend is working by checking the Resend dashboard:
1. Go to https://resend.com/emails
2. Look for recent emails sent to the applicant's email
3. Check the status (delivered, bounced, failed)

### 5. Check Email Format

The email is sent from: `PrepSkul <noreply@mail.prepskul.com>`

Make sure this format matches your verified domain in Resend.

### 6. Rate Limits

Resend free tier: 3,000 emails/month
- If you hit the limit, emails will fail
- Check your usage at https://resend.com/dashboard

### 7. Debug Steps

1. **Check browser console** when clicking "Send Approval Email"
2. **Check server terminal** for error messages
3. **Check Resend dashboard** for email delivery status
4. **Verify email address** - make sure it's correct in the application

### 8. Manual Test

You can manually test Resend by sending a test email:
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "PrepSkul <noreply@mail.prepskul.com>",
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<p>Test</p>"
  }'
```

Replace `YOUR_RESEND_API_KEY` with your actual API key.

## Still Not Working?

1. Check Resend dashboard for detailed error messages
2. Verify domain DNS records are correct
3. Try sending to a different email address
4. Check if emails are being blocked by the recipient's email provider

