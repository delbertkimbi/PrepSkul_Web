/**
 * Slide Canvas Component
 * Renders and allows editing of slide content
 * Uses native Canvas API (fabric.js removed due to canvas dependency issues)
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/lib/ticha/editor/state'
import type { SlideElement } from '@/lib/ticha/types'

export function SlideCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentSlide } = useEditorStore()

  useEffect(() => {
    if (!canvasRef.current || !currentSlide) return
    renderSlide()
  }, [currentSlide?.id])

  const renderSlide = () => {
    if (!canvasRef.current || !currentSlide) return
    
    // Set canvas size
    canvasRef.current.width = 960
    canvasRef.current.height = 540
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, 960, 540)
    
    // Set background
    ctx.fillStyle = getBackgroundColor(currentSlide.design.background_color)
    ctx.fillRect(0, 0, 960, 540)

    // Draw title
    if (currentSlide.slide_title) {
      ctx.fillStyle = currentSlide.design.text_color === 'white' ? '#FFFFFF' : '#000000'
      ctx.font = 'bold 44px Poppins, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(currentSlide.slide_title, 480, 150)
    }

    // Draw bullets
    ctx.font = '18px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillStyle = currentSlide.design.text_color === 'white' ? '#FFFFFF' : '#000000'
    
    currentSlide.bullets?.forEach((bullet: string, index: number) => {
      ctx.fillText(`• ${bullet}`, 96, 250 + index * 60, 768)
    })
  }

  const getBackgroundColor = (color: string): string => {
    const colorMap: Record<string, string> = {
      'light-blue': '#E3F2FD',
      'dark-blue': '#1565C0',
      white: '#FFFFFF',
      gray: '#F5F5F5',
      green: '#C8E6C9',
    }
    return colorMap[color] || (color.startsWith('#') ? color : `#${color}`)
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
