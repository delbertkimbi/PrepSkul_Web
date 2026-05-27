"use client"

import { getStartedUrl } from "@/lib/get-started-url"
import Image from "next/image"
import Link from "next/link"
import { Users, Globe, Calendar, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getTranslations } from "@/lib/translations"
import { type Locale } from "@/lib/i18n"

interface PEAPShowcaseProps {
  locale: Locale
}

export function PEAPShowcase({ locale }: PEAPShowcaseProps) {
  const t = getTranslations(locale)
  const ea = t.home.examAccelerator

  const stats = [
    { icon: Users, value: ea.stats.learners.value, label: ea.stats.learners.label },
    { icon: Globe, value: ea.stats.reach.value, label: ea.stats.reach.label },
    { icon: Calendar, value: ea.stats.duration.value, label: ea.stats.duration.label },
    { icon: Gift, value: ea.stats.cost.value, label: ea.stats.cost.label },
  ]

  return (
    <section className="py-12 sm:py-16 bg-muted/30 border-y">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="flex justify-center mb-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md border bg-white">
              <Image src="/peaplogo.jpg" alt={ea.logoAlt} fill className="object-cover" />
            </div>
          </div>

          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            {ea.badge}
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">{ea.title}</h2>

          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {ea.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all hover:shadow-lg"
              >
                <CardContent className="p-4 sm:p-5 text-center space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold leading-tight">{stat.value}</div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center max-w-6xl mx-auto">
          <div className="space-y-4 order-2 lg:order-1">
            <h3 className="text-2xl sm:text-3xl font-bold">{ea.storyTitle}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{ea.storyP1}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{ea.storyP2}</p>
            <Button size="lg" asChild className="mt-2 text-base font-semibold h-11 px-8">
              <Link href={getStartedUrl()}>{ea.getStarted}</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 order-1 lg:order-2">
            <div className="relative aspect-[4/5] min-h-[220px] sm:min-h-[280px] rounded-2xl overflow-hidden border-2 bg-white shadow-sm">
              <Image
                src="/program2.jpg"
                alt={ea.imageAlt1}
                fill
                className="object-contain p-2"
                sizes="(max-width: 640px) 100vw, 280px"
              />
            </div>
            <div className="relative aspect-[4/5] min-h-[220px] sm:min-h-[280px] rounded-2xl overflow-hidden border-2 bg-white shadow-sm sm:mt-6">
              <Image
                src="/program1.jpg"
                alt={ea.imageAlt2}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 280px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
