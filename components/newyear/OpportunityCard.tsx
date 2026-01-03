"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Globe } from "lucide-react"
import { motion } from "framer-motion"

interface OpportunityCardProps {
  title: string
  description: string
  location: "Online" | "Location-based"
  locationDetails?: string
  index: number
}

export function OpportunityCard({ title, description, location, locationDetails, index }: OpportunityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full border-2 border-primary/30 hover:border-primary/70 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm transition-all hover:shadow-[0_0_30px_rgba(255,138,0,0.4)] group">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors flex-1 drop-shadow-lg">
              {title}
            </h3>
            <div className="flex-shrink-0">
              {location === "Online" ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-400/30 backdrop-blur-sm">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold border border-green-400/30 backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Location</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
            {description}
          </p>
          {locationDetails && (
            <div className="flex items-center gap-2 text-sm text-gray-400 pt-2 border-t border-primary/20">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{locationDetails}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

