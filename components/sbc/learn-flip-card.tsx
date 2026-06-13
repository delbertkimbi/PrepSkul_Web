"use client"

import { FlipCard } from "@/components/sbc/flip-card"
import { Rocket } from "lucide-react"
import {
  invertedBadge,
  invertedBody,
  invertedCardShell,
  invertedDot,
  invertedIconColor,
  invertedTitle,
} from "@/components/sbc/inverted-card-face"
import { cn } from "@/lib/utils"

interface LearnFlipCardProps {
  title: string
  detail: string
  variant?: "learn" | "outcome"
  delay?: number
  index?: number
}

function LearnCardFace({
  title,
  detail,
  variant,
  theme,
}: {
  title: string
  detail: string
  variant: "learn" | "outcome"
  theme: "light" | "dark"
}) {
  const badge = variant === "outcome" ? "Outcome" : "Skill"

  return (
    <div className={invertedCardShell(theme)}>
      <p className={invertedBadge(theme)}>{badge}</p>
      <div className="flex items-start gap-2 mb-2">
        {variant === "outcome" ? (
          <Rocket className={cn("h-4 w-4 shrink-0 mt-0.5", invertedIconColor(theme))} />
        ) : (
          <span className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", invertedDot(theme))} />
        )}
        <p className={cn(invertedTitle(theme), "mb-0 flex-1")}>{title}</p>
      </div>
      <p className={invertedBody(theme)}>{detail}</p>
    </div>
  )
}

export function LearnFlipCard({
  title,
  detail,
  variant = "learn",
  delay = 0,
  index = 0,
}: LearnFlipCardProps) {
  return (
    <FlipCard
      delay={delay}
      heightClass="min-h-[130px] sm:min-h-[140px]"
      initialSide={index % 2 === 1 ? "back" : "front"}
      front={<LearnCardFace title={title} detail={detail} variant={variant} theme="light" />}
      back={<LearnCardFace title={title} detail={detail} variant={variant} theme="dark" />}
    />
  )
}
