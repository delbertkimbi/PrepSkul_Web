/**
 * Design Learning Module
 * Fetches, analyzes, and learns from design inspiration
 */

import { DesignInspiration } from '../types'
import { getTichaSupabaseAdmin } from '../supabase-service'

/**
 * Fetch design inspiration from external sources
 * For MVP: Manual curation, post-MVP: automated scraping
 */
export async function fetchDesignInspiration(
  sources: string[] = ['behance', 'dribbble']
): Promise<DesignInspiration[]> {
  // For MVP: Return manually curated designs
  // Post-MVP: Implement actual scraping
  
  const curatedDesigns: DesignInspiration[] = [
    {
      id: 'curated-1',
      sourceUrl: 'https://behance.net/example',
      designData: {
        colorPalette: ['1565C0', 'E3F2FD', 'FFFFFF', '212121'],
        layoutPatterns: ['title-and-bullets', 'two-column'],
        typography: {
          fonts: ['Poppins', 'Inter'],
          sizes: [44, 32, 18, 16],
        },
        styleKeywords: ['professional', 'clean', 'modern'],
      },
      category: 'corporate',
      scrapedAt: new Date().toISOString(),
    },
    {
      id: 'curated-2',
      sourceUrl: 'https://dribbble.com/example',
      designData: {
        colorPalette: ['E91E63', '9C27B0', 'FFFFFF', '212121'],
        layoutPatterns: ['title-only', 'image-left'],
        typography: {
          fonts: ['Poppins', 'Inter'],
          sizes: [48, 24, 20],
        },
        styleKeywords: ['creative', 'bold', 'colorful'],
      },
      category: 'creative',
      scrapedAt: new Date().toISOString(),
    },
  ]

  return curatedDesigns
}

/**
 * Analyze design patterns from inspiration
 */
export async function analyzeDesignPatterns(
  inspirations: DesignInspiration[]
): Promise<{
  commonColors: string[]
  commonLayouts: string[]
  commonFonts: string[]
  styleTrends: string[]
}> {
  const colorFrequency: Record<string, number> = {}
  const layoutFrequency: Record<string, number> = {}
  const fontFrequency: Record<string, number> = {}
  const styleKeywords: string[] = []

  for (const inspiration of inspirations) {
    // Count colors
    for (const color of inspiration.designData.colorPalette) {
      colorFrequency[color] = (colorFrequency[color] || 0) + 1
    }

    // Count layouts
    for (const layout of inspiration.designData.layoutPatterns) {
      layoutFrequency[layout] = (layoutFrequency[layout] || 0) + 1
    }

    // Count fonts
    for (const font of inspiration.designData.typography.fonts) {
      fontFrequency[font] = (fontFrequency[font] || 0) + 1
    }

    // Collect style keywords
    styleKeywords.push(...inspiration.designData.styleKeywords)
  }

  // Get most common items
  const commonColors = Object.entries(colorFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([color]) => color)

  const commonLayouts = Object.entries(layoutFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([layout]) => layout)

  const commonFonts = Object.entries(fontFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([font]) => font)

  const styleTrends = [...new Set(styleKeywords)]

  return {
    commonColors,
    commonLayouts,
    commonFonts,
    styleTrends,
  }
}

/**
 * Generate design variations based on learned patterns
 */
export async function generateDesignVariations(
  baseDesign: any,
  patterns: {
    commonColors: string[]
    commonLayouts: string[]
    commonFonts: string[]
    styleTrends: string[]
  }
): Promise<any[]> {
  const variations: any[] = []

  // Generate variations by mixing patterns
  for (let i = 0; i < 3; i++) {
    const variation = {
      ...baseDesign,
      colorPalette: patterns.commonColors.slice(i * 3, (i + 1) * 3),
      preferredLayouts: patterns.commonLayouts.slice(0, 3),
      fonts: {
        title: patterns.commonFonts[0] || 'Poppins',
        body: patterns.commonFonts[1] || 'Inter',
      },
    }
    variations.push(variation)
  }

  return variations
}

/**
 * Store design inspiration in database
 */
export async function storeDesignInspiration(
  inspiration: DesignInspiration
): Promise<void> {
  const supabase = getTichaSupabaseAdmin()

  const { error } = await supabase.from('ticha_design_inspiration').insert({
    source_url: inspiration.sourceUrl,
    design_data: inspiration.designData,
    category: inspiration.category,
    scraped_at: inspiration.scrapedAt,
  })

  if (error) {
    console.error('Failed to store design inspiration:', error)
    throw new Error(`Failed to store design inspiration: ${error.message}`)
  }
}

/**
 * Get design inspiration from database by category
 */
export async function getDesignInspirationByCategory(
  category: string,
  limit: number = 10
): Promise<DesignInspiration[]> {
  const supabase = getTichaSupabaseAdmin()

  const { data, error } = await supabase
    .from('ticha_design_inspiration')
    .select('*')
    .eq('category', category)
    .order('scraped_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch design inspiration:', error)
    return []
  }

  return (data || []).map((row) => ({
    id: row.id,
    sourceUrl: row.source_url,
    designData: row.design_data,
    category: row.category,
    scrapedAt: row.scraped_at,
  }))
}

