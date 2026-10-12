"use client"

import { useEffect } from "react"

export function PerformanceOptimizer() {
  useEffect(() => {
    // Optimize images for better LCP
    const optimizeImages = () => {
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        // Add loading="lazy" to images below the fold
        if (img.getBoundingClientRect().top > window.innerHeight) {
          img.setAttribute('loading', 'lazy')
        }
        
        // Add fetchpriority="high" to above-the-fold images
        if (img.getBoundingClientRect().top < window.innerHeight) {
          img.setAttribute('fetchpriority', 'high')
        }
      })
    }

    // Reduce layout shift by reserving space for dynamic content
    const preventLayoutShift = () => {
      // Reserve space for animated counters
      const counters = document.querySelectorAll('[data-counter]')
      counters.forEach(counter => {
        const element = counter as HTMLElement
        element.style.minHeight = '2.5rem' // Reserve space for counter
      })
    }

    // Initialize optimizations
    optimizeImages()
    preventLayoutShift()

    // Re-optimize on resize
    const handleResize = () => {
      optimizeImages()
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return null
}

