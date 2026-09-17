"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { getStartedUrl } from "@/lib/get-started-url"
import { PaperButton, PaperCutout, PaperSheet, Tape } from "@/components/marketing/paper"
import type { PublicTutor } from "@/lib/tutors/directory"

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
          <p className="mt-1 text-sm font-bold text-[#0EA5E9]">
            {tutor.city || "Cameroon"}
            {tutor.rating ? ` · ${tutor.rating.toFixed(1)}` : ""}
          </p>
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
  unavailable,
}: {
  locale: string
  tutors: PublicTutor[]
  unavailable: boolean
}) {
  const c = aliveCopy(locale)

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
        </div>

        {tutors.length > 0 ? (
          <div className="mt-12">
            <h2 className="ps-h2">{c.find.recommended}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} bookLabel={c.find.bookInApp} />
              ))}
            </div>
          </div>
        ) : (
          <PaperSheet className="relative mt-12 max-w-xl p-6 sm:p-7" tone="cream" rotate={-1}>
            <Tape className="-top-3 left-8" />
            <PaperCutout src="/onboard/art/mate-think.png" className="h-24 w-24 sm:h-28 sm:w-28" />
            <p className="mt-3 font-black uppercase text-[#1B2C4F]">{c.find.recommended}</p>
            <p className="mt-2 text-sm leading-6 text-[#5C6B84]">{unavailable || tutors.length === 0 ? c.find.empty : c.find.empty}</p>
            <a href={getStartedUrl()} className="mt-5 inline-block">
              <PaperButton>{c.find.openApp}</PaperButton>
            </a>
          </PaperSheet>
        )}

        <p className="mt-10 max-w-xl text-sm leading-6 text-[#5C6B84]">
          {locale.startsWith("fr")
            ? "Pas de formulaire ici. Une demande de tuteur s’écrit dans tutor_requests depuis l’app, avec un compte."
            : "No request form on this page. A tutor request is written to tutor_requests from the app, with an account."}
        </p>
      </main>
      <Footer />
    </div>
  )
}
