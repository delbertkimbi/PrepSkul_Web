# How to Manually Confirm Users in Supabase

## ✅ For TichaAI (Supabase)

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Sign in with your account

### Step 2: Select TichaAI Project
1. Select **TichaAI** organization
2. Click your **TichaAI project**

### Step 3: Navigate to Users
1. In the **left sidebar**, click **"Authentication"** (🔐 lock icon)
2. Click **"Users"** (or it might be under "User Management")

### Step 4: Find the User
1. You'll see a list of all users who signed up
2. **Find the user** you want to confirm (by email address)
3. Click on the user row or click the **"..."** menu

### Step 5: Confirm the User
**Option A: Click on User**
1. Click on the user's **email address** or row
2. Look for **"Email Confirmed"** toggle or checkbox
3. **Turn it ON** / **Check it** to confirm the email

**Option B: Using Actions Menu**
1. Find the user in the list
2. Click the **"..."** menu (three dots) on the right
3. Click **"Confirm user"** or **"Confirm email"**

**Option C: Edit User Details**
1. Click on the user
2. Look for **"Email Confirmed"** field
3. Toggle it to **"Yes"** or **"True"**
4. Click **"Save"** or changes auto-save

### Step 6: Verify
After confirming:
- ✅ User can now sign in without clicking email link
- ✅ Status should show "Confirmed" or green checkmark

---

## Visual Guide

### In Users List:
```
Email                    | Status       | Actions
------------------------|--------------|---------
user@example.com       | Unconfirmed  | ... ⚙️
                        |              |
Click here or menu →    | Confirm      |
```

### In User Details:
```
User Details:
├── Email: user@example.com
├── Email Confirmed: ❌ OFF  → Click to turn ON ✅
└── Save button
```

---

## Quick Steps Summary

1. **Supabase Dashboard** → TichaAI project
2. **Authentication** → **Users**
3. **Find user** by email
4. **Click user** or **"..."** menu
5. **Toggle "Email Confirmed"** to ON / Click "Confirm user"
6. **Save** (if needed)
7. ✅ **Done!** User can now sign in

---

## Alternative: Confirm via SQL Editor

If you prefer SQL:

1. Go to **SQL Editor** in Supabase
2. Run this query:

```sql
-- Confirm a user by email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

Replace `user@example.com` with the actual email address.

---

## Notes

- ✅ Confirming manually **doesn't affect** the user's account
- ✅ They can still use the app normally
- ✅ For testing, this is perfectly fine
- ✅ For production, let users confirm via email link (more secure)

**Once confirmed, the user can sign in at `/ticha/signin` immediately!** 🎉

