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

      <section className="ps-wrap pt-14 pb-8 lg:pt-20 lg:pb-10">
        <h1 className="ps-h1 max-w-3xl">{c.programs.title}</h1>
        <p className="ps-lead mt-5 max-w-xl">{c.programs.lead}</p>
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5C6B84]">
          <a href="#sbc" className="font-semibold text-[#1B2C4F] underline underline-offset-4">
            {sbc?.title}
          </a>
          <a href="#peap" className="font-semibold text-[#1B2C4F] underline underline-offset-4">
            {peap?.title}
          </a>
        </p>
      </section>

      <section id="sbc" className="scroll-mt-24 ps-wrap pb-12 lg:pb-16">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10">
          <div>
            <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-[#1B2C4F] sm:text-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sbc?.logo} alt="" className="h-9 w-9 rounded-xl border border-[#1B2C4F]/10 bg-white object-contain p-0.5" />
              {sbc?.title}
            </h2>
            <p className="ps-lead mt-4 max-w-xl">{sbc?.body}</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5C6B84]">{c.programs.sbc.done}</p>
            <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-sm">
              {c.programs.sbc.stats.map((stat) => (
                <div key={stat.value}>
                  <dt className="font-semibold text-[#1B2C4F]">{stat.value}</dt>
                  <dd className="text-[#5C6B84]">{stat.label}</dd>
                </div>
              ))}
            </dl>
            <a href={sbc?.href} className="mt-7 inline-block">
              <PaperButton>{c.programs.sbc.cta}</PaperButton>
            </a>
          </div>
          <PaperSheet className="overflow-hidden p-2" tone="sky">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sbc?.cover} alt="" className="h-44 w-full rounded-[16px] object-cover sm:h-48" />
          </PaperSheet>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {c.programs.sbc.gallery.map((src) => (
            <div key={src} className="overflow-hidden rounded-xl border border-[#1B2C4F]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-full object-cover sm:h-24" />
            </div>
          ))}
        </div>
      </section>

      <section id="peap" className="scroll-mt-24 border-t border-[#1B2C4F]/10">
        <div className="ps-wrap py-12 lg:py-16">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10">
            <div>
              <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-[#1B2C4F] sm:text-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={peap?.logo} alt="" className="h-9 w-9 rounded-xl border border-[#1B2C4F]/10 bg-white object-contain p-0.5" />
                {peap?.title}
              </h2>
              <p className="ps-lead mt-4 max-w-xl">{peap?.body}</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#5C6B84]">{c.programs.peap.done}</p>
              <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-sm">
                {c.programs.peap.stats.map((stat) => (
                  <div key={stat.value}>
                    <dt className="font-semibold text-[#1B2C4F]">{stat.value}</dt>
                    <dd className="text-[#5C6B84]">{stat.label}</dd>
                  </div>
                ))}
              </dl>
              <a href={getStartedUrl()} className="mt-7 inline-block">
                <PaperButton>{c.programs.peap.cta}</PaperButton>
              </a>
            </div>
            <PaperSheet className="overflow-hidden p-2" tone="blue">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.programs.peap.photo} alt="" className="h-44 w-full rounded-[16px] object-cover sm:h-48" />
            </PaperSheet>
          </div>
          <blockquote className="mt-8 max-w-2xl border-l-2 border-[#1B2C4F]/15 pl-4">
            <p className="text-sm leading-6 text-[#5C6B84]">{c.programs.peap.quote}</p>
            <footer className="mt-1.5 text-xs font-semibold text-[#1B2C4F]/70">{c.programs.peap.quoteName}</footer>
          </blockquote>
        </div>
      </section>

      <section className="border-t border-[#1B2C4F]/10 py-10 lg:py-12">
        <div className="ps-wrap">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C6B84]">{c.programs.valuesTitle}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#5C6B84]">{c.programs.valuesLead}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.programs.values.map((value) => (
              <div key={value.title}>
                <h3 className="text-sm font-semibold text-[#1B2C4F]">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#5C6B84]">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ps-wrap py-12 lg:py-14">
        <h2 className="text-xl font-semibold tracking-tight text-[#1B2C4F] sm:text-2xl">{c.programs.closeTitle}</h2>
        <p className="ps-lead mt-3 max-w-xl">{c.programs.closeBody}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
