"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface InfoCardProps {
  icon: LucideIcon
  title: string
  description: string
  index: number
}

export function InfoCard({ icon: Icon, title, description, index }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <Card className="h-full border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
        <CardContent className="p-6 space-y-4 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

