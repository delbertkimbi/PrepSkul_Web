"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { ActionBubble } from "@/components/sbc/action-bubble"
import { PricingBadge } from "@/components/sbc/pricing-badge"
import { JourneyFlipCard } from "@/components/sbc/journey-flip-card"
import { LearnFlipCard } from "@/components/sbc/learn-flip-card"
import { StatFlipCard } from "@/components/sbc/stat-flip-card"
import { ScrollReveal } from "@/components/sbc/scroll-reveal"
import { Button } from "@/components/ui/button"
import {
  SBC_LEARN,
  SBC_OUTCOMES,
  SBC_LEARN_DETAILS,
  SBC_OUTCOME_DETAILS,
  SBC_HERO_STATS,
  SBC_PRICING,
  SBC_JOURNEY,
} from "@/lib/sbc/content"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { sbcBtnPrimary, sbcBtnOutline } from "@/lib/sbc/styles"
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Laptop,
  Sparkles,
  Lightbulb,
  Search,
  Palette,
  Code,
  Megaphone,
  Handshake,
} from "lucide-react"

const journeyIcons = {
  lightbulb: Lightbulb,
  search: Search,
  palette: Palette,
  code: Code,
  megaphone: Megaphone,
}

const heroIcons = [Calendar, Users, MapPin]

export default function SbcLandingPage() {
  const sbcPath = useSbcPath()

  return (
    <SbcPageShell>
      <SbcHeader />

      {/* Hero */}
      <section className="relative py-10 sm:py-14 lg:py-20 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 mb-5 sm:mb-6">
                {(["Create", "Build", "Pitch", "Launch"] as const).map((label, i) => (
                  <ActionBubble key={label} label={label} delay={0.15 + i * 0.12} />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="leading-none">
                  <span
                    className="block text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#1B2C4F]"
                    style={{ WebkitTextStroke: "1.5px #7eb8ff" }}
                  >
                    summer
                  </span>
                  <span className="block text-3xl sm:text-5xl lg:text-6xl font-black text-[#4A6FBF] my-0.5 sm:my-1 tracking-wide">
                    build
                  </span>
                  <span
                    className="block text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#1B2C4F]"
                    style={{ WebkitTextStroke: "1.5px #7eb8ff" }}
                  >
                    camp
                  </span>
                </h1>
                <p className="mt-4 sm:mt-5 text-base sm:text-lg lg:text-xl text-[#4A6FBF] font-medium max-w-md mx-auto lg:mx-0">
                  AI + Entrepreneurship for young innovators
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0"
              >
                {SBC_HERO_STATS.map((stat, i) => {
                  const Icon = heroIcons[i]
                  return (
                    <StatFlipCard
                      key={stat.label}
                      icon={Icon}
                      label={stat.label}
                      sub={stat.sub}
                      back={stat.back}
                      delay={i * 0.15}
                      index={i}
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
              className="order-1 lg:order-2 relative flex justify-center lg:justify-end"
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
                Across Cameroon and Africa, young people use emerging technologies and AI every day. Most never learn how these tools work, or that they can build their own products with them.
              </p>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Summer Build Camp bridges that gap. Students aged 10 to 17 arrive with ideas and curiosity, and leave with working prototypes, a brand, marketing skills, and the confidence to pitch on Demo Day.
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

      {/* Journey */}
      <section className="relative py-14 sm:py-20 lg:py-24 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <ScrollReveal className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 text-[#1B2C4F]">The Builder&apos;s Journey</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base px-2">
              From ideation to Demo Day. Every weekend is a step closer to launching something real.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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

          <div className="text-center mt-8 sm:mt-10">
            <Button asChild variant="outline" className={`${sbcBtnOutline}`}>
              <Link href={sbcPath("/program")}>
                Explore Full Program <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
