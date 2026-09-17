"use client"

import { getStartedUrl } from "@/lib/get-started-url"
import Link from "next/link"
import { getTranslations } from "@/lib/translations"
import { type Locale } from "@/lib/i18n"
import { PaperButton, PaperSheet, Tape } from "@/components/marketing/paper"

export function PEAPShowcase({ locale }: { locale: Locale }) {
  const t = getTranslations(locale)
  const ea = t.home.examAccelerator

  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <PaperSheet className="overflow-hidden bg-[#1B2C4F] p-7 text-white sm:p-12" rotate={-0.5}>
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="ps-h2 text-white">{ea.title}</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">{ea.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-black">
                <span>{ea.stats.learners.value} {ea.stats.learners.label}</span>
                <span>{ea.stats.duration.value}</span>
                <span>{ea.stats.cost.value}</span>
              </div>
              <Link href={getStartedUrl()} className="mt-8 inline-block">
                <PaperButton className="bg-white text-[#1B2C4F] shadow-[0_7px_0_#d7d2c6]">{ea.getStarted}</PaperButton>
              </Link>
            </div>
            <PaperSheet className="relative p-3" tone="cream" rotate={2}>
              <Tape color="yellow" className="-top-3 left-1/2 -translate-x-1/2" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/program1.jpg" alt={ea.imageAlt2} className="h-52 w-full rounded-[18px] object-cover sm:h-64" />
              <div className="absolute left-6 top-6 h-14 w-14 overflow-hidden rounded-2xl border border-[#1B2C4F]/10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/peaplogo.jpg" alt={ea.logoAlt} className="h-full w-full object-cover" />
              </div>
            </PaperSheet>
          </div>
        </PaperSheet>
      </div>
    </section>
  )
}
