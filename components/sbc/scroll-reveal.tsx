"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { fadeUp, viewportOnce } from "@/lib/sbc/motion"
import { cn } from "@/lib/utils"

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  delay?: number
  children: React.ReactNode
}

export function ScrollReveal({ delay = 0, children, className, ...props }: ScrollRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      custom={delay}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function ScrollRevealStagger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScrollRevealItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={fadeUp} custom={0} className={cn(className)}>
      {children}
    </motion.div>
  )
}
