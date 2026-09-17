"use client"

import { useEffect } from "react"

/**
 * Paper ink fill. Sets --ps-scroll from 0 to 1 as the page is read.
 * CSS draws a left rail and a wash that soaks into the sheet.
 */
export function ScrollFill() {
  useEffect(() => {
    if (typeof window === "undefined") return
    const root = document.documentElement
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.style.setProperty("--ps-scroll", "1")
      return
    }

    let frame = 0
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, window.scrollY / max))
      root.style.setProperty("--ps-scroll", progress.toFixed(4))
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <>
      <div className="ps-ink-rail" aria-hidden>
        <span />
      </div>
      <div className="ps-ink-wash" aria-hidden />
    </>
  )
}
