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
  /** Which side is visible before any interaction or auto-flip */
  initialSide?: "front" | "back"
  /** Flip automatically when the card scrolls into view */
  autoFlipOnView?: boolean
  /** Ms after entering view before auto-flip (stagger via delay prop) */
  viewFlipDelay?: number
  /** Ms after entering view if still on initial side — catches hero cards on load */
  idleFlipDelay?: number
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
  idleFlipDelay,
}: FlipCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const initialFlipped = initialSide === "back"
  const [flipped, setFlipped] = useState(initialFlipped)
  const rootRef = useRef<HTMLDivElement>(null)
  const userInteractedRef = useRef(false)
  const touchHandledRef = useRef(false)
  const scrollFlippedRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const toggle = useCallback(() => {
    userInteractedRef.current = true
    setFlipped((f) => !f)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || !autoFlipOnView) return

    const el = rootRef.current
    if (!el) return

    const targetFlipped = !initialFlipped

    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimers()

        if (entry?.isIntersecting) {
          const onViewMs = viewFlipDelay ?? 650 + delay * 140
          const idleMs = idleFlipDelay ?? 2800 + delay * 140

          timersRef.current.push(
            setTimeout(() => {
              if (!userInteractedRef.current) setFlipped(targetFlipped)
            }, onViewMs)
          )

          timersRef.current.push(
            setTimeout(() => {
              if (!userInteractedRef.current) setFlipped((current) => (current === initialFlipped ? targetFlipped : current))
            }, idleMs)
          )
        } else if (!userInteractedRef.current) {
          setFlipped(initialFlipped)
        }
      },
      { threshold: [0.08, 0.22], rootMargin: "40px 0px 40px 0px" }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      clearTimers()
    }
  }, [
    prefersReducedMotion,
    autoFlipOnView,
    delay,
    initialFlipped,
    viewFlipDelay,
    idleFlipDelay,
    clearTimers,
  ])

  useEffect(() => {
    if (prefersReducedMotion || !autoFlipOnView) return
    const el = rootRef.current
    if (!el) return
    if (typeof window === "undefined" || !window.matchMedia("(pointer: coarse)").matches) return

    const targetFlipped = !initialFlipped
    let ticking = false

    const checkScrollFlip = () => {
      ticking = false
      if (userInteractedRef.current) return

      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const visible = rect.bottom > 0 && rect.top < vh
      const cardCenter = rect.top + rect.height / 2
      const inHotZone = cardCenter > vh * 0.2 && cardCenter < vh * 0.8

      if (visible && inHotZone) {
        if (!scrollFlippedRef.current) {
          setFlipped(targetFlipped)
          scrollFlippedRef.current = true
        }
      } else {
        scrollFlippedRef.current = false
        if (!visible) setFlipped(initialFlipped)
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(checkScrollFlip)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("touchmove", onScroll, { passive: true })
    checkScrollFlip()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("touchmove", onScroll)
    }
  }, [prefersReducedMotion, autoFlipOnView, initialFlipped])

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      setFlipped(true)
    }
  }

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches && !userInteractedRef.current) {
      setFlipped(initialFlipped)
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") {
      touchHandledRef.current = true
      toggle()
    }
  }

  const handleClick = () => {
    if (touchHandledRef.current) {
      touchHandledRef.current = false
      return
    }
    toggle()
  }

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
      onPointerDown={handlePointerDown}
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
        className={cn(
          "relative w-full h-full",
          innerClassName
        )}
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.42, ease: [0.34, 1.15, 0.64, 1] }
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
