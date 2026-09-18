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
            ? "Des tuteurs approuvés. Un cours en direct, ou à table. Mate tient la semaine. Toi, tu t’assois quand une personne est ce qu’il faut."
            : "Approved tutors. A live class, or at the table. Mate holds the week. You sit with a learner when a person is what the hour needs."}
        </p>
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
              ? "Écris-nous. Pas un formulaire sur ce site. On te répond, et l’inscription se fait dans l’app."
              : "Write to us. There is no form on this site. We reply, and the rest happens in the app."}
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
