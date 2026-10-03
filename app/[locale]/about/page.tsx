"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"
import { PaperButton, PaperPhoto, PaperSheet } from "@/components/marketing/paper"

export default function AboutPage() {
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const values = [
    t.about.values.growth,
    t.about.values.trust,
    t.about.values.accountability,
    t.about.values.accessibility,
    t.about.values.community,
    t.about.values.excellence,
  ]

  return (
    <div className="ps-site min-h-screen">
      <Header />
      <section className="ps-wrap py-16 lg:py-20">
        <h1 className="ps-h1 max-w-3xl">
          <span className="text-[#0EA5E9]">{t.about.hero.titleLead}</span> {t.about.hero.titleRest}
        </h1>
        <p className="ps-lead mt-5 max-w-2xl">{t.about.hero.subtitle}</p>
      </section>

      <section className="ps-wrap grid items-center gap-10 pb-16 lg:grid-cols-2">
        <div>
          <h2 className="ps-h2">{t.about.story.title}</h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-[#5C6B84]">
            <p>{t.about.story.paragraph1}</p>
            <p>{t.about.story.paragraph2}</p>
            <p>{t.about.story.paragraph3}</p>
          </div>
        </div>
        <PaperPhoto src="/images/prepskul-student-presenting-optimized.png" alt="PrepSkul learners presenting their work" rotate={2} imgClassName="h-72 sm:h-80" />
      </section>

      <section className="bg-[#1B2C4F] py-16 text-white">
        <div className="ps-wrap max-w-3xl">
          <h2 className="ps-h2 text-white">{t.about.mission.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/75">{t.about.mission.description}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="ps-wrap">
          <h2 className="ps-h2">{t.about.values.title}</h2>
          <p className="ps-lead mt-3 max-w-xl">{t.about.values.subtitle}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, i) => (
              <PaperSheet key={value.title} className="p-6" rotate={i % 2 ? 1 : -1} tone={i % 3 === 1 ? "yellow" : i % 3 === 2 ? "blue" : "cream"}>
                <h3 className="text-lg font-black uppercase">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5C6B84]">{value.description}</p>
              </PaperSheet>
            ))}
          </div>
        </section>

      <section className="ps-wrap pb-20 text-center">
        <h2 className="ps-h2">{t.about.cta.title}</h2>
        <p className="ps-lead mx-auto mt-3 max-w-xl">{t.about.cta.subtitle}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={`/${locale}/onboard`}>
            <PaperButton>{t.about.cta.startLearning}</PaperButton>
          </Link>
          <Link href={`/${locale}/programs`} className="inline-flex items-center justify-center rounded-2xl border-2 border-[#1B2C4F] bg-[#fffdf7] px-6 py-3.5 font-black text-[#1B2C4F] shadow-[0_5px_0_rgba(27,44,79,.18)]">
            {t.about.cta.explorePrograms}
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
