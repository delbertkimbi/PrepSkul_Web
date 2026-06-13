"use client"

import { FlipCard } from "@/components/sbc/flip-card"
import { Rocket } from "lucide-react"

interface LearnFlipCardProps {
  title: string
  detail: string
  variant?: "learn" | "outcome"
  delay?: number
  index?: number
}

export function LearnFlipCard({
  title,
  detail,
  variant = "learn",
  delay = 0,
  index = 0,
}: LearnFlipCardProps) {
  const isOutcome = variant === "outcome"

  return (
    <FlipCard
      delay={delay}
      heightClass="min-h-[130px] sm:min-h-[140px]"
      initialSide={index % 2 === 1 ? "back" : "front"}
      front={
        <div className="h-full flex flex-col rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start gap-2 flex-1">
            {isOutcome ? (
              <Rocket className="h-4 w-4 text-[#FF8A00] shrink-0 mt-0.5" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#FF8A00] shrink-0 mt-1.5" />
            )}
            <p className="font-semibold text-[#1B2C4F] text-sm sm:text-base leading-snug">{title}</p>
          </div>
        </div>
      }
      back={
        <div
          className={`h-full flex flex-col rounded-xl p-4 text-white shadow-md ${
            isOutcome
              ? "bg-gradient-to-br from-[#FF8A00] to-[#e67a00]"
              : "bg-gradient-to-br from-[#4A6FBF] to-[#1B2C4F]"
          }`}
        >
          <p className="text-[10px] uppercase tracking-wider font-bold opacity-80 mb-1">
            {isOutcome ? "Outcome" : "Skill"}
          </p>
          <p className="font-bold text-sm sm:text-base mb-2">{title}</p>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed flex-1">{detail}</p>
        </div>
      }
    />
  )
}
