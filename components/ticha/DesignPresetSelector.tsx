/**
 * Design Preset Selector Component
 * Visual selector for design presets
 */

'use client'

import { DESIGN_PRESETS, getAllPresets } from '@/lib/ticha/design/presets'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DesignPresetSelectorProps {
  selectedPreset?: string
  onSelect: (presetId: string) => void
  className?: string
}

export function DesignPresetSelector({
  selectedPreset,
  onSelect,
  className,
}: DesignPresetSelectorProps) {
  const presets = getAllPresets()

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-4', className)}>
      {presets.map((preset) => {
        const primaryColor = `#${preset.colorPalette.primary}`
        const secondaryColor = `#${preset.colorPalette.secondary}`
        const accentColor = `#${preset.colorPalette.accent}`

        return (
          <Card
            key={preset.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg',
              selectedPreset === preset.id
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'hover:border-gray-300'
            )}
            onClick={() => onSelect(preset.id)}
          >
            <CardContent className="p-4">
              {/* Color Preview */}
              <div className="flex gap-1 mb-3">
                <div
                  className="flex-1 h-8 rounded"
                  style={{ backgroundColor: primaryColor }}
                />
                <div
                  className="flex-1 h-8 rounded"
                  style={{ backgroundColor: secondaryColor }}
                />
                <div
                  className="flex-1 h-8 rounded"
                  style={{ backgroundColor: accentColor }}
                />
              </div>

              {/* Preset Info */}
              <div>
                <h4 className="font-semibold text-sm mb-1">{preset.name}</h4>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              {/* Category Badge */}
              <div className="mt-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {preset.category}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

