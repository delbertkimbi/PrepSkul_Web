"use client"

import { cn } from "@/lib/utils"
import { STROKES, type Shape } from "@/lib/primar/strokes"

/**
 * Renders a shape as hand-drawn strokes on the shared grid.
 *
 * Round caps and joins plus a slightly heavy weight keep figures readable on a
 * cheap screen in daylight — the same reason the paper look uses hard shadows
 * rather than soft ones.
 */

export type FigureTone = "question" | "answer" | "ghost"

const TONES: Record<FigureTone, string> = {
  question: "#c1443a",
  answer: "#1f4fa8",
  ghost: "#9aa4bb",
}

export function ShapeFigure({
  shape,
  tone = "question",
  size = 96,
  className,
  strokeWidth = 6,
}: {
  shape: Shape
  tone?: FigureTone
  size?: number
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("block shrink-0", className)}
      role="img"
      aria-label="shape"
      focusable="false"
    >
      <g
        fill="none"
        stroke={TONES[tone]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {shape.map((id) => (
          <path key={id} d={STROKES[id].d} />
        ))}
      </g>
    </svg>
  )
}

/** The + and − signs, drawn as strokes so nothing on a child's screen is type. */
export function OperatorGlyph({
  op,
  size = 34,
  className,
}: {
  op: "add" | "subtract"
  size?: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={cn("block shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="#132d63" strokeWidth={5} strokeLinecap="round">
        <line x1="8" y1="20" x2="32" y2="20" />
        {op === "add" && <line x1="20" y1="8" x2="20" y2="32" />}
      </g>
    </svg>
  )
}

/** The equals sign, same reasoning. */
export function EqualsGlyph({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={cn("block shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="#132d63" strokeWidth={5} strokeLinecap="round">
        <line x1="9" y1="14" x2="31" y2="14" />
        <line x1="9" y1="26" x2="31" y2="26" />
      </g>
    </svg>
  )
}

/** An empty slot where the answer belongs. */
export function MysterySlot({ size = 96, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("block shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="14"
        y="14"
        width="72"
        height="72"
        rx="14"
        fill="none"
        stroke="#132d63"
        strokeOpacity="0.32"
        strokeWidth="4"
        strokeDasharray="9 9"
        strokeLinecap="round"
      />
    </svg>
  )
}
