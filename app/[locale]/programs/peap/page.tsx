"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Globe2, Users } from "lucide-react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { useLocale } from "@/lib/locale-context"

const copy = {
  en: {
    back: "All programs",
    status: "2026 edition · Completed",
    label: "PrepSkul Exam Accelerator Program",
    title: "Turning exam pressure into guided preparation.",
    body: "PEAP was created for GCE candidates who needed more than another pile of notes. The two-week online intensive focused on difficult concepts, structured revision and the confidence to approach the exam with a clearer plan.",
    facts: ["GCE O-Level & A-Level", "Nationwide online access", "Two-week intensive", "2026 edition"],
    problem: {
      label: "Why PEAP existed",
      title: "The exam is shared. The learning gaps are personal.",
      body: "Candidates enter the same examination with different weak topics, different levels of confidence and different access to guidance. PEAP created a focused support window where learners could revisit difficult concepts and prepare with direction.",
      quote: "The goal was not to add more pressure. It was to make the next revision step clearer.",
    },
    experience: {
      label: "The guided experience",
      title: "A short program with a deliberate sequence.",
      steps: [
        { number: "01", title: "Orientation", body: "Set expectations, explain the program and help learners use the intensive well." },
        { number: "02", title: "Focused revision", body: "Return to difficult concepts with guided explanations instead of broad, unfocused coverage." },
        { number: "03", title: "Purposeful practice", body: "Use questions and active revision to turn explanations into exam readiness." },
        { number: "04", title: "A clearer plan", body: "Help each learner leave with more confidence about what to revise and how to continue." },
      ],
    },
    archive: {
      label: "Program archive",
      title: "Evidence from the 2026 edition.",
      body: "These artifacts document how the edition was communicated and how learners were introduced to the program. Verified results and participant stories will only be added with source records and consent.",
      poster: "The 2026 student-orientation announcement",
      session: "A live online student-orientation session",
    },
    next: {
      label: "Future editions",
      title: "PEAP 2026 is complete. The learning need is not.",
      body: "Parents, learners, schools and partners can register interest in a future edition or discuss an exam-support program adapted to their context.",
      primary: "Register PEAP interest",
      secondary: "Discuss a school program",
    },
  },
  fr: {
    back: "Tous les programmes",
    status: "Édition 2026 · Terminée",
    label: "Programme d’accélération aux examens PrepSkul",
    title: "Transformer la pression des examens en préparation guidée.",
    body: "PEAP a été créé pour les candidats au GCE qui avaient besoin de plus qu’une pile de notes. L’intensif en ligne de deux semaines ciblait les notions difficiles, la révision structurée et la confiance nécessaire pour aborder l’examen avec un plan plus clair.",
    facts: ["GCE O-Level et A-Level", "Accès national en ligne", "Deux semaines intensives", "Édition 2026"],
    problem: {
      label: "Pourquoi PEAP existait",
      title: "L’examen est commun. Les lacunes sont personnelles.",
      body: "Les candidats passent le même examen avec des sujets faibles, des niveaux de confiance et un accès à l’orientation différents. PEAP a créé une période ciblée pour revoir les notions difficiles et se préparer avec direction.",
      quote: "L’objectif n’était pas d’ajouter de la pression, mais de clarifier la prochaine étape de révision.",
    },
    experience: {
      label: "L’expérience guidée",
      title: "Un programme court avec une séquence intentionnelle.",
      steps: [
        { number: "01", title: "Orientation", body: "Présenter les attentes, le programme et la meilleure façon d’utiliser l’intensif." },
        { number: "02", title: "Révision ciblée", body: "Revenir aux notions difficiles avec des explications guidées et concentrées." },
        { number: "03", title: "Pratique utile", body: "Transformer les explications en préparation grâce aux questions et à la révision active." },
        { number: "04", title: "Un plan plus clair", body: "Aider chaque apprenant à savoir quoi réviser et comment continuer." },
      ],
    },
    archive: {
      label: "Archive du programme",
      title: "Des preuves de l’édition 2026.",
      body: "Ces éléments montrent comment l’édition a été communiquée et comment les apprenants ont été accueillis. Les résultats et témoignages ne seront ajoutés qu’avec sources et consentement.",
      poster: "L’annonce d’orientation des apprenants 2026",
      session: "Une session d’orientation en ligne",
    },
    next: {
      label: "Prochaines éditions",
      title: "PEAP 2026 est terminé. Le besoin d’apprendre demeure.",
      body: "Parents, apprenants, écoles et partenaires peuvent manifester leur intérêt pour une prochaine édition ou discuter d’un programme adapté à leur contexte.",
      primary: "Manifester mon intérêt",
      secondary: "Discuter d’un programme scolaire",
    },
  },
} as const

export default function PeapPage() {
  const { locale } = useLocale()
  const t = copy[locale]
  const factIcons = [Users, Globe2, Clock3, CalendarDays]

  return (
    <div className="min-h-screen bg-white text-[#17213a]">
      <Header />
      <main>
        <section className="overflow-hidden border-b border-[#17213a]/10 bg-white">
          <div className="mx-auto grid min-h-[680px] max-w-[1440px] lg:grid-cols-[1.04fr_0.96fr]">
            <div className="relative z-10 flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-12 xl:px-20">
              <Link href={`/${locale}/programs`} className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#3156a6]"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
              <h1 className="font-editorial mt-10 max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.05em] sm:text-6xl lg:text-[4.7rem]">{t.title}</h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-[#596176]">{t.body}</p>
              <span className="mt-8 w-fit border border-[#3156a6]/25 bg-[#f8fafc] px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#3156a6]">{t.status}</span>
            </div>
            <div className="relative min-h-[560px] overflow-hidden border-t border-[#17213a]/10 bg-[#f8fafc] lg:min-h-full lg:border-l lg:border-t-0">
              <div className="absolute inset-8 border border-[#17213a]/10" />
              <div className="absolute inset-x-[16%] bottom-0 top-[7%] overflow-hidden border border-[#17213a]/10 bg-white">
                <Image src="/program1.jpg" alt="PrepSkul PEAP 2026 student orientation poster" fill priority sizes="(max-width: 1024px) 70vw, 38vw" className="object-cover object-top" />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#17213a]/15 bg-[#f8fafc]">
          <div className="mx-auto grid max-w-[1440px] border-l border-[#17213a]/15 sm:grid-cols-2 lg:grid-cols-4">
            {t.facts.map((fact, index) => {
              const Icon = factIcons[index]
              return <div key={fact} className="flex min-h-[120px] items-center gap-4 border-b border-r border-[#17213a]/15 px-5 py-6 sm:px-8 lg:border-b-0"><Icon className="h-5 w-5 text-[#3156a6]" /><span className="text-sm font-extrabold">{fact}</span></div>
            })}
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-12 xl:px-20">
            <div>
              <h2 className="font-editorial text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">{t.problem.title}</h2>
            </div>
            <div className="self-end">
              <p className="text-base leading-8 text-[#596176] sm:text-lg">{t.problem.body}</p>
              <blockquote className="font-editorial mt-8 border-l-2 border-[#3156a6] pl-6 text-2xl font-semibold leading-snug text-[#17213a]">{t.problem.quote}</blockquote>
            </div>
          </div>
        </section>

        <section className="bg-[#f8fafc] py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-20">
            <h2 className="font-editorial max-w-4xl text-5xl font-semibold tracking-[-0.045em] sm:text-6xl">{t.experience.title}</h2>
            <ol className="mt-12 grid border-l border-t border-[#17213a]/20 md:grid-cols-2 lg:grid-cols-4">
              {t.experience.steps.map((step) => (
                <li key={step.number} className="min-h-[285px] border-b border-r border-[#17213a]/20 p-6 sm:p-8">
                  <span className="text-xs font-extrabold text-[#3156a6]">{step.number}</span>
                  <h3 className="mt-12 text-2xl font-extrabold tracking-[-0.03em]">{step.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#596176]">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="overflow-hidden bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-20">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <h2 className="font-editorial text-5xl font-semibold leading-[0.96] tracking-[-0.045em] sm:text-6xl">{t.archive.title}</h2>
              </div>
              <p className="max-w-2xl self-end text-base leading-8 text-[#596176]">{t.archive.body}</p>
            </div>
            <div className="mt-14 grid border border-[#17213a]/15 lg:grid-cols-[0.72fr_1.28fr]">
              <figure className="border-b border-[#17213a]/15 lg:border-b-0 lg:border-r">
                <div className="relative min-h-[620px] bg-[#f8fafc]"><Image src="/program1.jpg" alt={t.archive.poster} fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-contain" /></div>
                <figcaption className="border-t border-[#17213a]/15 px-5 py-4 text-xs font-bold text-[#596176]">{t.archive.poster}</figcaption>
              </figure>
              <figure>
                <div className="relative min-h-[420px] bg-[#f8fafc] lg:min-h-[620px]"><Image src="/program2.jpg" alt={t.archive.session} fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-contain" /></div>
                <figcaption className="border-t border-[#17213a]/15 px-5 py-4 text-xs font-bold text-[#596176]">{t.archive.session}</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="border-t border-[#17213a]/10 bg-[#f8fafc] py-20 sm:py-24">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12 xl:px-20">
            <div>
              <h2 className="font-editorial max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.045em] sm:text-6xl">{t.next.title}</h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#596176]">{t.next.body}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/contact?interest=peap`} className="inline-flex h-14 items-center justify-center gap-3 rounded-md bg-[#3156a6] px-7 text-sm font-extrabold text-white hover:bg-[#17213a]">{t.next.primary}<ArrowRight className="h-4 w-4" /></Link>
              <Link href={`/${locale}/contact?interest=school-program`} className="inline-flex h-14 items-center justify-center border border-[#17213a]/25 px-7 text-sm font-extrabold text-[#17213a] hover:border-[#3156a6] hover:text-[#3156a6]">{t.next.secondary}</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
