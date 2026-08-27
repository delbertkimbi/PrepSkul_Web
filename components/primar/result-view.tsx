"use client"

import { ShapeFigure } from "./shape-figure"
import { COMPOSITES } from "@/lib/primar/strokes"
import type { Placement } from "@/lib/primar/mastery"

/**
 * The parent-facing read-out.
 *
 * Written to describe what a child *can* do, never what they failed. A parent
 * whose child is behind already knows it; what they have never been given is a
 * specific next step.
 */

interface Band {
  max: number
  title: string
  can: string
  next: string
  sample: string
}

const BANDS: Band[] = [
  {
    max: 2.5,
    title: "Building the basics",
    can: "puts two simple parts together and sees what they make",
    next: "more practice joining parts, before anything is taken away",
    sample: "circle",
  },
  {
    max: 4.5,
    title: "Joining confidently",
    can: "combines several parts at once and holds the whole shape in mind",
    next: "starting to take parts away, which is a real step up",
    sample: "square",
  },
  {
    max: 6.5,
    title: "Taking apart",
    can: "works in both directions — joining parts and removing them",
    next: "busier figures where the parts are harder to pick out",
    sample: "circlePlus",
  },
  {
    max: 8.5,
    title: "Working with detail",
    can: "handles crowded figures and spots small differences between them",
    next: "the hardest figures, where two answers look nearly the same",
    sample: "squarePlus",
  },
  {
    max: 11,
    title: "Reading fine detail",
    can: "separates shapes that differ by a single stroke",
    next: "ready to carry this into letters and numbers",
    sample: "squareCross",
  },
]

const bandFor = (level: number): Band => BANDS.find((b) => level < b.max) ?? BANDS[BANDS.length - 1]

export function ResultView({
  childName,
  placement,
  onRestart,
}: {
  childName: string
  placement: Placement
  onRestart: () => void
}) {
  const band = bandFor(placement.level)
  const sample = COMPOSITES.find((c) => c.id === band.sample) ?? COMPOSITES[0]
  const seconds = Math.round(placement.medianMs / 100) / 10

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6">
      <div className="pm-paper relative w-full rounded-[26px] px-6 py-8 sm:px-9">
        <span aria-hidden className="pm-tape absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2" />

        <div className="flex items-start justify-between gap-5">
          <div>
            <span className="inline-flex -rotate-1 items-center rounded-sm bg-[#f5c843] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#112b5f]">
              Where {childName} is working
            </span>
            <h2 className="pm-display mt-3 text-3xl leading-tight">{band.title}</h2>
          </div>
          <ShapeFigure shape={sample.strokes} tone="answer" size={72} className="-rotate-2" />
        </div>

        <p className="mt-4 text-[15px] leading-relaxed text-[#31406a]">
          {childName} comfortably {band.can}.
        </p>

        <div className="mt-6 rounded-2xl bg-[#eef3ff] px-5 py-4">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#2864d7]">Next step</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-[#1b2c4f]">{band.next}</p>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-[#132d63]/10 pt-5">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5e6b84]">Level</dt>
            <dd className="pm-display text-2xl tabular-nums">{placement.level.toFixed(1)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5e6b84]">Got right</dt>
            <dd className="pm-display text-2xl tabular-nums">
              {placement.correct}/{placement.total}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5e6b84]">Thinking time</dt>
            <dd className="pm-display text-2xl tabular-nums">{seconds}s</dd>
          </div>
        </dl>

        {placement.provisional && (
          <p className="mt-5 rounded-xl bg-[#fbf0df] px-4 py-3 text-[13px] leading-relaxed text-[#8a5a12]">
            This one is a rough estimate — {childName} did not settle at a steady level yet. A second
            session will sharpen it.
          </p>
        )}
      </div>

      <button type="button" onClick={onRestart} className="pm-btn rounded-2xl px-7 py-3.5 font-black">
        Play again
      </button>
    </div>
  )
}
