/**
 * Beautiful Animated Slide Viewer
 * Neomorphic, visually stunning presentation viewer with slide navigation sidebar
 */

'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2, Menu, Settings, Type, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Slide {
  id: string
  slide_number: number
  slide_title: string
  bullets: string[]
  design: {
    background_color: string
    text_color: string
    layout: string
    icon: string
    fontFamily?: string
    fontSize?: number
  }
}

interface SlideViewerProps {
  slides: Slide[]
  presentationId: string
  downloadUrl?: string // Deprecated - kept for backward compatibility but not used
  onClose?: () => void
  designPreset?: 'business' | 'academic' | 'kids'
}

// Image pool from /public/images (used pseudo-randomly on slides)
const SLIDE_IMAGES = [
  { src: '/images/hero-tutoring.png', alt: 'Student receiving tutoring support' },
  { src: '/images/hero-tutoring-nobg.png', alt: 'Confident student with learning tools' },
  { src: '/images/prepskul-student-confident.png', alt: 'Confident PrepSkul student' },
  { src: '/images/prepskul-student-presenting.png', alt: 'Student presenting in class' },
  { src: '/images/pexels-cottonbro-5082579.jpg', alt: 'Students learning together' },
  { src: '/images/pexels-cottonbro-5083407.jpg', alt: 'Learner focused on online class' },
  { src: '/images/pexels-picjumbo-com-55570-196655.jpg', alt: 'Classroom with teacher and students' },
  { src: '/images/pexels-rdne-6129042.jpg', alt: 'Teacher supporting student learning' },
]

// Design Presets
const DESIGN_PRESETS = {
  business: {
    colors: {
      primary: '#FF8A00',
      secondary: '#2D3542',
      accent: '#FFFFFF',
      text: { light: '#FFFFFF', dark: '#000000' },
    },
    fonts: {
      title: { name: 'Montserrat', size: 56, weight: 700 },
      body: { name: 'Open Sans', size: 20, weight: 400 },
    },
    effects: {
      shadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      glow: '0 0 40px rgba(255, 138, 0, 0.2)',
    },
  },
  academic: {
    colors: {
      primary: '#1a365d',
      secondary: '#2d4a5c',
      accent: '#f7fafc',
      text: { light: '#FFFFFF', dark: '#1a202c' },
    },
    fonts: {
      title: { name: 'Georgia', size: 52, weight: 600 },
      body: { name: 'Merriweather', size: 18, weight: 400 },
    },
    effects: {
      shadow: '0 15px 50px rgba(26, 54, 93, 0.25)',
      glow: '0 0 30px rgba(26, 54, 93, 0.15)',
    },
  },
  kids: {
    colors: {
      primary: '#FF6B9D',
      secondary: '#4ECDC4',
      accent: '#FFE66D',
      text: { light: '#FFFFFF', dark: '#2d3748' },
    },
    fonts: {
      title: { name: 'Comic Sans MS', size: 48, weight: 700 },
      body: { name: 'Nunito', size: 22, weight: 500 },
    },
    effects: {
      shadow: '0 25px 70px rgba(255, 107, 157, 0.3)',
      glow: '0 0 50px rgba(255, 107, 157, 0.4)',
    },
  },
}

// Emoji sets for kids preset
const KIDS_EMOJIS = ['🎉', '🌟', '✨', '🎈', '🎨', '🌈', '🚀', '⭐', '💫', '🎊', '🎁', '🎪']

export function SlideViewer({ slides, presentationId, downloadUrl, onClose, designPreset = 'business' }: SlideViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [direction, setDirection] = useState(0)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editedSlides, setEditedSlides] = useState<Slide[]>(slides)
  const preset = DESIGN_PRESETS[designPreset]
  
  // Update edited slides when slides prop changes
  useEffect(() => {
    setEditedSlides(slides)
  }, [slides])

  const currentSlide = editedSlides[currentSlideIndex] || slides[currentSlideIndex]

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false)
        if (onClose) onClose()
      }
      if (e.key === 'f' || e.key === 'F') setIsFullscreen(!isFullscreen)
      if (e.key === 'b' || e.key === 'B') setShowSidebar(!showSidebar)
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlideIndex, isFullscreen, showSidebar])

  // Download handler - regenerates PPT from edited slides and triggers file system dialog
  const handleDownload = async () => {
    try {
      // Show loading state
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement
      if (downloadButton) {
        downloadButton.disabled = true
        downloadButton.textContent = 'Generating...'
      }

      // Send edited slides to API to regenerate PPT
      const response = await fetch('/api/ticha/ppt/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides: editedSlides.map(slide => ({
            slide_title: slide.slide_title,
            bullets: slide.bullets || [],
            design: {
              background_color: slide.design.background_color,
              text_color: slide.design.text_color,
              layout: slide.design.layout,
              icon: slide.design.icon,
              fontFamily: slide.design.fontFamily,
              fontSize: slide.design.fontSize,
            },
          })),
          title: `Presentation ${presentationId || Date.now()}`,
          author: 'TichaAI User',
          company: 'TichaAI',
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to regenerate PPT: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success || !data.pptData) {
        throw new Error('Invalid response from server')
      }

      // Convert base64 to blob
      const binaryString = atob(data.pptData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })

      // Trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename || `presentation-${presentationId || Date.now()}.pptx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Reset button state
      if (downloadButton) {
        downloadButton.disabled = false
        downloadButton.innerHTML = '<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>Download PPT'
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert(`Failed to download presentation: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Reset button state on error
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement
      if (downloadButton) {
        downloadButton.disabled = false
        downloadButton.innerHTML = '<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>Download PPT'
      }
    }
  }

  const goToNext = () => {
    if (currentSlideIndex < editedSlides.length - 1) {
      setDirection(1)
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentSlideIndex > 0) {
      setDirection(-1)
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const goToSlide = (index: number) => {
    setDirection(index > currentSlideIndex ? 1 : -1)
    setCurrentSlideIndex(index)
  }

  const getBackgroundColor = (index: number): string => {
    const slide = editedSlides[index] || slides[index]
    const designBg = slide?.design?.background_color

    if (designBg && typeof designBg === 'string' && designBg.trim().length > 0) {
      return designBg
    }

    // Fallback to preset behavior if slide has no explicit design background
    if (designPreset === 'business' || designPreset === 'academic') {
      return index === 0 ? preset.colors.primary : (index % 2 === 0 ? preset.colors.secondary : preset.colors.accent)
    }

    const colors = [preset.colors.primary, preset.colors.secondary, preset.colors.accent]
    return colors[index % colors.length]
  }

  const getTextColor = (index: number, bgColor: string): string => {
    const slide = editedSlides[index] || slides[index]
    const designText = slide?.design?.text_color

    if (designText && typeof designText === 'string' && designText.trim().length > 0) {
      return designText
    }

    if (bgColor === preset.colors.accent || bgColor === '#f7fafc' || bgColor === '#FFFFFF') {
      return preset.colors.text.dark
    }
    return preset.colors.text.light
  }

  // Deterministic "random" image selection per slide
  const getSlideImage = (index: number) => {
    if (!SLIDE_IMAGES.length) return null

    const slide = editedSlides[index] || slides[index]
    if (!slide) return null

    // Only show images on content-heavy slides (with bullets) so title slides stay clean
    const hasBullets = slide.bullets && slide.bullets.length > 0
    if (!hasBullets) return null

    const imageIndex = slide.slide_number
      ? (slide.slide_number - 1) % SLIDE_IMAGES.length
      : index % SLIDE_IMAGES.length

    return SLIDE_IMAGES[imageIndex]
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    }),
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <p className="text-gray-500 text-xl">No slides available</p>
      </div>
    )
  }

  const bgColor = getBackgroundColor(currentSlideIndex)
  const textColor = getTextColor(currentSlideIndex, bgColor)
  const isKidsPreset = designPreset === 'kids'
  const slideImage = getSlideImage(currentSlideIndex)

  const viewerContent = (
    <div className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-screen'} overflow-hidden flex`}>
      {/* Left Sidebar - Slide Thumbnails */}
      <motion.div
        initial={{ x: showSidebar ? 0 : -300 }}
        animate={{ x: showSidebar ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-64 bg-black/40 backdrop-blur-md border-r border-white/10 overflow-y-auto"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Slides</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(false)}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {slides.map((slide, index) => {
              const slideBgColor = getBackgroundColor(index)
              const slideTextColor = getTextColor(index, slideBgColor)
              const isActive = index === currentSlideIndex
              
              return (
                <motion.button
                  key={slide.id || index}
                  onClick={() => goToSlide(index)}
                  className={`w-full p-3 rounded-lg text-left transition-all relative overflow-hidden ${
                    isActive
                      ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]'
                      : 'hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: isActive ? slideBgColor : 'rgba(255, 255, 255, 0.05)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-white/60">#{index + 1}</span>
                    {isActive && (
                      <motion.div
                        className="w-2 h-2 rounded-full bg-blue-400"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <p
                    className="text-xs font-medium line-clamp-2"
                    style={{ color: isActive ? slideTextColor : 'rgba(255, 255, 255, 0.8)' }}
                  >
                    {slide.slide_title || 'Untitled Slide'}
                  </p>
                  {slide.bullets && slide.bullets.length > 0 && (
                    <p className="text-xs mt-1 text-white/50 line-clamp-1">
                      {slide.bullets.length} {slide.bullets.length === 1 ? 'bullet' : 'bullets'}
                    </p>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-black/40 backdrop-blur-md border-b border-white/10 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!showSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(true)}
                  className="text-white hover:bg-white/20"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <h3 className="text-white font-semibold text-lg">
                Slide {currentSlideIndex + 1} of {editedSlides.length}
              </h3>
            <Button
              variant="ghost"
              size="sm"
                onClick={() => setShowEditor(!showEditor)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showEditor ? 'Hide Editor' : 'Show Editor'}
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-download-button
              >
                <Download className="h-4 w-4 mr-2" />
                Download PPT
              </Button>
            </div>
            <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
                  className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

        {/* Main Slide Area */}
        <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlideIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative w-full max-w-6xl mx-auto"
            >
              {/* Neomorphic Slide Container */}
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: bgColor,
                  boxShadow: `${preset.effects.shadow}, ${preset.effects.glow}`,
                  minHeight: '600px',
                  aspectRatio: '16/9',
                }}
              >
                {/* Decorative Background Elements */}
                {isKidsPreset && (
                  <>
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute pointer-events-none"
                        style={{
                          top: `${10 + Math.random() * 80}%`,
                          left: `${10 + Math.random() * 80}%`,
                          fontSize: `${24 + Math.random() * 32}px`,
                        }}
                        animate={{
                          y: [0, -30, 0],
                          rotate: [0, 15, -15, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 4 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      >
                        {KIDS_EMOJIS[Math.floor(Math.random() * KIDS_EMOJIS.length)]}
                      </motion.div>
                    ))}
                  </>
                )}

                {/* Gradient Overlay for Depth */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: designPreset === 'business'
                      ? 'linear-gradient(135deg, rgba(255,138,0,0.3) 0%, rgba(45,53,66,0.3) 100%)'
                      : designPreset === 'academic'
                      ? 'linear-gradient(135deg, rgba(26,54,93,0.3) 0%, rgba(45,74,92,0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(255,107,157,0.3) 0%, rgba(78,205,196,0.3) 100%)',
                  }}
                />

                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 50%, ${textColor}40 0%, transparent 50%),
                                      radial-gradient(circle at 80% 80%, ${textColor}30 0%, transparent 50%)`,
                    }}
                  />
                </div>

                {/* Slide Content */}
                <div className="relative z-10 p-8 md:p-12 lg:p-16 h-full flex items-center">
                  <div
                    className={`grid gap-8 md:gap-10 w-full items-center ${
                      slideImage ? 'md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]' : 'grid-cols-1'
                    }`}
                  >
                    <div className="flex flex-col justify-center">
                      {/* Title */}
                      {currentSlide.slide_title && (
                        <motion.h1
                          initial={{ opacity: 0, y: -30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                          className="text-center md:text-left mb-6 md:mb-8 font-bold leading-tight"
                          style={{
                            color: textColor,
                            fontFamily: `${currentSlide.design.fontFamily || preset.fonts.title.name}, sans-serif`,
                            fontSize: `clamp(32px, 5vw, ${currentSlide.design.fontSize || preset.fonts.title.size}px)`,
                            fontWeight: preset.fonts.title.weight,
                            textShadow: `0 2px 20px rgba(0,0,0,0.3), 0 0 40px ${textColor}20`,
                          }}
                        >
                          {currentSlide.slide_title}
                        </motion.h1>
                      )}

                      {/* Bullets */}
                      {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                        <div className="space-y-4 md:space-y-5 max-w-3xl mx-auto md:mx-0">
                          {currentSlide.bullets.map((bullet, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: 0.4 + index * 0.1,
                                type: 'spring',
                                stiffness: 100,
                              }}
                              className="flex items-start gap-4 group"
                            >
                              {/* Bullet Point */}
                              <div
                                className="flex-shrink-0 mt-2"
                                style={{ color: textColor }}
                              >
                                {isKidsPreset ? (
                                  <motion.span
                                    className="text-3xl"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                  >
                                    {KIDS_EMOJIS[index % KIDS_EMOJIS.length]}
                                  </motion.span>
                                ) : (
                                  <motion.div
                                    className="w-4 h-4 rounded-full"
                                    style={{
                                      backgroundColor: textColor,
                                      boxShadow: `0 0 15px ${textColor}60`,
                                    }}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                                  />
                                )}
                              </div>
                              <p
                                className="flex-1 leading-relaxed group-hover:translate-x-2 transition-transform"
                                style={{
                                  color: textColor,
                                  fontFamily: `${currentSlide.design.fontFamily || preset.fonts.body.name}, sans-serif`,
                                  fontSize: `clamp(16px, 2vw, ${currentSlide.design.fontSize || preset.fonts.body.size}px)`,
                                  fontWeight: preset.fonts.body.weight,
                                  textShadow: `0 1px 10px rgba(0,0,0,0.2)`,
                                }}
                              >
                                {bullet}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {slideImage && (
                      <motion.div
                        initial={{ opacity: 0, x: 40, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 120, damping: 18 }}
                        className="relative h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-sm"
                      >
                        <Image
                          src={slideImage.src}
                          alt={slideImage.alt}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 80vw"
                          priority={currentSlideIndex === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Neomorphic Border Effect */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    boxShadow: `
                      inset 3px 3px 8px rgba(255,255,255,0.1),
                      inset -3px -3px 8px rgba(0,0,0,0.1)
                    `,
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            disabled={currentSlideIndex === 0}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed transition-all z-20 group"
          >
            <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentSlideIndex === editedSlides.length - 1}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed transition-all z-20 group"
          >
            <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Bottom Progress Bar */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-black/40 backdrop-blur-md border-t border-white/10 px-6 py-4"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {editedSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlideIndex
                    ? 'bg-white w-8'
                    : 'bg-white/30 w-2 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          <p className="text-white/60 text-sm text-center">
            Press ← → to navigate, F for fullscreen, B to toggle sidebar, ESC to close
          </p>
        </motion.div>
      </div>

      {/* Right Sidebar - Editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 bg-black/40 backdrop-blur-md border-l border-white/10 overflow-y-auto"
          >
            <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Slide
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditor(false)}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

            {currentSlide && (
              <div className="space-y-6">
                {/* Font Family */}
                <div>
                  <label className="block text-white text-xs font-medium mb-2 flex items-center gap-2">
                    <Type className="h-3 w-3" />
                    Font Family
                  </label>
                  <select
                    value={currentSlide.design.fontFamily || preset.fonts.title.name}
                    onChange={(e) => {
                      const updated = [...editedSlides]
                      updated[currentSlideIndex] = {
                        ...updated[currentSlideIndex],
                        design: {
                          ...updated[currentSlideIndex].design,
                          fontFamily: e.target.value,
                        },
                      }
                      setEditedSlides(updated)
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Montserrat" className="bg-gray-800">Montserrat</option>
                    <option value="Open Sans" className="bg-gray-800">Open Sans</option>
                    <option value="Georgia" className="bg-gray-800">Georgia</option>
                    <option value="Merriweather" className="bg-gray-800">Merriweather</option>
                    <option value="Comic Sans MS" className="bg-gray-800">Comic Sans MS</option>
                    <option value="Nunito" className="bg-gray-800">Nunito</option>
                    <option value="Arial" className="bg-gray-800">Arial</option>
                    <option value="Times New Roman" className="bg-gray-800">Times New Roman</option>
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-white text-xs font-medium mb-2">
                    Font Size: {currentSlide.design.fontSize || preset.fonts.title.size}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={currentSlide.design.fontSize || preset.fonts.title.size}
                    onChange={(e) => {
                      const updated = [...editedSlides]
                      updated[currentSlideIndex] = {
                        ...updated[currentSlideIndex],
                        design: {
                          ...updated[currentSlideIndex].design,
                          fontSize: parseInt(e.target.value),
                        },
                      }
                      setEditedSlides(updated)
                    }}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>12px</span>
                    <span>72px</span>
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-white text-xs font-medium mb-2 flex items-center gap-2">
                    <Palette className="h-3 w-3" />
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={bgColor.startsWith('#') ? bgColor : `#${bgColor}`}
                      onChange={(e) => {
                        const updated = [...editedSlides]
                        updated[currentSlideIndex] = {
                          ...updated[currentSlideIndex],
                          design: {
                            ...updated[currentSlideIndex].design,
                            background_color: e.target.value,
                          },
                        }
                        setEditedSlides(updated)
                      }}
                      className="w-16 h-10 rounded-lg border border-white/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor.startsWith('#') ? bgColor : `#${bgColor}`}
                      onChange={(e) => {
                        const updated = [...editedSlides]
                        updated[currentSlideIndex] = {
                          ...updated[currentSlideIndex],
                          design: {
                            ...updated[currentSlideIndex].design,
                            background_color: e.target.value,
                          },
                        }
                        setEditedSlides(updated)
                      }}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#FF8A00"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-white text-xs font-medium mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textColor.startsWith('#') ? textColor : textColor === 'white' ? '#FFFFFF' : '#000000'}
                      onChange={(e) => {
                        const updated = [...editedSlides]
                        updated[currentSlideIndex] = {
                          ...updated[currentSlideIndex],
                          design: {
                            ...updated[currentSlideIndex].design,
                            text_color: e.target.value,
                          },
                        }
                        setEditedSlides(updated)
                      }}
                      className="w-16 h-10 rounded-lg border border-white/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textColor.startsWith('#') ? textColor : textColor === 'white' ? '#FFFFFF' : '#000000'}
                      onChange={(e) => {
                        const updated = [...editedSlides]
                        updated[currentSlideIndex] = {
                          ...updated[currentSlideIndex],
                          design: {
                            ...updated[currentSlideIndex].design,
                            text_color: e.target.value,
                          },
                        }
                        setEditedSlides(updated)
                      }}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>

                {/* Quick Color Presets */}
                <div>
                  <label className="block text-white text-xs font-medium mb-2">
                    Quick Colors
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Orange', color: '#FF8A00' },
                      { name: 'Navy', color: '#2D3542' },
                      { name: 'White', color: '#FFFFFF' },
                      { name: 'Blue', color: '#1a365d' },
                      { name: 'Pink', color: '#FF6B9D' },
                      { name: 'Teal', color: '#4ECDC4' },
                    ].map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => {
                          const updated = [...editedSlides]
                          updated[currentSlideIndex] = {
                            ...updated[currentSlideIndex],
                            design: {
                              ...updated[currentSlideIndex].design,
                              background_color: preset.color,
                              text_color: preset.color === '#FFFFFF' ? '#000000' : '#FFFFFF',
                            },
                          }
                          setEditedSlides(updated)
                        }}
                        className="h-10 rounded-lg border border-white/20 hover:border-white/40 transition-all flex items-center justify-center text-xs text-white"
                        style={{ backgroundColor: preset.color }}
                      >
                        {preset.name}
          </button>
                    ))}
                  </div>
                </div>
        </div>
      )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {viewerContent}
      </div>
    )
  }

  return viewerContent
}
