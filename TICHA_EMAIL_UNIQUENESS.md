# TichaAI Email Uniqueness Implementation

This document explains how email uniqueness is enforced in the TichaAI application.

## Database-Level Enforcement

### 1. Supabase Auth (`auth.users`)
- Supabase Auth **automatically enforces unique emails** at the database level
- The `auth.users` table has a built-in unique constraint on the `email` column
- Attempts to create a user with an existing email will fail at the database level

### 2. Ticha Users Table (`ticha_users`)
- The `ticha_users` table has an explicit `UNIQUE` constraint on the `email` column (line 10 in `supabase/ticha_schema.sql`)
- This provides an additional layer of protection
- The trigger function `handle_new_ticha_user()` handles conflicts gracefully with `ON CONFLICT (email) DO NOTHING`

## Application-Level Enforcement

### 1. Email Normalization
- All emails are normalized to **lowercase** and **trimmed** before being sent to Supabase
- This ensures that `User@Example.com` and `user@example.com` are treated as the same email
- Normalization happens in both:
  - **Sign Up** (`app/ticha/signup/page.tsx`)
  - **Sign In** (`app/ticha/signin/page.tsx`)

### 2. Error Handling
- The signup page specifically handles duplicate email errors
- User-friendly error messages are displayed:
  - "This email address is already registered. Please sign in instead or use a different email."
- Multiple error conditions are checked:
  - Error messages containing "already registered"
  - Error messages containing "already exists"
  - Error messages containing "email address is already in use"
  - HTTP status code 422 (Unprocessable Entity)

### 3. Client-Side Validation
- Email format validation before submission
- Normalization happens before the API call
- Immediate feedback to users

## How It Works

1. **User enters email** → Email is normalized (lowercase, trimmed)
2. **Signup attempt** → Supabase Auth checks for duplicate email
3. **If duplicate**:
   - Supabase Auth rejects the request
   - Application catches the error
   - User-friendly message is displayed
   - User is prompted to sign in instead
4. **If unique**:
   - User account is created
   - Trigger creates profile in `ticha_users` table
   - Confirmation email is sent

## Testing

To verify email uniqueness:

1. **Sign up with email**: `test@example.com`
2. **Try to sign up again** with the same email (or `TEST@EXAMPLE.COM`)
3. **Expected result**: Error message "This email address is already registered..."

## Database Schema Updates

If you need to update the schema to ensure uniqueness is enforced, run this SQL in Supabase:

```sql
-- Ensure unique constraint exists
ALTER TABLE ticha_users 
ADD CONSTRAINT ticha_users_email_unique UNIQUE (email);

-- Update trigger to handle conflicts
CREATE OR REPLACE FUNCTION public.handle_new_ticha_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ticha_users (id, email, full_name)
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Notes

- Email uniqueness is enforced at **multiple levels** (database + application)
- All emails are **case-insensitive** (normalized to lowercase)
- Users receive **clear, actionable error messages** when attempting duplicate signups
- The system is **resilient** - even if application-level checks fail, database constraints prevent duplicates

