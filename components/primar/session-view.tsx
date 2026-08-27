"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { EqualsGlyph, MysterySlot, OperatorGlyph, ShapeFigure } from "./shape-figure"
import { shapesEqual } from "@/lib/primar/strokes"
import {
  computePlacement,
  nextItem,
  recordAttempt,
  SESSION_LENGTH,
  startSession,
  type Placement,
  type SessionState,
} from "@/lib/primar/mastery"

/**
 * The working loop.
 *
 * There is no score, no timer on screen, and no streak. A missed answer shows
 * the right one calmly and moves on — the staircase is already keeping the
 * child near 70% correct, so the felt experience is "I can mostly do this",
 * which is the only thing that brings a child back tomorrow.
 */

type Phase = "asking" | "revealing"

export function SessionView({ onFinish }: { onFinish: (placement: Placement, state: SessionState) => void }) {
  const [state, setState] = useState<SessionState>(() => startSession())
  const [phase, setPhase] = useState<Phase>("asking")
  const [chosen, setChosen] = useState<number | null>(null)
  const shownAt = useRef<number>(Date.now())
  const timeoutRef = useRef<number | null>(null)

  const item = useMemo(() => nextItem(state), [state])

  useEffect(() => {
    shownAt.current = Date.now()
    setPhase("asking")
    setChosen(null)
  }, [item.id])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const choose = useCallback(
    (optionIndex: number) => {
      if (phase !== "asking") return

      const correct = shapesEqual(item.options[optionIndex], item.answer)
      setChosen(optionIndex)
      setPhase("revealing")

      const advance = () => {
        const updated = recordAttempt(state, {
          itemId: item.id,
          level: item.level,
          correct,
          elapsedMs: Date.now() - shownAt.current,
        })
        if (updated.finished) onFinish(computePlacement(updated), updated)
        else setState(updated)
      }

      // A correct answer moves on briskly; a miss lingers a moment longer so the
      // child actually sees the right shape before the next question arrives.
      timeoutRef.current = window.setTimeout(advance, correct ? 620 : 1450)
    },
    [item, onFinish, phase, state],
  )

  const answered = state.attempts.length

  return (
    <div className="flex w-full flex-col items-center gap-7">
      <div className="flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: SESSION_LENGTH }).map((_, i) => (
          <span
            key={i}
            className="pm-progress-pip h-2 rounded-full"
            style={{
              width: i < answered ? 16 : 8,
              backgroundColor: i < answered ? "#168c91" : "rgba(19,45,99,0.16)",
            }}
          />
        ))}
      </div>

      <div className="pm-paper relative flex w-full max-w-md items-center justify-center gap-1 rounded-[26px] px-4 py-9">
        <span aria-hidden className="pm-tape absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2" />
        <ShapeFigure shape={item.operandA} tone="question" size={68} />
        <OperatorGlyph op={item.op} size={24} />
        <ShapeFigure shape={item.operandB} tone="question" size={68} />
        <EqualsGlyph size={24} />
        {phase === "revealing" ? (
          <div className="pm-anim-pop">
            <ShapeFigure shape={item.answer} tone="answer" size={68} />
          </div>
        ) : (
          <MysterySlot size={68} />
        )}
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-3.5">
        {item.options.map((option, i) => {
          const isAnswer = shapesEqual(option, item.answer)
          const revealed = phase === "revealing"
          const tileState = revealed
            ? isAnswer
              ? "pm-tile--right"
              : chosen === i
                ? "pm-tile--missed"
                : ""
            : ""

          return (
            <button
              key={`${item.id}-${i}`}
              type="button"
              onClick={() => choose(i)}
              disabled={revealed}
              aria-label={`Option ${i + 1}`}
              className={`pm-tile flex aspect-square items-center justify-center rounded-[22px] ${tileState}`}
            >
              <ShapeFigure
                shape={option}
                tone={revealed && !isAnswer && chosen === i ? "ghost" : "answer"}
                size={92}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
