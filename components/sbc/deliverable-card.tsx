import { cn } from "@/lib/utils"
import { sbcPremiumBlueCard } from "@/lib/sbc/styles"

interface DeliverableCardProps {
  number: string
  title: string
  description: string
}

export function DeliverableCard({ number, title, description }: DeliverableCardProps) {
  return (
    <div className={cn(sbcPremiumBlueCard, "rounded-2xl p-6 sm:p-7 h-full flex flex-col")}>
      <p className="text-3xl sm:text-4xl font-black text-[#7eb8ff]/40 leading-none mb-4">{number}</p>
      <h3 className="font-bold text-lg sm:text-xl text-white mb-3 leading-snug">{title}</h3>
      <p className="text-sm text-white/80 leading-relaxed flex-1">{description}</p>
    </div>
  )
}
