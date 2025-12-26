# Fapshi Webhook URL Setup Guide

**Last Updated**: [Current Session]

---

## 🔔 Webhook URLs

### Primary Webhook URL (Required)

**For Payment Collection Service:**
```
https://www.prepskul.com/api/webhooks/fapshi
```

**Where to Add:**
1. Log in to your **Fapshi Dashboard**
2. Navigate to **Merchants** → **Your Collection Service**
3. Go to **Settings** → **Webhooks** (or **Webhook Settings**)
4. Enter the webhook URL: `https://www.prepskul.com/api/webhooks/fapshi`
5. **Save** the configuration

---

## 📋 What This Webhook Handles

This single webhook endpoint handles **all payment types** based on the `externalId` pattern:

### 1. Trial Session Payments
- **Pattern:** `trial_{trialSessionId}`
- **Example:** `trial_abc123-def456-ghi789`
- **Actions:**
  - Updates `trial_sessions.payment_status` → `paid`
  - Updates `trial_sessions.status` → `scheduled`
  - Generates Google Meet link (for online sessions)
  - Sends success/failure notifications

### 2. Payment Request Payments
- **Pattern:** `payment_request_{paymentRequestId}`
- **Example:** `payment_request_xyz789-abc123`
- **Actions:**
  - Updates `payment_requests.status` → `paid`
  - Links payment to booking request
  - Sends success/failure notifications

### 3. Session Payments
- **Pattern:** `session_{sessionId}`
- **Example:** `session_session123`
- **Actions:**
  - Updates `session_payments.payment_status` → `paid`
  - Moves tutor earnings from `pending` → `active`
  - Updates `tutor_earnings.earnings_status` → `active`
  - Sends success/failure notifications

---

## 🔧 Configuration Steps

### Step 1: Access Fapshi Dashboard
1. Go to: **https://dashboard.fapshi.com** (or your Fapshi dashboard URL)
2. Log in with your Fapshi account credentials

### Step 2: Navigate to Your Service
1. Click on **Merchants** (or **Services**) in the left sidebar
2. Select your **Collection Service** (the service used for collecting payments)
3. If you have multiple services, select the one you're using for PrepSkul payments

### Step 3: Configure Webhook
1. Go to **Settings** → **Webhooks** (or look for "Webhook URL" or "Webhook Settings")
2. In the **Webhook URL** field, enter:
   ```
   https://www.prepskul.com/api/webhooks/fapshi
   ```
3. **Enable** the webhook (toggle switch or checkbox)
4. **Save** the configuration

### Step 4: Verify Webhook (Optional)
Some dashboards allow you to:
- **Test the webhook** - Send a test webhook to verify it's working
- **View webhook logs** - See recent webhook deliveries
- **Retry failed webhooks** - Manually retry failed deliveries

---

## 🌍 Environment-Specific URLs

### Production (Live Mode)
```
https://www.prepskul.com/api/webhooks/fapshi
```

### Development/Testing (If Needed)
If you have a separate development environment:
```
https://dev.prepskul.com/api/webhooks/fapshi
```
*(Replace with your actual dev domain if different)*

**Note:** The same webhook URL works for both sandbox and live environments. Fapshi will send webhooks to this URL regardless of the environment.

---

## 🔐 Webhook Security

### Current Implementation
The webhook endpoint currently:
- ✅ Validates required fields (`transId`, `status`, `externalId`)
- ✅ Handles errors gracefully
- ✅ Logs all webhook events
- ✅ Returns appropriate HTTP status codes

### Recommended Enhancements (Future)
- [ ] Add webhook signature verification (if Fapshi provides it)
- [ ] Add IP whitelist (if Fapshi provides IP ranges)
- [ ] Add rate limiting
- [ ] Add webhook authentication token

---

## 📊 Webhook Events Handled

The webhook handles these payment status changes:

| Status | Description | Action |
|--------|-------------|--------|
| `SUCCESS` | Payment completed successfully | Update payment status, send notifications |
| `SUCCESSFUL` | Payment completed successfully (alternative) | Same as SUCCESS |
| `FAILED` | Payment failed | Update payment status, send failure notification |
| `EXPIRED` | Payment request expired | Update payment status, send expiration notification |
| `PENDING` | Payment still pending | Log status, no action needed |

---

## 🧪 Testing the Webhook

### Using Fapshi Sandbox
1. Make a test payment in the app
2. Complete the payment in Fapshi sandbox
3. Check Vercel logs: `https://vercel.com/dashboard/[project]/logs`
4. Verify database updates in Supabase

### Manual Testing (cURL)
```bash
curl -X POST https://www.prepskul.com/api/webhooks/fapshi \
  -H "Content-Type: application/json" \
  -d '{
    "transId": "test_trans_123",
    "status": "SUCCESS",
    "externalId": "trial_abc123-def456-ghi789",
    "userId": "user_123",
    "amount": 2000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## 🔍 Troubleshooting

### Webhook Not Receiving Events
1. **Verify URL is correct** - Check for typos in the webhook URL
2. **Check Vercel deployment** - Ensure the route is deployed
3. **Check Fapshi dashboard** - Verify webhook is enabled
4. **Check Vercel logs** - Look for incoming requests

### Webhook Receiving but Not Processing
1. **Check Vercel logs** - Look for error messages
2. **Verify database connection** - Check Supabase connection
3. **Check externalId format** - Ensure it matches expected patterns
4. **Check webhook payload** - Verify all required fields are present

### Common Issues
- **404 Not Found** - Webhook URL is incorrect or route not deployed
- **500 Internal Server Error** - Check Vercel logs for details
- **Timeout** - Webhook processing taking too long (should be < 5 seconds)

---

## 📝 Important Notes

1. **Single Webhook URL**: One webhook URL handles all payment types (trial, payment request, session)
2. **Per Service**: Configure webhook URL for each Fapshi service (Collection and Disbursement if separate)
3. **Automatic Retries**: Fapshi may retry failed webhooks automatically
4. **Idempotency**: The webhook handler is idempotent - processing the same webhook multiple times is safe

---

## 🔄 If You Have Multiple Services

### Collection Service (Receiving Payments)
- **Webhook URL:** `https://www.prepskul.com/api/webhooks/fapshi`
- **Purpose:** Handle payment confirmations from students/parents

### Disbursement Service (Sending Payments to Tutors)
- **Webhook URL:** `https://www.prepskul.com/api/webhooks/fapshi` (same endpoint)
- **Purpose:** Handle payout confirmations to tutors
- **Note:** Currently, the webhook only handles collection payments. If you need disbursement webhooks, we'll need to add support.

---

## ✅ Verification Checklist

After configuring the webhook:

- [ ] Webhook URL added to Fapshi dashboard
- [ ] Webhook enabled/toggled on
- [ ] Test payment made in sandbox
- [ ] Webhook received in Vercel logs
- [ ] Database updated correctly
- [ ] Notifications sent successfully

---

## 📞 Support

If you encounter issues:
1. Check **Vercel logs** for webhook errors
2. Check **Supabase logs** for database errors
3. Verify webhook URL in **Fapshi dashboard**
4. Test with **sandbox environment** first
5. Contact Fapshi support if webhook not being sent

---

**Webhook Endpoint File:** `PrepSkul_Web/app/api/webhooks/fapshi/route.ts`  
**Documentation:** `prepskul_app/docs/FAPSHI_WEBHOOK_INTEGRATION.md`



