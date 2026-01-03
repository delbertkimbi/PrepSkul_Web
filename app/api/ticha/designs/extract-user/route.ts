/**
 * Extract design from admin-uploaded image (for design sets)
 * ADMIN ONLY - This is for training the AI model
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractDesignFromImage } from '@/lib/ticha/design/extractor'
import { getTichaSupabaseAdmin } from '@/lib/ticha/supabase-service'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'
import { isTichaAdmin } from '@/lib/ticha/admin'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getTichaServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await isTichaAdmin(session.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 })
    }

    const body = await request.json()
    const { imageUrl, userId, designSetId, designSetName, slideIndex } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    if (userId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Extract design from image
    console.log(`[ExtractUser] Extracting design from: ${imageUrl}`)
    const extractedDesign = await extractDesignFromImage(imageUrl, [])

    // Store in database as user design inspiration
    const description = designSetName 
      ? `${designSetName} - Slide ${(slideIndex || 0) + 1}`
      : `User-uploaded slide design ${slideIndex !== undefined ? `(Slide ${slideIndex + 1})` : ''}`
    
    // Use the admin client which bypasses RLS with service role key
    const supabaseAdmin = getTichaSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('ticha_design_inspiration')
      .insert({
        source_url: imageUrl, // Required field - use imageUrl as source
        image_url: imageUrl,
        keywords: extractedDesign.styleKeywords || [],
        extracted_design_spec: extractedDesign,
        design_data: extractedDesign, // Also populate design_data for backward compatibility
        quality_score: extractedDesign.qualityScore || 0,
        uploaded_by: userId,
        category: designSetId ? `user-set:${designSetId}` : 'user-uploaded',
        description: description,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[ExtractUser] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save design', details: error.message },
        { status: 500 }
      )
    }

    console.log(`[ExtractUser] Successfully extracted and saved design: ${data.id}`)

    return NextResponse.json({
      success: true,
      designId: data.id,
      extractedDesign,
    })
  } catch (error: any) {
    console.error('[ExtractUser] Error:', error)
    return NextResponse.json(
      { error: 'Failed to extract design', message: error.message },
      { status: 500 }
    )
  }
}

