import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { notifyTutorApproval } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerSession();
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check admin permission
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get tutor ID and notes from form data
    const formData = await request.formData();
    const tutorId = formData.get('tutorId') as string;
    const notes = formData.get('notes') as string;

    if (!tutorId) {
      return NextResponse.json({ error: 'Tutor ID required' }, { status: 400 });
    }

    // Get supabase client
    const supabase = await createServerSupabaseClient();

    // First, fetch tutor profile to get contact info and check rating/pricing
    const { data: tutorProfile, error: fetchError } = await supabase
      .from('tutor_profiles')
      .select('user_id, full_name, admin_approved_rating, base_session_price, hourly_rate, pricing_tier, rating_justification, status, video_url, video_link, video_intro')
      .eq('id', tutorId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    // Validate rating before approval
    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    if (!tutorProfile.admin_approved_rating) {
      missingFields.push('admin_approved_rating');
    } else {
      // Validate rating range (3.0 - 4.5)
      const rating = Number(tutorProfile.admin_approved_rating);
      if (isNaN(rating) || rating < 3.0 || rating > 4.5) {
        invalidFields.push(`admin_approved_rating (value: ${tutorProfile.admin_approved_rating} is outside valid range 3.0-4.5)`);
      }
    }

    // Validate pricing before approval
    if (!tutorProfile.base_session_price) {
      missingFields.push('base_session_price');
      
      // If base_session_price is missing, check if hourly_rate is valid as fallback
      if (tutorProfile.hourly_rate) {
        const hourlyRate = Number(tutorProfile.hourly_rate);
        if (isNaN(hourlyRate) || hourlyRate < 1000 || hourlyRate > 50000) {
          invalidFields.push(`hourly_rate (value: ${tutorProfile.hourly_rate} is corrupted or outside valid range 1000-50000)`);
        } else if (hourlyRate < 3000 || hourlyRate > 15000) {
          console.warn(`⚠️ Tutor ${tutorId} has hourly_rate ${hourlyRate} which is valid but outside typical session price range (3000-15000)`);
        }
      }
    } else {
      // Validate base_session_price range (3000 - 15000)
      const price = Number(tutorProfile.base_session_price);
      if (isNaN(price) || price < 3000 || price > 15000) {
        invalidFields.push(`base_session_price (value: ${tutorProfile.base_session_price} is outside valid range 3000-15000)`);
      }
    }

    // Check for corrupted hourly_rate even if base_session_price exists
    if (tutorProfile.hourly_rate) {
      const hourlyRate = Number(tutorProfile.hourly_rate);
      if (!isNaN(hourlyRate) && (hourlyRate < 1000 || hourlyRate > 50000)) {
        invalidFields.push(`hourly_rate (value: ${tutorProfile.hourly_rate} is corrupted)`);
      }
    }

    // Return detailed error if validation fails
    if (missingFields.length > 0 || invalidFields.length > 0) {
      const errorMessages: string[] = [];
      
      if (missingFields.length > 0) {
        errorMessages.push(`Missing required fields: ${missingFields.join(', ')}`);
        errorMessages.push('Please set rating and pricing in the tutor detail page before approval.');
      }
      
      if (invalidFields.length > 0) {
        errorMessages.push(`Invalid field values: ${invalidFields.join('; ')}`);
        errorMessages.push('Please correct these values before approval.');
      }

      console.error(`❌ Cannot approve tutor ${tutorId}:`, {
        missingFields,
        invalidFields,
        tutorProfile: {
          admin_approved_rating: tutorProfile.admin_approved_rating,
          base_session_price: tutorProfile.base_session_price,
          hourly_rate: tutorProfile.hourly_rate,
        }
      });

      return NextResponse.json(
        { 
          error: errorMessages.join(' '),
          missingFields: missingFields.reduce((acc, field) => {
            acc[field] = true;
            return acc;
          }, {} as Record<string, boolean>),
          invalidFields: invalidFields,
        },
        { status: 400 }
      );
    }

    // Log successful validation
    console.log(`✅ Tutor ${tutorId} validation passed:`, {
      admin_approved_rating: tutorProfile.admin_approved_rating,
      base_session_price: tutorProfile.base_session_price,
      hourly_rate: tutorProfile.hourly_rate,
    });

    // Get user profile for email/phone
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('email, phone_number, full_name')
      .eq('id', tutorProfile.user_id)
      .maybeSingle();

    if (profileError) throw profileError;

    // Sync video fields: ensure video_url is populated from video_link or video_intro
    const videoUrl = tutorProfile.video_url || tutorProfile.video_link || 
      (typeof tutorProfile.video_intro === 'string' ? tutorProfile.video_intro : tutorProfile.video_intro?.url || tutorProfile.video_intro?.link || null);
    
    // Update tutor status to approved with optional notes
    // Also sync video_url if it's empty but video_link or video_intro exists
    const updateData: any = {
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_review_notes: notes || null,
    };
    
    // Sync video_url if needed
    if (videoUrl && !tutorProfile.video_url) {
      updateData.video_url = videoUrl;
    }
    
    const { error } = await supabase
      .from('tutor_profiles')
      .update(updateData)
      .eq('id', tutorId);

    if (error) throw error;

    // Send notification to tutor (email/SMS/in-app) with rating and pricing info
    const tutorName = userProfile?.full_name || tutorProfile.full_name || 'Tutor';
    const notificationResult = await notifyTutorApproval(
      userProfile?.email || null,
      userProfile?.phone_number || null,
      tutorName,
      tutorProfile.user_id, // Pass userId for in-app notifications
      notes || undefined,
      {
        rating: tutorProfile.admin_approved_rating,
        sessionPrice: tutorProfile.base_session_price,
        pricingTier: tutorProfile.pricing_tier,
        ratingJustification: tutorProfile.rating_justification
      }
    );

    console.log('📧 Notification results:', notificationResult);

    // Redirect back to pending tutors page
    return NextResponse.redirect(new URL('/admin/tutors/pending', request.url));
  } catch (error: any) {
    console.error('Error approving tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
