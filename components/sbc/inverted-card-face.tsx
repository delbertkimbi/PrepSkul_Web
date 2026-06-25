import { cn } from "@/lib/utils"
import { sbcPremiumBlueCard } from "@/lib/sbc/styles"

type CardTheme = "light" | "dark"

export function invertedCardShell(theme: CardTheme, className?: string) {
  return cn(
    "h-full flex flex-col p-4 sm:p-5",
    theme === "light"
      ? "rounded-xl bg-white border border-slate-200/90 shadow-sm text-[#1B2C4F]"
      : cn("rounded-xl", sbcPremiumBlueCard),
    className
  )
}

export function invertedBadge(theme: CardTheme, className?: string) {
  return cn(
    "text-[10px] uppercase tracking-wider font-bold mb-1",
    theme === "light" ? "text-[#4A6FBF]" : "text-[#7eb8ff]/90",
    className
  )
}

export function invertedTitle(theme: CardTheme, className?: string) {
  return cn(
    "font-bold text-sm sm:text-base mb-2 leading-snug",
    theme === "light" ? "text-[#1B2C4F]" : "text-white",
    className
  )
}

export function invertedBody(theme: CardTheme, className?: string) {
  return cn(
    "text-xs sm:text-sm leading-relaxed flex-1",
    theme === "light" ? "text-slate-500" : "text-white/85",
    className
  )
}

export function invertedIconColor(theme: CardTheme) {
  return theme === "light" ? "text-[#4A6FBF]" : "text-[#7eb8ff]"
}

export function invertedDot(theme: CardTheme) {
  return theme === "light" ? "bg-[#4A6FBF]" : "bg-[#7eb8ff]"
}

export function invertedStepBadge(theme: CardTheme) {
  return cn(
    "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-3",
    theme === "light" ? "bg-[#eef3ff]" : "bg-white/10 border border-white/15"
  )
}

export function invertedWeekNumber(theme: CardTheme) {
  return cn(
    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
    theme === "light"
      ? "bg-[#eef3ff] border border-[#4A6FBF]/30 text-[#4A6FBF]"
      : "bg-white/10 border border-white/20 text-white"
  )
}
