"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { fadeUp, viewportOnce } from "@/lib/sbc/motion"
import { cn } from "@/lib/utils"

interface FlipCardProps {
  front: React.ReactNode
  back: React.ReactNode
  className?: string
  innerClassName?: string
  delay?: number
  heightClass?: string
  initialSide?: "front" | "back"
  autoFlipOnView?: boolean
  viewFlipDelay?: number
}

export function FlipCard({
  front,
  back,
  className,
  innerClassName,
  delay = 0,
  heightClass = "min-h-[168px] sm:min-h-[180px]",
  initialSide = "front",
  autoFlipOnView = true,
  viewFlipDelay,
}: FlipCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const initialFlipped = initialSide === "back"
  const [flipped, setFlipped] = useState(initialFlipped)
  const rootRef = useRef<HTMLDivElement>(null)
  const userInteractedRef = useRef(false)
  const autoFlippedRef = useRef(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const skipClickRef = useRef(false)

  const toggle = useCallback(() => {
    userInteractedRef.current = true
    setFlipped((f) => !f)
  }, [])

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }, [])

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current)
      autoTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || !autoFlipOnView) return

    const el = rootRef.current
    if (!el) return

    const targetFlipped = !initialFlipped

    const observer = new IntersectionObserver(
      ([entry]) => {
        clearAutoTimer()

        if (entry?.isIntersecting && entry.intersectionRatio >= 0.35) {
          if (autoFlippedRef.current || userInteractedRef.current) return

          const onViewMs = viewFlipDelay ?? 3800 + delay * 500
          autoTimerRef.current = setTimeout(() => {
            if (!userInteractedRef.current && !autoFlippedRef.current) {
              setFlipped(targetFlipped)
              autoFlippedRef.current = true
            }
          }, onViewMs)
        }
      },
      { threshold: [0.35, 0.55], rootMargin: "0px 0px -8% 0px" }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      clearAutoTimer()
    }
  }, [prefersReducedMotion, autoFlipOnView, delay, initialFlipped, viewFlipDelay, clearAutoTimer])

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    if (typeof window === "undefined" || !window.matchMedia("(hover: hover)").matches) return

    clearHoverTimer()
    hoverTimerRef.current = setTimeout(() => {
      if (!userInteractedRef.current) setFlipped(true)
    }, 500)
  }

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    clearHoverTimer()
    if (!userInteractedRef.current) setFlipped(initialFlipped)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return

    const touch = e.changedTouches[0]
    if (!touch) return

    const dx = Math.abs(touch.clientX - start.x)
    const dy = Math.abs(touch.clientY - start.y)
    const dt = Date.now() - start.t

    if (dx < 12 && dy < 12 && dt < 350) {
      skipClickRef.current = true
      toggle()
    }
  }

  const handleClick = () => {
    if (skipClickRef.current) {
      skipClickRef.current = false
      return
    }
    toggle()
  }

  useEffect(() => () => clearHoverTimer(), [clearHoverTimer])

  return (
    <motion.div
      ref={rootRef}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      custom={delay}
      className={cn(
        "group perspective-[1200px] cursor-pointer select-none touch-manipulation",
        heightClass,
        className
      )}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          toggle()
        }
      }}
      aria-pressed={flipped}
    >
      <motion.div
        className={cn("relative w-full h-full", innerClassName)}
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.55, ease: [0.4, 0, 0.2, 1] }
        }
      >
        <div
          className="absolute inset-0 rounded-2xl backface-hidden overflow-hidden"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 rounded-2xl backface-hidden overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </motion.div>
      <span className="sr-only">{flipped ? "Showing details" : "Showing summary"}</span>
    </motion.div>
  )
}
