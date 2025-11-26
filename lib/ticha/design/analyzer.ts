/**
 * Design Analysis Service
 * Analyzes scraped designs and extracts patterns
 */

import { DesignInspiration } from '../types'
import { getDesignInspirationByCategory, analyzeDesignPatterns } from './learning'

/**
 * Analyze designs and generate recommendations
 */
export async function generateDesignRecommendations(
  category: string
): Promise<{
  recommendedColors: string[]
  recommendedLayouts: string[]
  recommendedFonts: string[]
  styleGuidance: string
}> {
  // Fetch inspiration for category
  const inspirations = await getDesignInspirationByCategory(category, 20)

  if (inspirations.length === 0) {
    // Return defaults if no inspiration found
    return {
      recommendedColors: ['1565C0', 'FFFFFF', '212121'],
      recommendedLayouts: ['title-and-bullets', 'title-only'],
      recommendedFonts: ['Poppins', 'Inter'],
      styleGuidance: 'Professional and clean design',
    }
  }

  // Analyze patterns
  const patterns = await analyzeDesignPatterns(inspirations)

  // Generate style guidance
  const styleGuidance = generateStyleGuidance(patterns, category)

  return {
    recommendedColors: patterns.commonColors.slice(0, 5),
    recommendedLayouts: patterns.commonLayouts,
    recommendedFonts: patterns.commonFonts.slice(0, 2),
    styleGuidance,
  }
}

/**
 * Generate style guidance text from patterns
 */
function generateStyleGuidance(
  patterns: {
    commonColors: string[]
    commonLayouts: string[]
    commonFonts: string[]
    styleTrends: string[]
  },
  category: string
): string {
  const trends = patterns.styleTrends.join(', ')
  const layouts = patterns.commonLayouts.join(', ')

  return `Based on ${category} design trends: Use ${trends} style. Preferred layouts: ${layouts}.`
}

/**
 * Compare design against category standards
 */
export async function compareDesignToCategory(
  design: any,
  category: string
): Promise<{
  matchScore: number
  recommendations: string[]
}> {
  const recommendations = await generateDesignRecommendations(category)

  let matchScore = 0
  const recommendationsList: string[] = []

  // Check color match
  const designColors = design.colorPalette || []
  const colorMatches = designColors.filter((c: string) =>
    recommendations.recommendedColors.includes(c)
  )
  matchScore += (colorMatches.length / designColors.length) * 40

  // Check layout match
  const designLayouts = design.preferredLayouts || []
  const layoutMatches = designLayouts.filter((l: string) =>
    recommendations.recommendedLayouts.includes(l)
  )
  matchScore += (layoutMatches.length / Math.max(designLayouts.length, 1)) * 30

  // Check font match
  if (design.fonts?.title === recommendations.recommendedFonts[0]) {
    matchScore += 15
  }
  if (design.fonts?.body === recommendations.recommendedFonts[1]) {
    matchScore += 15
  }

  // Generate recommendations
  if (colorMatches.length < designColors.length) {
    recommendationsList.push(
      `Consider using colors: ${recommendations.recommendedColors.slice(0, 3).join(', ')}`
    )
  }
  if (layoutMatches.length < designLayouts.length) {
    recommendationsList.push(
      `Consider using layouts: ${recommendations.recommendedLayouts.join(', ')}`
    )
  }

  return {
    matchScore: Math.min(100, Math.round(matchScore)),
    recommendations: recommendationsList,
  }
}

