"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PaperButton, PaperSheet, Tape } from "@/components/marketing/paper"
import { PrepMate } from "@/components/onboard/prep-mate"
import { getStartedUrl } from "@/lib/get-started-url"
import { useLocale } from "@/lib/locale-context"

export default function MatePage() {
  const { locale } = useLocale()
  const fr = locale.startsWith("fr")

  return (
    <div className="ps-site min-h-screen">
      <Header />
      <main className="ps-wrap grid items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <PaperSheet className="relative mx-auto max-w-sm p-8" tone="cream" rotate={-1.5}>
          <Tape className="-top-3 left-1/2 -translate-x-1/2" />
          <div className="mx-auto flex h-56 w-56 items-center justify-center">
            <PrepMate mood="cheer" size={224} />
          </div>
        </PaperSheet>
        <div>
          <h1 className="ps-h1 max-w-xl text-[#1B2C4F]">
            {fr ? "SkulMate enseigne dans l’app PrepSkul." : "SkulMate teaches in the PrepSkul app."}
          </h1>
          <p className="ps-lead mt-5 max-w-xl">
            {fr
              ? "Mate est le tuteur dans PrepSkul: voix ouverte, tableau, et une leçon qui se souvient de toi. Réserve un tuteur humain, ou fais une demande, dans la même app."
              : "Mate is the tutor inside PrepSkul: always-on voice, a live board, and a lesson that remembers you. Book a human tutor, or request a match, in the same app."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={getStartedUrl()}>
              <PaperButton>{fr ? "Ouvrir l’app" : "Open the app"}</PaperButton>
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
      <Footer />
    </div>
  )
}
