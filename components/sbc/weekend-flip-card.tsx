"use client"

import { FlipCard } from "@/components/sbc/flip-card"
import {
  invertedBadge,
  invertedBody,
  invertedCardShell,
  invertedTitle,
  invertedWeekNumber,
} from "@/components/sbc/inverted-card-face"
import { cn } from "@/lib/utils"

interface WeekendFlipCardProps {
  week: number
  focus: string
  detail: string
  back: string
  delay?: number
  index?: number
}

function WeekendCardFace({
  week,
  focus,
  detail,
  back,
  theme,
}: {
  week: number
  focus: string
  detail: string
  back: string
  theme: "light" | "dark"
}) {
  return (
    <div className={invertedCardShell(theme)}>
      <div className="flex items-start gap-3 mb-2">
        <span className={invertedWeekNumber(theme)}>{week}</span>
        <h3 className={cn(invertedTitle(theme), "mb-0 flex-1")}>{focus}</h3>
      </div>
      <p className={cn(invertedBadge(theme), "pl-11 mb-1.5")}>Week {week}</p>
      <p className={cn(invertedBody(theme), "pl-11")}>{detail}</p>
      {back.trim() !== detail.trim() && (
        <p className={cn(invertedBody(theme), "pl-11 mt-2")}>{back}</p>
      )}
    </div>
  )
}

export function WeekendFlipCard({
  week,
  focus,
  detail,
  back,
  delay = 0,
  index = 0,
}: WeekendFlipCardProps) {
  return (
    <FlipCard
      delay={delay}
      heightClass="min-h-[150px] sm:min-h-[160px]"
      initialSide="back"
      front={<WeekendCardFace week={week} focus={focus} detail={detail} back={back} theme="light" />}
      back={<WeekendCardFace week={week} focus={focus} detail={detail} back={back} theme="dark" />}
    />
  )
}
