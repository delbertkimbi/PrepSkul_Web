/**
 * TypeScript types for Tichar AI presentation system
 */

export interface SlideElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'bullet'
  content: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  style: {
    fontFamily?: string
    fontSize?: number
    fontWeight?: 'normal' | 'bold' | 'italic' | 'bold italic'
    color?: string
    backgroundColor?: string
    alignment?: 'left' | 'center' | 'right' | 'justify'
    lineHeight?: number
  }
}

export interface SlideData {
  id: string
  slide_number: number
  slide_title: string
  bullets: string[]
  design: DesignSpec
  elements?: SlideElement[] // For editor
}

export interface DesignSpec {
  background_color: 'light-blue' | 'dark-blue' | 'white' | 'gray' | 'green' | string
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

export interface PresentationData {
  id: string
  title: string
  author?: string
  company?: string
  slides: SlideData[]
  metadata?: {
    version: number
    created_at: string
    updated_at: string
  }
}

export interface RefinementHistory {
  version: number
  timestamp: string
  prompt: string
  designPreset?: string
  customDesignPrompt?: string
  changes: {
    slideCount?: number
    designChanges?: string[]
    contentChanges?: string[]
  }
  presentationUrl?: string
}

export interface DesignPreset {
  id: string
  name: string
  category: 'corporate' | 'creative' | 'minimalist' | 'academic' | 'marketing'
  description: string
  colorPalette: {
    primary: string
    secondary: string
    accent: string
    background: string[]
    text: string[]
  }
  fonts: {
    title: string
    body: string
  }
  layoutPreferences: {
    preferred: string[]
    avoid: string[]
  }
  iconStyle: 'minimal' | 'bold' | 'outlined' | 'filled'
  thumbnailUrl?: string
}

export interface DesignInspiration {
  id: string
  sourceUrl: string
  designData: {
    colorPalette: string[]
    layoutPatterns: string[]
    typography: {
      fonts: string[]
      sizes: number[]
    }
    styleKeywords: string[]
  }
  category: string
  scrapedAt: string
  imageUrl?: string
  keywords?: string[]
  extractedDesignSpec?: ExtractedDesign
  qualityScore?: number
  usageCount?: number
  uploadedBy?: string
}

export interface TypographySpec {
  fonts: string[]
  sizes: number[]
  weights: string[]
}

export interface SpacingSpec {
  margins: number[]
  padding: number[]
}

export interface ExtractedDesign {
  colorPalette: string[]
  typography: TypographySpec
  layoutPattern: string
  spacing: SpacingSpec
  styleKeywords: string[]
  qualityScore: number
  designSpec: DesignSpec
}

// Aggregated spec computed from multiple slides in a design set
export interface AggregatedDesignSpec {
  colorPalette: string[]
  typography: TypographySpec
  layoutPatterns: string[]
  spacing: SpacingSpec
  styleKeywords: string[]
  qualityScore: number
  designSpec: DesignSpec
}

// Static, hand-authored slide templates for fixed sequences
export interface ManualSlideTemplate {
  slideNumber: number
  role: 'title' | 'agenda' | 'section' | 'content' | 'image' | 'summary'
  design: DesignSpec
  imageQueryHint?: string
}

export interface ManualDesignSet {
  id: string
  name: string
  preset: 'business' | 'academic' | 'kids'
  topicKeywords: string[]
  description: string
  slides: ManualSlideTemplate[]
}

export interface MatchedDesign {
  designId: string
  matchScore: number
  keywords: string[]
  extractedDesign: ExtractedDesign | null
  category?: string
}

