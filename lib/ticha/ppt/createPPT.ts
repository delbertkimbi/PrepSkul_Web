/**
 * PowerPoint Presentation Generation
 * Creates beautiful, design-focused presentations using pptxgenjs
 * Uses Business Template (Orange/Dark Blue) as default
 */

import PptxGenJS from 'pptxgenjs'

export interface SlideDesign {
  background_color: string // Hex code or color name
  text_color: 'black' | 'white' | string
  layout: 'title-only' | 'title-and-bullets' | 'two-column' | 'image-left' | 'image-right'
  icon: 'none' | 'book' | 'idea' | 'warning' | 'check'
  fontFamily?: string
  fontSize?: number
  customColors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
}

export interface SlideData {
  slide_title: string
  bullets: string[]
  design: SlideDesign
}

export interface PresentationOptions {
  title?: string
  author?: string
  company?: string
  slides: SlideData[]
}

// Business Template Color Palette
const BUSINESS_COLORS = {
  orange: '#FF8A00',
  darkBlue: '#2D3542',
  white: '#FFFFFF',
  black: '#000000',
} as const

// Business Template Fonts
const BUSINESS_FONTS = {
  title: { name: 'Montserrat', size: 48, bold: true },
  subtitle: { name: 'Montserrat', size: 32, bold: true },
  body: { name: 'Open Sans', size: 18, bold: false },
  bullet: { name: 'Open Sans', size: 16, bold: false },
} as const

/**
 * Get color from design spec - defaults to business template
 */
function getColorTheme(background_color: string | undefined): { bg: string; text: string } {
  if (!background_color) {
    return { bg: BUSINESS_COLORS.orange, text: BUSINESS_COLORS.white }
  }

  // Handle hex codes
  if (background_color.startsWith('#')) {
    const hex = background_color.replace('#', '')
    const brightness = getBrightness(hex)
    const textColor = brightness > 128 ? BUSINESS_COLORS.black : BUSINESS_COLORS.white
    return { bg: hex, text: textColor }
  }

  // Map old color names to business template
  const colorMap: Record<string, { bg: string; text: string }> = {
    'light-blue': { bg: BUSINESS_COLORS.orange, text: BUSINESS_COLORS.white },
    'dark-blue': { bg: BUSINESS_COLORS.darkBlue, text: BUSINESS_COLORS.white },
    'white': { bg: BUSINESS_COLORS.white, text: BUSINESS_COLORS.black },
    'gray': { bg: BUSINESS_COLORS.white, text: BUSINESS_COLORS.black },
    'green': { bg: BUSINESS_COLORS.orange, text: BUSINESS_COLORS.white },
    'orange': { bg: BUSINESS_COLORS.orange, text: BUSINESS_COLORS.white },
    'dark-gray-blue': { bg: BUSINESS_COLORS.darkBlue, text: BUSINESS_COLORS.white },
  }

  return colorMap[background_color] || { bg: BUSINESS_COLORS.orange, text: BUSINESS_COLORS.white }
}

/**
 * Calculate brightness of a hex color
 */
function getBrightness(hex: string): number {
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000
}

/**
 * Get font configuration - defaults to business template
 */
function getFontConfig(design: SlideDesign, type: 'title' | 'subtitle' | 'body' | 'bullet'): { name: string; size: number; bold: boolean } {
  const defaultFont = BUSINESS_FONTS[type]
  
  // Use design font if specified, otherwise use business template defaults
  if (design.fontFamily) {
    return {
      name: design.fontFamily,
      size: design.fontSize || defaultFont.size,
      bold: type === 'title' || type === 'subtitle' ? true : defaultFont.bold,
    }
  }
  
  return defaultFont
}

/**
 * Create PowerPoint presentation
 */
export async function createPPT(options: PresentationOptions): Promise<Buffer> {
  const pptx = new PptxGenJS()

  pptx.author = options.author || 'TichaAI'
  pptx.company = options.company || 'TichaAI'
  pptx.title = options.title || 'TichaAI Presentation'
  pptx.revision = '1'

  pptx.defineLayout({
    name: 'TICHA_WIDE',
    width: 10,
    height: 5.625, // 16:9
  })
  pptx.layout = 'TICHA_WIDE'

  // Create slides
  for (let i = 0; i < options.slides.length; i++) {
    const slideData = options.slides[i]
    const slide = pptx.addSlide()

    // Get design with business template defaults
    const design = slideData.design || {
      background_color: BUSINESS_COLORS.orange,
      text_color: BUSINESS_COLORS.white,
      layout: 'title-and-bullets',
      icon: 'none',
      fontFamily: BUSINESS_FONTS.title.name,
      fontSize: BUSINESS_FONTS.title.size,
    }

    // Force business template colors if old colors detected
    let bgColor = design.background_color
    if (bgColor === 'light-blue' || bgColor === 'dark-blue' || 
        bgColor?.includes('667eea') || bgColor?.includes('764ba2') ||
        bgColor?.includes('1e3c72')) {
      bgColor = i === 0 ? BUSINESS_COLORS.orange : (i % 2 === 0 ? BUSINESS_COLORS.darkBlue : BUSINESS_COLORS.white)
    }

    const colorTheme = getColorTheme(bgColor)
    slide.background = { color: colorTheme.bg }

    // Force business template fonts
    const finalFontFamily = design.fontFamily || BUSINESS_FONTS.title.name
    const titleFont = getFontConfig({ ...design, fontFamily: finalFontFamily }, 'title')
    const bodyFont = getFontConfig({ ...design, fontFamily: finalFontFamily }, 'body')

    const layout = design.layout || 'title-and-bullets'

    switch (layout) {
      case 'title-only':
        createTitleOnlySlide(slide, slideData, colorTheme, titleFont)
        break
      case 'title-and-bullets':
        createTitleBulletsSlide(slide, slideData, colorTheme, titleFont, bodyFont)
        break
      case 'two-column':
        createTwoColumnSlide(slide, slideData, colorTheme, titleFont, bodyFont)
        break
      case 'image-left':
        createImageLeftSlide(slide, slideData, colorTheme, titleFont, bodyFont)
        break
      case 'image-right':
        createImageRightSlide(slide, slideData, colorTheme, titleFont, bodyFont)
        break
      default:
        createTitleBulletsSlide(slide, slideData, colorTheme, titleFont, bodyFont)
    }
  }

  const buffer = await pptx.write({ outputType: 'nodebuffer' })
  return Buffer.from(buffer as ArrayBuffer)
}

function createTitleOnlySlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colorTheme: { bg: string; text: string },
  titleFont: { name: string; size: number; bold: boolean }
): void {
  slide.addText(slideData.slide_title, {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1.5,
    align: 'center',
    valign: 'middle',
    fontSize: titleFont.size,
    fontFace: titleFont.name,
    bold: titleFont.bold,
    color: colorTheme.text,
    lineSpacing: 32,
  })
}

function createTitleBulletsSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colorTheme: { bg: string; text: string },
  titleFont: { name: string; size: number; bold: boolean },
  bodyFont: { name: string; size: number; bold: boolean }
): void {
  // Title
  slide.addText(slideData.slide_title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: titleFont.size,
    fontFace: titleFont.name,
    bold: titleFont.bold,
    color: colorTheme.text,
  })

  // Bullets
  if (slideData.bullets && Array.isArray(slideData.bullets) && slideData.bullets.length > 0) {
    const bulletY = 1.8
    const lineHeight = 0.4
    
    slideData.bullets.forEach((bullet, index) => {
      slide.addText(`• ${bullet}`, {
        x: 0.8,
        y: bulletY + (index * lineHeight),
        w: 8.4,
        h: lineHeight,
        fontSize: bodyFont.size,
        fontFace: bodyFont.name,
        bold: bodyFont.bold,
        color: colorTheme.text,
        lineSpacing: 28,
      })
    })
  }
}

function createTwoColumnSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colorTheme: { bg: string; text: string },
  titleFont: { name: string; size: number; bold: boolean },
  bodyFont: { name: string; size: number; bold: boolean }
): void {
  slide.addText(slideData.slide_title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: titleFont.size,
    fontFace: titleFont.name,
    bold: titleFont.bold,
    color: colorTheme.text,
  })

  const midPoint = slideData.bullets.length / 2
  const leftBullets = slideData.bullets.slice(0, Math.ceil(midPoint))
  const rightBullets = slideData.bullets.slice(Math.ceil(midPoint))

  leftBullets.forEach((bullet, index) => {
    slide.addText(`• ${bullet}`, {
      x: 0.8,
      y: 1.5 + (index * 0.4),
      w: 4.2,
      h: 0.35,
      fontSize: bodyFont.size,
      fontFace: bodyFont.name,
      color: colorTheme.text,
    })
  })

  rightBullets.forEach((bullet, index) => {
    slide.addText(`• ${bullet}`, {
      x: 5.3,
      y: 1.5 + (index * 0.4),
      w: 4.2,
      h: 0.35,
      fontSize: bodyFont.size,
      fontFace: bodyFont.name,
      color: colorTheme.text,
    })
  })
}

function createImageLeftSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colorTheme: { bg: string; text: string },
  titleFont: { name: string; size: number; bold: boolean },
  bodyFont: { name: string; size: number; bold: boolean }
): void {
  slide.addText(slideData.slide_title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: titleFont.size,
    fontFace: titleFont.name,
    bold: titleFont.bold,
    color: colorTheme.text,
  })

  slideData.bullets.forEach((bullet, index) => {
    slide.addText(`• ${bullet}`, {
      x: 5.5,
      y: 1.5 + (index * 0.4),
      w: 4,
      h: 0.35,
      fontSize: bodyFont.size,
      fontFace: bodyFont.name,
      color: colorTheme.text,
    })
  })
}

function createImageRightSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colorTheme: { bg: string; text: string },
  titleFont: { name: string; size: number; bold: boolean },
  bodyFont: { name: string; size: number; bold: boolean }
): void {
  slide.addText(slideData.slide_title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: titleFont.size,
    fontFace: titleFont.name,
    bold: titleFont.bold,
    color: colorTheme.text,
  })

  slideData.bullets.forEach((bullet, index) => {
    slide.addText(`• ${bullet}`, {
      x: 0.8,
      y: 1.5 + (index * 0.4),
      w: 4,
      h: 0.35,
      fontSize: bodyFont.size,
      fontFace: bodyFont.name,
      color: colorTheme.text,
    })
  })
}
