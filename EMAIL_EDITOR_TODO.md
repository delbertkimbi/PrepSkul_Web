# 📧 Admin Email Editor - TODO

## **User Request:**
Add a custom email editor to the admin dashboard where:
1. Admin can select email template (Approval, Rejection, Enhancement)
2. Pre-filled HTML template appears in editor
3. Admin can customize the content
4. Send to a specific email or the tutor being reviewed

## **Implementation Plan:**

### **Location:** 
`/admin/tutors/[id]/email` or as a modal on detail page

### **Features Needed:**
1. **Template Selector**
   - Radio buttons or dropdown
   - Options: Approval, Rejection, Enhancement

2. **Rich Text Editor**
   - Use `react-quill` or `@tiptap/react`
   - Allow HTML editing
   - Show preview

3. **Dynamic Variables**
   - `{{tutorName}}` - Auto-replace
   - `{{adminName}}` - Current admin
   - `{{status}}` - Approval/rejection

4. **Send Options**
   - Send to: tutor.email (auto-filled)
   - OR custom email input

5. **History Log**
   - Save sent emails to database
   - Show in tutor timeline

### **Database Schema Addition:**
```sql
CREATE TABLE admin_email_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES tutor_profiles(id),
  admin_id UUID REFERENCES profiles(id),
  template_type TEXT,
  subject TEXT,
  body_html TEXT,
  recipient_email TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);
```

### **API Route:**
`POST /api/admin/tutors/email/send`

**This is a nice-to-have but not MVP critical - can be added later!**

