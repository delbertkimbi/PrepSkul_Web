import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { subject, body, reasons } = await request.json();

    const supabase = await createServerSupabaseClient();
    const { data: tutor } = await supabase.from('tutor_profiles').select('user_id').eq('id', id).maybeSingle();
    if (!tutor) return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });

    const { data: profile } = await supabase.from('profiles').select('email').eq('id', tutor.user_id).maybeSingle();

    // Send email if email address exists and API key is configured
    if (profile?.email) {
      try {
        const { Resend } = await import('resend');
        if (!process.env.RESEND_API_KEY) {
          console.warn('⚠️ RESEND_API_KEY not set - email not sent, but status updated');
        } else {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'PrepSkul <info@prepskul.com>',
            to: profile.email,
            subject: subject,
            html: body.replace(/\n/g, '<br />'),
          });
          console.log('📧 Rejection email sent');
        }
      } catch (emailError: any) {
        console.error('❌ Error sending email:', emailError);
        // Continue with status update even if email fails
      }
    } else {
      console.warn('⚠️ No email address found for tutor - email not sent');
    }

    await supabase.from('tutor_profiles').update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_review_notes: reasons || '',
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
