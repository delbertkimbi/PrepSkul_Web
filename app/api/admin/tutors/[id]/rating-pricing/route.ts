import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    
    // Get request body
    const body = await request.json();
    const {
      admin_approved_rating,
      base_session_price,
      pricing_tier,
      initial_rating_suggested,
      rating_justification,
      credential_score,
    } = body;

    // Validate required fields
    if (admin_approved_rating === undefined || base_session_price === undefined) {
      return NextResponse.json(
        { error: 'admin_approved_rating and base_session_price are required' },
        { status: 400 }
      );
    }

    // Validate rating range (3.0 - 4.5)
    if (admin_approved_rating < 3.0 || admin_approved_rating > 4.5) {
      return NextResponse.json(
        { error: 'admin_approved_rating must be between 3.0 and 4.5' },
        { status: 400 }
      );
    }

    // Validate price range (3000 - 15000 XAF)
    if (base_session_price < 3000 || base_session_price > 15000) {
      return NextResponse.json(
        { error: 'base_session_price must be between 3000 and 15000 XAF' },
        { status: 400 }
      );
    }

    // Update tutor profile with rating and pricing
    const updateData: any = {
      admin_approved_rating: parseFloat(admin_approved_rating),
      base_session_price: parseInt(base_session_price),
      updated_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (pricing_tier) {
      updateData.pricing_tier = pricing_tier;
    }
    if (initial_rating_suggested !== undefined) {
      updateData.initial_rating_suggested = parseFloat(initial_rating_suggested);
    }
    if (rating_justification) {
      updateData.rating_justification = rating_justification;
    }
    if (credential_score !== undefined) {
      updateData.credential_score = parseInt(credential_score);
    }

    // Update the tutor profile
    const { error, data } = await supabase
      .from('tutor_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating rating and pricing:', error);
      return NextResponse.json(
        { error: 'Failed to save rating and pricing', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Rating and pricing saved successfully',
    });
  } catch (error: any) {
    console.error('Error in rating-pricing route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

