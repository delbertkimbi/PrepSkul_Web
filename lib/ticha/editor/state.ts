/**
 * Editor State Management using Zustand
 */

import { create } from 'zustand'
import type { PresentationData, SlideData, SlideElement } from '../types'

interface EditorState {
  // Presentation data
  presentation: PresentationData | null
  setPresentation: (presentation: PresentationData) => void

  // Current slide
  currentSlideIndex: number
  setCurrentSlideIndex: (index: number) => void
  currentSlide: SlideData | null

  // Selected elements
  selectedElementIds: string[]
  setSelectedElementIds: (ids: string[]) => void
  addSelectedElement: (id: string) => void
  removeSelectedElement: (id: string) => void
  clearSelection: () => void

  // Undo/Redo
  history: PresentationData[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  saveToHistory: () => void

  // Editor operations
  updateSlide: (slideIndex: number, slide: Partial<SlideData>) => void
  updateElement: (elementId: string, updates: Partial<SlideElement>) => void
  addElement: (slideIndex: number, element: SlideElement) => void
  removeElement: (elementId: string) => void
  addSlide: (slide: SlideData) => void
  removeSlide: (slideIndex: number) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void

  // UI state
  isSaving: boolean
  setIsSaving: (saving: boolean) => void
  lastSaved: Date | null
  setLastSaved: (date: Date) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Presentation data
  presentation: null,
  setPresentation: (presentation) => {
    set({ presentation, history: [presentation], historyIndex: 0 })
  },

  // Current slide
  currentSlideIndex: 0,
  setCurrentSlideIndex: (index) => {
    const { presentation } = get()
    if (presentation && index >= 0 && index < presentation.slides.length) {
      set({ currentSlideIndex: index })
    }
  },
  get currentSlide() {
    const { presentation, currentSlideIndex } = get()
    return presentation?.slides[currentSlideIndex] || null
  },

  // Selected elements
  selectedElementIds: [],
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
  addSelectedElement: (id) =>
    set((state) => ({
      selectedElementIds: [...state.selectedElementIds, id],
    })),
  removeSelectedElement: (id) =>
    set((state) => ({
      selectedElementIds: state.selectedElementIds.filter((eid) => eid !== id),
    })),
  clearSelection: () => set({ selectedElementIds: [] }),

  // Undo/Redo
  history: [],
  historyIndex: -1,
  get canUndo() {
    const { historyIndex } = get()
    return historyIndex > 0
  },
  get canRedo() {
    const { history, historyIndex } = get()
    return historyIndex < history.length - 1
  },
  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      set({
        historyIndex: newIndex,
        presentation: history[newIndex],
      })
    }
  },
  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      set({
        historyIndex: newIndex,
        presentation: history[newIndex],
      })
    }
  },
  saveToHistory: () => {
    const { presentation, history, historyIndex } = get()
    if (!presentation) return

    // Remove any history after current index (when undoing then making changes)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(presentation))) // Deep clone

    // Limit history to 50 entries
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      set({ historyIndex: newHistory.length - 1 })
    }

    set({ history: newHistory })
  },

  // Editor operations
  updateSlide: (slideIndex, updates) => {
    const { presentation, saveToHistory } = get()
    if (!presentation || slideIndex < 0 || slideIndex >= presentation.slides.length) return

    const updatedSlides = [...presentation.slides]
    updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], ...updates }

    set({
      presentation: {
        ...presentation,
        slides: updatedSlides,
        metadata: {
          ...presentation.metadata,
          updated_at: new Date().toISOString(),
        },
      },
    })

    saveToHistory()
  },

  updateElement: (elementId, updates) => {
    const { presentation, saveToHistory } = get()
    if (!presentation) return

    const updatedSlides = presentation.slides.map((slide) => {
      if (!slide.elements) return slide

      const updatedElements = slide.elements.map((element) =>
        element.id === elementId ? { ...element, ...updates } : element
      )

      return { ...slide, elements: updatedElements }
    })

    set({
      presentation: {
        ...presentation,
        slides: updatedSlides,
        metadata: {
          ...presentation.metadata,
          updated_at: new Date().toISOString(),
        },
      },
    })

    saveToHistory()
  },

  addElement: (slideIndex, element) => {
    const { presentation, saveToHistory } = get()
    if (!presentation || slideIndex < 0 || slideIndex >= presentation.slides.length) return

    const updatedSlides = [...presentation.slides]
    const slide = updatedSlides[slideIndex]
    updatedSlides[slideIndex] = {
      ...slide,
      elements: [...(slide.elements || []), element],
    }

    set({
      presentation: {
        ...presentation,
        slides: updatedSlides,
        metadata: {
          ...presentation.metadata,
          updated_at: new Date().toISOString(),
        },
      },
    })

    saveToHistory()
  },

  removeElement: (elementId) => {
    const { presentation, saveToHistory } = get()
    if (!presentation) return

    const updatedSlides = presentation.slides.map((slide) => {
      if (!slide.elements) return slide

      const updatedElements = slide.elements.filter((element) => element.id !== elementId)
      return { ...slide, elements: updatedElements }
    })

    set({
      presentation: {
        ...presentation,
        slides: updatedSlides,
        metadata: {
          ...presentation.metadata,
          updated_at: new Date().toISOString(),
        },
      },
    })

    saveToHistory()
  },

  addSlide: (slide) => {
    const { presentation, saveToHistory } = get()
    if (!presentation) return

    const newSlide = {
      ...slide,
      slide_number: presentation.slides.length + 1,
    }

    set({
      presentation: {
        ...presentation,
        slides: [...presentation.slides, newSlide],
        metadata: {
          ...presentation.metadata,
          updated_at: new Date().toISOString(),
        },
      },
    })

    saveToHistory()
  },

  removeSlide: (slideIndex) => {
    const { presentation, saveToHistory, currentSlideIndex, setCurrentSlideIndex } = get()
    if (!presentation || slideIndex < 0 || slideIndex >= presentation.slides.length) return

    const updatedSlides = presentation.slides.filter((_, index) => index !== slideIndex)
    // Renumber slides
    const renumberedSlides = updatedSlides.map((slide, index) => ({
      ...slide,
      slide_number: index + 1,
    }))

    // Adjust current slide index if needed
    let newCurrentIndex = currentSlideIndex
    if (currentSlideIndex >= updatedSlides.length) {
      newCurrentIndex = Math.max(0, updatedSlides.length - 1)
      setCurrentSlideIndex(newCurrentIndex)
    } else if (currentSlideIndex > slideIndex) {
      newCurrentIndex = currentSlideIndex - 1
      setCurrentSlideIndex(newCurrentIndex)
    }

    set({
      presentation: {
        ...presentation,
        slides: renumberedSlides,
        metadata: {
          ...presentation.metadata,
          updated_at: new Date().toISOString(),
        },
      },
    })

    saveToHistory()
  },

  reorderSlides: (fromIndex, toIndex) => {
    const { presentation, saveToHistory } = get()
    if (!presentation) return

    const slides = [...presentation.slides]
    const [movedSlide] = slides.splice(fromIndex, 1)
    slides.splice(toIndex, 0, movedSlide)

    // Renumber slides
    const renumberedSlides = slides.map((slide, index) => ({
      ...slide,
      slide_number: index + 1,
    }))

    set({
      presentation: {
        ...presentation,
        slides: renumberedSlides,
        metadata: {
          ...presentation.metadata,
          updated_at: new Date().toISOString(),
        },
      },
    })

    saveToHistory()
  },

  // UI state
  isSaving: false,
  setIsSaving: (saving) => set({ isSaving: saving }),
  lastSaved: null,
  setLastSaved: (date) => set({ lastSaved: date }),
}))

