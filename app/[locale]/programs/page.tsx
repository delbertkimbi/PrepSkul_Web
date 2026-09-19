"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PEAPShowcase } from "@/components/peap-showcase"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { PaperButton, PaperCutout, PaperSheet } from "@/components/marketing/paper"
import { useLocale } from "@/lib/locale-context"
import { type Locale } from "@/lib/i18n"

export default function ProgramsPage() {
  const { locale } = useLocale()
  const c = aliveCopy(locale)
  const loc = (locale.startsWith("fr") ? "fr" : "en") as Locale

  return (
    <div className="ps-site min-h-screen">
      <Header />
      <section className="ps-wrap py-16 lg:py-20">
        <h1 className="ps-h1 max-w-3xl">{c.programs.title}</h1>
        <p className="ps-lead mt-4 max-w-2xl">{c.programs.lead}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={`/${loc}/onboard`}>
            <PaperButton>{c.programs.mateCta}</PaperButton>
          </Link>
          <Link
            href={`/${loc}/find`}
            className="inline-flex items-center justify-center rounded-2xl border-2 border-[#1B2C4F] bg-[#fffdf7] px-6 py-3.5 font-black text-[#1B2C4F] shadow-[0_5px_0_rgba(27,44,79,.18)]"
          >
            {c.programs.tutorsCta}
          </Link>
        </div>
      </section>

      <section className="ps-wrap pb-16">
        <h2 className="ps-h2 max-w-xl">{c.programs.hostedTitle}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {c.programs.hosted.map((program, i) => {
            const card = (
              <PaperSheet className="h-full p-6 sm:p-8" tone={program.tone} rotate={i ? 1 : -1}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={program.logo}
                  alt=""
                  className="h-16 w-16 rounded-2xl border border-[#1B2C4F]/10 bg-white object-contain p-1 sm:h-20 sm:w-20"
                />
                <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#0EA5E9]">{program.kicker}</p>
                <h3 className="ps-h2 mt-2">{program.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#5C6B84]">{program.body}</p>
                <p className="mt-5 text-sm font-black text-[#1B2C4F]">{program.cta}</p>
              </PaperSheet>
            )
            return (
              <a key={program.id} href={program.href}>
                {card}
              </a>
            )
          })}
        </div>
      </section>

      <PEAPShowcase locale={loc} />

      <section className="ps-wrap grid gap-5 py-16 md:grid-cols-2">
        <PaperSheet className="p-6 sm:p-8" tone="mint" rotate={-1}>
          <PaperCutout src="/onboard/art/tile-flask.png" className="h-16 w-16 sm:h-20 sm:w-20" />
          <h2 className="ps-h2 mt-5">{c.programs.schoolTitle}</h2>
          <p className="mt-3 text-[15px] leading-7 text-[#5C6B84]">{c.programs.schoolBody}</p>
        </PaperSheet>
        <PaperSheet className="p-6 sm:p-8" tone="yellow" rotate={1}>
          <PaperCutout src="/onboard/art/tile-laptop.png" className="h-16 w-16 sm:h-20 sm:w-20" />
          <h2 className="ps-h2 mt-5">{c.programs.beyondTitle}</h2>
          <p className="mt-3 text-[15px] leading-7 text-[#5C6B84]">{c.programs.beyondBody}</p>
        </PaperSheet>
      </section>

      <section className="bg-[#fffdf7] py-16">
        <div className="ps-wrap">
          <h2 className="ps-h2">{c.programs.subjectsTitle}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.programs.subjects.map((subject, i) => (
              <PaperSheet key={subject.title} className="ps-fill-well h-full p-5" tone={subject.tone} rotate={i % 2 ? 1 : -1}>
                <PaperCutout src={subject.tile} className="h-14 w-14" />
                <h3 className="mt-4 text-lg font-black uppercase">{subject.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5C6B84]">{subject.body}</p>
              </PaperSheet>
            ))}
          </div>
        </div>
      </section>

      <section className="ps-wrap py-16">
        <h2 className="ps-h2 max-w-xl">{c.programs.howTitle}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {c.programs.how.map((step, i) => (
            <PaperSheet key={step.title} className="p-6" tone={i === 1 ? "peach" : "cream"} rotate={i === 1 ? 1 : -1}>
              <p className="text-sm font-black uppercase text-[#0EA5E9]">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-xl font-black uppercase leading-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5C6B84]">{step.body}</p>
            </PaperSheet>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}
