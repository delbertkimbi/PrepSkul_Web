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

      <section className="ps-wrap pt-14 pb-10 lg:pt-20 lg:pb-12">
        <h1 className="ps-h1 max-w-3xl">{c.programs.title}</h1>
        <p className="ps-lead mt-5 max-w-xl">{c.programs.lead}</p>
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-black text-[#1B2C4F]">
          <a href="#sbc" className="underline decoration-[#EAB308] decoration-4 underline-offset-4">
            {sbc?.title}
          </a>
          <a href="#peap" className="underline decoration-[#EAB308] decoration-4 underline-offset-4">
            {peap?.title}
          </a>
        </p>
      </section>

      <section id="sbc" className="scroll-mt-24 ps-wrap pb-16 lg:pb-20">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div>
            <h2 className="text-2xl font-black uppercase leading-none text-[#1B2C4F] sm:text-3xl">
              {sbc?.title}
            </h2>
            <p className="ps-lead mt-4 max-w-xl">{sbc?.body}</p>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#5C6B84]">{c.programs.sbc.done}</p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {c.programs.sbc.stats.map((stat) => (
                <div key={stat.value}>
                  <dt className="font-black text-[#1B2C4F]">{stat.value}</dt>
                  <dd className="text-[#5C6B84]">{stat.label}</dd>
                </div>
              ))}
            </dl>
            <a href={sbc?.href} className="mt-8 inline-block">
              <PaperButton>{c.programs.sbc.cta}</PaperButton>
            </a>
          </div>
          <PaperSheet className="overflow-hidden p-2.5" tone="sky">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sbc?.cover} alt="" className="h-52 w-full rounded-[18px] object-cover sm:h-56" />
          </PaperSheet>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {c.programs.sbc.gallery.map((src) => (
            <div key={src} className="overflow-hidden rounded-2xl border border-[#1B2C4F]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-24 w-full object-cover sm:h-32" />
            </div>
          ))}
        </div>
      </section>

      <section id="peap" className="scroll-mt-24 px-4 pb-16 sm:px-6 lg:pb-20">
        <div className="ps-wrap">
          <PaperSheet className="overflow-hidden bg-[#1B2C4F] p-6 text-white sm:p-8 lg:p-10" tone="navy">
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
              <div>
                <h2 className="text-2xl font-black uppercase leading-none text-white sm:text-3xl">
                  {peap?.title}
                </h2>
                <p className="mt-4 max-w-xl text-[17px] leading-7 text-white/80">{peap?.body}</p>
                <p className="mt-3 max-w-xl text-[15px] leading-7 text-white/65">{c.programs.peap.done}</p>
                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                  {c.programs.peap.stats.map((stat) => (
                    <div key={stat.value}>
                      <dt className="font-black text-white">{stat.value}</dt>
                      <dd className="text-white/60">{stat.label}</dd>
                    </div>
                  ))}
                </dl>
                <a href={getStartedUrl()} className="mt-8 inline-block">
                  <PaperButton className="bg-white text-[#1B2C4F] shadow-[0_7px_0_#d7d2c6]">{c.programs.peap.cta}</PaperButton>
                </a>
              </div>
              <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/5 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.programs.peap.photo} alt="" className="h-52 w-full rounded-[14px] object-cover sm:h-56" />
              </div>
            </div>
            <blockquote className="mt-8 max-w-2xl border-t border-white/15 pt-6">
              <p className="text-[15px] leading-7 text-white/85">{c.programs.peap.quote}</p>
              <footer className="mt-2 text-sm font-bold text-white/50">{c.programs.peap.quoteName}</footer>
            </blockquote>
          </PaperSheet>
        </div>
      </section>

      <section className="border-t border-[#1B2C4F]/10 py-12">
        <div className="ps-wrap">
          <h2 className="text-lg font-black uppercase text-[#1B2C4F]">{c.programs.valuesTitle}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#5C6B84]">{c.programs.valuesLead}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.programs.values.map((value) => (
              <div key={value.title}>
                <h3 className="text-sm font-black uppercase text-[#1B2C4F]">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#5C6B84]">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ps-wrap py-14 lg:py-16">
        <h2 className="text-2xl font-black uppercase leading-tight text-[#1B2C4F]">{c.programs.closeTitle}</h2>
        <p className="ps-lead mt-3 max-w-xl">{c.programs.closeBody}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
