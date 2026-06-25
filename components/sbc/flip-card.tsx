"use client"

import { useState, useCallback, useRef } from "react"
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
}

export function FlipCard({
  front,
  back,
  className,
  innerClassName,
  delay = 0,
  heightClass = "min-h-[168px] sm:min-h-[180px]",
  initialSide = "back",
}: FlipCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const initialFlipped = initialSide === "back"
  const [flipped, setFlipped] = useState(initialFlipped)
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const skipClickRef = useRef(false)

  const toggle = useCallback(() => {
    setFlipped((f) => !f)
  }, [])

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
    if (dx < 14 && dy < 14 && dt < 400) {
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

  return (
    <motion.div
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
            : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
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
      <span className="sr-only">{flipped ? "Showing alternate view" : "Showing primary view"}</span>
    </motion.div>
  )
}
