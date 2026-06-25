"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { ActionBubble } from "@/components/sbc/action-bubble"
import { PricingBadge } from "@/components/sbc/pricing-badge"
import { LearnFlipCard } from "@/components/sbc/learn-flip-card"
import { HeroStatCard } from "@/components/sbc/hero-stat-card"
import { SectionLabel } from "@/components/sbc/section-label"
import { StructureFlipCard } from "@/components/sbc/structure-flip-card"
import { DeliverableCard } from "@/components/sbc/deliverable-card"
import { RoadmapPreview } from "@/components/sbc/roadmap-preview"
import { ScrollReveal } from "@/components/sbc/scroll-reveal"
import { Button } from "@/components/ui/button"
import {
  SBC_LEARN,
  SBC_OUTCOMES,
  SBC_LEARN_DETAILS,
  SBC_OUTCOME_DETAILS,
  SBC_HERO_STATS,
  SBC_PRICING,
  SBC_INTRO,
  SBC_VISION,
  SBC_MILESTONES,
  SBC_PROGRAM_STRUCTURE,
  SBC_DELIVERABLES,
} from "@/lib/sbc/content"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { sbcBtnPrimary, sbcBtnOutline } from "@/lib/sbc/styles"
import {
  ArrowRight,
  Calendar,
  Users,
  Laptop,
  Sparkles,
  Handshake,
  Globe,
  Star,
} from "lucide-react"

const structureIcons = {
  calendar: Calendar,
  globe: Globe,
  star: Star,
}

const heroIcons = [Calendar, Users, Sparkles]

export default function SbcLandingPage() {
  const sbcPath = useSbcPath()

  return (
    <SbcPageShell>
      <SbcHeader />

      {/* Hero */}
      <section className="relative py-10 sm:py-14 lg:py-20 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="grid lg:grid-cols-2 lg:grid-rows-[auto_1fr] gap-6 sm:gap-8 lg:gap-x-12 lg:gap-y-6 items-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="order-1 lg:col-start-1 lg:row-start-1 text-center lg:text-left"
            >
              <h1 className="leading-[0.95] tracking-tight">
                <span
                  className="block text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-black text-[#1B2C4F]"
                  style={{ WebkitTextStroke: "1.5px #7eb8ff" }}
                >
                  Summer
                </span>
                <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-[#5B8DEF] via-[#4A6FBF] to-[#1B2C4F] bg-clip-text text-transparent mt-0.5 sm:mt-1">
                  Build Camp
                </span>
              </h1>
            </motion.div>

            <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-base sm:text-lg lg:text-xl text-[#4A6FBF] font-medium max-w-md mx-auto lg:mx-0 italic">
                  {SBC_INTRO.tagline}
                </p>
                <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0 hidden sm:block">
                  {SBC_INTRO.summary}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-2.5 xl:gap-3 max-w-lg mx-auto lg:mx-0 lg:max-w-none"
              >
                {SBC_HERO_STATS.map((stat, i) => {
                  const Icon = heroIcons[i]
                  return (
                    <HeroStatCard
                      key={stat.label}
                      icon={Icon}
                      value={stat.value}
                      label={stat.label}
                      detail={stat.detail}
                    />
                  )
                })}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-stretch sm:items-center"
              >
                <Button asChild size="lg" className={`w-full sm:w-auto text-base sm:text-lg font-bold px-8 sm:px-10 h-12 sm:h-14 ${sbcBtnPrimary}`}>
                  <Link href={sbcPath("/register")}>
                    Register Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className={`w-full sm:w-auto text-base sm:text-lg font-semibold px-6 sm:px-8 h-12 sm:h-14 ${sbcBtnOutline}`}>
                  <a href="#about">Learn More</a>
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7eb8ff]/30 via-[#4A6FBF]/20 to-[#1B2C4F]/10 blur-2xl scale-110" aria-hidden />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <Image
                    src="/child.png"
                    alt="Young Summer Build Camp participant exploring VR and technology"
                    width={440}
                    height={440}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                    priority
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="about" className="relative py-14 sm:py-20 lg:py-24 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <ScrollReveal className="space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef3ff] border border-[#4A6FBF]/25 text-[#4A6FBF] text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                Why SBC Exists
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight text-[#1B2C4F]">
                From consumers to{" "}
                <span className="text-[#4A6FBF]">creators</span> of technology
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                {SBC_INTRO.summary}
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                {SBC_INTRO.partners}
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#eef3ff] border border-[#4A6FBF]/15">
                <Laptop className="h-5 w-5 text-[#4A6FBF] mt-0.5 shrink-0" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  Bring a laptop or phone if you have one. It helps students keep building at home. No device? We provide laptops at the center during program hours.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.12} className="relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg"
              >
                <Image
                  src="/young-african-female-tech-student.jpg"
                  alt="Young student learning with technology"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </motion.div>
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-5 sm:-left-4 lg:-left-6">
                <PricingBadge />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <ScrollReveal className="mb-8 sm:mb-12">
            <SectionLabel>Program Structure</SectionLabel>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2C4F] mb-3">How It Works</h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
              Six weeks. Three sessions per week. Every session builds directly on the last. By the end, each participant has a complete founder portfolio.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {SBC_PROGRAM_STRUCTURE.map((item, i) => {
              const Icon = structureIcons[item.icon]
              return (
                <StructureFlipCard
                  key={item.label}
                  icon={Icon}
                  label={item.label}
                  title={item.title}
                  description={item.description}
                  delay={i * 0.08}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="relative py-14 sm:py-20 lg:py-24 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <ScrollReveal className="mb-8 sm:mb-12">
            <SectionLabel>Outcomes</SectionLabel>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2C4F] mb-3">
              What Every Child Leaves With
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
              These are not learning objectives. These are tangible things every participant produces, owns, and can show anyone.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {SBC_DELIVERABLES.map((item) => (
              <DeliverableCard key={item.number} number={item.number} title={item.title} description={item.description} />
            ))}
          </div>
          <ScrollReveal className="mt-8 sm:mt-10">
            <div className="rounded-2xl bg-gradient-to-br from-[#1B2C4F] via-[#2559a8] to-[#1a3260] p-6 sm:p-8 text-center text-white">
              <SectionLabel dark className="justify-center">The Bigger Picture</SectionLabel>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black leading-snug max-w-3xl mx-auto">
                We are building a community of{" "}
                <span className="text-[#FFD93D]">10,000</span> young innovators by 2030.
              </p>
              <p className="text-sm sm:text-base text-white/75 mt-3 max-w-xl mx-auto">{SBC_VISION.compound}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pathway preview */}
      <section className="relative py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <ScrollReveal className="mb-8 sm:mb-12 text-center">
            <SectionLabel className="justify-center">Curriculum</SectionLabel>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2C4F] mb-3">
              A winding path to Demo Day
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Six milestones — not the full syllabus. Follow the pathway, then dive into each week on the program page.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <RoadmapPreview href={sbcPath("/program")} />
          </ScrollReveal>
        </div>
      </section>

      {/* Vision */}
      <section className="relative py-14 sm:py-20 lg:py-24 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <ScrollReveal>
              <SectionLabel>Our Vision</SectionLabel>
              <p className="text-6xl sm:text-7xl lg:text-8xl font-black text-[#1B2C4F] leading-none">{SBC_VISION.headline}</p>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#4A6FBF] mt-2 mb-6">{SBC_VISION.subhead}</p>
              <blockquote className="text-slate-600 text-base sm:text-lg leading-relaxed border-l-4 border-[#4A6FBF]/30 pl-4">
                {SBC_VISION.quote}
              </blockquote>
            </ScrollReveal>
            <ScrollReveal delay={0.1} className="space-y-4">
              {SBC_MILESTONES.map((m) => (
                <div key={m.year} className="rounded-2xl bg-gradient-to-br from-[#1a3260] via-[#2559a8] to-[#0f2444] border border-[#4a8fe8]/30 p-5 sm:p-6 text-white">
                  <p className="text-2xl font-black text-[#7eb8ff] mb-1">{m.year}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">{m.title}</p>
                  <p className="text-sm text-white/85 leading-relaxed">{m.description}</p>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Learn & Outcomes */}
      <section className="relative py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <ScrollReveal className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2C4F] px-2">
              What they&apos;ll learn & what they&apos;ll achieve
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-xl mx-auto">
              Skills and outcomes that stick long after camp ends
            </p>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#1B2C4F] mb-4 text-center sm:text-left">
                What They&apos;ll Learn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {SBC_LEARN.map((item, i) => (
                  <LearnFlipCard
                    key={item}
                    title={item}
                    detail={SBC_LEARN_DETAILS[item]}
                    variant="learn"
                    delay={i * 0.06}
                    index={i}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#4A6FBF] mb-4 text-center sm:text-left">
                Outcomes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {SBC_OUTCOMES.map((item, i) => (
                  <LearnFlipCard
                    key={item}
                    title={item}
                    detail={SBC_OUTCOME_DETAILS[item]}
                    variant="outcome"
                    delay={i * 0.06}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-[#eef3ff]/80 to-transparent">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <ScrollReveal delay={0.1}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4 text-[#1B2C4F]">Invest in their future</h2>
              <p className="text-slate-500 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                Secure your spot with a registration fee, then pay the program fee in manageable installments across the 6 weeks.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-3xl sm:text-4xl font-black text-[#1B2C4F]">
                    {SBC_PRICING.registrationFee.toLocaleString()}
                  </span>
                  <div>
                    <p className="font-semibold text-[#1B2C4F]">{SBC_PRICING.currency} Registration</p>
                    <p className="text-sm text-[#4A6FBF]">Deadline: {SBC_PRICING.registrationDeadline}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-[#4A6FBF]/25 shadow-sm">
                  <span className="text-3xl sm:text-4xl font-black text-[#4A6FBF]">
                    {SBC_PRICING.programFee.toLocaleString()}
                  </span>
                  <div>
                    <p className="font-semibold text-[#1B2C4F]">{SBC_PRICING.currency} Program Fee</p>
                    <p className="text-sm text-slate-500">Paid in installments throughout the program</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="flex flex-col items-center gap-5 sm:gap-6">
              <PricingBadge />
              <Button asChild size="lg" className={`w-full sm:w-auto text-base sm:text-lg font-bold px-8 sm:px-12 h-12 sm:h-14 ${sbcBtnPrimary}`}>
                <Link href={sbcPath("/register")}>Register Today</Link>
              </Button>
              <p className="text-xs sm:text-sm text-slate-400 text-center px-4">
                Limited spots. Registration closes {SBC_PRICING.registrationDeadline}.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="relative py-14 sm:py-20 lg:py-24 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-[#4A6FBF]/10 flex items-center justify-center mx-auto mb-5"
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <Handshake className="h-7 w-7 text-[#4A6FBF]" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2C4F] mb-3">
              Partner with us
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 px-2">
              Investors, startups, NGOs, brands, and schools can join PrepSkul and DelTech Hub in shaping the next generation of young builders across Africa.
            </p>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-[#4A6FBF]/40 text-[#1B2C4F] hover:bg-[#eef3ff] bg-white font-semibold"
            >
              <Link href={sbcPath("/partner")}>
                Explore Partnership
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2C4F] via-[#2d4a7a] to-[#4A6FBF]" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 text-center min-w-0">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-5 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white">
              Come with ideas.
              <br />
              <span className="text-[#FFD93D]">Leave with products.</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto px-2">
              The next generation of African builders starts here. Will your child be one of them?
            </p>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg font-bold px-8 sm:px-12 h-12 sm:h-14 bg-white text-[#1B2C4F] hover:bg-white/90 shadow-xl"
            >
              <Link href={sbcPath("/register")}>
                Register for Summer Build Camp
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <SbcFooter />
    </SbcPageShell>
  )
}
