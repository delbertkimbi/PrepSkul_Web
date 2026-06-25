"use client"

import { motion } from "framer-motion"

const colors: Record<string, string> = {
  Create: "bg-[#FFD93D] text-[#1B2C4F]",
  Build: "bg-gradient-to-r from-[#5B8DEF] to-[#4A6FBF] text-white",
  Pitch: "bg-[#1B2C4F] text-white border border-[#7eb8ff]/30",
  Launch: "bg-gradient-to-r from-[#4A6FBF] to-[#1B2C4F] text-white",
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
      initial={{ opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
      transition={{
        opacity: { delay, duration: 0.4 },
        scale: { delay, type: "spring", stiffness: 260, damping: 18 },
        y: { delay: delay + 0.5, duration: 3.5, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.08, y: -2 }}
      className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-blue-900/10 ${colors[label]} ${className}`}
    >
      {label}
    </motion.span>
  )
}
