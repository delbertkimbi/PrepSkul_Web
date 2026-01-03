"use client"

import { motion } from "framer-motion"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function SectionHeader({ title, subtitle, className = "" }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`text-center mb-12 ${className}`}
    >
      <motion.h2
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-[0_0_20px_rgba(255,138,0,0.3)]"
        animate={{
          textShadow: [
            "0 0 20px rgba(255, 138, 0, 0.3)",
            "0 0 40px rgba(255, 138, 0, 0.5)",
            "0 0 20px rgba(255, 138, 0, 0.3)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

