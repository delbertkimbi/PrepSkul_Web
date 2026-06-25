import { cn } from "@/lib/utils"
import { sbcPremiumBlueCard } from "@/lib/sbc/styles"

interface CurriculumWeekCardProps {
  week: number
  title: string
  learn: string
  do: string
  produce: string
  className?: string
}

function Block({ label, text, inverted = false }: { label: string; text: string; inverted?: boolean }) {
  return (
    <div className="space-y-1">
      <p
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          inverted ? "text-[#7eb8ff]/90" : "text-[#4A6FBF]"
        )}
      >
        {label}
      </p>
      <p className={cn("text-xs sm:text-sm leading-relaxed", inverted ? "text-white/85" : "text-slate-600")}>
        {text}
      </p>
    </div>
  )
}

export function CurriculumWeekCard({ week, title, learn, do: doText, produce, className }: CurriculumWeekCardProps) {
  return (
    <div className={cn(sbcPremiumBlueCard, "rounded-2xl p-5 sm:p-6 flex flex-col gap-4 h-full", className)}>
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-black shrink-0">
          W{week}
        </span>
        <h3 className="font-bold text-base sm:text-lg text-white leading-snug pt-1">{title}</h3>
      </div>
      <div className="space-y-3.5 flex-1">
        <Block label="Learn" text={learn} inverted />
        <Block label="Do" text={doText} inverted />
        <Block label="Produce" text={produce} inverted />
      </div>
    </div>
  )
}
