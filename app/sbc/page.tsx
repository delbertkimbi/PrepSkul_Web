"use client"

import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin, ArrowRight, Lightbulb, Puzzle, MessageCircle, Rocket, Bot, PencilRuler, Star, Quote } from "lucide-react"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { ScrollReveal } from "@/components/sbc/scroll-reveal"
import { Doodle, Eyebrow, PaperButton, PaperSheet, Tape, TornDivider } from "@/components/sbc/paper-ui"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { SBC_CURRICULUM_WEEKS, SBC_PRICING, SBC_SCHEDULE } from "@/lib/sbc/content"
import { CountdownStrip } from "@/components/sbc/countdown-strip"
import { useSbcLanguage } from "@/lib/sbc/i18n"

const experiences = [
  { icon: Lightbulb, title: "Spot real problems", text: "See everyday challenges as opportunities worth solving.", tone: "blue" as const },
  { icon: Puzzle, title: "Work with others", text: "Listen, collaborate and turn different ideas into one plan.", tone: "yellow" as const },
  { icon: Bot, title: "Build with AI", text: "Use practical AI tools to research, design and prototype.", tone: "mint" as const },
  { icon: MessageCircle, title: "Pitch with confidence", text: "Explain an idea clearly and present it on Demo Day.", tone: "lilac" as const },
]

const builds = [
  { icon: PencilRuler, title: "A clear solution", color: "text-[#2864d7]" },
  { icon: Bot, title: "Practical AI skills", color: "text-[#6a47bd]" },
  { icon: Rocket, title: "A working prototype", color: "text-[#e06b2d]" },
  { icon: MessageCircle, title: "A confident pitch", color: "text-[#168c91]" },
]

export default function SbcLandingPage() {
  const path = useSbcPath()
  const { t } = useSbcLanguage()
  return (
    <SbcPageShell>
      <SbcHeader />
      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:pb-24 lg:pt-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_.98fr]">
            <div className="relative z-10 text-center lg:text-left">
              <Eyebrow>Summer Build Camp 2026</Eyebrow>
              <h1 className="sbc-display mt-5 text-[2.55rem] font-black uppercase leading-[.9] text-[#132d63] min-[375px]:text-[2.9rem] sm:text-7xl lg:text-[5.6rem]">
                <span className="text-[#2864d7]">{t("1 Week")}</span><span className="block">{t("AI & Innovation")}</span><span className="block text-[#168c91]">{t("Experience")}</span>
              </h1>
              <p className="mt-6 text-lg font-bold text-[#132d63] sm:text-xl"><span className="text-[#2864d7]">{t("Learn.")}</span> <span className="text-[#6a47bd]">{t("Build.")}</span> <span className="text-[#e06b2d]">{t("Innovate.")}</span> <span className="text-[#168c91]">{t("Pitch.")}</span></p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base lg:mx-0">Young learners turn bold ideas into real solutions through hands-on AI, creativity, teamwork and confident pitching.</p>
              <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href={path("/register")}><PaperButton className="w-full sm:w-auto">{t("Register now")} <ArrowRight className="ml-2 h-5 w-5" /></PaperButton></Link>
                <Link href={path("/program")} className="inline-flex items-center justify-center rounded-2xl border-2 border-[#132d63] bg-[#fffdf7] px-6 py-3.5 font-black text-[#132d63] shadow-[0_5px_0_rgba(19,45,99,.18)] transition hover:-translate-y-1">View roadmap</Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl pt-7">
              <Doodle className="-right-1 top-0 rotate-12 text-5xl text-[#f2b91f]">✦</Doodle>
              <Doodle className="-left-3 bottom-16 -rotate-12 text-5xl">↗</Doodle>
              <PaperSheet className="p-3 sm:p-4" rotate={2}>
                <Tape className="-top-4 left-1/2 -translate-x-1/2" />
                <div className="overflow-hidden rounded-[18px] bg-[#dce9ff]">
                  <Image src="/sbc-hero-builders-v2.webp" alt="Three African teenagers building a technology project together" width={1792} height={875} priority sizes="(max-width: 1024px) 92vw, 46vw" className="h-[280px] w-full object-cover min-[375px]:h-[310px] sm:h-[390px]" />
                </div>
              </PaperSheet>
              <PaperSheet className="relative z-10 mx-auto -mt-5 w-[94%] p-4 sm:absolute sm:-bottom-10 sm:left-8 sm:mt-0 sm:w-auto sm:max-w-[88%] sm:p-5">
                <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-3">
                  <div><CalendarDays className="mb-1 h-5 w-5 text-[#2864d7]"/><b className="block text-sm">4–8 August</b><span className="text-xs text-slate-500">Tuesday–Saturday</span></div>
                  <div><MapPin className="mb-1 h-5 w-5 text-[#168c91]"/><b className="block text-sm">Buea + online</b><span className="text-xs text-slate-500">Ages 9–18</span></div>
                  <div className="col-span-2 sm:col-span-1"><Star className="mb-1 h-5 w-5 text-[#e06b2d]"/><b className="block text-sm">Demo Day</b><span className="text-xs text-slate-500">Pitch & celebrate</span></div>
                </div>
              </PaperSheet>
            </div>
          </div>
        </section>

        <CountdownStrip />
        <TornDivider />
        <section id="experience" className="bg-[#fffdf7] px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <ScrollReveal className="mx-auto max-w-3xl text-center"><Eyebrow>Why SBC?</Eyebrow><h2 className="sbc-display mt-5 text-4xl font-black uppercase leading-none text-[#132d63] sm:text-6xl">What if we taught children to solve problems, not just answer questions?</h2><p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">The future rewards young people who can notice, collaborate, build and communicate. That is exactly what innovation is.</p></ScrollReveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{experiences.map(({icon: Icon, title, text, tone}, i) => <ScrollReveal key={title} delay={i*.05}><PaperSheet tone={tone} className="h-full p-6" rotate={i % 2 ? 1 : -1}><Icon className="h-9 w-9 text-[#132d63]"/><h3 className="mt-5 text-lg font-black uppercase leading-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></PaperSheet></ScrollReveal>)}</div>
          </div>
        </section>

        <TornDivider flip />
        <section id="roadmap" className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl"><ScrollReveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Eyebrow>5-day roadmap</Eyebrow><h2 className="sbc-display mt-4 text-4xl font-black uppercase sm:text-6xl">{t("One week to")} <span className="text-[#2864d7]">{t("create")}</span>, {t("innovate and pitch.")}</h2></div><Link href={path("/program")} className="shrink-0 font-black text-[#2864d7] underline decoration-[#f5c843] decoration-4 underline-offset-4">{t("Explore each day →")}</Link></ScrollReveal>
            <div className="mt-12 grid gap-4 md:grid-cols-5">{SBC_CURRICULUM_WEEKS.map((day, i) => <PaperSheet key={day.title} className="p-5" tone={(["blue","lilac","peach","mint","yellow"] as const)[i]} rotate={i%2 ? 1 : -1}><span className="text-xs font-black uppercase tracking-widest">Day {day.week}</span><h3 className="mt-4 text-lg font-black uppercase leading-tight">{day.title}</h3><p className="mt-3 text-xs leading-5 text-slate-600">{day.produce}</p></PaperSheet>)}</div>
          </div>
        </section>

        <section id="build" className="bg-[#132d63] px-4 py-20 text-white sm:px-6 lg:py-24"><div className="mx-auto max-w-6xl"><div className="grid items-center gap-10 lg:grid-cols-2"><ScrollReveal><Eyebrow>What they’ll build</Eyebrow><h2 className="sbc-display mt-5 text-4xl font-black uppercase sm:text-6xl">{t("Come with ideas.")}<br/><span className="text-[#f5c843]">{t("Leave with proof.")}</span></h2><p className="mt-5 max-w-lg leading-7 text-white/70">Every learner finishes with something tangible they can demonstrate, explain and continue improving.</p></ScrollReveal><div className="grid grid-cols-2 gap-4">{builds.map(({icon:Icon,title,color},i)=><PaperSheet key={title} className="p-5 text-[#132d63]" rotate={i%2?2:-2}><Icon className={`h-8 w-8 ${color}`}/><h3 className="mt-4 font-black uppercase leading-tight">{title}</h3></PaperSheet>)}</div></div></div></section>

        <section id="gallery" className="px-4 py-20 sm:px-6 lg:py-28"><div className="mx-auto max-w-6xl"><div className="text-center"><Eyebrow>Inside the experience</Eyebrow><h2 className="sbc-display mt-4 text-4xl font-black uppercase sm:text-6xl">A creative classroom in motion</h2></div><div className="mt-12 grid gap-7 md:grid-cols-3"><PaperSheet className="p-3" rotate={-2}><Image src="/sbc-gallery-student.webp" alt="Learner exploring technology" width={600} height={600} sizes="(max-width: 768px) 92vw, 31vw" className="h-64 w-full rounded-[18px] object-cover min-[375px]:h-72"/></PaperSheet><PaperSheet className="p-3 md:-translate-y-5" rotate={2}><Image src="/sbc-gallery-online.webp" alt="Learner participating online" width={600} height={600} sizes="(max-width: 768px) 92vw, 31vw" className="h-64 w-full rounded-[18px] object-cover min-[375px]:h-72"/></PaperSheet><PaperSheet className="p-3" rotate={-1}><Image src="/sbc-gallery-vr.webp" alt="SBC learner exploring immersive technology" width={669} height={373} sizes="(max-width: 768px) 92vw, 31vw" className="h-64 w-full rounded-[18px] bg-[#eaf3ff] object-contain min-[375px]:h-72"/></PaperSheet></div></div></section>

        <section id="testimonials" className="bg-[#dfeeff] px-4 py-20 sm:px-6"><ScrollReveal className="mx-auto max-w-3xl"><PaperSheet className="p-7 text-center sm:p-10" rotate={-1}><Quote className="mx-auto h-9 w-9 text-[#2864d7]"/><blockquote className="sbc-display mt-4 text-2xl font-black leading-tight sm:text-4xl">“{t("The goal is not to make children memorize technology. It is to help them use it to think, build and communicate.")}”</blockquote><p className="mt-5 text-sm font-bold uppercase tracking-widest text-[#168c91]">The SBC learning promise</p></PaperSheet></ScrollReveal></section>

        <section id="registration" className="px-4 py-20 sm:px-6 lg:py-28"><div className="mx-auto max-w-5xl"><PaperSheet tone="yellow" className="overflow-hidden p-7 sm:p-12" rotate={1}><Tape color="cream" className="-top-3 right-16 rotate-6"/><div className="grid items-center gap-8 md:grid-cols-[1fr_auto]"><div><Eyebrow className="bg-white">Registration is open</Eyebrow><h2 className="sbc-display mt-5 text-4xl font-black uppercase sm:text-6xl">Save their seat.</h2><p className="mt-4 max-w-xl leading-7 text-slate-700">4–8 August 2026 · Buea onsite + online · Ages 9–18</p><p className="mt-4 text-xl font-black">{SBC_PRICING.registrationFee.toLocaleString()} XAF <span className="text-sm font-semibold text-slate-600">{t("for one child")}</span></p><p className="mt-1 text-sm font-bold text-[#168c91]">{t("More than one child?")} {SBC_PRICING.siblingFee.toLocaleString()} {t("XAF per child.")}</p></div><Link href={path("/register")}><PaperButton className="w-full md:w-auto">{t("Start registration")} <ArrowRight className="ml-2 h-5 w-5"/></PaperButton></Link></div></PaperSheet></div></section>
      </main>
      <SbcFooter />
    </SbcPageShell>
  )
}
