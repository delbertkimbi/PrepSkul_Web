/**
 * PowerPoint Presentation Generation
 * Creates beautiful, design-focused presentations using pptxgenjs
 * Emphasizes templates, themes, and visual design
 */

import PptxGenJS from 'pptxgenjs'

export interface SlideDesign {
  background_color: 'light-blue' | 'dark-blue' | 'white' | 'gray' | 'green'
  text_color: 'black' | 'white'
  layout: 'title-only' | 'title-and-bullets' | 'two-column' | 'image-left' | 'image-right'
  icon: 'none' | 'book' | 'idea' | 'warning' | 'check'
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

// Color palette for TichaAI brand
const COLORS = {
  'light-blue': { bg: 'E3F2FD', text: '000000' }, // Light blue background, black text
  'dark-blue': { bg: '1565C0', text: 'FFFFFF' },  // Dark blue background, white text
  'white': { bg: 'FFFFFF', text: '000000' },      // White background, black text
  'gray': { bg: 'F5F5F5', text: '212121' },       // Light gray background, dark gray text
  'green': { bg: 'C8E6C9', text: '1B5E20' },      // Light green background, dark green text
} as const

// Brand fonts and styles
const BRAND_FONTS = {
  title: { name: 'Poppins', size: 44, bold: true },
  subtitle: { name: 'Poppins', size: 32, bold: true },
  body: { name: 'Inter', size: 18 },
  bullet: { name: 'Inter', size: 16 },
}

// Icon Unicode characters (fallback if icons can't be used)
const ICONS = {
  'none': '',
  'book': '📚',
  'idea': '💡',
  'warning': '⚠️',
  'check': '✓',
} as const

/**
 * Create a PowerPoint presentation with rich design and themes
 */
export async function createPPT(options: PresentationOptions): Promise<Buffer> {
  const pptx = new PptxGenJS()

  // Presentation metadata
  pptx.author = options.author || 'TichaAI'
  pptx.company = options.company || 'TichaAI'
  pptx.title = options.title || 'TichaAI Presentation'
  pptx.revision = '1'

  // Master slide layout (applies to all slides)
  pptx.defineLayout({
    name: 'TICHA_WIDE',
    width: 10,
    height: 5.625, // 16:9 aspect ratio
  })
  pptx.layout = 'TICHA_WIDE'

  // Set the default slide background color directly as defineMasterSlide does not exist
  // (see: https://gitbrent.github.io/PptxGenJS/docs/api-slaye/#background)
  // Will apply per slide below as needed


  // Create slides
  for (let i = 0; i < options.slides.length; i++) {
    const slideData = options.slides[i]
    const slide = pptx.addSlide()

    // Apply design theme
    const colorTheme = COLORS[slideData.design.background_color]
    slide.background = { color: colorTheme.bg }

    // Create slide based on layout type
    switch (slideData.design.layout) {
      case 'title-only':
        await createTitleOnlySlide(slide, slideData, colorTheme)
        break
      case 'title-and-bullets':
        await createTitleBulletsSlide(slide, slideData, colorTheme)
        break
      case 'two-column':
        await createTwoColumnSlide(slide, slideData, colorTheme)
        break
      case 'image-left':
        await createImageLeftSlide(slide, slideData, colorTheme)
        break
      case 'image-right':
        await createImageRightSlide(slide, slideData, colorTheme)
        break
    }
  }

  // Generate and return as buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' })
  return Buffer.from(buffer as ArrayBuffer)
}

/**
 * Title-only slide (for impactful opening/closing slides)
 */
function createTitleOnlySlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colorTheme: { bg: string; text: string }
): void {
  // Large centered title
  slide.addText(slideData.slide_title, {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1.5,
    align: 'center',
    valign: 'middle',
    fontSize: BRAND_FONTS.title.size,
    fontFace: BRAND_FONTS.title.name,
    bold: BRAND_FONTS.title.bold,
    color: colorTheme.text,
    lineSpacing: 32,
  })

  // Add icon if specified
  if (slideData.design.icon !== 'none') {
    const iconText = ICONS[slideData.design.icon]
    if (iconText) {
      slide.addText(iconText, {
        x: 4.5,
        y: 0.5,
        w: 1,
        h: 1,
        align: 'center',
        valign: 'middle',
        fontSize: 72,
        color: colorTheme.text,
      })
    }
  }

  // Add subtle decorative elements
  addDecorativeElements(slide, colorTheme)
}

/**
 * Title and bullets slide (standard content)
 */
function createTitleBulletsSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colorTheme: { bg: string; text: string }
): void {
  // Title
  slide.addText(slideData.slide_title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: BRAND_FONTS.subtitle.size,
    fontFace: BRAND_FONTS.subtitle.name,
    bold: BRAND_FONTS.subtitle.bold,
    color: colorTheme.text,
  })

  // Icon next to title (if specified)
  if (slideData.design.icon !== 'none') {
    const iconText = ICONS[slideData.design.icon]
    if (iconText) {
      slide.addText(iconText, {
        x: 8.5,
        y: 0.5,
        w: 1,
        h: 0.8,
        align: 'center',
        valign: 'middle',
        fontSize: 36,
        color: colorTheme.text,
      })
    }
  }

  // Bullet points
  if (slideData.bullets.length > 0) {
    const bulletYStart = 1.6
    const bulletHeight = 3.5
    const maxBullets = Math.min(slideData.bullets.length, 6)

    slideData.bullets.slice(0, maxBullets).forEach((bullet, index) => {
      const yPos = bulletYStart + (index * (bulletHeight / maxBullets))
      
      slide.addText(`• ${bullet}`, {
        x: 0.8,
        y: yPos,
        w: 8.5,
        h: bulletHeight / maxBullets - 0.1,
        fontSize: BRAND_FONTS.bullet.size,
        fontFace: BRAND_FONTS.bullet.name,
        color: colorTheme.text,
        bullet: { type: 'number', code: '1.' },
        lineSpacing: 24,
      })
    })
  }

  addDecorativeElements(slide, colorTheme)
}

/**
 * Two-column slide (for comparisons or side-by-side content)
 */
function createTwoColumnSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colorTheme: { bg: string; text: string }
): void {
  // Title
  slide.addText(slideData.slide_title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: BRAND_FONTS.subtitle.size,
    fontFace: BRAND_FONTS.subtitle.name,
    bold: BRAND_FONTS.subtitle.bold,
    color: colorTheme.text,
    align: 'center',
  })

  // Split bullets into two columns
  const midPoint = Math.ceil(slideData.bullets.length / 2)
  const leftBullets = slideData.bullets.slice(0, midPoint)
  const rightBullets = slideData.bullets.slice(midPoint)

  // Left column
  if (leftBullets.length > 0) {
    slide.addText(leftBullets.map(b => `• ${b}`).join('\n'), {
      x: 0.5,
      y: 1.6,
      w: 4.25,
      h: 3.5,
      fontSize: BRAND_FONTS.bullet.size,
      fontFace: BRAND_FONTS.bullet.name,
      color: colorTheme.text,
      lineSpacing: 20,
    })
  }

  // Right column
  if (rightBullets.length > 0) {
    slide.addText(rightBullets.map(b => `• ${b}`).join('\n'), {
      x: 5.25,
      y: 1.6,
      w: 4.25,
      h: 3.5,
      fontSize: BRAND_FONTS.bullet.size,
      fontFace: BRAND_FONTS.bullet.name,
      color: colorTheme.text,
      lineSpacing: 20,
    })
  }

  // Add divider line

  slide.addShape('rect' as any, {

    x: 4.95,
    y: 1.6,
    w: 0.1,
    h: 3.5,
    fill: { color: colorTheme.text, transparency: 50 },
  })

  addDecorativeElements(slide, colorTheme)
}

/**
 * Image-left slide (visual-heavy with supporting text)
 */
function createImageLeftSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colorTheme: { bg: string; text: string }
): void {
  // Title
  slide.addText(slideData.slide_title, {
    x: 5.5,
    y: 0.5,
    w: 4,
    h: 0.8,
    fontSize: BRAND_FONTS.subtitle.size,
    fontFace: BRAND_FONTS.subtitle.name,
    bold: BRAND_FONTS.subtitle.bold,
    color: colorTheme.text,
  })

  // Placeholder for image (left side)

  slide.addShape('rect' as any, {

    x: 0.5,
    y: 1.6,
    w: 4,
    h: 3.5,
    fill: { color: colorTheme.bg, transparency: 20 },
    line: { color: colorTheme.text, width: 2, dashType: 'dash' },
  })

  slide.addText('[Image Placeholder]', {
    x: 0.5,
    y: 3.35,
    w: 4,
    h: 0.5,
    fontSize: 12,
    color: colorTheme.text,
    align: 'center',
    valign: 'middle',
    italic: true,
    transparency: 50,
  })

  // Bullets on right side
  if (slideData.bullets.length > 0) {
    const bulletYStart = 1.6
    const bulletText = slideData.bullets.map(b => `• ${b}`).join('\n')

    slide.addText(bulletText, {
      x: 5.5,
      y: bulletYStart,
      w: 4,
      h: 3.5,
      fontSize: BRAND_FONTS.bullet.size,
      fontFace: BRAND_FONTS.bullet.name,
      color: colorTheme.text,
      lineSpacing: 20,
    })
  }

  addDecorativeElements(slide, colorTheme)
}

/**
 * Image-right slide (content-first with supporting visual)
 */
function createImageRightSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colorTheme: { bg: string; text: string }
): void {
  // Title
  slide.addText(slideData.slide_title, {
    x: 0.5,
    y: 0.5,
    w: 4,
    h: 0.8,
    fontSize: BRAND_FONTS.subtitle.size,
    fontFace: BRAND_FONTS.subtitle.name,
    bold: BRAND_FONTS.subtitle.bold,
    color: colorTheme.text,
  })

  // Bullets on left side
  if (slideData.bullets.length > 0) {
    const bulletText = slideData.bullets.map(b => `• ${b}`).join('\n')

    slide.addText(bulletText, {
      x: 0.5,
      y: 1.6,
      w: 4,
      h: 3.5,
      fontSize: BRAND_FONTS.bullet.size,
      fontFace: BRAND_FONTS.bullet.name,
      color: colorTheme.text,
      lineSpacing: 20,
    })
  }

  // Placeholder for image (right side)

  slide.addShape('rect' as any, {

    x: 5.5,
    y: 1.6,
    w: 4,
    h: 3.5,
    fill: { color: colorTheme.bg, transparency: 20 },
    line: { color: colorTheme.text, width: 2, dashType: 'dash' },
  })

  slide.addText('[Image Placeholder]', {
    x: 5.5,
    y: 3.35,
    w: 4,
    h: 0.5,
    fontSize: 12,
    color: colorTheme.text,
    align: 'center',
    valign: 'middle',
    italic: true,
    transparency: 50,
  })

  addDecorativeElements(slide, colorTheme)
}

/**
 * Add decorative elements for visual polish
 */
function addDecorativeElements(
  slide: PptxGenJS.Slide,
  colorTheme: { bg: string; text: string }
): void {
  // Subtle corner accent (top-right)

  slide.addShape('rect' as any, {
=======

    x: 9.5,
    y: 0,
    w: 0.5,
    h: 0.3,
    fill: { color: colorTheme.text, transparency: 20 },
    rotate: 45,
  })


  slide.addShape('rect' as any, {
    x: 0,
    y: 5.3,
    w: 10,
    h: 0.05,
    fill: { color: colorTheme.text, transparency: 30 },
  })
}

