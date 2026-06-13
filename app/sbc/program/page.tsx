"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { CurriculumRoadmap } from "@/components/sbc/curriculum-roadmap"
import { DeliverableCard } from "@/components/sbc/deliverable-card"
import { SectionLabel } from "@/components/sbc/section-label"
import { ScrollReveal } from "@/components/sbc/scroll-reveal"
import { Button } from "@/components/ui/button"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { sbcBtnPrimary } from "@/lib/sbc/styles"
import {
  SBC_SCHEDULE,
  SBC_PRICING,
  SBC_CURRICULUM_WEEKS,
  SBC_DELIVERABLES,
  SBC_WEEKLY_SESSIONS,
} from "@/lib/sbc/content"
import { SbcBackButton } from "@/components/sbc/sbc-back-button"
import {
  ArrowRight,
  Calendar,
  Globe,
  Star,
  Trophy,
  MapPin,
} from "lucide-react"

export default function SbcProgramPage() {
  const sbcPath = useSbcPath()

  return (
    <SbcPageShell>
      <SbcHeader />

      <div className="flex-1 min-w-0">
        {/* Hero */}
        <section className="relative py-10 sm:py-14 lg:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#eef3ff]/80 to-transparent pointer-events-none" aria-hidden />
          <SbcBackButton className="absolute top-6 left-4 sm:left-6 lg:left-8 z-10" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative pt-2 sm:pt-0">
            <ScrollReveal className="max-w-3xl lg:pl-12">
              <SectionLabel>The Pathway</SectionLabel>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-[#1B2C4F] leading-tight">
                Six weeks. One clear{" "}
                <span className="text-[#4A6FBF]">path forward.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                From {SBC_SCHEDULE.startDate} to {SBC_SCHEDULE.endDate}, your child moves step by step from curiosity to a live Demo Day pitch. Each week builds on the last with something real to show for it.
              </p>
            </ScrollReveal>

            {/* At a glance — replaces separate structure + rhythm sections */}
            <ScrollReveal delay={0.08} className="mt-8 sm:mt-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: Calendar, label: "6 weeks", sub: `${SBC_SCHEDULE.totalSessions} sessions` },
                  { icon: Globe, label: "Online & onsite", sub: "Three tiers, one curriculum" },
                  { icon: MapPin, label: "Buea + online", sub: "Sat & Sun onsite, Mon live" },
                  { icon: Star, label: "Demo Day", sub: "Live pitch to parents & guests" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white border border-slate-200/90 p-3 sm:p-4 shadow-sm"
                  >
                    <Icon className="h-4 w-4 text-[#4A6FBF] mb-2" />
                    <p className="font-bold text-sm text-[#1B2C4F] leading-snug">{label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{sub}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.12} className="mt-4 sm:mt-5">
              <div className="flex flex-wrap gap-2">
                {SBC_WEEKLY_SESSIONS.map((s) => (
                  <span
                    key={s.day}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eef3ff] border border-[#4A6FBF]/20 text-xs text-[#1B2C4F]"
                  >
                    <span className="font-bold text-[#4A6FBF]">{s.day}</span>
                    <span className="text-slate-500 hidden sm:inline">· {s.type}</span>
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Roadmap — single source of truth for the 6-week journey */}
        <section className="py-10 sm:py-16 lg:py-20 bg-white/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
              <SectionLabel className="justify-center">Curriculum</SectionLabel>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2C4F] mb-3">
                The 6-Week Builder Pathway
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Follow the path week by week. Every stop has a theme, hands-on work, and a tangible output your child brings home.
              </p>
            </ScrollReveal>

            <CurriculumRoadmap weeks={SBC_CURRICULUM_WEEKS} />
          </div>
        </section>

        {/* Outcomes — destination of the path */}
        <section className="py-10 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-8 sm:mb-10 max-w-2xl">
              <SectionLabel>Destination</SectionLabel>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1B2C4F] mb-2">
                What Every Child Leaves With
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">
                At the end of the pathway, these are not goals on paper. They are real things your child built, owns, and can show anyone.
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {SBC_DELIVERABLES.map((item) => (
                <DeliverableCard
                  key={item.number}
                  number={item.number}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Demo Day */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-[#eef3ff] to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal className="space-y-5 sm:space-y-6">
              <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-[#4A6FBF] mx-auto" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2C4F]">
                Week 6 ends at Demo Day
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                The pathway culminates in a live presentation to parents, mentors, and industry guests. Your child demos their product, presents their brand, and answers real questions from the panel.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl overflow-hidden border border-slate-200 shadow-md max-w-sm mx-auto"
              >
                <Image
                  src="/young-african-girl-online-learning-session.jpg"
                  alt="Young camper on Demo Day"
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16">
          <ScrollReveal className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6">
            <p className="text-slate-500 text-sm sm:text-base">
              Registration: {SBC_PRICING.registrationFee.toLocaleString()} {SBC_PRICING.currency} ·
              Program: {SBC_PRICING.programFee.toLocaleString()} {SBC_PRICING.currency} (installments)
            </p>
            <Button
              asChild
              size="lg"
              className={`w-full sm:w-auto text-base sm:text-lg font-bold px-8 sm:px-10 h-12 sm:h-14 ${sbcBtnPrimary}`}
            >
              <Link href={sbcPath("/register")}>
                Register Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </ScrollReveal>
        </section>
      </div>

      <SbcFooter />
    </SbcPageShell>
  )
}
