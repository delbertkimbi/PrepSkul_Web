import { cn } from "@/lib/utils"

export function SectionLabel({
  children,
  className,
  dark = false,
}: {
  children: React.ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] mb-3",
        dark ? "text-[#7eb8ff]" : "text-[#4A6FBF]",
        className
      )}
    >
      <span className={cn("h-px w-8 shrink-0", dark ? "bg-[#7eb8ff]/40" : "bg-[#4A6FBF]/40")} />
      {children}
    </p>
  )
}
