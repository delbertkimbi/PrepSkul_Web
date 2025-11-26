/**
 * Editor Toolbar Component
 * Provides formatting and editing tools
 */

'use client'

import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Undo, Redo, Save, Plus, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/lib/ticha/editor/state'
import { Button } from '@/components/ui/button'
// Separator component - using div for now
const Separator = ({ orientation, className }: { orientation?: 'vertical' | 'horizontal', className?: string }) => (
  <div className={orientation === 'vertical' ? `w-px bg-gray-300 ${className}` : `h-px bg-gray-300 ${className}`} />
)

export function EditorToolbar() {
  const {
    selectedElementIds,
    updateElement,
    canUndo,
    canRedo,
    undo,
    redo,
    addSlide,
    removeSlide,
    currentSlideIndex,
    presentation,
    isSaving,
    setIsSaving,
    setLastSaved,
  } = useEditorStore()

  const selectedElement = presentation?.slides[currentSlideIndex]?.elements?.find(
    (el) => selectedElementIds.includes(el.id)
  )

  const handleBold = () => {
    if (selectedElement) {
      const currentWeight = selectedElement.style?.fontWeight || 'normal'
      const newWeight = currentWeight === 'bold' ? 'normal' : 'bold'
      updateElement(selectedElement.id, {
        style: { ...selectedElement.style, fontWeight: newWeight },
      })
    }
  }

  const handleItalic = () => {
    if (selectedElement) {
      const currentWeight = selectedElement.style?.fontWeight || 'normal'
      const newWeight = currentWeight === 'italic' ? 'normal' : 'italic'
      updateElement(selectedElement.id, {
        style: { ...selectedElement.style, fontWeight: newWeight },
      })
    }
  }

  const handleUnderline = () => {
    // Underline would be a text decoration property
    // For MVP, we'll skip this
  }

  const handleAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (selectedElement) {
      updateElement(selectedElement.id, {
        style: { ...selectedElement.style, alignment },
      })
    }
  }

  const handleSave = async () => {
    if (!presentation?.id) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/ticha/editor/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presentationId: presentation.id,
          presentationData: presentation,
          changes: {
            description: 'Manual edit via editor',
            type: 'content',
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save presentation. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSlide = () => {
    if (!presentation) return

    const newSlide = {
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
    }

    addSlide(newSlide)
  }

  const handleRemoveSlide = () => {
    if (!presentation || presentation.slides.length <= 1) {
      alert('Cannot remove the last slide')
      return
    }

    if (confirm('Are you sure you want to remove this slide?')) {
      removeSlide(currentSlideIndex)
    }
  }

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-2">
      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBold}
          disabled={!selectedElement}
          className={selectedElement?.style?.fontWeight === 'bold' ? 'bg-gray-100' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleItalic}
          disabled={!selectedElement}
          className={selectedElement?.style?.fontWeight === 'italic' ? 'bg-gray-100' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleUnderline}
          disabled={!selectedElement}
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Alignment */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAlignment('left')}
          disabled={!selectedElement}
          className={selectedElement?.style?.alignment === 'left' ? 'bg-gray-100' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAlignment('center')}
          disabled={!selectedElement}
          className={selectedElement?.style?.alignment === 'center' ? 'bg-gray-100' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAlignment('right')}
          disabled={!selectedElement}
          className={selectedElement?.style?.alignment === 'right' ? 'bg-gray-100' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Slide Operations */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={handleAddSlide} title="Add Slide">
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemoveSlide}
          disabled={!presentation || presentation.slides.length <= 1}
          title="Remove Slide"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1" />

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}

