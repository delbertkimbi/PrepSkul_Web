/**
 * Design Presets for TichaAI
 * Three stunning presets: Business, Academic, Kids
 */

export type DesignPreset = 'business' | 'academic' | 'kids'

export interface DesignPresetConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    text: { light: string; dark: string }
  }
  fonts: {
    title: { name: string; size: number; weight: number }
    body: { name: string; size: number; weight: number }
  }
  getBackgroundColor: (index: number) => string
  getTextColor: (bgColor: string) => string
}

export const DESIGN_PRESETS: Record<DesignPreset, DesignPresetConfig> = {
  business: {
    colors: {
      primary: '#FF8A00',      // Vibrant orange
      secondary: '#2D3542',     // Dark blue-gray
      accent: '#FFFFFF',        // White
      text: { light: '#FFFFFF', dark: '#000000' },
    },
    fonts: {
      title: { name: 'Montserrat', size: 48, weight: 700 },
      body: { name: 'Open Sans', size: 18, weight: 400 },
    },
    getBackgroundColor: (index: number) => {
      return index === 0 ? '#FF8A00' : (index % 2 === 0 ? '#2D3542' : '#FFFFFF')
    },
    getTextColor: (bgColor: string) => {
      return bgColor === '#FFFFFF' ? '#000000' : '#FFFFFF'
    },
  },
  academic: {
    colors: {
      primary: '#1a365d',       // Deep blue
      secondary: '#2d4a5c',      // Slate blue
      accent: '#f7fafc',        // Light gray
      text: { light: '#FFFFFF', dark: '#1a202c' },
    },
    fonts: {
      title: { name: 'Georgia', size: 44, weight: 600 },
      body: { name: 'Merriweather', size: 16, weight: 400 },
    },
    getBackgroundColor: (index: number) => {
      return index === 0 ? '#1a365d' : (index % 2 === 0 ? '#2d4a5c' : '#f7fafc')
    },
    getTextColor: (bgColor: string) => {
      return bgColor === '#f7fafc' ? '#1a202c' : '#FFFFFF'
    },
  },
  kids: {
    colors: {
      primary: '#FF6B9D',       // Pink
      secondary: '#4ECDC4',     // Turquoise
      accent: '#FFE66D',       // Yellow
      text: { light: '#FFFFFF', dark: '#2d3748' },
    },
    fonts: {
      title: { name: 'Comic Sans MS', size: 42, weight: 700 },
      body: { name: 'Nunito', size: 20, weight: 500 },
    },
    getBackgroundColor: (index: number) => {
      const colors = ['#FF6B9D', '#4ECDC4', '#FFE66D']
      return colors[index % colors.length]
    },
    getTextColor: (bgColor: string) => {
      return bgColor === '#FFE66D' ? '#2d3748' : '#FFFFFF'
    },
  },
}

/**
 * Get all presets as an array with metadata
 */
export function getAllPresets() {
  return [
    {
      id: 'business',
      name: 'Business',
      description: 'Professional, modern, and energetic. Perfect for corporate presentations and business proposals.',
      category: 'Professional',
      colorPalette: {
        primary: 'FF8A00',
        secondary: '2D3542',
        accent: 'FFFFFF',
      },
    },
    {
      id: 'academic',
      name: 'Academic',
      description: 'Scholarly and structured. Ideal for research presentations, thesis defenses, and educational content.',
      category: 'Educational',
      colorPalette: {
        primary: '1a365d',
        secondary: '2d4a5c',
        accent: 'f7fafc',
      },
    },
    {
      id: 'kids',
      name: 'Kids',
      description: 'Colorful, fun, and engaging. Perfect for children\'s presentations with emojis and vibrant colors.',
      category: 'Fun',
      colorPalette: {
        primary: 'FF6B9D',
        secondary: '4ECDC4',
        accent: 'FFE66D',
      },
    },
  ]
}

/**
 * Get a specific preset by ID
 */
export function getPreset(id: string): DesignPresetConfig | null {
  if (id in DESIGN_PRESETS) {
    return DESIGN_PRESETS[id as DesignPreset]
  }
  return null
}

/**
 * Apply design preset to slides
 */
export function applyDesignPreset(
  slides: Array<{ slide_title: string; bullets: string[]; design: any }>,
  preset: DesignPreset
): Array<{ slide_title: string; bullets: string[]; design: any }> {
  const config = DESIGN_PRESETS[preset]
  
  return slides.map((slide, index) => {
    const bgColor = config.getBackgroundColor(index)
    const textColor = config.getTextColor(bgColor)
    
    return {
      ...slide,
      design: {
        ...slide.design,
        background_color: bgColor,
        text_color: textColor,
        fontFamily: config.fonts.title.name,
        fontSize: index === 0 ? config.fonts.title.size : config.fonts.title.size - 8,
      },
    }
  })
}
