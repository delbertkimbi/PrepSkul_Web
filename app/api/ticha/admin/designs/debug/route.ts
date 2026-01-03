/**
 * Debug endpoint to check design extraction status
 * GET: View what's stored for a design
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTichaSupabaseAdmin } from '@/lib/ticha/supabase-service'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'
import { isTichaAdmin } from '@/lib/ticha/admin'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const designId = searchParams.get('id')

    const supabase = getTichaSupabaseAdmin()

    if (designId) {
      // Get specific design
      const { data: design, error } = await supabase
        .from('ticha_design_inspiration')
        .select('*')
        .eq('id', designId)
        .single()

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch design: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        design: {
          id: design.id,
          keywords: design.keywords,
          category: design.category,
          image_url: design.image_url,
          has_extracted_spec: !!design.extracted_design_spec,
          extracted_design_spec: design.extracted_design_spec,
          quality_score: design.quality_score,
          usage_count: design.usage_count,
          design_data: design.design_data,
          created_at: design.created_at,
        },
      })
    } else {
      // Get all designs with extraction status
      const { data: designs, error } = await supabase
        .from('ticha_design_inspiration')
        .select('id, keywords, category, image_url, quality_score, usage_count, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch designs: ${error.message}` },
          { status: 500 }
        )
      }

      // Check extraction status for each
      const designsWithStatus = await Promise.all(
        (designs || []).map(async (design) => {
          const { data: fullDesign } = await supabase
            .from('ticha_design_inspiration')
            .select('extracted_design_spec, design_data')
            .eq('id', design.id)
            .single()

          return {
            ...design,
            has_extracted_spec: !!fullDesign?.extracted_design_spec,
            extracted_spec_preview: fullDesign?.extracted_design_spec
              ? {
                  colorPalette: fullDesign.extracted_design_spec.colorPalette?.slice(0, 3),
                  fonts: fullDesign.extracted_design_spec.typography?.fonts,
                  layoutPattern: fullDesign.extracted_design_spec.layoutPattern,
                  qualityScore: fullDesign.extracted_design_spec.qualityScore,
                }
              : null,
          }
        })
      )

      return NextResponse.json({
        success: true,
        designs: designsWithStatus,
        summary: {
          total: designsWithStatus.length,
          with_extraction: designsWithStatus.filter((d) => d.has_extracted_spec).length,
          without_extraction: designsWithStatus.filter((d) => !d.has_extracted_spec).length,
        },
      })
    }
  } catch (error) {
    console.error(`[DesignDebug] Error:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to debug designs: ${errorMessage}` },
      { status: 500 }
    )
  }
}

