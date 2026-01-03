import { AggregatedDesignSpec, ExtractedDesign } from '../types'
import { getTichaSupabaseAdmin } from '../supabase-service'

type InspirationRow = {
  id: string
  category: string | null
  extracted_design_spec: ExtractedDesign | null
  quality_score: number | null
  scraped_at: string | null
  created_at: string | null
  uploaded_by: string | null
}

function normalizeColorString(color: string): string {
  if (!color) return ''
  const trimmed = color.trim()
  if (trimmed.startsWith('#')) return trimmed.toUpperCase()
  // If it's a 6-char hex without '#', add it
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`
  }
  return trimmed
}

function getTopFrequent<T extends string | number>(items: T[], limit: number): T[] {
  const freq: Record<string, { value: T; count: number }> = {}
  for (const item of items) {
    const key = String(item)
    if (!freq[key]) {
      freq[key] = { value: item, count: 0 }
    }
    freq[key].count += 1
  }
  return Object.values(freq)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((e) => e.value)
}

function averageNumericArrays(arrays: number[][], fallback: number[]): number[] {
  if (!arrays.length) return fallback
  const maxLen = Math.max(...arrays.map((a) => a.length))
  const result: number[] = []
  for (let i = 0; i < maxLen; i++) {
    let sum = 0
    let count = 0
    for (const arr of arrays) {
      if (typeof arr[i] === 'number') {
        sum += arr[i]
        count += 1
      }
    }
    if (count === 0) {
      result[i] = fallback[i] ?? fallback[fallback.length - 1] ?? 0
    } else {
      result[i] = Math.round(sum / count)
    }
  }
  return result
}

export function aggregateDesigns(designs: ExtractedDesign[]): AggregatedDesignSpec {
  if (!designs.length) {
    return {
      colorPalette: [],
      typography: {
        fonts: ['Montserrat', 'Open Sans'],
        sizes: [48, 32, 18, 16],
        weights: ['normal', 'bold'],
      },
      layoutPatterns: ['title-and-bullets'],
      spacing: {
        margins: [40, 40, 40, 40],
        padding: [20, 20, 20, 20],
      },
      styleKeywords: [],
      qualityScore: 80,
      designSpec: {
        background_color: '#FF8A00',
        text_color: 'white',
        layout: 'title-and-bullets',
        icon: 'none',
        fontFamily: 'Montserrat',
        fontSize: 32,
        customColors: {
          primary: '#FF8A00',
          secondary: '#2D3542',
          accent: '#FFFFFF',
        },
      },
    }
  }

  const allColors = designs
    .flatMap((d) => d.colorPalette || [])
    .map((c) => normalizeColorString(c))
  const allLayouts = designs.map((d) => d.layoutPattern).filter(Boolean)
  const allFonts = designs.flatMap((d) => d.typography?.fonts || [])
  const allSizesArrays = designs.map((d) => d.typography?.sizes || [])
  const allWeights = designs.flatMap((d) => d.typography?.weights || [])
  const marginArrays = designs.map((d) => d.spacing?.margins || [40, 40, 40, 40])
  const paddingArrays = designs.map((d) => d.spacing?.padding || [20, 20, 20, 20])
  const allKeywords = designs.flatMap((d) => d.styleKeywords || [])
  const qualityScores = designs.map((d) => d.qualityScore).filter((q) => typeof q === 'number')

  const colorPalette = getTopFrequent(allColors, 8)
  const layoutPatterns = getTopFrequent(allLayouts, 4)
  const fonts = getTopFrequent(allFonts, 4)
  const sizes = averageNumericArrays(allSizesArrays, [48, 32, 18, 16])
  const weights = getTopFrequent(allWeights, 4)
  const margins = averageNumericArrays(marginArrays, [40, 40, 40, 40])
  const padding = averageNumericArrays(paddingArrays, [20, 20, 20, 20])
  const styleKeywords = getTopFrequent(allKeywords, 10)
  const qualityScore =
    qualityScores.length > 0
      ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
      : 80

  const primaryColor = colorPalette[0] || '#FF8A00'
  const textColor = '#FFFFFF'

  return {
    colorPalette,
    typography: {
      fonts: fonts.length ? fonts : ['Montserrat', 'Open Sans'],
      sizes,
      weights: weights.length ? weights : ['normal', 'bold'],
    },
    layoutPatterns: layoutPatterns.length ? layoutPatterns : ['title-and-bullets'],
    spacing: {
      margins,
      padding,
    },
    styleKeywords,
    qualityScore,
    designSpec: {
      background_color: primaryColor,
      text_color: textColor,
      layout: (layoutPatterns[0] as any) || 'title-and-bullets',
      icon: 'none',
      fontFamily: fonts[0] || 'Montserrat',
      fontSize: sizes[0] || 32,
      customColors: {
        primary: primaryColor,
        secondary: colorPalette[1] || '#2D3542',
        accent: colorPalette[2] || '#FFFFFF',
      },
    },
  }
}

// Helper to compute an aggregated spec for a single design set given its id.
export async function getAggregatedDesignForSet(designSetId: string): Promise<AggregatedDesignSpec | null> {
  const supabase = getTichaSupabaseAdmin()

  const { data, error } = await supabase
    .from('ticha_design_inspiration')
    .select('id, category, extracted_design_spec, quality_score, scraped_at, created_at, uploaded_by')
    .ilike('category', `user-set:${designSetId}`)

  if (error) {
    console.error('[ActiveDesignSet] Failed to fetch designs for set', designSetId, error)
    return null
  }

  const rows = (data || []) as InspirationRow[]
  const designs: ExtractedDesign[] = rows
    .map((r) => r.extracted_design_spec)
    .filter((d): d is ExtractedDesign => !!d)

  if (!designs.length) {
    console.warn('[ActiveDesignSet] No extracted designs found for set', designSetId)
    return null
  }

  return aggregateDesigns(designs)
}

// Select the latest admin-uploaded design set (by created_at) and return its aggregated spec.
export async function getActiveAggregatedDesignSet(): Promise<{
  designSetId: string
  spec: AggregatedDesignSpec
} | null> {
  const supabase = getTichaSupabaseAdmin()

  const { data, error } = await supabase
    .from('ticha_design_inspiration')
    .select('id, category, extracted_design_spec, quality_score, scraped_at, created_at, uploaded_by')
    .not('category', 'is', null)
    .ilike('category', 'user-set:%')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[ActiveDesignSet] Failed to fetch candidate design sets', error)
    return null
  }

  const rows = (data || []) as InspirationRow[]
  if (!rows.length) {
    console.warn('[ActiveDesignSet] No user-set design inspirations found')
    return null
  }

  // Take the designSetId from the most recent row
  const latest = rows[0]
  const category = latest.category || ''
  const match = category.match(/^user-set:(.+)$/)
  if (!match) {
    console.warn('[ActiveDesignSet] Latest row has unexpected category format', category)
    return null
  }
  const designSetId = match[1]

  const spec = await getAggregatedDesignForSet(designSetId)
  if (!spec) {
    return null
  }

  return { designSetId, spec }
}



