import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { sbcPremiumBlueCard } from "@/lib/sbc/styles"

interface HeroStatCardProps {
  icon: LucideIcon
  value: string
  label: string
  detail: string
}

export function HeroStatCard({ icon: Icon, value, label, detail }: HeroStatCardProps) {
  return (
    <div
      className={cn(
        sbcPremiumBlueCard,
        "rounded-2xl p-3 sm:p-4 lg:p-3 xl:p-4 flex flex-col items-center justify-center text-center h-full min-h-[108px] lg:min-h-[118px]"
      )}
    >
      <Icon className="h-4 w-4 text-[#7eb8ff] mb-1.5 shrink-0" aria-hidden />
      <p className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-black leading-none tracking-tight">
        {value}
      </p>
      <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] font-semibold text-[#7eb8ff] mt-1">
        {label}
      </p>
      <p className="text-[10px] lg:text-[11px] text-white/70 mt-1.5 leading-snug line-clamp-2 max-w-[140px]">
        {detail}
      </p>
    </div>
  )
}
