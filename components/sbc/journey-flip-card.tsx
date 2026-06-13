"use client"

import type { LucideIcon } from "lucide-react"
import { FlipCard } from "@/components/sbc/flip-card"

interface JourneyFlipCardProps {
  step: number
  title: string
  description: string
  flipDetail: string
  icon: LucideIcon
  delay?: number
}

export function JourneyFlipCard({
  step,
  title,
  description,
  flipDetail,
  icon: Icon,
  delay = 0,
}: JourneyFlipCardProps) {
  return (
    <FlipCard
      delay={delay}
      heightClass="min-h-[200px] sm:min-h-[220px]"
      initialSide={step % 2 === 1 ? "back" : "front"}
      front={
        <div className="h-full flex flex-col rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF8A00]/15 flex items-center justify-center mb-3">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF8A00]" />
          </div>
          <p className="text-xs text-[#4A6FBF] font-bold mb-1">Step {step}</p>
          <h3 className="font-bold text-[#1B2C4F] mb-1.5 text-sm sm:text-base">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed flex-1">{description}</p>
        </div>
      }
      back={
        <div className="h-full flex flex-col rounded-2xl bg-gradient-to-br from-[#1B2C4F] to-[#2d4a7a] border border-[#4A6FBF]/30 p-4 sm:p-5 text-white shadow-md">
          <p className="text-xs text-[#FFD93D] font-bold uppercase tracking-wider mb-2">Inside this stage</p>
          <h3 className="font-bold text-base sm:text-lg mb-2">{title}</h3>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed flex-1">{flipDetail}</p>
          <p className="text-[10px] text-white/50 pt-2">Step {step} of 5</p>
        </div>
      }
    />
  )
}
