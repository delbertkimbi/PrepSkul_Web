"use client"

import Image from "next/image"
import Link from "next/link"
import { Globe, Heart, Shield, TrendingUp, Users } from "lucide-react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"

export default function AboutPage() {
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const values = [
    [TrendingUp, t.about.values.growth],
    [Heart, t.about.values.trust],
    [Shield, t.about.values.accountability],
    [Globe, t.about.values.accessibility],
    [Users, t.about.values.community],
    [Heart, t.about.values.excellence],
  ] as const

  return (
    <div className="min-h-screen bg-white text-[#17213a]">
      <Header />
      <main>
        <section className="border-b border-[#17213a]/10 bg-[#f7f9fd]">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_.82fr] lg:px-12 lg:py-28 xl:px-20">
            <div className="self-center">
              <h1 className="max-w-3xl text-5xl font-extrabold leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-7xl">
                {t.about.hero.title} <span className="text-[#3156a6]">{t.about.hero.titleAccent}</span> {t.about.hero.titlePrimary} {t.about.hero.titlePrimaryEnd}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5f6b85]">{t.about.hero.subtitle}</p>
            </div>
            <div className="relative min-h-[380px] overflow-hidden rounded-[22px] border border-[#17213a]/10 bg-white sm:min-h-[470px]">
              <Image src="/images/prepskul-student-presenting.png" alt="PrepSkul learner" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20 lg:px-12 lg:py-28 xl:px-20">
          <h2 className="text-4xl font-extrabold leading-[1] tracking-[-.05em] sm:text-5xl">{t.about.story.title}</h2>
          <div className="max-w-2xl space-y-5 text-lg leading-8 text-[#5f6b85]">
            <p>{t.about.story.paragraph1}</p><p>{t.about.story.paragraph2}</p><p>{t.about.story.paragraph3}</p>
          </div>
        </section>

        <section className="bg-[#17213a] text-white">
          <div className="mx-auto max-w-[1440px] px-5 py-20 text-center sm:px-8 lg:px-12 lg:py-24 xl:px-20">
            <h2 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">{t.about.mission.title}</h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/75">{t.about.mission.description}</p>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28 xl:px-20">
          <div className="max-w-2xl"><h2 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">{t.about.values.title}</h2><p className="mt-4 text-lg leading-8 text-[#5f6b85]">{t.about.values.subtitle}</p></div>
          <div className="mt-12 grid border-l border-t border-[#17213a]/12 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(([Icon, value]) => <article key={value.title} className="min-h-[220px] border-b border-r border-[#17213a]/12 p-7 transition-colors hover:bg-[#f4f7ff] sm:p-8"><Icon className="h-6 w-6 text-[#3156a6]" /><h3 className="mt-12 text-2xl font-extrabold tracking-[-.04em]">{value.title}</h3><p className="mt-4 text-[15px] leading-7 text-[#69758c]">{value.description}</p></article>)}
          </div>
        </section>

        <section className="border-t border-[#17213a]/10 bg-[#f7f9fd]">
          <div className="mx-auto max-w-[1440px] px-5 py-20 text-center sm:px-8 lg:px-12 xl:px-20"><h2 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">{t.about.cta.title}</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#5f6b85]">{t.about.cta.subtitle}</p><div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row"><Link href={`/${locale}/contact`} className="glass-primary">{t.about.cta.startLearning}</Link><Link href={`/${locale}/tutors`} className="glass-secondary">{t.about.cta.becomeTutor}</Link></div></div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
