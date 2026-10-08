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
  const initialValue = decimals > 0 ? start : Math.max(0, start - 3)
  const [value, setValue] = useState(initialValue)
  const initial = formatValue(initialValue, locale, decimals)
  const [shown, setShown] = useState(initial)
  const [leaving, setLeaving] = useState<string | null>(null)
  const shownRef = useRef(initial)

  useEffect(() => {
    const next = formatValue(initialValue, locale, decimals)
    setValue(initialValue)
    setShown(next)
    setLeaving(null)
    shownRef.current = next
  }, [initialValue, locale, decimals])

  useEffect(() => {
    const next = formatValue(value, locale, decimals)
    if (next === shownRef.current) return
    setLeaving(shownRef.current)
    setShown(next)
    shownRef.current = next
  }, [value, locale, decimals])

  useEffect(() => {
    if (reduce || decimals > 0) { setValue(start); return }
    let next = Math.max(0, Math.round(start) - 3)
    setValue(next)
    const timer = window.setInterval(() => {
      next = Math.min(start, next + 1)
      setValue(next)
      if (next >= start) window.clearInterval(timer)
    }, intervalMs > 20000 ? 2100 : 1300)
    return () => window.clearInterval(timer)
  }, [start, reduce, decimals, intervalMs])

  useEffect(() => {
    if (reduce || decimals > 0 || typeof window === "undefined") return
    const base = intervalMs || minMs || maxMs
    if (!base) return
    let timer: number | undefined
    const schedule = () => {
      const floor = minMs || base
      const ceiling = maxMs || base
      const delay = floor + Math.random() * Math.max(0, ceiling - floor)
      timer = window.setTimeout(() => {
        setValue((current) => current + step)
        schedule()
      }, delay)
    }
    timer = window.setTimeout(schedule, 6500 + staggerMs)
    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [intervalMs, minMs, maxMs, step, reduce, decimals, staggerMs])

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
