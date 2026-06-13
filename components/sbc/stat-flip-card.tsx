"use client"

import type { LucideIcon } from "lucide-react"
import { FlipCard } from "@/components/sbc/flip-card"
import {
  invertedBody,
  invertedCardShell,
  invertedIconColor,
  invertedTitle,
} from "@/components/sbc/inverted-card-face"
import { cn } from "@/lib/utils"

interface StatFlipCardProps {
  icon: LucideIcon
  label: string
  sub: string
  back: string
  delay?: number
  index?: number
}

function StatCardFace({
  icon: Icon,
  label,
  sub,
  back,
  theme,
}: {
  icon: LucideIcon
  label: string
  sub: string
  back: string
  theme: "light" | "dark"
}) {
  return (
    <div className={cn(invertedCardShell(theme, "items-center justify-center text-center rounded-2xl"))}>
      <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6 mb-2", invertedIconColor(theme))} />
      <p className={invertedTitle(theme)}>{label}</p>
      <p className={invertedBody(theme)}>{sub}</p>
      {back.trim() !== sub.trim() && (
        <p className={cn(invertedBody(theme), "mt-1.5")}>{back}</p>
      )}
    </div>
  )
}

export function StatFlipCard({ icon, label, sub, back, delay = 0, index = 0 }: StatFlipCardProps) {
  return (
    <FlipCard
      delay={delay}
      heightClass="min-h-[140px] sm:min-h-[152px]"
      initialSide="back"
      front={<StatCardFace icon={icon} label={label} sub={sub} back={back} theme="light" />}
      back={<StatCardFace icon={icon} label={label} sub={sub} back={back} theme="dark" />}
    />
  )
}
