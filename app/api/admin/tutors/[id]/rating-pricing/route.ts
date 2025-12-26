import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      admin_approved_rating,
      base_session_price,
      pricing_tier,
      initial_rating_suggested,
      rating_justification,
      credential_score
    } = body;

    // Validate input
    const missingFields: string[] = [];
    if (!admin_approved_rating) missingFields.push('admin_approved_rating');
    if (!base_session_price) missingFields.push('base_session_price');
    if (!pricing_tier) missingFields.push('pricing_tier');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      );
    }

    // Validate rating range
    const rating = Number(admin_approved_rating);
    if (isNaN(rating) || rating < 3.0 || rating > 4.5) {
      return NextResponse.json(
        { 
          error: `admin_approved_rating must be between 3.0 and 4.5. Received: ${admin_approved_rating}`,
          field: 'admin_approved_rating',
          received: admin_approved_rating,
          validRange: { min: 3.0, max: 4.5 }
        },
        { status: 400 }
      );
    }

    // Validate price range
    const price = Number(base_session_price);
    if (isNaN(price) || price < 3000 || price > 15000) {
      return NextResponse.json(
        { 
          error: `base_session_price must be between 3000 and 15000 XAF. Received: ${base_session_price}`,
          field: 'base_session_price',
          received: base_session_price,
          validRange: { min: 3000, max: 15000 }
        },
        { status: 400 }
      );
    }

    // Validate pricing_tier
    const validTiers = ['entry', 'standard', 'premium', 'expert'];
    if (!validTiers.includes(pricing_tier)) {
      return NextResponse.json(
        { 
          error: `pricing_tier must be one of: ${validTiers.join(', ')}. Received: ${pricing_tier}`,
          field: 'pricing_tier',
          received: pricing_tier,
          validValues: validTiers
        },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await createServerSupabaseClient();

    // Get current tutor profile to check status and existing values
    const { data: currentProfile, error: fetchError } = await supabase
      .from('tutor_profiles')
      .select('status, hourly_rate, base_session_price, admin_approved_rating')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching tutor profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch tutor profile' },
        { status: 500 }
      );
    }

    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Tutor profile not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      admin_approved_rating: rating,
      base_session_price: price,
      pricing_tier,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (initial_rating_suggested !== undefined) {
      updateData.initial_rating_suggested = initial_rating_suggested;
    }
    if (rating_justification !== undefined) {
      updateData.rating_justification = rating_justification;
    }
    if (credential_score !== undefined) {
      updateData.credential_score = credential_score;
    }

    // Auto-sync hourly_rate with base_session_price for approved tutors
    // This ensures data consistency (hourly_rate should match base_session_price)
    if (currentProfile.status === 'approved' || currentProfile.status === 'pending') {
      // Only update hourly_rate if it's missing, corrupted, or different from base_session_price
      const currentHourlyRate = currentProfile.hourly_rate ? Number(currentProfile.hourly_rate) : null;
      const shouldUpdateHourlyRate = 
        !currentHourlyRate || 
        currentHourlyRate < 1000 || 
        currentHourlyRate > 50000 || 
        currentHourlyRate !== price;

      if (shouldUpdateHourlyRate) {
        updateData.hourly_rate = price;
        console.log(`🔄 Auto-syncing hourly_rate to ${price} for tutor ${id} (was: ${currentHourlyRate})`);
      }
    }

    // Update tutor profile
    const { data, error } = await supabase
      .from('tutor_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating tutor rating/pricing:', error);
      return NextResponse.json(
        { 
          error: 'Failed to update tutor rating/pricing',
          details: error.message 
        },
        { status: 500 }
      );
    }

    // Log successful update
    console.log(`✅ Updated rating/pricing for tutor ${id}:`, {
      admin_approved_rating: rating,
      base_session_price: price,
      pricing_tier,
      hourly_rate: updateData.hourly_rate || currentProfile.hourly_rate,
      updated_by: user.id,
    });

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Rating and pricing updated successfully',
      syncedFields: updateData.hourly_rate ? ['hourly_rate'] : []
    });
  } catch (error) {
    console.error('Error in rating-pricing route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






