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
    if (!admin_approved_rating || !base_session_price || !pricing_tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (admin_approved_rating < 3.0 || admin_approved_rating > 4.5) {
      return NextResponse.json(
        { error: 'Rating must be between 3.0 and 4.5' },
        { status: 400 }
      );
    }

    // Validate price range
    if (base_session_price < 3000 || base_session_price > 15000) {
      return NextResponse.json(
        { error: 'Price must be between 3000 and 15000 XAF' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await createServerSupabaseClient();

    // Update tutor profile
    const { data, error } = await supabase
      .from('tutor_profiles')
      .update({
        admin_approved_rating,
        base_session_price,
        pricing_tier,
        initial_rating_suggested,
        rating_justification,
        credential_score,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tutor rating/pricing:', error);
      return NextResponse.json(
        { error: 'Failed to update tutor rating/pricing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in rating-pricing route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






