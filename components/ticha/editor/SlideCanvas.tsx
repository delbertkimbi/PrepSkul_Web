/**
 * Slide Canvas Component
 * Renders slides using Business Template design system
 */

'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/lib/ticha/editor/state'

// Business Template Colors
const BUSINESS_COLORS = {
  orange: '#FF8A00',
  darkBlue: '#2D3542',
  white: '#FFFFFF',
  black: '#000000',
} as const

// Business Template Fonts
const BUSINESS_FONTS = {
  title: { name: 'Montserrat', size: 48 },
  body: { name: 'Open Sans', size: 18 },
} as const

export function SlideCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentSlide } = useEditorStore()

  useEffect(() => {
    if (!canvasRef.current || !currentSlide) return
    renderSlide()
  }, [currentSlide?.id, currentSlide?.design])

  const getBackgroundColor = (color: string | undefined): string => {
    if (!color) return BUSINESS_COLORS.orange

    // Handle hex codes
    if (color.startsWith('#')) {
      return color
    }

    // Map old colors to business template
    const colorMap: Record<string, string> = {
      'light-blue': BUSINESS_COLORS.orange,
      'dark-blue': BUSINESS_COLORS.darkBlue,
      'white': BUSINESS_COLORS.white,
      'gray': BUSINESS_COLORS.white,
      'green': BUSINESS_COLORS.orange,
      'orange': BUSINESS_COLORS.orange,
      'dark-gray-blue': BUSINESS_COLORS.darkBlue,
    }

    // If it's an old gradient color, use business template
    if (color.includes('667eea') || color.includes('764ba2') || color.includes('1e3c72')) {
      return BUSINESS_COLORS.orange
    }

    return colorMap[color] || BUSINESS_COLORS.orange
  }

  const getTextColor = (bgColor: string, designTextColor?: string): string => {
    if (designTextColor === 'black') return BUSINESS_COLORS.black
    if (designTextColor === 'white') return BUSINESS_COLORS.white
    
    // Auto-determine based on background brightness
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    
    return brightness > 128 ? BUSINESS_COLORS.black : BUSINESS_COLORS.white
  }

  const getFontFamily = (designFont?: string): string => {
    return designFont || BUSINESS_FONTS.title.name
  }

  const getFontSize = (type: 'title' | 'body', designFontSize?: number): number => {
    if (designFontSize) return designFontSize
    return type === 'title' ? BUSINESS_FONTS.title.size : BUSINESS_FONTS.body.size
  }

  const renderSlide = () => {
    if (!canvasRef.current || !currentSlide) return
    
    const canvas = canvasRef.current
    canvas.width = 960
    canvas.height = 540
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, 960, 540)
    
    // Get colors
    const bgColor = getBackgroundColor(currentSlide.design?.background_color)
    const textColor = getTextColor(bgColor, currentSlide.design?.text_color)
    
    // Set background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, 960, 540)

    // Get fonts from design or use business template defaults
    // Title uses Montserrat, body uses Open Sans
    const titleFont = currentSlide.design?.fontFamily || BUSINESS_FONTS.title.name
    const titleSize = getFontSize('title', currentSlide.design?.fontSize)
    const bodyFont = BUSINESS_FONTS.body.name // Always use Open Sans for body
    const bodySize = getFontSize('body')

    // Draw title
    if (currentSlide.slide_title) {
      ctx.fillStyle = textColor
      ctx.font = `bold ${titleSize}px ${titleFont}, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Word wrap for title
      const words = currentSlide.slide_title.split(' ')
      const lines: string[] = []
      let currentLine = ''
      const maxWidth = 800
      
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      })
      if (currentLine) lines.push(currentLine)
      
      const startY = lines.length === 1 ? 150 : 120
      lines.forEach((line, index) => {
        ctx.fillText(line, 480, startY + (index * (titleSize + 10)), 800)
      })
    }

    // Draw bullets
    if (currentSlide.bullets && currentSlide.bullets.length > 0) {
      ctx.font = `${bodySize}px ${bodyFont}, sans-serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillStyle = textColor
      
      const startY = currentSlide.slide_title ? 280 : 200
      const lineHeight = bodySize + 12
      const maxWidth = 768
      
      currentSlide.bullets.forEach((bullet, index) => {
        const y = startY + (index * lineHeight)
        const bulletText = `• ${bullet}`
        
        // Word wrap for bullets
        const words = bulletText.split(' ')
        let currentLine = ''
        let lineY = y
        
        words.forEach(word => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && currentLine) {
            ctx.fillText(currentLine, 96, lineY, maxWidth)
            currentLine = word
            lineY += lineHeight
          } else {
            currentLine = testLine
          }
        })
        if (currentLine) {
          ctx.fillText(currentLine, 96, lineY, maxWidth)
        }
      })
    }
  }

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">No slide selected</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="border border-gray-300"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  )
}
