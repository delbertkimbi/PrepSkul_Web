"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { getStartedUrl } from "@/lib/get-started-url"
import { PaperButton, PaperPhoto, PaperSheet, Tape } from "@/components/marketing/paper"
import { useLocale } from "@/lib/locale-context"
import { type Locale } from "@/lib/i18n"

export default function ProgramsPage() {
  const { locale } = useLocale()
  const c = aliveCopy(locale)
  const loc = (locale.startsWith("fr") ? "fr" : "en") as Locale
  const sbc = c.programs.hosted[0]
  const peap = c.programs.hosted[1]

  return (
    <div className="ps-site min-h-screen">
      <Header />
      <section className="ps-wrap py-16 lg:py-20">
        <h1 className="ps-h1 max-w-3xl">{c.programs.title}</h1>
        <p className="ps-lead mt-5 max-w-2xl">{c.programs.lead}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {c.programs.hosted.map((program, i) => (
            <a key={program.id} href={`#${program.id}`}>
              <PaperSheet className="h-full overflow-hidden p-3 sm:p-4" tone={program.tone} rotate={i ? 1 : -1}>
                <div className="relative overflow-hidden rounded-[18px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={program.cover} alt="" className="h-44 w-full object-cover sm:h-52" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={program.logo}
                    alt=""
                    className="absolute left-4 top-4 h-14 w-14 rounded-2xl border border-[#1B2C4F]/10 bg-white object-contain p-1"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h2 className="ps-h2">{program.title}</h2>
                  <p className="mt-2 text-[15px] leading-7 text-[#5C6B84]">{program.body}</p>
                  <p className="mt-4 text-sm font-black text-[#1B2C4F]">{program.cta}</p>
                </div>
              </PaperSheet>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-[#fffdf7] py-16">
        <div className="ps-wrap">
          <h2 className="ps-h2 max-w-2xl">{c.programs.valuesTitle}</h2>
          <p className="ps-lead mt-3 max-w-xl">{c.programs.valuesLead}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.programs.values.map((value, i) => (
              <PaperSheet
                key={value.title}
                className="h-full p-5"
                tone={i === 1 ? "yellow" : i === 2 ? "blue" : i === 3 ? "mint" : "cream"}
                rotate={i % 2 ? 1 : -1}
              >
                <h3 className="text-lg font-black uppercase">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5C6B84]">{value.body}</p>
              </PaperSheet>
            ))}
          </div>
        </div>
      </section>

      <section id="sbc" className="scroll-mt-24 ps-wrap py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sbc?.logo} alt="" className="h-16 w-16 rounded-2xl border border-[#1B2C4F]/10 bg-white object-contain p-1" />
            <h2 className="ps-h2 mt-5">{sbc?.title}</h2>
            <p className="ps-lead mt-4 max-w-xl">{sbc?.body}</p>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#5C6B84]">{c.programs.sbc.done}</p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {c.programs.sbc.stats.map((stat) => (
                <p key={stat.value}>
                  <span className="block text-lg font-black text-[#1B2C4F]">{stat.value}</span>
                  <span className="text-sm font-bold text-[#5C6B84]">{stat.label}</span>
                </p>
              ))}
            </div>
            <a href={sbc?.href} className="mt-8 inline-block">
              <PaperButton>{c.programs.sbc.cta}</PaperButton>
            </a>
          </div>
          <PaperSheet className="relative overflow-hidden p-3" tone="sky" rotate={1.5}>
            <Tape color="yellow" className="-top-3 left-1/2 -translate-x-1/2" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sbc?.cover} alt="" className="h-64 w-full rounded-[18px] object-cover sm:h-80" />
          </PaperSheet>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {c.programs.sbc.gallery.map((src, i) => (
            <PaperPhoto key={src} src={src} alt="" rotate={i === 1 ? 1.5 : -1} imgClassName="aspect-[4/3] h-auto max-h-56" />
          ))}
        </div>
      </section>

      <section id="peap" className="scroll-mt-24 bg-[#1B2C4F] py-16 text-white lg:py-20">
        <div className="ps-wrap grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={peap?.logo} alt="" className="h-16 w-16 rounded-2xl border border-white/15 bg-white object-contain p-1" />
            <h2 className="ps-h2 mt-5 text-white">{peap?.title}</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">{peap?.body}</p>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/70">{c.programs.peap.done}</p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {c.programs.peap.stats.map((stat) => (
                <p key={stat.value}>
                  <span className="block text-lg font-black text-white">{stat.value}</span>
                  <span className="text-sm font-bold text-white/65">{stat.label}</span>
                </p>
              ))}
            </div>
            <a href={getStartedUrl()} className="mt-8 inline-block">
              <PaperButton className="bg-white text-[#1B2C4F] shadow-[0_7px_0_#d7d2c6]">{c.programs.peap.cta}</PaperButton>
            </a>
          </div>
          <PaperSheet className="relative overflow-hidden p-3" tone="cream" rotate={-1}>
            <Tape color="yellow" className="-top-3 left-1/2 -translate-x-1/2" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.programs.peap.photo} alt="" className="h-64 w-full rounded-[18px] object-cover sm:h-80" />
          </PaperSheet>
        </div>
        <div className="ps-wrap mt-10 max-w-3xl">
          <PaperSheet className="p-6 sm:p-8" tone="cream" rotate={-0.5}>
            <p className="text-lg font-black leading-snug text-[#1B2C4F]">{c.programs.peap.quote}</p>
            <p className="mt-4 text-sm font-bold text-[#5C6B84]">{c.programs.peap.quoteName}</p>
          </PaperSheet>
        </div>
      </section>

      <section className="ps-wrap py-16 text-center lg:py-20">
        <h2 className="ps-h2">{c.programs.closeTitle}</h2>
        <p className="ps-lead mx-auto mt-3 max-w-xl">{c.programs.closeBody}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
      <Footer />
    </div>
  )
}
