"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin, Users, Flag, CheckCircle2 } from "lucide-react"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { Eyebrow, PaperButton, PaperSheet, Tape, TornDivider } from "@/components/sbc/paper-ui"
import { ScrollReveal } from "@/components/sbc/scroll-reveal"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { SBC_CURRICULUM_WEEKS, SBC_SCHEDULE } from "@/lib/sbc/content"
import { useSbcLanguage } from "@/lib/sbc/i18n"

const colors = ["blue", "lilac", "peach", "mint", "yellow"] as const

export default function ProgramPage() {
  const path = useSbcPath()
  const { t } = useSbcLanguage()
  return <SbcPageShell><SbcHeader/><main>
    <section className="px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-20"><div className="mx-auto max-w-6xl"><div className="grid gap-10 lg:grid-cols-[1fr_390px] lg:items-start"><div><Eyebrow>SBC training roadmap</Eyebrow><h1 className="sbc-display mt-5 text-5xl font-black uppercase leading-[.9] sm:text-7xl">{t("Five days.")}<br/><span className="text-[#2864d7]">{t("One bold idea.")}</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">A focused, hands-on path from discovering a problem to presenting a working solution. Every day ends with clear progress.</p></div><PaperSheet className="p-6" rotate={2}><Tape className="-right-5 -top-3 rotate-12" color="cream"/><dl className="space-y-5 text-sm"><div className="flex gap-3"><CalendarDays className="h-6 w-6 text-[#2864d7]"/><div><dt className="font-black uppercase">Date</dt><dd>4–8 August 2026 · Tuesday–Saturday</dd></div></div><div className="flex gap-3"><Users className="h-6 w-6 text-[#6a47bd]"/><div><dt className="font-black uppercase">Ages</dt><dd>9–18 years</dd></div></div><div className="flex gap-3"><MapPin className="h-6 w-6 text-[#168c91]"/><div><dt className="font-black uppercase">Mode</dt><dd>Buea onsite, with online participation</dd></div></div><div className="flex gap-3"><Flag className="h-6 w-6 text-[#e06b2d]"/><div><dt className="font-black uppercase">Finale</dt><dd>Demo Day · Saturday, 8 August</dd></div></div></dl></PaperSheet></div></div></section>
    <TornDivider/>
    <section className="bg-[#fffdf7] px-4 py-20 sm:px-6 lg:py-28"><div className="mx-auto max-w-6xl"><ScrollReveal className="text-center"><Eyebrow>The journey</Eyebrow><h2 className="sbc-display mt-4 text-4xl font-black uppercase sm:text-6xl">Discover → Build → Pitch</h2></ScrollReveal><div className="relative mt-14 grid gap-7 lg:grid-cols-5">{SBC_CURRICULUM_WEEKS.map((day,i)=><ScrollReveal key={day.week} delay={i*.05}><PaperSheet tone={colors[i]} className="h-full p-6" rotate={i%2?1:-1}><span className="inline-flex rounded-lg bg-[#132d63] px-3 py-1 text-xs font-black uppercase text-white">Day {day.week}</span><p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#132d63]/60">{["Tuesday","Wednesday","Thursday","Friday","Saturday"][i]}</p><h3 className="mt-4 text-xl font-black uppercase leading-tight">{day.title}</h3><div className="mt-5 border-t border-dashed border-[#132d63]/20 pt-4"><p className="text-sm leading-6 text-slate-600">{day.learn}</p><p className="mt-4 flex gap-2 text-xs font-bold leading-5 text-[#132d63]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/>{day.produce}</p></div></PaperSheet></ScrollReveal>)}</div></div></section>
    <section className="px-4 py-20 sm:px-6"><div className="mx-auto max-w-4xl text-center"><Eyebrow>Demo Day</Eyebrow><h2 className="sbc-display mt-5 text-4xl font-black uppercase sm:text-6xl">Pitch it. Show it. Celebrate it.</h2><p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">Learners showcase their prototypes to parents, mentors and guests, receive certificates and leave with the confidence to keep building.</p><Link href={path("/register")} className="mt-8 inline-block"><PaperButton>{t("Register for SBC")} <ArrowRight className="ml-2 h-5 w-5"/></PaperButton></Link></div></section>
  </main><SbcFooter/></SbcPageShell>
}
