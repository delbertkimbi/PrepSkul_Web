"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function LiveTicker({
  start,
  intervalMs = 0,
  step = 1,
  locale = "en",
  suffix = "",
  decimals = 0,
  className,
}: {
  start: number
  intervalMs?: number
  step?: number
  locale?: string
  suffix?: string
  decimals?: number
  className?: string
}) {
  const [value, setValue] = useState(start)
  const tag = locale.startsWith("fr") ? "fr-FR" : "en-US"

  useEffect(() => {
    setValue(start)
  }, [start])

  useEffect(() => {
    if (!intervalMs || typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => {
      setValue((current) => current + step)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, step])

  const formatted =
    decimals > 0
      ? new Intl.NumberFormat(tag, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value)
      : new Intl.NumberFormat(tag).format(Math.round(value))

  return (
    <span className={cn("tabular-nums", className)}>
      {formatted}
      {suffix}
    </span>
  )
}
