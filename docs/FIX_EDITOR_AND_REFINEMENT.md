# Fix: Editor and Refinement Buttons Not Showing

## Problem
The "Edit in Editor" and "Refine Presentation" buttons were not showing because:
1. `presentationId` was only created if `userId` existed
2. The API wasn't fetching the user session
3. Database record wasn't being created for anonymous users

## Fixes Applied

### 1. Updated Generate API (`app/api/ticha/generate/route.ts`)
- Now fetches user session automatically
- Always creates database record (even for anonymous users)
- Made `user_id` nullable in database schema

### 2. Updated Database Schema
- Changed `user_id` from `NOT NULL` to nullable
- Created migration script: `supabase/migration_make_user_id_nullable.sql`

### 3. Added Debug Logging
- Console logs to help debug if `presentationId` is missing

## Steps to Fix Your Database

### Option 1: Run Migration (if table already exists)
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE ticha_presentations 
  ALTER COLUMN user_id DROP NOT NULL;
```

### Option 2: Re-run Safe Schema
Run `supabase/ticha_schema_safe.sql` - it now has nullable user_id

## Testing

1. **Generate a new presentation**
   - Upload a file
   - Check browser console for `[Ticha] Generation response:`
   - Verify `presentationId` is in the response

2. **Check buttons appear**
   - After generation, you should see:
     - "Download Presentation" (green)
     - "Edit in Editor" (blue) - if presentationId exists
     - "Refine Presentation" (purple) - if presentationId exists

3. **Test Editor**
   - Click "Edit in Editor"
   - Should navigate to `/ticha/editor/[id]`
   - Editor should load with slide thumbnails, canvas, and properties panel

4. **Test Refinement**
   - Click "Refine Presentation"
   - Modal should open with:
     - Refinement instructions textarea
     - Design preset selector
     - Custom design prompt textarea
   - Enter instructions and click "Refine"

## If Buttons Still Don't Show

1. **Check browser console** for errors
2. **Check Network tab** - look at the `/api/ticha/generate` response
3. **Verify `presentationId`** is in the response JSON
4. **Check database** - verify a record was created in `ticha_presentations` table

## Common Issues

**Issue:** "Presentation not found" in editor
- **Solution:** Make sure database record was created. Check `ticha_presentations` table.

**Issue:** Buttons don't show
- **Solution:** Check if `presentationId` is in the API response. If not, check API logs.

**Issue:** Database error about NOT NULL constraint
- **Solution:** Run the migration SQL above to make `user_id` nullable.

