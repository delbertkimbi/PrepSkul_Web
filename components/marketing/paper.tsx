import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const tones = {
  cream: "bg-[#fffdf7]",
  blue: "bg-[#e8f4ff]",
  yellow: "bg-[#fff3b0]",
  mint: "bg-[#dff4e4]",
  peach: "bg-[#ffe4d5]",
  sky: "bg-[#d9f3ff]",
  navy: "bg-[#1B2C4F] text-white ps-paper-ink",
} as const

export function PaperSheet({
  children,
  className,
  tone = "cream",
  rotate = 0,
}: {
  children: ReactNode
  className?: string
  tone?: keyof typeof tones
  rotate?: number
}) {
  return (
    <div
      className={cn("ps-paper ps-neu relative rounded-[24px] border border-[#1B2C4F]/10", tones[tone], className)}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      {children}
    </div>
  )
}

export function Tape({ className, color = "blue" }: { className?: string; color?: "blue" | "cream" | "yellow" }) {
  const colors = { blue: "bg-[#7db7f0]/70", cream: "bg-[#e8d6ae]/75", yellow: "bg-[#EAB308]/75" }
  return <span aria-hidden className={cn("absolute z-20 h-7 w-24 -rotate-2 opacity-80 shadow-sm", colors[color], className)} />
}

export function Doodle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span aria-hidden className={cn("absolute select-none font-black text-[#0EA5E9]", className)}>
      {children}
    </span>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex -rotate-1 items-center rounded-sm bg-[#EAB308] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#1B2C4F] shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  )
}

export function TornDivider({ flip = false }: { flip?: boolean }) {
  return <div aria-hidden className={cn("ps-torn h-9 w-full", flip && "rotate-180")} />
}

export function PaperButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "ps-paper-button inline-flex items-center justify-center rounded-2xl bg-[#1B2C4F] px-6 py-3.5 font-black text-white shadow-[0_7px_0_#0f1a2e] transition duration-200",
        className,
      )}
    >
      {children}
    </span>
  )
}

export function PaperCutout({
  src,
  alt = "",
  className,
  lift = "paper",
}: {
  src: string
  alt?: string
  className?: string
  lift?: "paper" | "navy" | "flat"
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(
        "max-h-full max-w-full bg-transparent object-contain",
        lift === "paper" && "ps-cutout",
        lift === "navy" && "ps-cutout-navy",
        className,
      )}
    />
  )
}

export function PaperPhoto({
  src,
  alt,
  className,
  imgClassName,
  rotate = 0,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  rotate?: number
}) {
  return (
    <PaperSheet className={cn("overflow-hidden p-3", className)} rotate={rotate}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={cn("h-full w-full rounded-[18px] object-cover", imgClassName)} />
    </PaperSheet>
  )
}
