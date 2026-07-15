import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function PaperSheet({ children, className, tone = "cream", rotate = 0 }: { children: ReactNode; className?: string; tone?: "cream" | "blue" | "yellow" | "mint" | "lilac" | "peach"; rotate?: number }) {
  const tones = {
    cream: "bg-[#fffdf7]",
    blue: "bg-[#eaf3ff]",
    yellow: "bg-[#fff0a8]",
    mint: "bg-[#dff4e4]",
    lilac: "bg-[#eee5ff]",
    peach: "bg-[#ffe4d5]",
  }
  return <div className={cn("sbc-paper relative rounded-[24px] border border-[#16346a]/10", tones[tone], className)} style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}>{children}</div>
}

export function Tape({ className, color = "blue" }: { className?: string; color?: "blue" | "cream" | "yellow" }) {
  const colors = { blue: "bg-[#638be0]/70", cream: "bg-[#e8d6ae]/75", yellow: "bg-[#f4c742]/75" }
  return <span aria-hidden className={cn("absolute z-20 h-7 w-24 -rotate-2 opacity-80 shadow-sm", colors[color], className)} />
}

export function Doodle({ children, className }: { children: ReactNode; className?: string }) {
  return <span aria-hidden className={cn("absolute select-none font-black text-[#2864d7]", className)}>{children}</span>
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex -rotate-1 items-center rounded-sm bg-[#f5c843] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#112b5f] shadow-sm", className)}>{children}</span>
}

export function TornDivider({ flip = false }: { flip?: boolean }) {
  return <div aria-hidden className={cn("sbc-torn-divider h-9 w-full", flip && "rotate-180")} />
}

export function PaperButton({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("sbc-paper-button inline-flex items-center justify-center rounded-2xl bg-[#1e3a8a] px-6 py-3.5 font-black text-white shadow-[0_7px_0_#12295f] transition duration-200", className)}>{children}</span>
}
