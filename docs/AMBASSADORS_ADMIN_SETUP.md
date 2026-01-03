# Ambassadors Admin Management Setup

## Overview

The Ambassadors admin management system allows admins to review, approve, and manage ambassador applications from the admin dashboard.

## Features

1. **Ambassadors Tab** - New tab in admin navigation
2. **Application Cards** - Display applications with image, name, location, and status
3. **Detail View** - Full application details in a well-designed profile view
4. **Approval System** - One-click approval with automatic email sending
5. **Email Notifications** - Pre-written approval email sent via Resend

## Database Schema Updates

The `ambassadors` table now includes:
- `application_status` - Tracks application state: 'pending', 'approved', 'rejected'
- `approved_at` - Timestamp when application was approved
- `approved_by` - UUID of admin who approved the application

**Important:** Run the updated SQL schema to add these fields:
```sql
-- Run supabase/ambassadors_schema.sql
```

## Admin UI Structure

### 1. Ambassadors List Page (`/admin/ambassadors`)
- Displays all ambassador applications in card format
- Tabs: All, Pending, Approved, Rejected
- Search by name, city, or region
- Filter by region
- Shows counts for each status

### 2. Ambassador Detail Page (`/admin/ambassadors/[id]`)
- Full application details
- Profile image, contact info, location
- All survey responses displayed in organized sections
- "Approve Application" button (only for pending applications)

### 3. Approval Flow
1. Admin clicks "Approve Application" button
2. Confirmation dialog appears
3. Application status updated to 'approved'
4. Approval email automatically sent via Resend
5. Admin redirected back to ambassadors list

## Email Template

The approval email includes:
- Congratulations message
- Welcome to PrepSkul Ambassador program
- Information about next steps (WhatsApp message from team)
- Ambassador responsibilities
- Professional HTML formatting

**Email Details:**
- **From:** `PrepSkul <noreply@mail.prepskul.com>`
- **Reply-To:** `info@prepskul.com`
- **Subject:** "🎉 Congratulations! Your PrepSkul Ambassador Application Has Been Approved"

## API Endpoints

### POST `/api/admin/ambassadors/[id]/approve`
- Requires admin authentication
- Updates application status to 'approved'
- Sends approval email automatically
- Returns success/error response

## Environment Variables Required

Make sure these are set:
```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=PrepSkul <noreply@mail.prepskul.com>
RESEND_REPLY_TO=info@prepskul.com
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Setup Steps

1. **Run SQL Schema:**
   ```sql
   -- Execute supabase/ambassadors_schema.sql
   -- This adds application_status, approved_at, approved_by fields
   ```

2. **Verify Environment Variables:**
   - Check that `RESEND_API_KEY` is set
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is configured

3. **Test the Flow:**
   - Navigate to `/admin/ambassadors`
   - View a pending application
   - Click "Approve Application"
   - Verify email is sent

## Components Created

1. `AmbassadorCard.tsx` - Card component for listing applications
2. `AmbassadorStatusBadge.tsx` - Status badge component
3. `AmbassadorsListClient.tsx` - Client component for list page with filters
4. `ApproveAmbassadorButton.tsx` - Approval button component
5. Ambassador detail page - Full application view
6. Approval API route - Handles approval and email sending

## Notes

- Applications default to 'pending' status
- Only pending applications show the approval button
- Email sending is automatic on approval (no manual email composition needed)
- The approval email template is pre-written and professional

