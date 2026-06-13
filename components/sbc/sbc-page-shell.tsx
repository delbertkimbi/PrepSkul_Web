"use client"

import { motion } from "framer-motion"

export function SbcPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#eef3ff] via-white to-[#fff9f3] text-[#1B2C4F] overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 bg-[#4A6FBF]/10 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -left-24 w-64 h-64 sm:w-80 sm:h-80 bg-[#FF8A00]/8 rounded-full blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, -15, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-56 h-56 bg-[#FFD93D]/10 rounded-full blur-3xl"
          animate={{ x: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">{children}</div>
    </div>
  )
}
