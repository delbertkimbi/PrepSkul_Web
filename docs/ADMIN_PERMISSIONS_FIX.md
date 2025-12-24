# 🔧 Fix Admin Login - Grant Admin Permissions

## Problem

You're getting "You do not have admin permissions" when trying to log in to the admin panel, even with the correct email and password.

## Solution

The user needs to have `is_admin = TRUE` in the `profiles` table. Run the SQL script below.

---

## 🚀 Quick Fix (2 Steps)

### **Step 1: Run SQL Script in Supabase**

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard
2. **Select your PrepSkul project**
3. **Go to:** SQL Editor (left sidebar)
4. **Click:** "New Query"
5. **Copy and paste this SQL:**

```sql
-- Ensure is_admin column exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Grant admin permissions to your email
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'prepskul@gmail.com';

-- Verify it worked
SELECT id, email, is_admin, user_type 
FROM profiles 
WHERE email = 'prepskul@gmail.com';
```

6. **Click "Run"** (or press Ctrl+Enter)

**Expected Result:** You should see your user with `is_admin = true`

---

### **Step 2: If No Rows Returned**

If the query returns no rows, the user might not have a profile entry. Run this instead:

```sql
-- Create profile from auth.users
INSERT INTO profiles (id, email, full_name, is_admin, user_type, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
  TRUE,
  'admin',
  created_at,
  NOW()
FROM auth.users 
WHERE email = 'prepskul@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
  is_admin = TRUE,
  user_type = COALESCE(profiles.user_type, 'admin'),
  updated_at = NOW();

-- Verify
SELECT id, email, is_admin, user_type 
FROM profiles 
WHERE email = 'prepskul@gmail.com';
```

---

## ✅ Verify It Worked

After running the SQL:

1. **Check the query result** - You should see your user with `is_admin = true`
2. **Try logging in again:**
   - Go to: `/admin/login`
   - Email: `prepskul@gmail.com`
   - Password: `***REMOVED***` (or whatever you set)
3. **You should now be able to access the admin dashboard!** 🎉

---

## 🔍 Troubleshooting

### **Issue: "No rows returned"**

**Cause:** User doesn't exist in `profiles` table.

**Solution:** Run the second SQL script above (INSERT INTO profiles...)

---

### **Issue: "User not found in auth.users"**

**Cause:** User doesn't exist in Supabase Auth.

**Solution:** 
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"**
3. Create user with email `prepskul@gmail.com`
4. Set password: `***REMOVED***` (or your preferred password)
5. ✅ Check **"Auto Confirm User"**
6. Then run the SQL scripts above

---

### **Issue: "Still getting permission error"**

**Possible causes:**
1. **Wrong email** - Make sure you're using the exact email from the database
2. **Cache issue** - Try:
   - Clear browser cache
   - Use incognito/private window
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Session issue** - Sign out completely and sign in again

---

## 📋 Complete SQL Script

For convenience, there's a complete script at:
- `PrepSkul_Web/sql/grant-admin-permissions.sql`

You can copy the entire file and run it in Supabase SQL Editor.

---

## 🎯 How Admin Permissions Work

1. **Login** - User authenticates with Supabase Auth (email/password)
2. **Permission Check** - System checks `profiles.is_admin` field
3. **Access** - If `is_admin = TRUE`, user can access admin dashboard

The `is_admin` field is a simple boolean in the `profiles` table - no separate admin table needed!

---

**Need more help?** Check:
- `docs/ADMIN_SETUP_GUIDE.md` - Complete admin setup
- `sql/grant-admin-permissions.sql` - Full SQL script

