"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { ActionBubble } from "@/components/sbc/action-bubble"
import { PricingBadge } from "@/components/sbc/pricing-badge"
import { Button } from "@/components/ui/button"
import {
  SBC_LEARN,
  SBC_OUTCOMES,
  SBC_PRICING,
  SBC_SCHEDULE,
  SBC_JOURNEY,
} from "@/lib/sbc/content"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Laptop,
  Sparkles,
  Rocket,
  Lightbulb,
  Search,
  Palette,
  Code,
  Megaphone,
} from "lucide-react"

const journeyIcons = {
  lightbulb: Lightbulb,
  search: Search,
  palette: Palette,
  code: Code,
  megaphone: Megaphone,
}

export default function SbcLandingPage() {
  const sbcPath = useSbcPath()

  return (
    <SbcPageShell>
      <SbcHeader />

      {/* Hero */}
      <section className="relative py-10 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10"
          >
            <a href="https://prepskul.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Image src="/logo.jpg" alt="PrepSkul" width={44} height={44} className="rounded-lg w-10 h-10 sm:w-11 sm:h-11" />
            </a>
            <span className="text-slate-300 text-lg font-light">×</span>
            <a href="https://deltech-hub.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Image src="/deltech.jpg" alt="DelTech Hub" width={44} height={44} className="rounded-lg w-10 h-10 sm:w-11 sm:h-11" />
            </a>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-1">
            {(["Create", "Build", "Pitch", "Launch"] as const).map((label, i) => (
              <ActionBubble key={label} label={label} delay={0.2 + i * 0.15} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="text-center"
          >
            <h1 className="leading-none">
              <span
                className="block text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#1B2C4F]"
                style={{ WebkitTextStroke: "1.5px #7eb8ff" }}
              >
                summer
              </span>
              <span className="block text-3xl sm:text-5xl lg:text-6xl font-black text-[#FF8A00] my-0.5 sm:my-1 tracking-wide">
                build
              </span>
              <span
                className="block text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#1B2C4F]"
                style={{ WebkitTextStroke: "1.5px #7eb8ff" }}
              >
                camp
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-[#4A6FBF] font-medium"
            >
              AI + Entrepreneurship for young innovators
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto"
          >
            {[
              { icon: Calendar, label: SBC_SCHEDULE.duration, sub: SBC_SCHEDULE.dateRange },
              { icon: Users, label: `Ages ${SBC_SCHEDULE.ages}`, sub: SBC_SCHEDULE.days },
              { icon: MapPin, label: "Buea", sub: SBC_SCHEDULE.location },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF8A00] mx-auto mb-2" />
                <p className="font-bold text-[#1B2C4F] text-sm sm:text-base">{stat.label}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">{stat.sub}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-2"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg font-bold px-8 sm:px-10 h-12 sm:h-14 bg-[#FF8A00] hover:bg-[#e67a00] text-white shadow-lg shadow-orange-500/20"
            >
              <Link href={sbcPath("/register")}>
                Register Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg font-semibold px-6 sm:px-8 h-12 sm:h-14 border-slate-300 text-[#1B2C4F] hover:bg-slate-50 bg-white"
            >
              <a href="#about">Learn More</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section id="about" className="relative py-14 sm:py-20 lg:py-24 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/25 text-[#FF8A00] text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                Why SBC Exists
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight text-[#1B2C4F]">
                From consumers to{" "}
                <span className="text-[#FF8A00]">creators</span> of technology
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                <Image
                  src="/young-african-female-tech-student.jpg"
                  alt="Young student learning with technology"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-5 sm:-left-4 lg:-left-6">
                <PricingBadge />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learn & Outcomes */}
      <section className="relative py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2C4F] px-2">
              What they&apos;ll learn & what they&apos;ll achieve
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl sm:rounded-3xl bg-[#f8f6f0] text-[#1a1a2e] p-6 sm:p-10 lg:p-12 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 sm:h-3 bg-gradient-to-r from-[#FF8A00] via-[#4A6FBF] to-[#FFD93D]" />
              <div className="grid sm:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 pt-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#1B2C4F] mb-3 sm:mb-4">
                    What They&apos;ll Learn
                  </h3>
                  <ul className="space-y-2.5 sm:space-y-3">
                    {SBC_LEARN.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[#333] font-medium text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-[#FF8A00] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#FF8A00] mb-3 sm:mb-4">Outcomes</h3>
                  <ul className="space-y-2.5 sm:space-y-3">
                    {SBC_OUTCOMES.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[#333] font-medium text-sm sm:text-base">
                        <Rocket className="h-4 w-4 text-[#FF8A00] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="relative py-14 sm:py-20 lg:py-24 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 text-[#1B2C4F]">The Builder&apos;s Journey</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base px-2">
              From ideation to Demo Day. Every weekend is a step closer to launching something real.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {SBC_JOURNEY.map((step, i) => {
              const Icon = journeyIcons[step.icon]
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:border-[#FF8A00]/40 hover:shadow-md transition-all"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF8A00]/15 flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF8A00]" />
                  </div>
                  <p className="text-xs text-[#4A6FBF] font-bold mb-1">Step {step.step}</p>
                  <h3 className="font-bold text-[#1B2C4F] mb-1.5 text-sm sm:text-base">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Button asChild variant="outline" className="border-slate-300 text-[#1B2C4F] hover:bg-slate-50 bg-white">
              <Link href={sbcPath("/program")}>
                Explore Full Program <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-[#FF8A00]/5 to-transparent">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
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
                    <p className="text-sm text-[#FF8A00]">Deadline: {SBC_PRICING.registrationDeadline}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-[#FF8A00]/25 shadow-sm">
                  <span className="text-3xl sm:text-4xl font-black text-[#FF8A00]">
                    {SBC_PRICING.programFee.toLocaleString()}
                  </span>
                  <div>
                    <p className="font-semibold text-[#1B2C4F]">{SBC_PRICING.currency} Program Fee</p>
                    <p className="text-sm text-slate-500">Paid in installments throughout the program</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-5 sm:gap-6"
            >
              <PricingBadge />
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg font-bold px-8 sm:px-12 h-12 sm:h-14 bg-[#FF8A00] hover:bg-[#e67a00] text-white shadow-lg shadow-orange-500/20"
              >
                <Link href={sbcPath("/register")}>Register Today</Link>
              </Button>
              <p className="text-xs sm:text-sm text-slate-400 text-center px-4">
                Limited spots. Registration closes {SBC_PRICING.registrationDeadline}.
              </p>
            </motion.div>
          </div>
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
