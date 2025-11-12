import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { profileNeedsImprovementEmail } from '@/lib/email_templates/tutor_profile_templates';
import { sendCustomEmail } from '@/lib/notifications';

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

    const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', tutor.user_id).maybeSingle();

    // Prepare improvement notes from reasons and email body
    const improvements = reasons ? reasons.split(', ').filter((r: string) => r.trim()) : [];
    const improvementNotes = improvements.length > 0 
      ? `Improvement Areas:\n${improvements.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}\n\n${body || ''}`
      : body || '';

    // Send email if email address exists
    if (profile?.email) {
      try {
        // Generate branded email using template
        const emailHtml = profileNeedsImprovementEmail(
          profile.full_name || 'Tutor',
          improvements.length > 0 ? improvements : ['Please review your profile and make necessary improvements.']
        );

        // Send using branded template
        const emailResult = await sendCustomEmail(
          profile.email,
          profile.full_name || 'Tutor',
          subject || 'Your PrepSkul Tutor Profile - Improvement Requests',
          emailHtml
        );

        if (!emailResult.success) {
          console.error('❌ Error sending improvement email:', emailResult.error);
        } else {
          console.log('📧 Improvement email sent successfully to:', profile.email);
        }
      } catch (emailError: any) {
        console.error('❌ Error sending email:', emailError);
        // Continue with status update even if email fails
      }
    } else {
      console.warn('⚠️ No email address found for tutor - email not sent');
    }

    // Update tutor profile with status and admin notes
    const { error: updateError } = await supabase.from('tutor_profiles').update({
      status: 'needs_improvement',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      improvement_requests: improvements,
      admin_review_notes: improvementNotes, // This is what the tutor dashboard reads
    }).eq('id', id);

    if (updateError) {
      console.error('❌ Error updating tutor profile:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('✅ Tutor status updated to needs_improvement');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error in improve/send route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
