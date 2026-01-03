/**
 * Slide Thumbnails Component
 * Shows mini previews of all slides with navigation
 */

'use client'

import { useEditorStore } from '@/lib/ticha/editor/state'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SlideThumbnails() {
  const {
    presentation,
    currentSlideIndex,
    setCurrentSlideIndex,
    addSlide,
    removeSlide,
  } = useEditorStore()

  if (!presentation) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <p className="text-gray-500 text-sm">No presentation loaded</p>
      </div>
    )
  }

  const getBackgroundColor = (color: string | undefined): string => {
    if (!color) return '#FF8A00' // Business template orange default
    
    // Handle hex codes
    if (color.startsWith('#')) {
      return color
    }

    // Map old colors to business template
    const colorMap: Record<string, string> = {
      'light-blue': '#FF8A00', // Business orange
      'dark-blue': '#2D3542',   // Business dark blue
      'white': '#FFFFFF',
      'gray': '#FFFFFF',
      'green': '#FF8A00',       // Business orange
      'orange': '#FF8A00',
      'dark-gray-blue': '#2D3542',
    }
    
    // If it's an old gradient color, use business template
    if (color.includes('667eea') || color.includes('764ba2') || color.includes('1e3c72')) {
      return '#FF8A00'
    }
    
    return colorMap[color] || '#FF8A00'
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Slides</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addSlide({
            id: `slide-${presentation.slides.length + 1}`,
            slide_number: presentation.slides.length + 1,
            slide_title: 'New Slide',
            bullets: [],
            design: {
              background_color: 'white',
              text_color: 'black',
              layout: 'title-and-bullets',
              icon: 'none',
            },
          })}
          className="h-6 w-6"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-2">
        {presentation.slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'relative group cursor-pointer rounded-lg border-2 p-2 transition-all',
              index === currentSlideIndex
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
            onClick={() => setCurrentSlideIndex(index)}
          >
            {/* Slide Preview */}
            <div
              className="aspect-video rounded bg-white shadow-sm overflow-hidden"
              style={{
                backgroundColor: getBackgroundColor(slide.design.background_color),
              }}
            >
              <div className="p-2 h-full flex flex-col">
                <div
                  className="text-xs font-bold truncate mb-1"
                  style={{
                    color: slide.design.text_color === 'white' ? '#FFFFFF' : '#000000',
                  }}
                >
                  {slide.slide_title || 'Untitled'}
                </div>
                <div className="flex-1 space-y-0.5">
                  {slide.bullets.slice(0, 3).map((bullet, i) => (
                    <div
                      key={i}
                      className="text-xs truncate"
                      style={{
                        color: slide.design.text_color === 'white' ? '#FFFFFF' : '#000000',
                      }}
                    >
                      • {bullet}
                    </div>
                  ))}
                  {slide.bullets.length > 3 && (
                    <div
                      className="text-xs text-gray-400"
                      style={{
                        color: slide.design.text_color === 'white' ? '#CCCCCC' : '#666666',
                      }}
                    >
                      +{slide.bullets.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Slide Number */}
            <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
              {index + 1}
            </div>

            {/* Delete Button */}
            {presentation.slides.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Delete this slide?')) {
                    removeSlide(index)
                  }
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

