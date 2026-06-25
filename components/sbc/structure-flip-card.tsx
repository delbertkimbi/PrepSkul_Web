"use client"

import type { LucideIcon } from "lucide-react"
import { FlipCard } from "@/components/sbc/flip-card"
import {
  invertedBadge,
  invertedBody,
  invertedCardShell,
  invertedIconColor,
  invertedTitle,
} from "@/components/sbc/inverted-card-face"
import { cn } from "@/lib/utils"

interface StructureFlipCardProps {
  icon: LucideIcon
  label: string
  title: string
  description: string
  delay?: number
}

function StructureFace({
  icon: Icon,
  label,
  title,
  description,
  theme,
}: {
  icon: LucideIcon
  label: string
  title: string
  description: string
  theme: "light" | "dark"
}) {
  return (
    <div className={cn(invertedCardShell(theme, "rounded-2xl"))}>
      <Icon className={cn("h-5 w-5 mb-3", invertedIconColor(theme))} />
      <p className={invertedBadge(theme)}>{label}</p>
      <p className={invertedTitle(theme)}>{title}</p>
      <p className={invertedBody(theme)}>{description}</p>
    </div>
  )
}

export function StructureFlipCard({ icon, label, title, description, delay = 0 }: StructureFlipCardProps) {
  return (
    <FlipCard
      delay={delay}
      heightClass="min-h-[160px] sm:min-h-[172px]"
      initialSide="back"
      front={<StructureFace icon={icon} label={label} title={title} description={description} theme="light" />}
      back={<StructureFace icon={icon} label={label} title={title} description={description} theme="dark" />}
    />
  )
}
