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
    
    // Fetch tutor profile with rating and pricing data
    const { data: tutor } = await supabase
      .from('tutor_profiles')
      .select('*, admin_approved_rating, base_session_price, pricing_tier, initial_rating_suggested, rating_justification')
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
        // Format rating, price, and tier for email body
        const approvalRating = tutor.admin_approved_rating || tutor.initial_rating_suggested;
        const approvalPrice = tutor.base_session_price;
        const approvalTier = tutor.pricing_tier;
        
        const formatRatingForBody = (rating: number | null | undefined): string => {
          if (!rating) return 'N/A';
          return rating.toFixed(1);
        };

        const formatPriceForBody = (price: number | null | undefined): string => {
          if (!price) return 'N/A';
          return `${price.toLocaleString('en-US')} XAF`;
        };

        const formatTierForBody = (tier: string | null | undefined): string => {
          if (!tier) return 'N/A';
          const tierMap: Record<string, string> = {
            'entry': 'Entry Level',
            'intermediate': 'Intermediate',
            'advanced': 'Advanced',
            'expert': 'Expert',
          };
          return tierMap[tier] || tier;
        };

        subject = `Your PrepSkul Tutor Profile Has Been Approved! 🎉`;
        body = `Hi ${tutorName},

Great news! Your PrepSkul tutor profile has been reviewed and approved by our admin team.

Your Initial Rating: ${formatRatingForBody(approvalRating)} ⭐
Your Session Price: ${formatPriceForBody(approvalPrice)}
Pricing Tier: ${formatTierForBody(approvalTier)}

Important Note: This is your initial rating based on your credentials and qualifications. Starting from your 3rd student review onwards, your rating will be dynamically updated based on actual student feedback and reviews.

Your profile is now live and visible to students. You can start receiving booking requests!

Log in to your dashboard to manage your profile and view your bookings.

Welcome to the PrepSkul community! 🎓

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

    // Format rating, price, and tier for email
    const formatRating = (rating: number | null | undefined): string => {
      if (!rating) return 'N/A';
      return rating.toFixed(1);
    };

    const formatPrice = (price: number | null | undefined): string => {
      if (!price) return 'N/A';
      return price.toLocaleString('en-US');
    };

    const formatTier = (tier: string | null | undefined): string => {
      if (!tier) return 'N/A';
      // Convert tier to readable format
      const tierMap: Record<string, string> = {
        'entry': 'Entry Level',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced',
        'expert': 'Expert',
      };
      return tierMap[tier] || tier;
    };

    const rating = formatRating(tutor.admin_approved_rating || tutor.initial_rating_suggested);
    const sessionPrice = formatPrice(tutor.base_session_price);
    const pricingTier = formatTier(tutor.pricing_tier);

    return NextResponse.json({
      success: true,
      tutorName,
      tutorEmail,
      rating,
      sessionPrice,
      pricingTier,
      subject,
      body,
      tutorStatus: tutor.status,
    });
  } catch (error: any) {
    console.error('Error fetching approval data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tutor data' }, { status: 500 });
  }
}


