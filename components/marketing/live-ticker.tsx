"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

function formatValue(value: number, locale: string, decimals: number) {
  const tag = locale.startsWith("fr") ? "fr-FR" : "en-US"
  if (decimals > 0) {
    return new Intl.NumberFormat(tag, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }
  return new Intl.NumberFormat(tag).format(Math.round(value))
}

function randomBump() {
  const roll = Math.random()
  if (roll < 0.88) return 1
  if (roll < 0.97) return 2
  return 10
}

function randomWait(minMs: number, maxMs: number) {
  return minMs + Math.random() * Math.max(0, maxMs - minMs)
}

const TICK_GAP_MS = 5200
const LAST_TICK_KEY = "__psLiveTickAt"

function lastTickAt() {
  if (typeof window === "undefined") return 0
  return Number((window as Record<string, unknown>)[LAST_TICK_KEY] || 0)
}

function stampTick() {
  ;(window as Record<string, unknown>)[LAST_TICK_KEY] = Date.now()
}

export function LiveTicker({
  start,
  intervalMs = 0,
  minMs,
  maxMs,
  staggerMs = 0,
  step = 1,
  locale = "en",
  suffix = "",
  decimals = 0,
  className,
}: {
  start: number
  intervalMs?: number
  minMs?: number
  maxMs?: number
  staggerMs?: number
  step?: number
  locale?: string
  suffix?: string
  decimals?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(start)
  const initial = formatValue(start, locale, decimals)
  const [shown, setShown] = useState(initial)
  const [leaving, setLeaving] = useState<string | null>(null)
  const shownRef = useRef(initial)

  useEffect(() => {
    const next = formatValue(start, locale, decimals)
    setValue(start)
    setShown(next)
    setLeaving(null)
    shownRef.current = next
  }, [start, locale, decimals])

  useEffect(() => {
    const next = formatValue(value, locale, decimals)
    if (next === shownRef.current) return
    setLeaving(shownRef.current)
    setShown(next)
    shownRef.current = next
  }, [value, locale, decimals])

  useEffect(() => {
    const lo = minMs ?? (intervalMs ? Math.round(intervalMs * 0.45) : 0)
    const hi = maxMs ?? (intervalMs ? Math.round(intervalMs * 2.4) : 0)
    if (!lo || reduce || typeof window === "undefined") return
    let timer = 0
    let lastOwn = 0
    const schedule = (first: boolean) => {
      const wait = first ? staggerMs + randomWait(lo, hi) : randomWait(lo, hi)
      timer = window.setTimeout(fire, wait)
    }
    const fire = () => {
      const now = Date.now()
      if (now - lastOwn < lo) {
        timer = window.setTimeout(fire, lo - (now - lastOwn) + randomWait(400, 1200))
        return
      }
      const since = now - lastTickAt()
      if (since < TICK_GAP_MS) {
        timer = window.setTimeout(fire, TICK_GAP_MS - since + randomWait(900, 2800))
        return
      }
      lastOwn = now
      stampTick()
      setValue((current) => current + (step > 1 ? step : randomBump()))
      schedule(false)
    }
    schedule(true)
    return () => window.clearTimeout(timer)
  }, [intervalMs, minMs, maxMs, staggerMs, step, reduce])

  useEffect(() => {
    if (!leaving || typeof window === "undefined") return
    const hold = 680 + shown.length * 80
    const id = window.setTimeout(() => setLeaving(null), hold)
    return () => window.clearTimeout(id)
  }, [leaving, shown])

  const chars = shown.split("")
  const prevChars = (leaving ?? shown).padStart(shown.length).split("")

  return (
    <span className={cn("ps-odometer", className)} aria-label={`${shown}${suffix}`}>
      {chars.map((ch, index) => {
        const fromRight = chars.length - 1 - index
        const prev = prevChars[index] ?? " "
        const digit = /\d/.test(ch)
        const changed = Boolean(leaving) && digit && prev !== ch
        return (
          <span
            key={index}
            className={cn(digit ? "ps-odometer-window" : "ps-odometer-sep", changed && "is-spinning")}
          >
            {changed ? (
              <span className="ps-odometer-reel" style={{ animationDelay: `${fromRight * 80}ms` }}>
                <span>{prev}</span>
                <span>{ch}</span>
              </span>
            ) : (
              ch
            )}
          </span>
        )
      })}
      {suffix ? <span className="ps-odometer-suffix">{suffix}</span> : null}
    </span>
  )
}
