"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { cn } from "@/lib/utils"

export function SbcBackButton({ className }: { className?: string }) {
  const sbcPath = useSbcPath()

  return (
    <Link
      href={sbcPath()}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full",
        "bg-[#eef3ff] text-[#4A6FBF] border border-[#4A6FBF]/25",
        "hover:bg-[#4A6FBF]/12 hover:border-[#4A6FBF]/40 transition-colors",
        "shadow-sm",
        className
      )}
      aria-label="Back to Summer Build Camp home"
    >
      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.25} />
    </Link>
  )
}
