/**
 * Design Learning API
 * Fetches and stores design inspiration from external sources
 * Can be called as a scheduled job
 */

import { NextRequest, NextResponse } from 'next/server'
import { batchScrapeAndStore } from '@/lib/ticha/design/scraper'
import { fetchDesignInspiration, storeDesignInspiration } from '@/lib/ticha/design/learning'

/**
 * POST /api/ticha/design/learn
 * Trigger design learning (scraping and analysis)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { sources = ['behance', 'dribbble'], categories = ['corporate', 'creative', 'minimalist'] } = body

    console.log('[DesignLearn] Starting design learning process...')

    // For MVP: Use manual curation
    // Post-MVP: Use actual scraping
    const inspirations = await fetchDesignInspiration(sources)

    // Store inspirations
    let storedCount = 0
    for (const inspiration of inspirations) {
      try {
        await storeDesignInspiration(inspiration)
        storedCount++
      } catch (error) {
        console.error('Failed to store inspiration:', error)
      }
    }

    // Post-MVP: Uncomment for actual scraping
    // const scrapedCount = await batchScrapeAndStore(sources, categories)

    return NextResponse.json({
      success: true,
      message: 'Design learning completed',
      storedCount,
      // scrapedCount, // Post-MVP
    })
  } catch (error) {
    console.error('[DesignLearn] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to learn designs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ticha/design/learn
 * Get design inspiration by category
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'corporate'
    const limit = parseInt(searchParams.get('limit') || '10')

    const { getDesignInspirationByCategory } = await import('@/lib/ticha/design/learning')
    const inspirations = await getDesignInspirationByCategory(category, limit)

    return NextResponse.json({
      success: true,
      inspirations,
      count: inspirations.length,
    })
  } catch (error) {
    console.error('[DesignLearn] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch design inspiration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

