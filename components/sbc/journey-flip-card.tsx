"use client"

import type { LucideIcon } from "lucide-react"
import { FlipCard } from "@/components/sbc/flip-card"
import {
  invertedBadge,
  invertedBody,
  invertedCardShell,
  invertedIconColor,
  invertedStepBadge,
  invertedTitle,
} from "@/components/sbc/inverted-card-face"
import { cn } from "@/lib/utils"

interface JourneyFlipCardProps {
  step: number
  title: string
  description: string
  flipDetail: string
  icon: LucideIcon
  delay?: number
}

function JourneyCardFace({
  step,
  title,
  description,
  flipDetail,
  icon: Icon,
  theme,
}: {
  step: number
  title: string
  description: string
  flipDetail: string
  icon: LucideIcon
  theme: "light" | "dark"
}) {
  return (
    <div className={cn(invertedCardShell(theme, "rounded-2xl hover:shadow-md transition-shadow"))}>
      <div className={invertedStepBadge(theme)}>
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", invertedIconColor(theme))} />
      </div>
      <p className={invertedBadge(theme)}>Step {step}</p>
      <h3 className={invertedTitle(theme)}>{title}</h3>
      <p className={invertedBody(theme)}>{description}</p>
      {flipDetail.trim() !== description.trim() && (
        <p className={cn(invertedBody(theme), "mt-2")}>{flipDetail}</p>
      )}
    </div>
  )
}

export function JourneyFlipCard({
  step,
  title,
  description,
  flipDetail,
  icon,
  delay = 0,
}: JourneyFlipCardProps) {
  return (
    <FlipCard
      delay={delay}
      heightClass="min-h-[200px] sm:min-h-[220px]"
      initialSide="back"
      front={
        <JourneyCardFace
          step={step}
          title={title}
          description={description}
          flipDetail={flipDetail}
          icon={icon}
          theme="light"
        />
      }
      back={
        <JourneyCardFace
          step={step}
          title={title}
          description={description}
          flipDetail={flipDetail}
          icon={icon}
          theme="dark"
        />
      }
    />
  )
}
