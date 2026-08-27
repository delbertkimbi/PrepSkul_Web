"use client"

import { useCallback, useState } from "react"
import { DemoReel } from "@/components/primar/demo-reel"
import { ResultView } from "@/components/primar/result-view"
import { SessionView } from "@/components/primar/session-view"
import { ShapeFigure } from "@/components/primar/shape-figure"
import { COMPOSITES } from "@/lib/primar/strokes"
import { TOPIC_ID, toMasteryUpsert, type Placement, type SessionState } from "@/lib/primar/mastery"

/**
 * Whole flow: parent sets up, hands the phone over, child plays, parent reads
 * the result. Everything runs client-side, so a session works with the network
 * off — which matters in regions where it goes off without warning.
 */

type Stage = "welcome" | "handoff" | "demo" | "session" | "result"

export default function PrimarPage() {
  const [stage, setStage] = useState<Stage>("welcome")
  const [childName, setChildName] = useState("")
  const [placement, setPlacement] = useState<Placement | null>(null)

  const name = childName.trim() || "your child"

  const handleFinish = useCallback((result: Placement, state: SessionState) => {
    setPlacement(result)
    setStage("result")

    // Shaped for skulmate_concept_mastery. Held locally for now so the loop can
    // be validated with real children before any account or network is required.
    const row = toMasteryUpsert(result, TOPIC_ID)
    try {
      const log = JSON.parse(window.localStorage.getItem("primar.sessions") ?? "[]")
      log.push({ at: new Date().toISOString(), row, attempts: state.attempts })
      window.localStorage.setItem("primar.sessions", JSON.stringify(log.slice(-50)))
    } catch {
      /* storage unavailable — a session must never fail because of logging */
    }
  }, [])

  return (
    <main className="pm-site min-h-screen w-full px-5 py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
        {stage === "welcome" && (
          <section className="flex w-full max-w-lg flex-col items-center gap-7">
            <div className="flex items-center gap-2.5">
              <ShapeFigure shape={["arcL", "arcR", "vert", "horiz"]} tone="answer" size={40} />
              <span className="pm-display text-xl">SkulMate</span>
            </div>

            <div className="pm-paper relative w-full rounded-[26px] px-6 py-9 sm:px-9">
              <span aria-hidden className="pm-tape absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2" />
              <h1 className="pm-display text-[32px] leading-[1.1] sm:text-4xl">
                Find out where your child is really working.
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-[#31406a]">
                A five-minute picture game. No reading, no writing, nothing to type. Your child
                just looks at shapes and taps the one that fits.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#31406a]">
                At the end you get one clear thing: where they are, and what comes next.
              </p>

              <label htmlFor="child-name" className="mt-7 block text-[11px] font-black uppercase tracking-[0.14em] text-[#5e6b84]">
                Your child&rsquo;s first name
              </label>
              <input
                id="child-name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Ayuk"
                autoComplete="off"
                className="mt-2 min-h-[52px] w-full rounded-[14px] border border-[#132d63]/20 bg-white/75 px-4 text-lg outline-none focus:border-[#2864d7] focus:ring-4 focus:ring-[#2864d7]/20"
              />

              <button
                type="button"
                onClick={() => setStage("handoff")}
                className="pm-btn mt-6 w-full rounded-2xl px-6 py-4 text-lg font-black"
              >
                Start
              </button>
            </div>

            <p className="max-w-sm text-center text-[13px] leading-relaxed text-[#5e6b84]">
              Works without internet once loaded. Nothing about your child leaves this phone.
            </p>
          </section>
        )}

        {stage === "handoff" && (
          <section className="flex w-full max-w-lg flex-col items-center gap-8 pt-6">
            <div className="pm-paper relative w-full rounded-[26px] px-6 py-10 text-center sm:px-9">
              <span aria-hidden className="pm-tape absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2" />
              <div className="mx-auto flex w-fit -rotate-2 gap-2">
                {COMPOSITES.slice(0, 3).map((c) => (
                  <ShapeFigure key={c.id} shape={c.strokes} tone="question" size={52} />
                ))}
              </div>
              <h2 className="pm-display mt-6 text-3xl leading-tight">
                Now hand the phone to {name}.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#31406a]">
                The game shows them how it works — they do not need you to explain anything.
                Sit close by, but let them tap for themselves.
              </p>
              <button
                type="button"
                onClick={() => setStage("demo")}
                className="pm-btn mt-7 w-full rounded-2xl px-6 py-4 text-lg font-black"
              >
                They have it
              </button>
            </div>
          </section>
        )}

        {stage === "demo" && (
          <section className="flex w-full flex-col items-center pt-4">
            <DemoReel onReady={() => setStage("session")} />
          </section>
        )}

        {stage === "session" && (
          <section className="flex w-full flex-col items-center pt-2">
            <SessionView onFinish={handleFinish} />
          </section>
        )}

        {stage === "result" && placement && (
          <section className="flex w-full flex-col items-center pt-4">
            <ResultView
              childName={childName.trim() || "Your child"}
              placement={placement}
              onRestart={() => setStage("demo")}
            />
          </section>
        )}
      </div>
    </main>
  )
}
