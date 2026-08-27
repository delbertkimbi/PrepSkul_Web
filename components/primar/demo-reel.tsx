"use client"

import { useEffect, useMemo, useState } from "react"
import { EqualsGlyph, OperatorGlyph, ShapeFigure } from "./shape-figure"
import { demonstrationItems, makeRng } from "@/lib/primar/items"

/**
 * The rule is taught by watching, never by reading.
 *
 * Each example plays on a loop: the two parts drift together and the result
 * settles into place. Three examples — two joins and one take-away — are enough
 * for a child to infer both operations without a word of instruction.
 */
export function DemoReel({ onReady }: { onReady: () => void }) {
  const items = useMemo(() => demonstrationItems(makeRng(11)), [])
  const [index, setIndex] = useState(0)
  const [seen, setSeen] = useState(1)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % items.length
        setSeen((s) => Math.min(items.length, s + 1))
        return next
      })
    }, 5200)
    return () => window.clearInterval(timer)
  }, [items.length])

  const item = items[index]

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div
        key={item.id}
        className="pm-paper relative flex w-full max-w-md items-center justify-center gap-0.5 rounded-[26px] px-3 py-10"
      >
        <span aria-hidden className="pm-tape absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2" />

        <div className="pm-anim-left shrink-0">
          <ShapeFigure shape={item.operandA} tone="question" size={64} />
        </div>
        <OperatorGlyph op={item.op} size={22} />
        <div className="pm-anim-right shrink-0">
          <ShapeFigure shape={item.operandB} tone="question" size={64} />
        </div>
        <EqualsGlyph size={22} />
        {/* Fixed slot so the row never reflows as the answer fades in and out. */}
        <div className="relative h-16 w-16 shrink-0">
          <div className="pm-anim-settle absolute inset-0">
            <ShapeFigure shape={item.answer} tone="answer" size={64} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5" aria-hidden>
        {items.map((it, i) => (
          <span
            key={it.id}
            className="pm-progress-pip h-2.5 rounded-full"
            style={{
              width: i === index ? 26 : 10,
              backgroundColor: i === index ? "#2864d7" : "rgba(19,45,99,0.2)",
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onReady}
        disabled={seen < items.length}
        aria-label="Start"
        className="pm-btn flex h-20 w-20 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-35"
      >
        <svg viewBox="0 0 40 40" width={38} height={38} aria-hidden focusable="false">
          <path
            d="M14 10 L27 20 L14 30"
            fill="none"
            stroke="currentColor"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
