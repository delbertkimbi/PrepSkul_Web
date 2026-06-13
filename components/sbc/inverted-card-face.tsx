import { cn } from "@/lib/utils"

type CardTheme = "light" | "dark"

export function invertedCardShell(theme: CardTheme, className?: string) {
  return cn(
    "h-full flex flex-col p-4 sm:p-5",
    theme === "light"
      ? "rounded-xl bg-white border border-slate-200 shadow-sm text-[#1B2C4F]"
      : "rounded-xl bg-gradient-to-br from-[#4A6FBF] to-[#1B2C4F] shadow-md text-white",
    className
  )
}

export function invertedBadge(theme: CardTheme, className?: string) {
  return cn(
    "text-[10px] uppercase tracking-wider font-bold mb-1",
    theme === "light" ? "text-[#4A6FBF]" : "text-white/70",
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
    theme === "light" ? "text-slate-500" : "text-white/90",
    className
  )
}

export function invertedIconColor(theme: CardTheme) {
  return theme === "light" ? "text-[#4A6FBF]" : "text-white/90"
}

export function invertedDot(theme: CardTheme) {
  return theme === "light" ? "bg-[#4A6FBF]" : "bg-white/90"
}

export function invertedStepBadge(theme: CardTheme) {
  return cn(
    "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-3",
    theme === "light" ? "bg-[#eef3ff]" : "bg-white/15"
  )
}

export function invertedWeekNumber(theme: CardTheme) {
  return cn(
    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
    theme === "light"
      ? "bg-[#eef3ff] border border-[#4A6FBF]/30 text-[#4A6FBF]"
      : "bg-white/15 border border-white/25 text-white"
  )
}
