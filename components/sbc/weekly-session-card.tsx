import { cn } from "@/lib/utils"
import { sbcPremiumBlueCard } from "@/lib/sbc/styles"

interface WeeklySessionCardProps {
  day: string
  type: string
  description: string
}

export function WeeklySessionCard({ day, type, description }: WeeklySessionCardProps) {
  return (
    <div className={cn(sbcPremiumBlueCard, "rounded-2xl p-5 sm:p-6 h-full flex flex-col")}>
      <p className="text-xs font-bold uppercase tracking-wider text-[#7eb8ff] mb-1">{day}</p>
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/60 mb-3">{type}</p>
      <p className="text-sm text-white/85 leading-relaxed flex-1">{description}</p>
    </div>
  )
}
