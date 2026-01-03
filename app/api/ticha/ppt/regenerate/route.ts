/**
 * Regenerate PPT from edited slides
 * Takes edited slide data and creates a new PPT file
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPPT, type SlideData } from '@/lib/ticha/ppt/createPPT'

interface RegenerateRequest {
  slides: Array<{
    slide_title: string
    bullets: string[]
    design: {
      background_color: string
      text_color: string
      layout: string
      icon: string
      fontFamily?: string
      fontSize?: number
    }
  }>
  title?: string
  author?: string
  company?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RegenerateRequest = await request.json()

    if (!body.slides || !Array.isArray(body.slides) || body.slides.length === 0) {
      return NextResponse.json(
        { error: 'Slides array is required' },
        { status: 400 }
      )
    }

    // Convert to SlideData format
    const slideData: SlideData[] = body.slides.map((slide) => ({
      slide_title: slide.slide_title || 'Untitled Slide',
      bullets: slide.bullets || [],
      design: {
        background_color: slide.design.background_color || '#FF8A00',
        text_color: slide.design.text_color || '#FFFFFF',
        layout: slide.design.layout || 'title-and-bullets',
        icon: slide.design.icon || 'none',
        fontFamily: slide.design.fontFamily,
        fontSize: slide.design.fontSize,
      },
    }))

    // Generate PPT
    const pptBuffer = await createPPT({
      title: body.title || 'TichaAI Presentation',
      author: body.author || 'TichaAI User',
      company: body.company || 'TichaAI',
      slides: slideData,
    })

    // Return as base64 or buffer
    const base64 = pptBuffer.toString('base64')
    const mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'

    return NextResponse.json({
      success: true,
      pptData: base64,
      mimeType,
      filename: `presentation-${Date.now()}.pptx`,
    })
  } catch (error) {
    console.error('[Regenerate PPT] Error:', error)
    return NextResponse.json(
      { error: `Failed to regenerate PPT: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

