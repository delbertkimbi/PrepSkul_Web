/**
 * Normalize presentation data to use business template colors and fonts
 */

import type { PresentationData, SlideData } from '../types'

const BUSINESS_COLORS = {
  orange: '#FF8A00',
  darkBlue: '#2D3542',
  white: '#FFFFFF',
  black: '#000000',
} as const

/**
 * Normalize a single slide's design to business template
 */
export function normalizeSlideDesign(slide: SlideData, index: number): SlideData {
  const design = slide.design || {}
  
  // Normalize background color to business template
  let bgColor = design.background_color
  if (!bgColor || bgColor === 'light-blue' || bgColor === 'dark-blue' || 
      bgColor?.includes('667eea') || bgColor?.includes('764ba2') || 
      bgColor?.includes('1e3c72') || bgColor?.toLowerCase().includes('blue') ||
      bgColor?.toLowerCase().includes('purple') || bgColor?.toLowerCase().includes('gradient')) {
    // Use business template colors: orange for first slide, alternate dark-blue/white for others
    bgColor = index === 0 ? BUSINESS_COLORS.orange : (index % 2 === 0 ? BUSINESS_COLORS.darkBlue : BUSINESS_COLORS.white)
  }
  
  // Ensure it's a hex code
  if (!bgColor.startsWith('#')) {
    bgColor = BUSINESS_COLORS.orange
  }
  
  // Normalize text color
  const textColor = bgColor === BUSINESS_COLORS.white ? 'black' : 'white'
  
  // Normalize fonts to business template
  const fontFamily = design.fontFamily || (index === 0 ? 'Montserrat' : 'Montserrat')
  const fontSize = design.fontSize || (index === 0 ? 48 : 32)
  
  return {
    ...slide,
    design: {
      ...design,
      background_color: bgColor,
      text_color: textColor,
      fontFamily: fontFamily,
      fontSize: fontSize,
    },
  }
}

/**
 * Normalize entire presentation to use business template
 */
export function normalizePresentation(presentation: PresentationData): PresentationData {
  return {
    ...presentation,
    slides: presentation.slides.map((slide, index) => normalizeSlideDesign(slide, index)),
  }
}

