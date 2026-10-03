"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { getStartedUrl } from "@/lib/get-started-url"
import { PaperButton, PaperSheet } from "@/components/marketing/paper"
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

      <section className="ps-wrap pt-16 pb-10 lg:pt-24 lg:pb-14">
        <h1 className="ps-h1 max-w-3xl">{c.programs.title}</h1>
        <p className="ps-lead mt-5 max-w-2xl">{c.programs.lead}</p>
      </section>

      <section id="sbc" className="scroll-mt-24 ps-wrap pb-16 lg:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#1B2C4F] sm:text-3xl">{sbc?.title}</h2>
            <p className="ps-lead mt-4 max-w-md">{sbc?.body}</p>
            <p className="mt-4 text-sm leading-6 text-[#5C6B84]">{c.programs.sbc.done}</p>
            <p className="mt-5 text-sm font-medium text-[#1B2C4F]">
              {c.programs.sbc.stats.map((stat) => stat.value).join("  ·  ")}
            </p>
            <a href={sbc?.href} className="mt-8 inline-block">
              <PaperButton>{c.programs.sbc.cta}</PaperButton>
            </a>
          </div>
          <div>
            <PaperSheet className="overflow-hidden p-2" tone="sky">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sbc?.cover} alt="" className="aspect-[4/3] w-full rounded-[16px] object-cover" />
            </PaperSheet>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {c.programs.sbc.gallery.map((src) => (
                <div key={src} className="overflow-hidden rounded-xl border border-[#1B2C4F]/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="peap" className="scroll-mt-24 border-t border-[#1B2C4F]/10">
        <div className="ps-wrap py-16 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#1B2C4F] sm:text-3xl">{peap?.title}</h2>
              <p className="ps-lead mt-4 max-w-md">{peap?.body}</p>
              <p className="mt-4 text-sm leading-6 text-[#5C6B84]">{c.programs.peap.done}</p>
              <p className="mt-5 text-sm font-medium text-[#1B2C4F]">
                {c.programs.peap.stats.map((stat) => stat.value).join("  ·  ")}
              </p>
              <a href={getStartedUrl()} className="mt-8 inline-block">
                <PaperButton>{c.programs.peap.cta}</PaperButton>
              </a>
            </div>
            <div>
              <PaperSheet className="overflow-hidden p-2" tone="blue">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.programs.peap.photo} alt="" className="aspect-[4/3] w-full rounded-[16px] object-cover" />
              </PaperSheet>
              <blockquote className="mt-5">
                <p className="text-sm leading-6 text-[#5C6B84]">“{c.programs.peap.quote}”</p>
                <footer className="mt-2 text-xs font-medium text-[#1B2C4F]/70">{c.programs.peap.quoteName}</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#1B2C4F]/10 py-12 lg:py-16">
        <div className="ps-wrap">
          <h2 className="text-sm font-medium text-[#5C6B84]">{c.programs.valuesTitle}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#5C6B84]">{c.programs.valuesLead}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.programs.values.map((value, index) => (
              <PaperSheet
                key={value.title}
                tone={(["sky", "yellow", "mint", "peach"] as const)[index % 4]}
                rotate={[-1.2, 0.8, -0.6, 1][index % 4]}
                className="min-h-[176px] p-5 sm:p-6"
              >
                <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border-2 border-[#1B2C4F]/15 bg-white/80 text-sm font-black text-[#1B2C4F] shadow-[0_3px_0_rgba(27,44,79,0.12)]">
                  0{index + 1}
                </span>
                <h3 className="text-base font-bold text-[#1B2C4F]">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5C6B84]">{value.body}</p>
              </PaperSheet>
            ))}
          </div>
        </div>
      </section>

      <section className="ps-wrap py-14 lg:py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-[#1B2C4F]">{c.programs.closeTitle}</h2>
        <p className="ps-lead mt-3 max-w-xl">{c.programs.closeBody}</p>
        <div className="mt-7">
          <Link href={`/${loc}/onboard`}>
            <PaperButton>{c.programs.mateCta}</PaperButton>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
