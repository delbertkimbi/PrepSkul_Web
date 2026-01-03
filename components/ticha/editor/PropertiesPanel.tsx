/**
 * Properties Panel Component
 * Allows editing of selected element properties
 */

'use client'

import { useEditorStore } from '@/lib/ticha/editor/state'
import { getAllPresets, getPreset } from '@/lib/ticha/design/presets'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PropertiesPanel() {
  const {
    currentSlide,
    selectedElementIds,
    updateElement,
    updateSlide,
    presentation,
  } = useEditorStore()

  const selectedElement = currentSlide?.elements?.find(
    (el) => selectedElementIds.includes(el.id)
  )

  const handleFontFamilyChange = (fontFamily: string) => {
    if (selectedElement) {
      updateElement(selectedElement.id, { style: { ...selectedElement.style, fontFamily } })
    }
  }

  const handleFontSizeChange = (fontSize: number) => {
    if (selectedElement) {
      updateElement(selectedElement.id, { style: { ...selectedElement.style, fontSize } })
    }
  }

  const handleColorChange = (color: string) => {
    if (selectedElement) {
      updateElement(selectedElement.id, { style: { ...selectedElement.style, color } })
    }
  }

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (selectedElement) {
      updateElement(selectedElement.id, { style: { ...selectedElement.style, alignment } })
    }
  }

  const handleBackgroundColorChange = (color: string) => {
    if (currentSlide) {
      updateSlide(
        presentation?.slides.findIndex((s) => s.id === currentSlide.id) || 0,
        {
          design: { ...currentSlide.design, background_color: color },
        }
      )
    }
  }

  const handlePresetChange = (presetId: string) => {
    const preset = getPreset(presetId)
    if (!preset || !currentSlide) return

    // Apply preset colors - use first slide color pattern
    const slideIndex = presentation?.slides.findIndex((s) => s.id === currentSlide.id) || 0
    const bgColor = preset.getBackgroundColor(slideIndex)
    const textColor = preset.getTextColor(bgColor)
    
    updateSlide(
      slideIndex,
      {
        design: {
          ...currentSlide.design,
          background_color: bgColor,
          text_color: textColor,
          fontFamily: preset.fonts.title.name,
          fontSize: slideIndex === 0 ? preset.fonts.title.size : preset.fonts.title.size - 8,
        },
      }
    )
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Properties</h3>

      {selectedElement ? (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="font-family">Font Family</Label>
              <Select
                value={selectedElement.style?.fontFamily || 'Inter'}
                onValueChange={handleFontFamilyChange}
              >
                <SelectTrigger id="font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Montserrat">Montserrat (Business Template)</SelectItem>
                  <SelectItem value="Open Sans">Open Sans (Business Template)</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                type="number"
                value={selectedElement.style?.fontSize || 18}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                min="8"
                max="72"
              />
            </div>

            <div>
              <Label htmlFor="text-color">Text Color</Label>
              <Input
                id="text-color"
                type="color"
                value={selectedElement.style?.color || '#000000'}
                onChange={(e) => handleColorChange(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="alignment">Alignment</Label>
              <Select
                value={selectedElement.style?.alignment || 'left'}
                onValueChange={handleAlignmentChange}
              >
                <SelectTrigger id="alignment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="slide-bg-color">Slide Background</Label>
              <Input
                id="slide-bg-color"
                type="color"
                value={
                  currentSlide?.design.background_color.startsWith('#')
                    ? currentSlide.design.background_color
                    : currentSlide?.design.background_color || '#FFFFFF'
                }
                onChange={(e) => handleBackgroundColorChange(e.target.value.replace('#', ''))}
              />
            </div>

            <div>
              <Label htmlFor="design-preset">Design Preset</Label>
              <Select
                value={(presentation?.metadata as any)?.designPreset || ''}
                onValueChange={handlePresetChange}
              >
                <SelectTrigger id="design-preset">
                  <SelectValue placeholder="Select preset" />
                </SelectTrigger>
                <SelectContent>
                  {getAllPresets().map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Select an element to edit its properties
            </p>
          </div>
        </>
      )}
    </div>
  )
}

