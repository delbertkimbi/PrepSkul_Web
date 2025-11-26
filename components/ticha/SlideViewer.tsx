/**
 * Beautiful Embedded Slide Viewer
 * PowerPoint-style viewer with sidebar, fullscreen, and animations
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, Minimize2, ChevronLeft, ChevronRight, Download, Menu, List } from 'lucide-react'
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
  }
}

interface SlideViewerProps {
  slides: Slide[]
  presentationId: string
  downloadUrl?: string
  onClose?: () => void
}

export function SlideViewer({ slides, presentationId, downloadUrl, onClose }: SlideViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedFont, setSelectedFont] = useState('Inter')
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const currentSlide = slides[currentSlideIndex]

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false)
        if (showThumbnails) setShowThumbnails(false)
        if (showTools) setShowTools(false)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlideIndex, isFullscreen, showThumbnails, showTools])

  // Touch swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left - next slide
        goToNext()
      } else {
        // Swiped right - previous slide
        goToPrevious()
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index)
  }

  const goToNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const getBackgroundColor = (color: string): string => {
    const colorMap: Record<string, string> = {
      'light-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'dark-blue': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      'white': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      'gray': 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
      'green': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    }
    return colorMap[color] || colorMap['light-blue']
  }

  const getTextColor = (color: string): string => {
    return color === 'white' ? '#FFFFFF' : '#1a1a1a'
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const slideTransition = {
    x: { type: 'spring', stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 },
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No slides available</p>
      </div>
    )
  }

  const viewerContent = (
    <div className={`relative bg-white overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full h-[600px] rounded-lg shadow-2xl'}`}>
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white ${isFullscreen ? 'h-14 md:h-16' : 'h-14 md:h-16'} flex items-center justify-between px-2 sm:px-4`}>
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThumbnails(!showThumbnails)}
              className="text-white hover:bg-gray-700 flex-shrink-0"
            >
              <List className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
          <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">
            Slide {currentSlideIndex + 1} of {slides.length}
          </h3>
          {downloadUrl && !isMobile && (
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 transition-colors text-xs sm:text-sm flex-shrink-0"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {isMobile && downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="p-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTools(!showTools)}
              className="text-white hover:bg-gray-700"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-gray-700"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-gray-700"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className={`flex ${isFullscreen ? (isMobile ? 'h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-4rem)]' : 'h-[calc(100vh-4rem)]') : (isMobile ? 'h-[calc(100%-3.5rem-4rem)] md:h-full' : 'h-full')} ${isFullscreen ? 'pt-14 md:pt-16' : 'pt-14 md:pt-16'} ${isMobile ? 'pb-16' : ''}`}>
        {/* Left Sidebar - Slide Thumbnails */}
        {(!isMobile || showThumbnails) && (
          <motion.div
            initial={isMobile ? { x: -300 } : false}
            animate={isMobile ? { x: showThumbnails ? 0 : -300 } : {}}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`${isMobile ? 'fixed left-0 top-14 md:top-16 bottom-0 z-30 w-64' : ''} ${isFullscreen ? 'w-56' : 'w-48'} bg-gray-100 border-r border-gray-300 overflow-y-auto shadow-lg`}
          >
            <div className="p-2 sm:p-3 space-y-2">
              <div className="flex items-center justify-between mb-2 px-2">
                <h4 className="font-semibold text-xs sm:text-sm text-gray-700">Slides</h4>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowThumbnails(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {slides.map((slide, index) => (
                <button
                  key={slide.id || index}
                  onClick={() => {
                    goToSlide(index)
                    if (isMobile) setShowThumbnails(false)
                  }}
                  className={`w-full p-2 sm:p-3 rounded-lg text-left transition-all ${
                    index === currentSlideIndex
                      ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                      : 'bg-white hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">Slide {index + 1}</div>
                  <div className="text-xs truncate">{slide.slide_title || 'Untitled'}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Mobile overlay when sidebar is open */}
        {isMobile && showThumbnails && (
          <div
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setShowThumbnails(false)}
          />
        )}

        {/* Main Slide Area */}
        <div
          className={`flex-1 relative bg-gray-200 flex items-center justify-center ${isFullscreen ? 'p-1 sm:p-2' : 'p-4 sm:p-6 md:p-8'}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={currentSlideIndex}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className={`w-full h-full ${isFullscreen ? 'max-w-full' : 'max-w-5xl'} mx-auto`}
            >
              <div
                className={`w-full h-full ${isFullscreen ? 'rounded-lg' : 'rounded-xl'} shadow-2xl ${isFullscreen ? 'p-3 sm:p-4 md:p-6' : 'p-4 sm:p-6 md:p-8 lg:p-12'} flex flex-col justify-center relative overflow-hidden`}
                style={{
                  background: getBackgroundColor(currentSlide.design?.background_color || 'light-blue'),
                }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />

                {/* Slide Content */}
                <div className="relative z-10 px-2 sm:px-4">
                  {currentSlide.slide_title && (
                    <motion.h1
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 text-center"
                      style={{
                        color: getTextColor(currentSlide.design?.text_color || 'black'),
                        fontFamily: selectedFont === 'Poppins' ? 'Poppins, sans-serif' : selectedFont === 'Inter' ? 'Inter, sans-serif' : selectedFont,
                      }}
                    >
                      {currentSlide.slide_title}
                    </motion.h1>
                  )}

                  {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      {currentSlide.bullets.map((bullet, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-start gap-2 sm:gap-3 md:gap-4"
                        >
                          <div
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-2 sm:mt-3 flex-shrink-0"
                            style={{
                              backgroundColor: getTextColor(currentSlide.design?.text_color || 'black'),
                            }}
                          />
                          <p
                            className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed"
                            style={{
                              color: getTextColor(currentSlide.design?.text_color || 'black'),
                              fontFamily: selectedFont === 'Poppins' ? 'Poppins, sans-serif' : selectedFont === 'Inter' ? 'Inter, sans-serif' : selectedFont,
                            }}
                          >
                            {bullet}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {!isMobile && (
            <>
              <button
                onClick={goToPrevious}
                disabled={currentSlideIndex === 0}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/90 hover:bg-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
              </button>
              <button
                onClick={goToNext}
                disabled={currentSlideIndex === slides.length - 1}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/90 hover:bg-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
              </button>
            </>
          )}
        </div>

        {/* Right Sidebar - Simple Editing Tools */}
        {(!isMobile || showTools) && (
          <motion.div
            initial={isMobile ? { x: 300 } : false}
            animate={isMobile ? { x: showTools ? 0 : 300 } : {}}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`${isMobile ? 'fixed right-0 top-14 md:top-16 bottom-0 z-30 w-64' : ''} ${isFullscreen ? 'w-72' : 'w-64'} bg-gray-50 border-l border-gray-300 p-3 sm:p-4 shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="font-semibold text-xs sm:text-sm text-gray-700">Edit</h4>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTools(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Font Family</label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Mobile overlay when tools sidebar is open */}
        {isMobile && showTools && (
          <div
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setShowTools(false)}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 flex items-center justify-between">
          <button
            onClick={goToPrevious}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Previous</span>
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlideIndex ? 'bg-white w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            onClick={goToNext}
            disabled={currentSlideIndex === slides.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="text-sm">Next</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black w-screen h-screen overflow-hidden">
        {viewerContent}
      </div>
    )
  }

  return viewerContent
}

