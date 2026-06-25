"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { SBC_CURRICULUM_WEEKS } from "@/lib/sbc/content"
import { cn } from "@/lib/utils"

const shortLabels: Record<number, string> = {
  1: "Think",
  2: "AI",
  3: "Brand",
  4: "Build",
  5: "Market",
  6: "Launch",
}

function ZigzagPath({ count }: { count: number }) {
  const step = 100 / count
  const points = Array.from({ length: count }, (_, i) => {
    const y = step * i + step / 2
    const x = i % 2 === 0 ? 18 : 82
    return { x, y }
  })

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const midY = (prev.y + curr.y) / 2
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="sbcPathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7eb8ff" />
          <stop offset="55%" stopColor="#4A6FBF" />
          <stop offset="100%" stopColor="#FFD93D" />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="url(#sbcPathGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 3"
        vectorEffect="non-scaling-stroke"
        opacity={0.55}
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === count - 1 ? 2.8 : 2.2}
          fill={i === count - 1 ? "#FFD93D" : "#4A6FBF"}
          opacity={0.85}
        />
      ))}
    </svg>
  )
}

export function RoadmapPreview({ href }: { href: string }) {
  return (
    <div className="max-w-md sm:max-w-lg lg:max-w-xl mx-auto">
      <div className="relative py-4 sm:py-6 min-h-[420px] sm:min-h-[480px]">
        <ZigzagPath count={SBC_CURRICULUM_WEEKS.length} />

        <div className="relative flex flex-col gap-6 sm:gap-7 lg:gap-8">
          {SBC_CURRICULUM_WEEKS.map((w, i) => {
            const isLeft = i % 2 === 0
            const isLast = i === SBC_CURRICULUM_WEEKS.length - 1
            return (
              <motion.div
                key={w.week}
                initial={{ opacity: 0, x: isLeft ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-24px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className={cn("flex w-[46%] sm:w-[42%]", isLeft ? "mr-auto" : "ml-auto")}
              >
                <div
                  className={cn(
                    "w-full rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5",
                    "bg-[#f4f7ff] border border-[#4A6FBF]/15 text-[#1B2C4F]",
                    "shadow-[2px_3px_10px_rgba(27,44,79,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]",
                    isLast && "ring-1 ring-[#FFD93D]/40"
                  )}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A6FBF]/80">
                    Week {w.week}
                  </p>
                  <p className="font-bold text-sm sm:text-base leading-snug mt-0.5">
                    {shortLabels[w.week]}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4A6FBF]/70" aria-hidden />
          Start
        </span>
        <div className="h-px w-10 sm:w-14 bg-gradient-to-r from-[#4A6FBF]/25 via-[#4A6FBF]/40 to-[#FFD93D]/70" aria-hidden />
        <span className="inline-flex items-center gap-1.5 text-[#FFD93D]/90">
          <span className="w-2 h-2 rounded-full bg-[#FFD93D]" aria-hidden />
          Demo Day
        </span>
      </div>

      <div className="text-center mt-6 sm:mt-8">
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#4A6FBF] hover:text-[#1B2C4F] transition-colors"
        >
          Explore the full 6-week pathway
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
