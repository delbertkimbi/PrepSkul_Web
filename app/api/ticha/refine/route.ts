/**
 * TichaAI Refinement API
 * Handles iterative refinement of existing presentations
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateOutline } from '@/lib/ticha/openrouter'
import { createPPT, type SlideData } from '@/lib/ticha/ppt/createPPT'
import {
  downloadFileFromStorage,
  uploadFileToStorage,
  tichaSupabaseAdmin,
} from '@/lib/ticha/supabase-service'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'
import type { RefinementHistory, PresentationData } from '@/lib/ticha/types'

interface RefineRequest {
  presentationId: string
  refinementPrompt: string
  designPreset?: string
  customDesignPrompt?: string
}

/**
 * POST /api/ticha/refine
 * Refine an existing presentation
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request
    const body: RefineRequest = await request.json()
    const { presentationId, refinementPrompt, designPreset, customDesignPrompt } = body

    if (!presentationId || !refinementPrompt) {
      return NextResponse.json(
        { error: 'presentationId and refinementPrompt are required' },
        { status: 400 }
      )
    }

    // Get user session
    let userId: string | null = null
    try {
      const session = await getTichaServerSession()
      userId = session?.id || null
    } catch (error) {
      console.warn('[Refine] Auth check failed, continuing without auth')
    }

    // Load existing presentation from database
    console.log(`[Refine] Loading presentation: ${presentationId}`)
    const { data: presentation, error: fetchError } = await tichaSupabaseAdmin
      .from('ticha_presentations')
      .select('*')
      .eq('id', presentationId)
      .maybeSingle()

    if (fetchError || !presentation) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      )
    }

    // Verify ownership (if user is authenticated)
    if (userId && presentation.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get existing presentation data
    const existingData: PresentationData | null = presentation.presentation_data || null
    const existingSlides = existingData?.slides || []

    // Get original file content if available
    let originalText = ''
    if (presentation.file_url) {
      try {
        const urlMatch = presentation.file_url.match(/\/uploads\/(.+)$/)
        if (urlMatch) {
          const fileBuffer = await downloadFileFromStorage('uploads', urlMatch[1])
          // For refinement, we'll use the existing slide content
          // In a full implementation, we might re-extract text
          originalText = existingSlides
            .map((slide) => `${slide.slide_title}\n${slide.bullets.join('\n')}`)
            .join('\n\n')
        }
      } catch (error) {
        console.warn('[Refine] Could not load original file, using existing slides')
        originalText = existingSlides
          .map((slide) => `${slide.slide_title}\n${slide.bullets.join('\n')}`)
          .join('\n\n')
      }
    } else {
      // Use existing slides as content
      originalText = existingSlides
        .map((slide) => `${slide.slide_title}\n${slide.bullets.join('\n')}`)
        .join('\n\n')
    }

    // Generate refined outline
    console.log(`[Refine] Generating refined outline...`)
    let refinedOutline
    try {
      refinedOutline = await generateOutline(originalText, undefined, {
        designPreset,
        customDesignPrompt,
        refinementPrompt,
        existingSlides: existingSlides.map((slide) => ({
          slide_title: slide.slide_title,
          bullets: slide.bullets,
          design: slide.design,
        })),
      })
      console.log(`[Refine] Generated ${refinedOutline.slides.length} refined slides`)
    } catch (error) {
      console.error(`[Refine] Failed to generate refined outline:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('402') || errorMessage.includes('credits')) {
        return NextResponse.json(
          {
            error:
              'OpenRouter credits required. Please purchase credits to refine presentations.',
          },
          { status: 402 }
        )
      }

      return NextResponse.json(
        { error: `Failed to refine presentation: ${errorMessage}` },
        { status: 500 }
      )
    }

    // Create refined PowerPoint
    console.log(`[Refine] Creating refined PowerPoint...`)
    let pptBuffer: Buffer
    try {
      pptBuffer = await createPPT({
        title: presentation.title || 'Refined Presentation',
        author: userId || 'TichaAI User',
        company: 'TichaAI',
        slides: refinedOutline.slides as SlideData[],
      })
      console.log(`[Refine] Created refined PPT: ${pptBuffer.length} bytes`)
    } catch (error) {
      console.error(`[Refine] Failed to create refined PPT:`, error)
      return NextResponse.json(
        {
          error: `Failed to create refined presentation: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
        { status: 500 }
      )
    }

    // Upload refined PPT
    console.log(`[Refine] Uploading refined PPT...`)
    let pptUrl: string
    try {
      const timestamp = Date.now()
      const pptFileName = `presentation-${presentationId}-refined-${timestamp}.pptx`
      const pptPath = `${userId || 'public'}/${pptFileName}`

      const { url } = await uploadFileToStorage(
        'generated',
        pptPath,
        pptBuffer,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      )

      pptUrl = url
      console.log(`[Refine] Uploaded refined PPT: ${pptUrl}`)
    } catch (error) {
      console.error(`[Refine] Failed to upload refined PPT:`, error)
      return NextResponse.json(
        {
          error: `Failed to upload refined presentation: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
        { status: 500 }
      )
    }

    // Update presentation data
    const refinedData: PresentationData = {
      id: presentationId,
      title: presentation.title,
      author: userId || undefined,
      slides: refinedOutline.slides.map((slide, index) => ({
        id: `slide-${index + 1}`,
        slide_number: index + 1,
        slide_title: slide.slide_title,
        bullets: slide.bullets,
        design: slide.design,
      })),
      metadata: {
        version: (existingData?.metadata?.version || 0) + 1,
        created_at: existingData?.metadata?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }

    // Get existing refinement history
    const existingHistory: RefinementHistory[] = presentation.refinement_history || []

    // Create new refinement history entry
    const newHistoryEntry: RefinementHistory = {
      version: refinedData.metadata.version,
      timestamp: new Date().toISOString(),
      prompt: refinementPrompt,
      designPreset,
      customDesignPrompt,
      changes: {
        slideCount: refinedOutline.slides.length - existingSlides.length,
        designChanges: designPreset
          ? [`Applied ${designPreset} preset`]
          : ['Design refinements applied'],
        contentChanges: ['Content refined based on user feedback'],
      },
      presentationUrl: pptUrl,
    }

    const updatedHistory = [...existingHistory, newHistoryEntry]

    // Update presentation in database
    const updateData: any = {
      presentation_data: refinedData,
      refinement_history: updatedHistory,
      presentation_url: pptUrl,
      updated_at: new Date().toISOString(),
    }

    if (designPreset) {
      updateData.design_preset = designPreset
    }

    if (customDesignPrompt) {
      updateData.design_customizations = {
        ...(presentation.design_customizations || {}),
        customPrompt: customDesignPrompt,
      }
    }

    const { error: updateError } = await tichaSupabaseAdmin
      .from('ticha_presentations')
      .update(updateData)
      .eq('id', presentationId)

    if (updateError) {
      console.error(`[Refine] Failed to update presentation:`, updateError)
      // Continue anyway - the PPT was created successfully
    }

    const processingTime = Date.now() - startTime
    console.log(`[Refine] Success! Processing time: ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      downloadUrl: pptUrl,
      slides: refinedOutline.slides.length,
      processingTime: `${(processingTime / 1000).toFixed(2)}s`,
      version: refinedData.metadata.version,
      refinementHistory: updatedHistory,
    })
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error(`[Refine] Unexpected error (${processingTime}ms):`, error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

