"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FAQSection } from "@/components/faq-section"
import { PEAPShowcase } from "@/components/peap-showcase"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { getStartedUrl } from "@/lib/get-started-url"
import { PaperButton, PaperCutout, PaperPhoto, PaperSheet, Tape, TornDivider } from "@/components/marketing/paper"
import { ScrollFill } from "@/components/marketing/scroll-fill"
import { ScrollReveal } from "@/components/sbc/scroll-reveal"
import { LiveTicker } from "@/components/marketing/live-ticker"
import { Laurel, MatePoint } from "@/components/marketing/mate-point"
import { PrepMate } from "@/components/onboard/prep-mate"
import type { PublicTutor } from "@/lib/tutors/directory"
import { type Locale } from "@/lib/i18n"
import { ArrowRight } from "lucide-react"

const MODES = [
  {
    tile: "/onboard/art/tile-laptop.png",
    titleEn: "Online, live",
    titleFr: "En ligne, en direct",
    bodyEn: "A live class. SkulMate, or a PrepSkul tutor.",
    bodyFr: "Une classe en direct. SkulMate, ou un tuteur PrepSkul.",
    tone: "sky" as const,
  },
  {
    tile: "/onboard/art/tile-book.png",
    titleEn: "At the table",
    titleFr: "Sur place",
    bodyEn: "A tutor comes to the home or the school.",
    bodyFr: "Un tuteur vient à la maison ou à l’école.",
    tone: "yellow" as const,
  },
  {
    tile: "/onboard/art/tile-heart.png",
    titleEn: "In a small group",
    titleFr: "En petit groupe",
    bodyEn: "The same subject, more than one learner.",
    bodyFr: "La même matière, plusieurs têtes.",
    tone: "mint" as const,
  },
]

function TutorMiniCard({ tutor, locale }: { tutor: PublicTutor; locale: string }) {
  const initial = tutor.name.trim().charAt(0).toUpperCase() || "P"
  return (
    <PaperSheet className="flex items-center gap-3 p-3" rotate={-0.5}>
      {tutor.photoUrl ? (
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-[#1B2C4F]/10 bg-[#fffdf7]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tutor.photoUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1B2C4F] text-sm font-black text-white">
          {initial}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-black text-[#1B2C4F]">{tutor.name}</p>
        <p className="truncate text-xs font-bold text-[#5C6B84]">
          {tutor.subjects.slice(0, 2).join(" · ") || (locale.startsWith("fr") ? "Tuteur PrepSkul" : "PrepSkul tutor")}
        </p>
      </div>
    </PaperSheet>
  )
}

export function AliveHome({
  locale,
  tutors = [],
}: {
  locale: string
  tutors?: PublicTutor[]
}) {
  const c = aliveCopy(locale)
  const loc = (locale.startsWith("fr") ? "fr" : "en") as Locale
  const fr = loc === "fr"
  const preview = tutors.slice(0, 4)

  return (
    <div className="ps-site min-h-screen">
      <ScrollFill />
      <Header />

      <section className="relative px-4 pb-4 pt-10 sm:px-6 lg:pb-4 lg:pt-24 xl:pt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative z-10 text-center lg:text-left">
            <h1 className="ps-h1 text-[#1B2C4F]">
              <span className="text-[#0EA5E9]">{fr ? "Apprends" : "Learn"}</span>{" "}
              {fr ? "avec un tuteur qui enseigne vraiment." : "with a tutor who actually teaches."}
            </h1>
            <p className="ps-lead mx-auto mt-5 max-w-xl lg:mx-0">{c.hero.subtitle}</p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href={`/${locale}/onboard`}>
                <PaperButton className="w-full sm:w-auto">
                  {c.hero.primary} <ArrowRight className="ml-2 h-5 w-5" />
                </PaperButton>
              </Link>
              <Link
                href={`/${locale}/find`}
                className="inline-flex items-center justify-center rounded-2xl border-2 border-[#1B2C4F] bg-[#fffdf7] px-6 py-3.5 font-black text-[#1B2C4F] shadow-[0_5px_0_rgba(27,44,79,.18)] transition hover:-translate-y-1"
              >
                {c.hero.secondary}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <PaperSheet className="overflow-hidden p-3 sm:p-3.5" rotate={1.5} tone="cream">
              <Tape color="yellow" className="-top-4 left-1/2 -translate-x-1/2" />
              <div className="relative min-h-[240px] overflow-hidden rounded-[18px] bg-[#fffdf7] sm:min-h-[300px] lg:min-h-[340px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/african-tutor-teaching-student-at-home-with-books-.jpg"
                  alt={fr ? "Un tuteur PrepSkul avec un élève à la maison" : "A PrepSkul tutor teaching a student at home"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </PaperSheet>
          </div>
        </div>
      </section>

      <section className="ps-live-stats px-4 pb-4 pt-4 sm:px-6 lg:pb-5 lg:pt-5" aria-label={c.hero.statLine}>
        <div className="ps-live-stats-row">
          <MatePoint />
          <div className="ps-live-stats-grid">
            {c.hero.stats.map((stat, index) => {
              const rating = stat.decimals > 0
              return (
                <div key={stat.label} className="ps-live-stat">
                  <p className="ps-live-value">
                    {rating ? <Laurel /> : null}
                    <LiveTicker
                      start={stat.start}
                      intervalMs={stat.liveMs}
                      minMs={stat.liveMin}
                      maxMs={stat.liveMax}
                      staggerMs={rating ? 0 : index === 0 ? 17000 : 0}
                      suffix={rating ? "" : stat.suffix}
                      decimals={stat.decimals}
                      locale={loc}
                    />
                    {rating ? <span className="ps-live-over">/5</span> : null}
                    {rating ? <Laurel flip /> : null}
                  </p>
                  {rating ? (
                    <p className="ps-live-stars" aria-hidden>
                      ★★★★★
                    </p>
                  ) : null}
                  <p className="ps-live-label">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <TornDivider />

      <section className="bg-[#fffdf7] px-4 pb-20 pt-10 sm:px-6 lg:pb-28 lg:pt-12">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <h2 className="ps-h2 text-[#1B2C4F]">{c.toolsTitle}</h2>
            <p className="ps-lead mx-auto mt-4 max-w-2xl">{c.toolsLead}</p>
          </ScrollReveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {c.tools.slice(0, 2).map((tool, i) => (
              <ScrollReveal key={tool.id} delay={i * 0.05}>
                <PaperSheet tone={tool.tone} className="ps-fill-well h-full p-6 sm:p-8" rotate={i ? 1 : -1}>
                  <PaperCutout src={tool.tile} className="h-20 w-20 sm:h-24 sm:w-24" />
                  <h3 className="mt-5 text-2xl font-black uppercase leading-tight text-[#1B2C4F]">{tool.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#5C6B84]">{tool.body}</p>
                </PaperSheet>
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.tools.slice(2).map((tool, i) => (
              <ScrollReveal key={tool.id} delay={i * 0.04}>
                <PaperSheet tone={tool.tone} className="ps-fill-well h-full p-5 sm:p-6" rotate={i % 2 ? 1 : -1}>
                  <PaperCutout src={tool.tile} className="h-14 w-14 sm:h-16 sm:w-16" />
                  <h3 className="mt-4 text-lg font-black uppercase leading-tight text-[#1B2C4F]">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5C6B84]">{tool.body}</p>
                </PaperSheet>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <TornDivider flip />

      <section className="ps-navy overflow-visible px-4 pb-24 pt-10 text-white sm:px-6 lg:pb-28">
        <div className="h-16 sm:h-20" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="mx-auto flex w-full max-w-[20rem] justify-center overflow-visible sm:max-w-[22rem]">
            <div className="ps-cutout-navy ps-mate-well">
              <PrepMate mood="idle" size={280} />
            </div>
          </div>
          <div>
            <h2 className="ps-h2 text-white">{c.science.title}</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75">{c.science.body}</p>
            <Link href={`/${locale}/onboard`} className="mt-8 inline-block">
              <PaperButton className="bg-white text-[#1B2C4F] shadow-[0_7px_0_#d7d2c6]">{c.science.cta}</PaperButton>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="ps-h2 max-w-2xl">{fr ? "En ligne, à la maison, ou en groupe." : "Online, at home, or in a group."}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {MODES.map((mode, i) => (
              <PaperSheet key={mode.titleEn} tone={mode.tone} className="ps-fill-well p-5 sm:p-6" rotate={i === 1 ? 1.5 : -1}>
                <PaperCutout src={mode.tile} className="h-16 w-16 sm:h-20 sm:w-20" />
                <h3 className="mt-5 text-xl font-black uppercase leading-tight">{fr ? mode.titleFr : mode.titleEn}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5C6B84]">{fr ? mode.bodyFr : mode.bodyEn}</p>
              </PaperSheet>
            ))}
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <PaperPhoto src="/young-african-girl-online-learning-session.jpg" alt="" className="min-h-0" rotate={-1.5} imgClassName="aspect-[4/3] h-auto max-h-56" />
            <PaperPhoto src="/african-tutor-teaching-student-at-home-with-books-.jpg" alt="" className="min-h-0 md:-translate-y-3" rotate={2} imgClassName="aspect-[4/3] h-auto max-h-56" />
            <PaperPhoto src="/group-class-prepskul.png" alt="" className="min-h-0" rotate={-1} imgClassName="aspect-[4/3] h-auto max-h-56" />
          </div>
        </div>
      </section>

      <section className="bg-[#dfeeff] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <h2 className="ps-h2 max-w-3xl">{c.split.title}</h2>
            <p className="ps-lead mt-4 max-w-2xl">{c.split.body}</p>
          </ScrollReveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <PaperSheet className="p-6" tone="cream" rotate={-1}>
              <h3 className="text-lg font-black uppercase">{c.split.siteTitle}</h3>
              <ul className="mt-4 space-y-3">
                {c.split.siteItems.map((item) => (
                  <li key={item.title}>
                    <p className="text-sm font-black">{item.title}</p>
                    <p className="text-sm leading-6 text-[#5C6B84]">{item.body}</p>
                  </li>
                ))}
              </ul>
            </PaperSheet>
            <PaperSheet className="p-6" tone="yellow" rotate={1}>
              <h3 className="text-lg font-black uppercase">{c.split.appTitle}</h3>
              <ul className="mt-4 space-y-3">
                {c.split.appItems.map((item) => (
                  <li key={item.title}>
                    <p className="text-sm font-black">{item.title}</p>
                    <p className="text-sm leading-6 text-[#5C6B84]">{item.body}</p>
                  </li>
                ))}
              </ul>
              <a href={getStartedUrl()} className="mt-6 inline-block">
                <PaperButton>{c.hybrid.request}</PaperButton>
              </a>
            </PaperSheet>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="ps-h2 max-w-xl">{c.hybrid.title}</h2>
              <p className="ps-lead mt-3 max-w-xl">{c.hybrid.body}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/find`}>
                <PaperButton>{c.hybrid.browse}</PaperButton>
              </Link>
              <a
                href={getStartedUrl()}
                className="inline-flex items-center justify-center rounded-2xl border-2 border-[#1B2C4F] bg-[#fffdf7] px-6 py-3.5 font-black text-[#1B2C4F] shadow-[0_5px_0_rgba(27,44,79,.18)]"
              >
                {c.hybrid.request}
              </a>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {preview.length > 0 ? (
              preview.map((tutor) => <TutorMiniCard key={tutor.id} tutor={tutor} locale={locale} />)
            ) : (
              <PaperSheet className="p-6 sm:col-span-2" tone="blue">
                <p className="font-black uppercase">{c.find.recommended}</p>
                <p className="mt-2 text-sm leading-6 text-[#5C6B84]">{c.find.empty}</p>
              </PaperSheet>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#fffdf7] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="ps-h2 text-center">{c.audienceKicker}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {c.audiences.map((aud, i) => (
              <PaperSheet key={aud.id} tone={aud.tone} className="ps-fill-well overflow-hidden p-4 sm:p-5" rotate={i === 1 ? 1.2 : -1}>
                <div className="overflow-hidden rounded-[18px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={aud.image} alt="" className="h-48 w-full object-cover" />
                </div>
                <h3 className="ps-display mt-5 text-2xl font-black uppercase text-[#1B2C4F]">{aud.title}</h3>
                <ul className="mt-3 space-y-3">
                  {aud.items.map((item) => (
                    <li key={item.title}>
                      <p className="text-sm font-black">{item.title}</p>
                      <p className="text-sm leading-relaxed text-[#5C6B84]">{item.body}</p>
                    </li>
                  ))}
                </ul>
                <Link href={`/${locale}/${aud.href}`} className="mt-5 inline-flex text-sm font-black text-[#0EA5E9] underline decoration-[#EAB308] decoration-4 underline-offset-4">
                  {aud.cta}
                </Link>
              </PaperSheet>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          <Link href={`/${locale}/programs`}>
            <PaperSheet className="h-full p-5 sm:p-6" tone="blue" rotate={-1}>
              <PaperCutout src="/onboard/art/tile-flask.png" className="h-16 w-16 sm:h-20 sm:w-20" />
              <h3 className="ps-h2 mt-4">{fr ? "École et examens" : "School and exams"}</h3>
              <p className="mt-2 text-sm text-[#5C6B84]">Maths · Sciences · Français · English</p>
            </PaperSheet>
          </Link>
          <Link href={`/${locale}/programs`}>
            <PaperSheet className="h-full p-5 sm:p-6" tone="yellow" rotate={1}>
              <PaperCutout src="/onboard/art/tile-laptop.png" className="h-16 w-16 sm:h-20 sm:w-20" />
              <h3 className="ps-h2 mt-4">{fr ? "Au-delà du programme" : "Beyond the syllabus"}</h3>
              <p className="mt-2 text-sm text-[#5C6B84]">{fr ? "Code, design, prise de parole." : "Code, design, public speaking."}</p>
            </PaperSheet>
          </Link>
        </div>
      </section>

      <PEAPShowcase locale={loc} />

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="ps-h2 max-w-2xl">
            {c.quotesTitle} <span className="text-[#0EA5E9]">{c.quotesTitleAccent}</span>
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {c.quotes.map((q, i) => (
              <PaperSheet key={q.name} className="ps-fill-well p-7" tone={i === 0 ? "navy" : i === 1 ? "blue" : "peach"} rotate={i === 1 ? 1 : -1}>
                <p className={`text-lg font-black leading-snug ${i === 0 ? "text-white" : "text-[#1B2C4F]"}`}>{q.body}</p>
                <footer className={`mt-6 text-sm font-bold ${i === 0 ? "text-white/70" : "text-[#5C6B84]"}`}>
                  {q.name}
                  <span className="mt-1 block font-medium">
                    {q.role} · {q.place}
                  </span>
                </footer>
              </PaperSheet>
            ))}
          </div>
        </div>
      </section>


      <div id="faq">
        <FAQSection />
      </div>

      <TornDivider flip />
      <section className="ps-navy overflow-visible px-4 pb-24 pt-10 sm:px-6 lg:pb-28">
        <div className="h-16 sm:h-20" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="ps-h2 text-white">{c.cta.title}</h2>
            <p className="mt-4 max-w-xl leading-7 text-white/75">{c.cta.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/onboard`}>
                <PaperButton className="bg-white text-[#1B2C4F] shadow-[0_7px_0_#d7d2c6]">{c.cta.button}</PaperButton>
              </Link>
              <Link
                href={`/${locale}/find`}
                className="inline-flex items-center justify-center rounded-2xl border-2 border-white/40 bg-transparent px-6 py-3.5 font-black text-white"
              >
                {c.hero.secondary}
              </Link>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-[16rem] justify-center overflow-visible">
            <div className="ps-cutout-navy ps-mate-well">
              <PrepMate mood="cheer" size={256} />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
