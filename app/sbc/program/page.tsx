"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { FlipCard } from "@/components/sbc/flip-card"
import { JourneyFlipCard } from "@/components/sbc/journey-flip-card"
import { ScrollReveal } from "@/components/sbc/scroll-reveal"
import { Button } from "@/components/ui/button"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import {
  SBC_JOURNEY,
  SBC_LEARN,
  SBC_OUTCOMES,
  SBC_SCHEDULE,
  SBC_PRICING,
  SBC_WEEKEND_WEEKS,
} from "@/lib/sbc/content"
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Search,
  Palette,
  Code,
  Megaphone,
  Trophy,
  Calendar,
  Users,
} from "lucide-react"

const journeyIcons = {
  lightbulb: Lightbulb,
  search: Search,
  palette: Palette,
  code: Code,
  megaphone: Megaphone,
}

export default function SbcProgramPage() {
  const sbcPath = useSbcPath()

  return (
    <SbcPageShell>
      <SbcHeader />

      <div className="flex-1 min-w-0">
        <section className="relative py-10 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link
              href={sbcPath()}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#FF8A00] transition-colors mb-6 sm:mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <ScrollReveal className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-[#1B2C4F]">
                The <span className="text-[#FF8A00]">6-Week</span> Builder Journey
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Every Saturday and Sunday from {SBC_SCHEDULE.startDate} to {SBC_SCHEDULE.endDate}, students grow from raw curiosity to confident creators. They train in ideation, problem thinking, solution design, building, marketing, and pitching.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-white/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-black text-[#1B2C4F]">The 5-Stage Framework</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {SBC_JOURNEY.map((step, i) => {
                const Icon = journeyIcons[step.icon]
                return (
                  <JourneyFlipCard
                    key={step.step}
                    step={step.step}
                    title={step.title}
                    description={step.description}
                    flipDetail={step.flipDetail}
                    icon={Icon}
                    delay={i * 0.08}
                  />
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-black text-[#1B2C4F]">Weekend by Weekend</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2">Six weekends. One unforgettable arc.</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
              {SBC_WEEKEND_WEEKS.map((w, i) => (
                <FlipCard
                  key={w.week}
                  delay={i * 0.06}
                  heightClass="min-h-[150px] sm:min-h-[160px]"
                  initialSide={i % 2 === 1 ? "back" : "front"}
                  front={
                    <div className="h-full flex flex-col rounded-xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm">
                      <div className="flex items-start gap-3 mb-2">
                        <span className="w-8 h-8 rounded-full bg-[#eef3ff] border border-[#4A6FBF]/30 flex items-center justify-center text-sm font-bold text-[#4A6FBF] shrink-0">
                          {w.week}
                        </span>
                        <h3 className="font-bold text-[#1B2C4F] text-sm sm:text-base leading-snug">{w.focus}</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 pl-11 flex-1">{w.detail}</p>
                    </div>
                  }
                  back={
                    <div className="h-full flex flex-col rounded-xl bg-gradient-to-br from-[#4A6FBF] to-[#1B2C4F] p-4 sm:p-5 text-white shadow-md">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[#FFD93D] mb-1">Week {w.week}</p>
                      <h3 className="font-bold text-sm sm:text-base mb-2">{w.focus}</h3>
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed flex-1">{w.back}</p>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-white/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <ScrollReveal delay={0.1} className="rounded-2xl overflow-hidden border border-slate-200 shadow-md order-2 lg:order-1">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.35 }}>
                  <Image
                    src="/young-african-female-student-smiling.jpg"
                    alt="Young student ready for Demo Day"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              </ScrollReveal>
              <ScrollReveal delay={0.15} className="space-y-6 sm:space-y-8 order-1 lg:order-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 flex items-center gap-2 text-[#1B2C4F]">
                    <Calendar className="h-5 w-5 text-[#FF8A00] shrink-0" />
                    Skills They&apos;ll Master
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SBC_LEARN.map((skill) => (
                      <li key={skill} className="flex items-center gap-2 text-slate-600 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A00] shrink-0" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 flex items-center gap-2 text-[#1B2C4F]">
                    <Trophy className="h-5 w-5 text-[#FF8A00] shrink-0" />
                    What They Walk Away With
                  </h3>
                  <ul className="space-y-2">
                    {SBC_OUTCOMES.map((outcome) => (
                      <li key={outcome} className="flex items-center gap-2 text-slate-600 text-sm sm:text-base">
                        <ArrowRight className="h-4 w-4 text-[#4A6FBF] shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gradient-to-br from-[#eef3ff] to-[#fff9f3]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal className="space-y-4 sm:space-y-6">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-[#FF8A00] mx-auto" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2C4F]">Demo Day</h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                The grand finale. Students pitch their products to parents, mentors, and stakeholders. They showcase everything they&apos;ve built, branded, and learned over 6 incredible weeks.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl overflow-hidden border border-slate-200 shadow-md max-w-sm mx-auto mt-6"
              >
                <Image
                  src="/young-african-girl-online-learning-session.jpg"
                  alt="Young camper learning and building"
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </ScrollReveal>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <ScrollReveal className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6">
            <p className="text-slate-500 text-sm sm:text-base">
              Registration: {SBC_PRICING.registrationFee.toLocaleString()} {SBC_PRICING.currency} ·
              Program: {SBC_PRICING.programFee.toLocaleString()} {SBC_PRICING.currency} (installments)
            </p>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg font-bold px-8 sm:px-10 h-12 sm:h-14 bg-[#FF8A00] hover:bg-[#e67a00] text-white"
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
