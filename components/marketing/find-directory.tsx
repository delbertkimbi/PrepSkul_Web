"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { getStartedUrl } from "@/lib/get-started-url"
import { PaperButton, PaperSheet } from "@/components/marketing/paper"
import { previewPublicTutors, type PublicTutor } from "@/lib/tutors/directory"

function TutorCard({ tutor, bookLabel }: { tutor: PublicTutor; bookLabel: string }) {
  const initial = tutor.name.trim().charAt(0).toUpperCase() || "P"
  const subjects = tutor.subjects.slice(0, 3).join(" · ")
  return (
    <PaperSheet className="flex h-full flex-col p-5">
      <div className="flex items-start gap-4">
        {tutor.photoUrl ? (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[#1B2C4F]/10 bg-[#fffdf7]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tutor.photoUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1B2C4F] text-lg font-black text-white">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black text-[#1B2C4F]">{tutor.name}</h2>
          <p className="mt-1 text-sm text-[#5C6B84]">{subjects || "PrepSkul tutor"}</p>
          {(tutor.city || tutor.rating) && (
            <p className="mt-1 text-sm font-bold text-[#0EA5E9]">
              {tutor.city || ""}
              {tutor.city && tutor.rating ? " · " : ""}
              {tutor.rating ? tutor.rating.toFixed(1) : ""}
            </p>
          )}
        </div>
      </div>
      <a href={getStartedUrl()} className="mt-5">
        <PaperButton className="w-full px-4 py-2.5 text-sm shadow-[0_5px_0_#0f1a2e]">{bookLabel}</PaperButton>
      </a>
    </PaperSheet>
  )
}

export function FindDirectory({
  locale,
  tutors,
  unavailable = false,
}: {
  locale: string
  tutors: PublicTutor[]
  unavailable?: boolean
}) {
  const c = aliveCopy(locale)
  const cards = tutors.length > 0 ? previewPublicTutors(tutors, 24) : []

  return (
    <div className="ps-site min-h-screen">
      <Header />
      <main className="ps-wrap py-12 lg:py-16">
        <h1 className="ps-h1 max-w-3xl">{c.find.title}</h1>
        <p className="ps-lead mt-4 max-w-2xl">{c.find.lead}</p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={getStartedUrl()} className="sm:w-auto">
            <PaperButton className="w-full sm:w-auto">{c.find.openApp}</PaperButton>
          </a>
          <a
            href={getStartedUrl()}
            className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-[#1B2C4F] bg-[#fffdf7] px-6 py-3.5 font-black text-[#1B2C4F] shadow-[0_5px_0_rgba(27,44,79,.18)] sm:w-auto"
          >
            {c.find.request}
          </a>
          <Link
            href={`/${locale.startsWith("fr") ? "fr" : "en"}/tutors`}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-[#1B2C4F]/20 bg-white px-6 py-3.5 font-black text-[#1B2C4F] transition hover:border-[#0EA5E9] hover:bg-[#E0F2FE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9] sm:w-auto"
          >
            {locale.startsWith("fr") ? "Devenir tuteur" : "Become a tutor"}
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="ps-h2">{c.find.recommended}</h2>
          {cards.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} bookLabel={c.find.bookInApp} />
              ))}
            </div>
          ) : (
            <PaperSheet className="mt-6 max-w-3xl p-6 sm:p-8">
              <h3 className="text-xl font-black text-[#1B2C4F]">
                {locale.startsWith("fr") ? "Tu cherches un tuteur ?" : "Looking for a tutor?"}
              </h3>
              <p className="mt-2 leading-7 text-[#5C6B84]">
                {unavailable
                  ? locale.startsWith("fr")
                    ? "Les profils ne se chargent pas pour le moment. Réessaie plus tard ou demande-nous de chercher un tuteur pour toi."
                    : "Tutor profiles aren’t loading right now. Try again later or ask us to find a tutor for you."
                  : c.find.empty}
              </p>
            </PaperSheet>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
