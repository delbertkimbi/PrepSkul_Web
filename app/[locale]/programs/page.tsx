"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { useLocale } from "@/lib/locale-context"

const copy = {
  en: {
    hero: {
      label: "PrepSkul guided programs",
      title: "Learning that takes learners somewhere.",
      body: "PrepSkul programs guide learners through a defined challenge—an exam, a new skill, a product idea or a shared school need—and towards something they can understand, build or confidently do next.",
      note: "A specific learner · A defined challenge · A visible outcome",
    },
    featured: {
      label: "Flagship programs",
      title: "Real work. Real learning. A visible next step.",
      body: "Every edition should remain useful: families can understand the experience, schools can evaluate the model, and future learners can see what participation actually involves.",
    },
    sbc: {
      index: "01",
      status: "2026 cohort · Registration closed",
      title: "Summer Build Camp",
      body: "A six-week guided journey through AI, entrepreneurship, brand building and product creation for young innovators aged 10–17.",
      meta: ["Ages 10–17", "Buea + online", "19 July–30 August 2026"],
      cta: "Explore the full program",
      alt: "Summer Build Camp program showing AI and entrepreneurship for young innovators",
    },
    peap: {
      index: "02",
      status: "2026 edition · Completed",
      title: "Exam Accelerator Program",
      body: "A focused revision initiative for GCE candidates, created to turn difficult concepts and exam pressure into structured guidance, practice and confidence.",
      meta: ["GCE candidates", "Nationwide online access", "Two-week intensive"],
      cta: "Open the PEAP archive",
      alt: "PrepSkul Exam Accelerator student orientation session",
    },
    model: {
      label: "The program model",
      title: "Start with the learner, then build the experience.",
      body: "We do not begin with a workshop format and search for participants. We begin with the learner’s gap, then design the people, structure and experience around it.",
      steps: [
        { number: "01", title: "Name the gap", body: "Define who needs support, what is difficult and what a useful outcome looks like." },
        { number: "02", title: "Build the guidance", body: "Bring together the right facilitators, learning sequence, tools and safeguarding." },
        { number: "03", title: "Make learners do", body: "Use revision, discussion, practice, building and feedback—not passive attendance." },
        { number: "04", title: "Keep the evidence", body: "Document the status, experience and approved outcomes so the work remains credible." },
      ],
    },
    lines: {
      label: "What we can build next",
      title: "Bring us a learner need worth building around.",
      items: [
        { title: "School learning programs", body: "Revision, skills and learner-support initiatives designed with school leaders and teachers." },
        { title: "Community workshops", body: "Focused learning experiences delivered with NGOs, communities, churches and sponsors." },
        { title: "Skills bootcamps", body: "Practical pathways in technology, creative work, communication and entrepreneurship." },
      ],
    },
    final: { title: "Have a learner challenge worth designing around?", body: "Tell us the audience, the gap and the outcome you want to create. We’ll explore the right program model with you.", primary: "Build a program with us", secondary: "Looking for individual guidance?" },
  },
  fr: {
    hero: {
      label: "Programmes guidés PrepSkul",
      title: "Un apprentissage qui emmène les apprenants quelque part.",
      body: "Les programmes PrepSkul guident les apprenants face à un défi précis—examen, compétence, idée de produit ou besoin scolaire—vers quelque chose qu’ils peuvent comprendre, construire ou accomplir.",
      note: "Un apprenant précis · Un défi défini · Un résultat visible",
    },
    featured: {
      label: "Programmes phares",
      title: "Du travail réel. Un apprentissage réel. Une prochaine étape visible.",
      body: "Chaque édition reste utile : les familles comprennent l’expérience, les écoles évaluent le modèle et les futurs apprenants voient ce que la participation implique réellement.",
    },
    sbc: {
      index: "01",
      status: "Cohorte 2026 · Inscriptions closes",
      title: "Summer Build Camp",
      body: "Six semaines guidées autour de l’IA, l’entrepreneuriat, la marque et la création de produits pour les jeunes de 10 à 17 ans.",
      meta: ["10–17 ans", "Buea + en ligne", "19 juillet–30 août 2026"],
      cta: "Explorer le programme complet",
      alt: "Programme Summer Build Camp sur l’IA et l’entrepreneuriat",
    },
    peap: {
      index: "02",
      status: "Édition 2026 · Terminée",
      title: "Programme d’accélération aux examens",
      body: "Une initiative de révision pour les candidats au GCE qui transforme notions difficiles et pression en orientation structurée, pratique et confiance.",
      meta: ["Candidats GCE", "Accès national en ligne", "Deux semaines intensives"],
      cta: "Ouvrir l’archive PEAP",
      alt: "Session d’orientation du programme d’accélération aux examens PrepSkul",
    },
    model: {
      label: "Le modèle de programme",
      title: "Partir de l’apprenant, puis construire l’expérience.",
      body: "Nous ne choisissons pas d’abord un format puis cherchons des participants. Nous partons du besoin de l’apprenant et construisons les personnes, la structure et l’expérience autour de lui.",
      steps: [
        { number: "01", title: "Nommer l’écart", body: "Définir le public, la difficulté et ce qu’un résultat utile doit produire." },
        { number: "02", title: "Construire l’orientation", body: "Réunir les bons facilitateurs, la séquence, les outils et la protection." },
        { number: "03", title: "Faire agir", body: "Réviser, discuter, pratiquer, construire et recevoir du retour—pas seulement assister." },
        { number: "04", title: "Garder les preuves", body: "Documenter le statut, l’expérience et les résultats approuvés pour rester crédible." },
      ],
    },
    lines: {
      label: "Ce que nous pouvons construire ensuite",
      title: "Présentez-nous un besoin apprenant qui mérite d’être construit.",
      items: [
        { title: "Programmes scolaires", body: "Révisions, compétences et soutien conçus avec les directions et les enseignants." },
        { title: "Ateliers communautaires", body: "Expériences ciblées avec les ONG, communautés, églises et sponsors." },
        { title: "Bootcamps pratiques", body: "Parcours en technologie, créativité, communication et entrepreneuriat." },
      ],
    },
    final: { title: "Un défi apprenant mérite-t-il un programme ?", body: "Présentez-nous le public, l’écart et le résultat souhaité. Nous explorerons avec vous le bon modèle.", primary: "Construire un programme", secondary: "Besoin d’un accompagnement individuel ?" },
  },
} as const

export default function ProgramsPage() {
  const { locale } = useLocale()
  const t = copy[locale]
  const programs = [
    { ...t.sbc, href: "/sbc", image: "/sbc-og.png", icons: [Users, MapPin, CalendarDays] },
    { ...t.peap, href: `/${locale}/programs/peap`, image: "/program2.jpg", icons: [Users, MapPin, CalendarDays] },
  ]

  return (
    <div className="min-h-screen bg-[#fbfcff] text-[#14213d]">
      <Header />
      <main>
        <section className="glass-page-section overflow-hidden">
          <div className="mx-auto grid min-h-[600px] max-w-[1340px] overflow-hidden rounded-[32px] border border-white/75 bg-white/35 shadow-[0_18px_48px_rgba(42,66,110,.1)] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-12 xl:px-20">
              <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.96] tracking-[-0.06em] sm:text-6xl lg:text-[4.5rem]">{t.hero.title}</h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-[#596176] sm:text-lg">{t.hero.body}</p>
              <p className="mt-9 border-l-2 border-[#f5bd4f] pl-4 text-xs font-bold leading-6 text-[#5f6b82]">{t.hero.note}</p>
            </div>
            <div className="flex min-h-[360px] items-center border-t border-[#14213d]/10 bg-[#2859c5] px-5 py-12 text-white lg:min-h-full lg:border-l lg:border-t-0 lg:px-12">
              <div className="w-full border-t border-white/25">
              {["Learner gap", "Guided experience", "Visible outcome"].map((label, index) => (
                <div key={label} className="flex items-center gap-5 border-b border-white/25 py-7 text-lg font-extrabold">
                  <span className="text-xs text-[#f5bd4f]">0{index + 1}</span>{label}
                </div>
              ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fbfcff] py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-20">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div>
                <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-6xl">{t.featured.title}</h2>
              </div>
              <p className="max-w-2xl self-end text-base leading-8 text-[#596176] sm:text-lg">{t.featured.body}</p>
            </div>

            <div className="mt-16 border-t border-[#14213d]/15">
              {programs.map((program, programIndex) => (
                <article key={program.title} id={programIndex === 1 ? "peap" : undefined} className="scroll-mt-28 grid border-b border-[#14213d]/15 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className={`relative min-h-[410px] overflow-hidden bg-[#dceef9] ${programIndex === 1 ? "lg:order-2" : ""}`}>
                    <Image src={program.image} alt={program.alt} fill sizes="(max-width: 1024px) 100vw, 45vw" className={`transition-transform duration-700 hover:scale-[1.02] ${programIndex === 0 ? "object-cover object-[center_37%]" : "object-cover"}`} />
                  </div>
                  <div className={`flex flex-col justify-center px-0 py-10 lg:px-14 lg:py-16 xl:px-20 ${programIndex === 1 ? "lg:order-1 lg:pl-0" : "lg:pr-0"}`}>
                    <div className="flex items-center justify-between gap-5">
                      <span className="text-sm font-extrabold text-[#2859c5]">{program.index}</span>
                      <span className="text-xs font-bold text-[#5f6b82]">{program.status}</span>
                    </div>
                    <h3 className="mt-9 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">{program.title}</h3>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-[#596176]">{program.body}</p>
                    <div className="mt-7 border-t border-[#17213a]/15">
                      {program.meta.map((item, index) => {
                        const Icon = program.icons[index]
                        return <div key={item} className="flex items-center gap-3 border-b border-[#17213a]/15 py-3 text-xs font-bold text-[#4b5870]"><Icon className="h-4 w-4 text-[#3156a6]" />{item}</div>
                      })}
                    </div>
                    <Link href={program.href} className="text-link mt-8">{program.cta}<ArrowRight className="h-4 w-4" /></Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-y border-[#14213d]/10 bg-[#14213d] py-20 text-white sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-20">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
              <div>
                <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-6xl">{t.model.title}</h2>
                <p className="mt-6 text-base leading-8 text-[#c5cedf]">{t.model.body}</p>
              </div>
              <ol className="border-l border-t border-white/20 md:grid md:grid-cols-2">
                {t.model.steps.map((step) => (
                  <li key={step.number} className="min-h-[245px] border-b border-r border-white/20 p-6 sm:p-8">
                    <span className="text-xs font-extrabold text-[#f5bd4f]">{step.number}</span>
                    <h3 className="mt-10 text-xl font-extrabold tracking-[-0.025em]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#c5cedf]">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-[#fbfcff] py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-20">
            <h2 className="max-w-4xl text-4xl font-extrabold tracking-[-0.055em] sm:text-6xl">{t.lines.title}</h2>
            <div className="mt-12 grid border-l border-t border-[#14213d]/15 md:grid-cols-3">
              {t.lines.items.map((item, index) => (
                <article key={item.title} className="min-h-[255px] border-b border-r border-[#14213d]/15 p-6 sm:p-8">
                  <span className="text-xs font-extrabold text-[#2859c5]">0{index + 1}</span>
                  <h3 className="mt-12 text-2xl font-extrabold tracking-[-0.03em]">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#596176]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#17213a]/10 bg-[#f8fafc] py-20 text-[#17213a] sm:py-24">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12 xl:px-20">
            <div>
              <h2 className="font-editorial max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.045em] sm:text-6xl">{t.final.title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#596176]">{t.final.body}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <Link href={`/${locale}/contact?interest=program-partnership`} className="inline-flex h-14 items-center justify-center gap-3 rounded-md bg-[#3156a6] px-7 text-sm font-extrabold text-white hover:bg-[#17213a]">{t.final.primary}<ArrowRight className="h-4 w-4" /></Link>
              <Link href="https://app.prepskul.com" className="text-center text-xs font-bold text-[#596176] hover:text-[#17213a]">{t.final.secondary}</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
