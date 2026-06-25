"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lightbulb,
  Sparkles,
  Palette,
  Code,
  Megaphone,
  Trophy,
  ChevronDown,
  Flag,
  Rocket,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { sbcPremiumBlueCard } from "@/lib/sbc/styles"
import type { LucideIcon } from "lucide-react"

export type RoadmapWeek = {
  week: number
  title: string
  learn: string
  do: string
  produce: string
}

const weekMeta: Record<
  number,
  { icon: LucideIcon; milestone: string; phase: "foundation" | "creation" | "launch" }
> = {
  1: { icon: Lightbulb, milestone: "Discover", phase: "foundation" },
  2: { icon: Sparkles, milestone: "Ideate", phase: "foundation" },
  3: { icon: Palette, milestone: "Brand", phase: "creation" },
  4: { icon: Code, milestone: "Build", phase: "creation" },
  5: { icon: Megaphone, milestone: "Market", phase: "launch" },
  6: { icon: Trophy, milestone: "Launch", phase: "launch" },
}

const phaseLabels = {
  foundation: { label: "Phase 1 · Foundation", sub: "Weeks 1–2" },
  creation: { label: "Phase 2 · Creation", sub: "Weeks 3–4" },
  launch: { label: "Phase 3 · Launch", sub: "Weeks 5–6" },
}

function WeekCard({ week, open, onToggle }: { week: RoadmapWeek; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        sbcPremiumBlueCard,
        "w-full rounded-2xl p-4 sm:p-5 text-left transition-all duration-300",
        "hover:border-[#6ba3f0]/50 hover:shadow-xl hover:shadow-[#1a3260]/20",
        open && "ring-2 ring-[#7eb8ff]/40"
      )}
      aria-expanded={open}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7eb8ff]/90 mb-1">
            Week {week.week}
          </p>
          <h3 className="font-bold text-base sm:text-lg text-white leading-snug">{week.title}</h3>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-[#7eb8ff] shrink-0 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2.5">
        <Rocket className="h-3.5 w-3.5 text-[#FFD93D] shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFD93D]/90 mb-0.5">
            They leave with
          </p>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{week.produce}</p>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3 border-t border-white/10 mt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7eb8ff]/80 mb-1">
                  Learn
                </p>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{week.learn}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7eb8ff]/80 mb-1">
                  Do
                </p>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{week.do}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <p className="text-[10px] text-white/45 mt-3">Tap to see what they learn and do this week</p>
      )}
    </button>
  )
}

function PathNode({ week, isLast }: { week: RoadmapWeek; isLast: boolean }) {
  const meta = weekMeta[week.week]
  const Icon = meta.icon

  return (
    <div className="flex flex-col items-center shrink-0">
      <div
        className={cn(
          "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative z-10",
          "bg-gradient-to-br from-[#3d7dd4] to-[#1a3260] border-2 border-[#7eb8ff]/50 shadow-lg shadow-[#1a3260]/30"
        )}
      >
        <Icon className="h-5 w-5 text-white" aria-hidden />
      </div>
      <span className="mt-1.5 text-[10px] font-black uppercase tracking-wider text-[#4A6FBF]">
        W{week.week}
      </span>
      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
        {meta.milestone}
      </span>
      {!isLast && (
        <div
          className="w-0.5 flex-1 min-h-[1.5rem] mt-2 bg-gradient-to-b from-[#4A6FBF] to-[#7eb8ff]/40 lg:hidden"
          aria-hidden
        />
      )}
    </div>
  )
}

function RoadmapStop({
  week,
  index,
  isLast,
}: {
  week: RoadmapWeek
  index: number
  isLast: boolean
}) {
  const [open, setOpen] = useState(false)
  const meta = weekMeta[week.week]
  const cardOnRight = index % 2 === 0

  const showPhase =
    week.week === 1 || week.week === 3 || week.week === 5 ? phaseLabels[meta.phase] : null

  return (
    <>
      {showPhase && (
        <div className="relative flex justify-center py-6 sm:py-8">
          <div className="relative z-10 px-5 py-2 rounded-full bg-white border border-[#4A6FBF]/25 shadow-sm text-center">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-[#4A6FBF]">
              {showPhase.label}
            </p>
            <p className="text-[10px] text-slate-400">{showPhase.sub}</p>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, delay: index * 0.06 }}
        className="relative pb-8 sm:pb-12 lg:pb-16"
      >
        {/* Mobile layout */}
        <div className="flex gap-4 lg:hidden">
          <PathNode week={week} isLast={isLast} />
          <div className="flex-1 min-w-0 pb-2">
            <WeekCard week={week} open={open} onToggle={() => setOpen((o) => !o)} />
          </div>
        </div>

        {/* Desktop alternating layout */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-x-8 lg:items-start">
          <div className="min-w-0 col-start-1">
            {!cardOnRight && (
              <WeekCard week={week} open={open} onToggle={() => setOpen((o) => !o)} />
            )}
          </div>
          <div className="col-start-2 flex justify-center px-2">
            <PathNode week={week} isLast={isLast} />
          </div>
          <div className="min-w-0 col-start-3">
            {cardOnRight && (
              <WeekCard week={week} open={open} onToggle={() => setOpen((o) => !o)} />
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export function CurriculumRoadmap({ weeks }: { weeks: readonly RoadmapWeek[] }) {
  return (
    <div className="relative max-w-4xl mx-auto">
      <div
        className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-10 bottom-16 w-1 rounded-full bg-gradient-to-b from-[#7eb8ff]/60 via-[#4A6FBF] to-[#FFD93D]/70"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative z-10 flex flex-col items-center mb-8 sm:mb-10"
      >
        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#4A6FBF]/30 shadow-md flex items-center justify-center mb-2">
          <Flag className="h-6 w-6 text-[#4A6FBF]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4A6FBF]">Start</p>
        <p className="text-sm font-semibold text-[#1B2C4F]">Curious explorer arrives</p>
      </motion.div>

      {weeks.map((w, i) => (
        <RoadmapStop key={w.week} week={w} index={i} isLast={i === weeks.length - 1} />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD93D] to-[#e6c235] shadow-lg shadow-[#FFD93D]/25 flex items-center justify-center mb-2">
          <Trophy className="h-7 w-7 text-[#1B2C4F]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4A6FBF]">Finish</p>
        <p className="text-base sm:text-lg font-black text-[#1B2C4F]">Demo Day · Confident founder</p>
        <p className="text-sm text-slate-500 mt-1 text-center max-w-xs">
          Live pitch. Product demo. Certificate in hand.
        </p>
      </motion.div>
    </div>
  )
}
