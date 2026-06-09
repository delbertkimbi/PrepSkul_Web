"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { Button } from "@/components/ui/button"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import {
  SBC_JOURNEY,
  SBC_LEARN,
  SBC_OUTCOMES,
  SBC_SCHEDULE,
  SBC_PRICING,
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

const weekendWeeks = [
  { week: 1, focus: "Orientation & Ideation", detail: "Meet mentors, form teams, identify problems worth solving" },
  { week: 2, focus: "Problem Analysis", detail: "Research, interview users, validate ideas with real-world thinking" },
  { week: 3, focus: "Solution Design", detail: "Sketch solutions, brand identity, and product architecture" },
  { week: 4, focus: "Building Begins", detail: "Hands-on product building with AI tools and no-code/low-code platforms" },
  { week: 5, focus: "Build & Brand", detail: "Refine prototypes, create marketing materials and pitch decks" },
  { week: 6, focus: "Demo Day", detail: "Pitch to parents, stakeholders, and celebrate launches" },
]

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
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-[#1B2C4F]">
                The <span className="text-[#FF8A00]">6-Week</span> Builder Journey
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Every Saturday and Sunday from {SBC_SCHEDULE.startDate} to {SBC_SCHEDULE.endDate}, students grow from raw curiosity to confident creators. They train in ideation, problem thinking, solution design, building, marketing, and pitching.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-white/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-black mb-8 sm:mb-10 text-center text-[#1B2C4F]">The 5-Stage Framework</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {SBC_JOURNEY.map((step, i) => {
                const Icon = journeyIcons[step.icon]
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 text-center shadow-sm hover:border-[#FF8A00]/30 hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FF8A00]/15 border-2 border-[#FF8A00]/30 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF8A00]" />
                    </div>
                    <p className="text-xs text-[#4A6FBF] font-bold uppercase tracking-wider mb-1">Stage {step.step}</p>
                    <h3 className="font-bold text-base sm:text-lg mb-2 text-[#1B2C4F]">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{step.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-black mb-8 sm:mb-10 text-center text-[#1B2C4F]">Weekend by Weekend</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
              {weekendWeeks.map((w, i) => (
                <motion.div
                  key={w.week}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-[#eef3ff] border border-[#4A6FBF]/30 flex items-center justify-center text-sm font-bold text-[#4A6FBF] shrink-0">
                      {w.week}
                    </span>
                    <h3 className="font-bold text-[#1B2C4F] text-sm sm:text-base leading-snug">{w.focus}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 pl-11">{w.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-white/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md order-2 lg:order-1">
                <Image
                  src="/young-african-female-student-smiling.jpg"
                  alt="Young student ready for Demo Day"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
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
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gradient-to-br from-[#eef3ff] to-[#fff9f3]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4 sm:space-y-6">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-[#FF8A00] mx-auto" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2C4F]">Demo Day</h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                The grand finale. Students pitch their products to parents, mentors, and stakeholders. They showcase everything they&apos;ve built, branded, and learned over 6 incredible weeks.
              </p>
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md max-w-sm mx-auto mt-6">
                <Image
                  src="/young-african-girl-online-learning-session.jpg"
                  alt="Young camper learning and building"
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6">
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
          </div>
        </section>
      </div>

      <SbcFooter />
    </SbcPageShell>
  )
}
