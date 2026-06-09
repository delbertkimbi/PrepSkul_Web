"use client"

import { motion } from "framer-motion"

const colors: Record<string, string> = {
  Create: "bg-[#FFD93D] text-[#1a1a2e]",
  Build: "bg-[#9B59B6] text-white",
  Pitch: "bg-[#1B2C4F] text-white border border-[#4A6FBF]/50",
  Launch: "bg-[#FF8A00] text-white",
}

export function ActionBubble({
  label,
  className = "",
  delay = 0,
}: {
  label: keyof typeof colors
  className?: string
  delay?: number
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${colors[label]} ${className}`}
    >
      {label}
    </motion.span>
  )
}
