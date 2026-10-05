"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PaperButton, PaperSheet } from "@/components/marketing/paper"
import { useLocale } from "@/lib/locale-context"

export default function TutorsRecruitPage() {
  const { locale } = useLocale()
  const loc = locale.startsWith("fr") ? "fr" : "en"
  const fr = loc === "fr"

  return (
    <div className="ps-site min-h-screen">
      <Header />
      <section className="ps-wrap py-16 lg:py-20">
        <h1 className="ps-h1 max-w-3xl">{fr ? "Enseigner avec PrepSkul." : "Teach with PrepSkul."}</h1>
        <p className="ps-lead mt-4 max-w-2xl">
          {fr
            ? "Rejoins une communauté de tuteurs qui aide les apprenants à avancer, en ligne ou près de chez eux. Les profils présentés ici évoluent au fil des candidatures et des besoins des familles."
            : "Join a tutor community helping learners make progress, online and nearby. Tutor profiles and availability grow as educators join and families tell us what they need."}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a href="mailto:info@prepskul.com">
            <PaperButton>{fr ? "Devenir tuteur" : "Become a tutor"}</PaperButton>
          </a>
          <Link
            href={`/${loc}/find`}
            className="inline-flex items-center justify-center rounded-2xl border-2 border-[#1B2C4F] bg-[#fffdf7] px-6 py-3.5 font-black text-[#1B2C4F] shadow-[0_5px_0_rgba(27,44,79,.18)]"
          >
            {fr ? "Trouver un tuteur" : "Find a tutor"}
          </Link>
        </div>
      </section>
      <section className="ps-wrap grid gap-5 pb-20 md:grid-cols-2">
        <PaperSheet className="p-6 sm:p-8" rotate={-1}>
          <h2 className="text-xl font-black uppercase">{fr ? "Ce que tu fais" : "What you do"}</h2>
          <p className="mt-3 text-sm leading-6 text-[#5C6B84]">
            {fr
              ? "Maths, langues, sciences, la classe où l’élève est. En ligne, ou tu vas chez lui."
              : "Maths, languages, sciences, the class the learner is in. Online, or you go to the table."}
          </p>
        </PaperSheet>
        <PaperSheet className="p-6 sm:p-8" tone="yellow" rotate={1}>
          <h2 className="text-xl font-black uppercase">{fr ? "Comment postuler" : "How to apply"}</h2>
          <p className="mt-3 text-sm leading-6 text-[#5C6B84]">
            {fr
              ? "Présente-nous tes matières, ton expérience et la façon dont tu souhaites accompagner les apprenants. Notre équipe te guidera pour la suite dans l’app."
              : "Tell us what you teach, your experience, and how you’d like to support learners. Our team will guide you through the next steps in the app."}
          </p>
          <a href="mailto:info@prepskul.com" className="mt-6 inline-block">
            <PaperButton>{fr ? "Écrire à PrepSkul" : "Email PrepSkul"}</PaperButton>
          </a>
        </PaperSheet>
      </section>
      <Footer />
    </div>
  )
}
