"use client"

import Link from "next/link"
import { Check, Sparkles, Users } from "lucide-react"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { Eyebrow, PaperButton, PaperSheet, Tape } from "@/components/sbc/paper-ui"
import { SBC_PACKAGES } from "@/lib/sbc/content"
import { useSbcLanguage } from "@/lib/sbc/i18n"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"

const tones = ["blue", "yellow", "mint"] as const

export default function PricingPage() {
  const path = useSbcPath()
  const { t, locale } = useSbcLanguage()
  const number = (value: number) => value.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")

  return <SbcPageShell><SbcHeader/><main>
    <section className="px-4 pb-14 pt-12 sm:px-6 lg:pb-20 lg:pt-20">
      <div className="mx-auto max-w-5xl text-center">
        <Eyebrow>{t("Summer Build Camp 2026")}</Eyebrow>
        <h1 className="sbc-display mt-5 text-5xl font-black uppercase leading-[.9] text-[#132d63] sm:text-7xl">{t("Choose the experience")}<br/><span className="text-[#2864d7]">{t("that fits your child.")}</span></h1>
        <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-600">{t("Every learner receives the complete 5-day Summer Build Camp experience. Choose the level of continued mentorship, AI resources and support that feels right for your family.")}</p>
      </div>
    </section>
    <section className="bg-[#fffdf7] px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {SBC_PACKAGES.map((pkg, index) => <PaperSheet key={pkg.id} tone={tones[index]} className="relative flex h-full flex-col p-6 sm:p-7" rotate={index === 1 ? 1 : -1}>
          {pkg.id === "creator" && <Tape color="cream" className="-top-3 right-10 rotate-6"/>}
          <div className="flex items-start justify-between gap-4"><div><h2 className="sbc-display text-3xl font-black uppercase text-[#132d63]">{t(pkg.name)}</h2><p className="mt-2 text-sm font-black leading-5 text-[#168c91]">{t(pkg.tagline)}</p></div>{pkg.id === "innovator" && <Sparkles className="h-8 w-8 shrink-0 text-[#f2b91f]"/>}</div>
          <p className="mt-5 text-sm leading-6 text-slate-600">{t(pkg.perfectFor)}</p>
          <div className="mt-6 border-y-2 border-dashed border-[#132d63]/15 py-5"><p className="text-4xl font-black text-[#132d63]">{number(pkg.price)} <span className="text-base">XAF</span></p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#132d63]/65">{t("per child")}</p><p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#168c91]"><Users className="h-4 w-4"/>{t("Family price")}: {number(pkg.familyPrice)} XAF {t("per child")}</p></div>
          <p className="mt-5 text-sm font-bold leading-6 text-[#132d63]">{t(pkg.description)}</p>
          <ul className="mt-5 space-y-3 text-sm leading-5 text-slate-700">{pkg.includes.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#168c91]"/>{t(item)}</li>)}</ul>
          <p className="mt-6 text-xs font-bold leading-5 text-[#132d63]/75">{t(pkg.bestFor)}</p>
          <Link href={`${path("/register")}?package=${pkg.id}`} className="mt-7 block"><PaperButton className="w-full">{t("Choose")} {t(pkg.name)}</PaperButton></Link>
        </PaperSheet>)}
      </div>
      <div className="mx-auto mt-10 max-w-4xl rounded-[22px] border-2 border-[#132d63]/15 bg-[#dfeeff] p-6 text-center sm:p-8"><h2 className="sbc-display text-2xl font-black uppercase text-[#132d63] sm:text-3xl">{t("What every learner receives")}</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">{t("Five days of immersive AI and innovation learning, hands-on team projects, entrepreneurial thinking workshops, Demo Day, a certificate, expert mentors, an AI Prompt Starter Pack and an equal opportunity to showcase ideas.")}</p><p className="mt-4 text-xs font-semibold text-[#132d63]/65">{t("Family prices apply when two or more children from the same family register together.")}</p></div>
    </section>
  </main><SbcFooter/></SbcPageShell>
}
