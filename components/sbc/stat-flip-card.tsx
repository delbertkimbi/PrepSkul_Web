"use client"

import type { LucideIcon } from "lucide-react"
import { FlipCard } from "@/components/sbc/flip-card"

interface StatFlipCardProps {
  icon: LucideIcon
  label: string
  sub: string
  back: string
  delay?: number
  index?: number
}

export function StatFlipCard({ icon: Icon, label, sub, back, delay = 0, index = 0 }: StatFlipCardProps) {
  return (
    <FlipCard
      delay={delay}
      heightClass="min-h-[140px] sm:min-h-[152px]"
      initialSide={index === 1 ? "back" : "front"}
      viewFlipDelay={900 + delay * 200}
      idleFlipDelay={2200 + delay * 200}
      front={
        <div className="h-full flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 text-center shadow-sm">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF8A00] mb-2" />
          <p className="font-bold text-[#1B2C4F] text-sm sm:text-base">{label}</p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">{sub}</p>
        </div>
      }
      back={
        <div className="h-full flex flex-col items-center justify-center rounded-2xl bg-[#FF8A00] p-4 sm:p-5 text-center text-white shadow-md">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white/90 mb-2" />
          <p className="font-bold text-sm sm:text-base mb-1">{label}</p>
          <p className="text-xs sm:text-sm text-white/90 leading-snug">{back}</p>
        </div>
      }
    />
  )
}
