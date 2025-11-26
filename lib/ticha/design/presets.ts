/**
 * Design Presets for Tichar AI
 * Predefined design templates for different presentation styles
 */

import { DesignPreset } from '../types'

export const DESIGN_PRESETS: Record<string, DesignPreset> = {
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    category: 'corporate',
    description: 'Professional, clean, and authoritative. Perfect for business presentations.',
    colorPalette: {
      primary: '1565C0', // Dark blue
      secondary: '424242', // Dark gray
      accent: '1976D2', // Medium blue
      background: ['FFFFFF', 'F5F5F5', 'E3F2FD', '424242'], // White, light gray, light blue, dark gray
      text: ['212121', 'FFFFFF'], // Dark gray, white
    },
    fonts: {
      title: 'Poppins',
      body: 'Inter',
    },
    layoutPreferences: {
      preferred: ['title-and-bullets', 'two-column'],
      avoid: ['image-left', 'image-right'],
    },
    iconStyle: 'outlined',
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    category: 'creative',
    description: 'Colorful, modern, and bold. Great for design portfolios and creative pitches.',
    colorPalette: {
      primary: 'E91E63', // Pink
      secondary: '9C27B0', // Purple
      accent: 'FF5722', // Orange
      background: ['FFFFFF', 'F3E5F5', 'FFF3E0', 'E1BEE7', 'FFE0B2'], // White, light purple, light orange, light purple, light orange
      text: ['212121', 'FFFFFF'], // Dark gray, white
    },
    fonts: {
      title: 'Poppins',
      body: 'Inter',
    },
    layoutPreferences: {
      preferred: ['title-only', 'image-left', 'image-right'],
      avoid: ['two-column'],
    },
    iconStyle: 'filled',
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'minimalist',
    description: 'Clean, simple, and elegant. Focus on content with minimal distractions.',
    colorPalette: {
      primary: '212121', // Dark gray
      secondary: '757575', // Medium gray
      accent: '000000', // Black
      background: ['FFFFFF', 'FAFAFA'], // White, off-white
      text: ['212121', '000000'], // Dark gray, black
    },
    fonts: {
      title: 'Inter',
      body: 'Inter',
    },
    layoutPreferences: {
      preferred: ['title-only', 'title-and-bullets'],
      avoid: ['image-left', 'image-right', 'two-column'],
    },
    iconStyle: 'minimal',
  },
  academic: {
    id: 'academic',
    name: 'Academic',
    category: 'academic',
    description: 'Formal, structured, and scholarly. Ideal for research and educational content.',
    colorPalette: {
      primary: '1A237E', // Deep indigo
      secondary: '37474F', // Blue gray
      accent: '0277BD', // Blue
      background: ['FFFFFF', 'ECEFF1', 'E3F2FD'], // White, light blue-gray, light blue
      text: ['212121', '37474F'], // Dark gray, blue-gray
    },
    fonts: {
      title: 'Poppins',
      body: 'Inter',
    },
    layoutPreferences: {
      preferred: ['title-and-bullets', 'two-column'],
      avoid: ['image-left', 'image-right'],
    },
    iconStyle: 'outlined',
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    category: 'marketing',
    description: 'Vibrant, attention-grabbing, and energetic. Perfect for sales and marketing pitches.',
    colorPalette: {
      primary: 'FF6F00', // Orange
      secondary: 'D32F2F', // Red
      accent: 'FBC02D', // Yellow
      background: ['FFFFFF', 'FFF3E0', 'FFE0B2', 'FBC02D'], // White, light orange, light orange, yellow
      text: ['212121', 'FFFFFF'], // Dark gray, white
    },
    fonts: {
      title: 'Poppins',
      body: 'Inter',
    },
    layoutPreferences: {
      preferred: ['title-only', 'image-left', 'image-right'],
      avoid: ['two-column'],
    },
    iconStyle: 'bold',
  },
}

/**
 * Get preset by ID
 */
export function getPreset(presetId: string): DesignPreset | undefined {
  return DESIGN_PRESETS[presetId]
}

/**
 * Get all presets
 */
export function getAllPresets(): DesignPreset[] {
  return Object.values(DESIGN_PRESETS)
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: string): DesignPreset[] {
  return Object.values(DESIGN_PRESETS).filter((p) => p.category === category)
}

/**
 * Get preset color palette as hex array
 */
export function getPresetColors(presetId: string): string[] {
  const preset = getPreset(presetId)
  if (!preset) return []
  
  return [
    preset.colorPalette.primary,
    preset.colorPalette.secondary,
    preset.colorPalette.accent,
    ...preset.colorPalette.background,
  ]
}

