import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const emailType = searchParams.get('type') || 'normal'; // normal, approval, rejection, improvement

    const supabase = await createServerSupabaseClient();
    
    // Fetch tutor profile
    const { data: tutor } = await supabase
      .from('tutor_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Fetch user profile for email and name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone_number')
      .eq('id', tutor.user_id)
      .maybeSingle();

    const tutorName = profile?.full_name || tutor.full_name || 'Tutor';
    const tutorEmail = profile?.email || tutor.email || '';

    // Generate email content based on type
    let subject = '';
    let body = '';

    switch (emailType) {
      case 'approval':
        subject = `Congratulations! Your PrepSkul Tutor Application Has Been Approved`;
        body = `Hi ${tutorName},

We're thrilled to inform you that your tutor application has been approved! 

Your profile is now live on PrepSkul and students can start booking sessions with you.

Next Steps:
1. Log in to your PrepSkul account
2. Complete your profile setup
3. Set your availability schedule
4. Start receiving booking requests!

Your Profile Details:
- Rating: ${tutor.admin_approved_rating || tutor.initial_rating_suggested || 'Pending'}
- Base Session Price: ${tutor.base_session_price ? `${tutor.base_session_price.toLocaleString()} XAF` : 'To be set'}

If you have any questions, feel free to reach out to our support team.

Welcome to PrepSkul!

Best regards,
The PrepSkul Team`;
        break;

      case 'rejection':
        const rejectionReason = tutor.admin_review_notes || 'Application does not meet our current requirements.';
        subject = `Update on Your PrepSkul Tutor Application`;
        body = `Hi ${tutorName},

Thank you for your interest in becoming a tutor with PrepSkul.

After careful review, we regret to inform you that your application has not been approved at this time.

Reason:
${rejectionReason}

We encourage you to address the points mentioned above and re-apply. Many successful tutors have improved their applications based on our feedback.

If you have any questions or need clarification, please don't hesitate to contact us.

Best regards,
The PrepSkul Team`;
        break;

      case 'improvement':
        const improvements = tutor.improvement_requests || [];
        const improvementList = Array.isArray(improvements) 
          ? improvements.map((item: any, idx: number) => `${idx + 1}. ${typeof item === 'string' ? item : JSON.stringify(item)}`).join('\n')
          : improvements;
        subject = `Action Required: Update Your PrepSkul Tutor Application`;
        body = `Hi ${tutorName},

Thank you for your interest in becoming a tutor with PrepSkul.

We've reviewed your application and would like to request some improvements before we can approve your profile.

Please review and address the following:

${improvementList}

Once you've made these updates, please resubmit your application. We'll review it again as soon as possible.

If you have any questions, feel free to reach out to our support team.

Best regards,
The PrepSkul Team`;
        break;

      default: // normal email
        subject = `Update from PrepSkul - ${tutorName}`;
        body = `Hi ${tutorName},

`;
        break;
    }

    return NextResponse.json({
      success: true,
      tutorName,
      tutorEmail,
      subject,
      body,
      tutorStatus: tutor.status,
    });
  } catch (error: any) {
    console.error('Error fetching approval data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tutor data' }, { status: 500 });
  }
}

