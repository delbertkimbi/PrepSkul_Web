/**
 * Manual Template Selector
 * Shows the 3 fixed design templates (Business, Academic, Kids)
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { getManualDesignSet, MANUAL_DESIGN_SETS } from '@/lib/ticha/design/manual-sets'
import { cn } from '@/lib/utils'

interface ManualTemplateSelectorProps {
  selectedTemplate?: string
  onSelect: (templateId: string) => void
  className?: string
}

export function ManualTemplateSelector({
  selectedTemplate,
  onSelect,
  className,
}: ManualTemplateSelectorProps) {
  const templates = [
    MANUAL_DESIGN_SETS.business_v1,
    MANUAL_DESIGN_SETS.academic_v1,
    MANUAL_DESIGN_SETS.kids_v1,
  ].filter(Boolean)

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      {templates.map((template) => {
        if (!template) return null
        
        const firstSlide = template.slides[0]
        const bgColor = firstSlide?.design?.background_color || '#FF8A00'
        const textColor = firstSlide?.design?.text_color || '#FFFFFF'
        const primaryColor = firstSlide?.design?.customColors?.primary || bgColor
        const secondaryColor = firstSlide?.design?.customColors?.secondary || '#2D3542'
        const accentColor = firstSlide?.design?.customColors?.accent || '#FFFFFF'

        return (
          <Card
            key={template.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-xl border-2',
              selectedTemplate === template.id
                ? 'ring-4 ring-blue-500 border-blue-500 shadow-2xl scale-105'
                : 'hover:border-gray-400 hover:scale-102'
            )}
            onClick={() => onSelect(template.preset || template.id.replace('_v1', ''))}
          >
            <CardContent className="p-6">
              {/* Preview Box */}
              <div
                className="w-full h-32 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: bgColor }}
              >
                <div className="absolute inset-0 opacity-20" style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                }} />
                <div className="relative z-10 text-center px-4">
                  <div
                    className="font-bold text-2xl mb-2"
                    style={{
                      color: textColor,
                      fontFamily: firstSlide?.design?.fontFamily || 'Montserrat',
                    }}
                  >
                    {template.name}
                  </div>
                  <div className="text-xs opacity-80" style={{ color: textColor }}>
                    {template.slides.length} slides
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div className="flex gap-1 mb-3">
                <div
                  className="flex-1 h-6 rounded"
                  style={{ backgroundColor: primaryColor }}
                  title="Primary"
                />
                <div
                  className="flex-1 h-6 rounded"
                  style={{ backgroundColor: secondaryColor }}
                  title="Secondary"
                />
                <div
                  className="flex-1 h-6 rounded"
                  style={{ backgroundColor: accentColor }}
                  title="Accent"
                />
              </div>

              {/* Template Info */}
              <div>
                <h4 className="font-bold text-lg mb-1">{template.name}</h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.topicKeywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected Badge */}
              {selectedTemplate === template.id && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Selected Template
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

