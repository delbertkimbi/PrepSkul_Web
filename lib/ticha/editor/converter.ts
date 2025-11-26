/**
 * PPT Converter
 * Converts between PPTX format and editable JSON format
 */

import PptxGenJS from 'pptxgenjs'
import type { PresentationData, SlideData, SlideElement } from '../types'

/**
 * Convert PPTX buffer to editable PresentationData format
 * Note: This is a simplified version. Full implementation would parse PPTX structure
 */
export async function pptxToEditable(pptxBuffer: Buffer): Promise<PresentationData> {
  // For MVP: This is a placeholder
  // Full implementation would:
  // 1. Parse PPTX file structure
  // 2. Extract slides, text, images, shapes
  // 3. Convert to PresentationData format
  
  console.log('[Converter] Converting PPTX to editable format')
  console.log('[Converter] MVP: Full PPTX parsing not implemented')
  
  // Return empty structure - in production, parse actual PPTX
  return {
    id: '',
    title: 'Imported Presentation',
    slides: [],
    metadata: {
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  }
}

/**
 * Convert editable PresentationData to PPTX buffer
 * Uses existing createPPT function
 */
export async function editableToPptx(
  data: PresentationData
): Promise<Buffer> {
  const { createPPT } = await import('../ppt/createPPT')
  
  const slides = data.slides.map((slide) => ({
    slide_title: slide.slide_title,
    bullets: slide.bullets,
    design: slide.design,
  }))

  const buffer = await createPPT({
    title: data.title,
    author: data.author,
    company: data.company,
    slides: slides as any,
  })

  return buffer
}

/**
 * Extract slide elements from existing slide data
 * Converts slide structure to editable elements
 */
export function slideToElements(slide: SlideData): SlideElement[] {
  const elements: SlideElement[] = []

  // Add title element
  if (slide.slide_title) {
    elements.push({
      id: `title-${slide.slide_number}`,
      type: 'text',
      content: slide.slide_title,
      position: {
        x: 0.5,
        y: 0.5,
        width: 9,
        height: 1,
      },
      style: {
        fontFamily: 'Poppins',
        fontSize: 44,
        fontWeight: 'bold',
        color: slide.design.text_color === 'white' ? '#FFFFFF' : '#000000',
        alignment: 'center',
      },
    })
  }

  // Add bullet elements
  slide.bullets.forEach((bullet, index) => {
    elements.push({
      id: `bullet-${slide.slide_number}-${index}`,
      type: 'bullet',
      content: bullet,
      position: {
        x: 1,
        y: 2 + index * 0.8,
        width: 8,
        height: 0.6,
      },
      style: {
        fontFamily: 'Inter',
        fontSize: 18,
        color: slide.design.text_color === 'white' ? '#FFFFFF' : '#000000',
        alignment: 'left',
      },
    })
  })

  return elements
}

/**
 * Convert elements back to slide structure
 */
export function elementsToSlide(
  elements: SlideElement[],
  baseSlide: SlideData
): SlideData {
  const titleElement = elements.find((el) => el.type === 'text' && el.id.includes('title'))
  const bulletElements = elements.filter((el) => el.type === 'bullet')

  return {
    ...baseSlide,
    slide_title: titleElement?.content || baseSlide.slide_title,
    bullets: bulletElements.map((el) => el.content),
    elements,
  }
}

