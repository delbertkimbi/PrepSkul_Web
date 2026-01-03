/**
 * Re-extract Design from Existing Image
 * POST /api/ticha/admin/designs/extract
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractDesignFromImage } from '@/lib/ticha/design/extractor'
import { getTichaSupabaseAdmin } from '@/lib/ticha/supabase-service'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'
import { isTichaAdmin } from '@/lib/ticha/admin'

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin status
    const user = await getTichaServerSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminStatus = await isTichaAdmin(user.id)
    if (!adminStatus) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 })
    }

    const body = await request.json()
    const { designId, imageUrl, keywords } = body

    if (!designId && !imageUrl) {
      return NextResponse.json(
        { error: 'Either designId or imageUrl is required' },
        { status: 400 }
      )
    }

    const supabase = getTichaSupabaseAdmin()

    // Get design record if designId provided
    let finalImageUrl = imageUrl
    let finalKeywords = keywords || []

    if (designId) {
      const { data: design, error } = await supabase
        .from('ticha_design_inspiration')
        .select('image_url, keywords')
        .eq('id', designId)
        .single()

      if (error || !design) {
        return NextResponse.json(
          { error: 'Design not found' },
          { status: 404 }
        )
      }

      finalImageUrl = design.image_url || imageUrl
      finalKeywords = design.keywords || finalKeywords
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Extract design patterns
    console.log(`[DesignExtract] Extracting design from: ${finalImageUrl}`)
    console.log(`[DesignExtract] Using keywords:`, finalKeywords)
    let extractedDesign
    try {
      extractedDesign = await extractDesignFromImage(finalImageUrl, finalKeywords)
      console.log(`[DesignExtract] Extraction successful!`)
      console.log(`[DesignExtract] Extracted colors:`, extractedDesign?.colorPalette)
      console.log(`[DesignExtract] Extracted fonts:`, extractedDesign?.typography?.fonts)
      console.log(`[DesignExtract] Extracted layout:`, extractedDesign?.layoutPattern)
      console.log(`[DesignExtract] Quality score:`, extractedDesign?.qualityScore)
    } catch (error) {
      console.error(`[DesignExtract] Extraction failed:`, error)
      throw error // Re-throw to be caught by outer try-catch
    }

    // Update database if designId provided
    if (designId) {
      const { error: updateError } = await supabase
        .from('ticha_design_inspiration')
        .update({
          extracted_design_spec: extractedDesign,
          quality_score: extractedDesign.qualityScore,
          design_data: {
            colorPalette: extractedDesign.colorPalette,
            layoutPatterns: [extractedDesign.layoutPattern],
            typography: extractedDesign.typography,
            styleKeywords: extractedDesign.styleKeywords,
          },
        })
        .eq('id', designId)

      if (updateError) {
        console.error(`[DesignExtract] Update error:`, updateError)
        return NextResponse.json(
          { error: `Failed to update design: ${updateError.message}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      extractedDesign,
      designId: designId || null,
    })
  } catch (error) {
    console.error(`[DesignExtract] Error:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to extract design: ${errorMessage}` },
      { status: 500 }
    )
  }
}

