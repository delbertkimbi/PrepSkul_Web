"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PaperButton } from "@/components/marketing/paper"
import { PrepMate } from "@/components/onboard/prep-mate"
import { LocaleProvider } from "@/lib/locale-context"
import { type Locale } from "@/lib/i18n"

export function PaperNotFound({ locale = "en" }: { locale?: string }) {
  const loc = (locale.startsWith("fr") ? "fr" : "en") as Locale
  const fr = loc === "fr"

  return (
    <LocaleProvider locale={loc}>
      <div className="ps-site min-h-screen">
        <Header />
        <main className="ps-wrap flex flex-col items-center py-16 text-center lg:py-24">
          <div className="ps-mate-well">
            <PrepMate mood="think" size={176} />
          </div>
          <p className="mt-10 text-sm font-black uppercase tracking-[0.18em] text-[#0EA5E9]">404</p>
          <h1 className="ps-h1 mt-3 max-w-xl">{fr ? "Cette page n’est pas là." : "This page is not here."}</h1>
          <p className="ps-lead mt-4 max-w-lg">
            {fr
              ? "Mate a cherché. La leçon est ailleurs. Reprends depuis l’accueil, ou assieds-toi avec un tuteur."
              : "Mate looked. The lesson is somewhere else. Start from home, or sit with a tutor."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${loc}`}>
              <PaperButton>{fr ? "Accueil" : "Go home"}</PaperButton>
            </Link>
            <Link
              href={`/${loc}/find`}
              className="inline-flex items-center justify-center rounded-2xl border-2 border-[#1B2C4F] bg-[#fffdf7] px-6 py-3.5 font-black text-[#1B2C4F] shadow-[0_5px_0_rgba(27,44,79,.18)]"
            >
              {fr ? "Voir les tuteurs" : "Browse tutors"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </LocaleProvider>
  )
}
