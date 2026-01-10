import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

/**
 * POST /api/admin/tutor-requests/[id]/invite-external-tutor
 * Invite an external tutor to join the platform for a specific request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getServerSession();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, notes } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const adminSupabase = getSupabaseAdmin();

    // Check if user already exists
    const { data: existingUser } = await adminSupabase.auth.admin.getUserByEmail(email);

    let userId: string;
    let isNewUser = false;

    if (existingUser?.user) {
      // User exists, use their ID
      userId = existingUser.user.id;
    } else {
      // Create new user account
      const tempPassword = crypto.randomBytes(16).toString('hex');
      const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        email_confirm: true, // Auto-confirm email
        password: tempPassword,
        user_metadata: {
          full_name: name,
          phone_number: phone || null,
        },
      });

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
      isNewUser = true;

      // Create profile entry
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: name,
          phone_number: phone || null,
          user_type: 'tutor',
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway - profile might already exist
      }
    }

    // Check if tutor profile already exists
    const { data: existingTutor } = await supabase
      .from('tutor_profiles')
      .select('id, status')
      .eq('user_id', userId)
      .maybeSingle();

    let tutorId: string;

    if (existingTutor) {
      tutorId = existingTutor.id;
      // Update status to pending if it's not already approved
      if (existingTutor.status !== 'approved') {
        await supabase
          .from('tutor_profiles')
          .update({ status: 'pending' })
          .eq('id', tutorId);
      }
    } else {
      // Create tutor profile
      const { data: newTutor, error: tutorError } = await supabase
        .from('tutor_profiles')
        .insert({
          user_id: userId,
          status: 'pending',
          full_name: name,
          admin_notes: notes
            ? `External tutor invitation for request ${id}. ${notes}`
            : `External tutor invitation for request ${id}`,
        })
        .select('id')
        .maybeSingle();

      if (tutorError || !newTutor) {
        console.error('Error creating tutor profile:', tutorError);
        return NextResponse.json(
          { error: 'Failed to create tutor profile' },
          { status: 500 }
        );
      }

      tutorId = newTutor.id;
    }

    // Get current request to preserve existing admin_notes
    const { data: currentRequest } = await supabase
      .from('tutor_requests')
      .select('admin_notes')
      .eq('id', id)
      .maybeSingle();

    // Update request to note external tutor invitation
    const existingNotes = currentRequest?.admin_notes || '';
    const newNotes = existingNotes
      ? `${existingNotes}\n\nExternal tutor invited: ${name} (${email})`
      : `External tutor invited: ${name} (${email})`;

    await supabase
      .from('tutor_requests')
      .update({
        admin_notes: newNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Send invitation email
    try {
      const { Resend } = await import('resend');
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'PrepSkul <noreply@mail.prepskul.com>';
        const requestUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://prepskul.com'}/tutor-onboarding`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Join PrepSkul as a Tutor</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to PrepSkul!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hello ${name},</p>
              <p>We're excited to invite you to join PrepSkul as a tutor! We have a student looking for a tutor with your expertise.</p>
              ${notes ? `<p><strong>Request Details:</strong> ${notes}</p>` : ''}
              <p>To get started, please complete your tutor profile by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${requestUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Complete Your Profile
                </a>
              </div>
              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>Best regards,<br>The PrepSkul Team</p>
            </div>
          </body>
          </html>
        `;

        await resend.emails.send({
          from: fromEmail.includes('@') ? `PrepSkul <${fromEmail}>` : fromEmail,
          to: email,
          subject: 'Join PrepSkul as a Tutor - Complete Your Profile',
          html: emailHtml,
        });
      }
    } catch (emailError) {
      console.warn('Failed to send invitation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      tutor: {
        id: tutorId,
        user_id: userId,
        name,
        email,
        status: existingTutor?.status || 'pending',
        isNewUser,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/tutor-requests/[id]/invite-external-tutor:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
