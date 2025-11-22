# How to Confirm User in Supabase - Step by Step

## Method 1: Click on User Row

### Step 1: Find the User
- You should see the user **"Leke Brian"** with email **"lekebryan64@gmail.com"** in the table

### Step 2: Click on the User Row
- **Click anywhere on the user row** (on "Leke Brian" or "lekebryan64@gmail.com")
- This should open a **side panel** or **modal** with user details

### Step 3: Look for Email Confirmed Toggle
In the user details panel that opens, look for:
- **"Email Confirmed"** checkbox or toggle
- **"Confirmed"** status field
- **"Email Verified"** toggle

**Toggle it ON** or **check the box**

### Step 4: Save (if needed)
- Changes might auto-save
- Or click **"Save"** button if visible

---

## Method 2: Use Actions Menu

### Step 1: Find the User Row
- Look at the right side of the user row

### Step 2: Look for Menu Button
- **Three dots (...)** icon
- **More options** icon
- **Actions** button

### Step 3: Click Menu → Confirm
- Click the menu button
- Look for:
  - **"Confirm user"**
  - **"Confirm email"**
  - **"Verify email"**
  - **"Activate user"**

---

## Method 3: Use SQL Editor (Easiest)

If you can't find the UI option, use SQL:

### Step 1: Go to SQL Editor
1. In **left sidebar**, click **"SQL Editor"**
2. Click **"New query"**

### Step 2: Run This Query
```sql
-- Confirm the user by email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'lekebryan64@gmail.com';
```

### Step 3: Click "Run" or Execute
- Click the **"Run"** button
- Should show "Success" message

### Step 4: Verify
- Go back to **Authentication → Users**
- User should now show as confirmed ✅

---

## Method 4: Check User Details Panel

When you click on the user row, a side panel should open. Look for:

### In the Side Panel:
- **General** tab or section
- **"Email Confirmed"** field with toggle/checkbox
- **"Status"** section
- **"Verified"** checkbox

**Toggle/check "Email Confirmed" to ON**

---

## Quick SQL Solution (Recommended)

If the UI is confusing, just use SQL:

1. **SQL Editor** → **New query**
2. **Paste:**
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = NOW()
   WHERE email = 'lekebryan64@gmail.com';
   ```
3. **Click "Run"**
4. **Done!** ✅ User is confirmed

---

## What to Look For

**In User Details Panel:**
```
User Information:
├── Email: lekebryan64@gmail.com
├── Email Confirmed: [ ] OFF  → Click to turn ON ✅
├── Phone: -
└── ...
```

**Or in Status Section:**
```
Status:
├── Verified: No  → Change to Yes
└── Email Confirmed: No  → Change to Yes
```

---

**Try the SQL method if the UI options aren't visible - it's the quickest!**

Let me know which method works for you! 🚀

