"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { getStartedUrl } from "@/lib/get-started-url"
import { PaperButton, PaperCutout, PaperSheet } from "@/components/marketing/paper"
import { PrepMate } from "@/components/onboard/prep-mate"
import { useLocale } from "@/lib/locale-context"

export default function MatePage() {
  const { locale } = useLocale()
  const c = aliveCopy(locale)
  const fr = locale.startsWith("fr")

  return (
    <div className="ps-site min-h-screen">
      <Header />
      <main className="ps-wrap grid items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <div className="ps-mate-well mx-auto">
          <PrepMate mood="idle" size={224} />
        </div>
        <div>
          <h1 className="ps-h1 max-w-xl text-[#1B2C4F]">
            <span className="text-[#0EA5E9]">{fr ? "Ton SkulMate." : "Your SkulMate."}</span>{" "}
            {fr ? "Il reste jusqu’à ce que ce soit à toi." : "He stays until it is yours."}
          </h1>
          <p className="ps-lead mt-5 max-w-xl">
            {fr
              ? "Dis-le à voix haute. Il dessine l’idée, reste sur le point qui bloque, et se souvient comment tu aimes les explications. Une personne? Il la fait venir."
              : "Say it out loud. He draws the idea, stays on the stuck point, and remembers how you like it explained. Need a person? He brings one in."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={getStartedUrl()}>
              <PaperButton>{fr ? "Commencer" : "Get started"}</PaperButton>
            </a>
            <Link
              href={`/${locale}/find`}
              className="inline-flex items-center justify-center rounded-2xl border-2 border-[#1B2C4F] bg-[#fffdf7] px-6 py-3.5 font-black text-[#1B2C4F] shadow-[0_5px_0_rgba(27,44,79,.18)]"
            >
              {fr ? "Voir les tuteurs" : "Browse tutors"}
            </Link>
          </div>
        </div>
      </main>

      <section className="bg-[#fffdf7] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="ps-h2 max-w-2xl">{c.toolsTitle}</h2>
          <p className="ps-lead mt-4 max-w-2xl">{c.toolsLead}</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.tools.map((tool, i) => (
              <PaperSheet key={tool.id} tone={tool.tone} className="ps-fill-well h-full p-5 sm:p-6" rotate={i % 2 ? 1 : -1}>
                <PaperCutout src={tool.tile} className="h-14 w-14 sm:h-16 sm:w-16" />
                <h3 className="mt-4 text-lg font-black uppercase leading-tight text-[#1B2C4F]">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5C6B84]">{tool.body}</p>
              </PaperSheet>
            ))}
          </div>
        </div>
      </section>

      <section className="ps-wrap grid gap-5 py-16 md:grid-cols-2">
        <PaperSheet className="p-6 sm:p-8" tone="cream" rotate={-1}>
          <h2 className="text-lg font-black uppercase">{c.split.siteTitle}</h2>
          <ul className="mt-4 space-y-3">
            {c.split.siteItems.map((item) => (
              <li key={item.title}>
                <p className="text-sm font-black">{item.title}</p>
                <p className="text-sm leading-6 text-[#5C6B84]">{item.body}</p>
              </li>
            ))}
          </ul>
        </PaperSheet>
        <PaperSheet className="p-6 sm:p-8" tone="yellow" rotate={1}>
          <h2 className="text-lg font-black uppercase">{c.split.appTitle}</h2>
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
      </section>
      <Footer />
    </div>
  )
}
