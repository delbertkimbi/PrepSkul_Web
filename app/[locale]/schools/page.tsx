"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, ShieldCheck } from "lucide-react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { useLocale } from "@/lib/locale-context"

const copy = {
  en: {
    hero: {
      label: "For schools, NGOs and education partners",
      title: "No learner should disappear behind the lesson.",
      body: "A classroom lesson reaches everyone, but every learner understands differently. PrepSkul works with schools to identify learners who are falling behind, guide them back on track and introduce them to practical skills that can change what comes next.",
      primary: "Discuss a partnership",
      secondary: "Explore engagement models",
      alt: "PrepSkul facilitators and learners working together in a guided session",
    },
    need: {
      label: "Where we add value",
      title: "Shared teaching. Personal understanding.",
      body: "PrepSkul extends the work already happening in school. We focus on the learners who need more time, a different explanation or closer guidance, then connect that support to clear academic and practical outcomes.",
      points: ["Identify learners who are falling behind", "Understand the specific learning gap", "Provide the right personal guidance", "Track progress towards catching up"],
    },
    models: {
      label: "The school partnership package",
      title: "Practical support a school can put around each learner.",
      included: "Included in the school partnership package",
      items: [
        { number: "01", title: "PTA 1-on-1 learner catch-up", body: "PTA 1-on-1 helps the school identify learners who are falling behind, understand where each learner is struggling and provide the right personal guidance to help them catch up." },
        { number: "02", title: "Exam preparation", body: "Focused revision initiatives that bring structure, guided practice and confidence to high-pressure periods." },
        { number: "03", title: "Life-changing skills", body: "Technology, entrepreneurship, communication and hands-on projects that help learners discover new strengths and build practical capability." },
        { number: "04", title: "Responsible technology pilots", body: "Carefully scoped SkulMate or guided-learning pilots with defined consent, privacy, support and evaluation boundaries." },
      ],
    },
    process: {
      label: "How partnership works",
      title: "Clear from the first conversation.",
      steps: [
        { number: "01", title: "Identify", body: "Work with the school to identify learners who are falling behind and the subjects or concepts holding them back." },
        { number: "02", title: "Understand", body: "Define each learner’s gap, current level, support needs and a clear catch-up goal." },
        { number: "03", title: "Guide", body: "Provide focused PTA 1-on-1 guidance alongside the agreed revision, skills or technology support." },
        { number: "04", title: "Track", body: "Review learner progress, document what is improving and adjust the guidance where needed." },
      ],
    },
    trust: {
      label: "Safeguarding before scale",
      title: "Learner support must be safe, accountable and understandable.",
      body: "Every engagement should define who interacts with learners, how concerns are handled, what information is collected, who owns follow-up and what can be reported publicly.",
      link: "Read our safeguarding approach",
    },
    audiences: {
      label: "Who can partner with PrepSkul",
      title: "Institutions with a real learner need.",
      items: ["Primary and secondary schools", "Universities and training institutions", "NGOs and community organizations", "Churches and youth networks", "Sponsors and corporate foundations", "Government and education initiatives"],
    },
    final: { title: "Bring us the learner challenge.", body: "Tell us who needs support, what is getting in the way and what a useful outcome would look like. We’ll shape the next conversation around that.", primary: "Start a partnership conversation" },
  },
  fr: {
    hero: {
      label: "Pour les écoles, ONG et partenaires éducatifs",
      title: "Aucun apprenant ne devrait se perdre derrière la leçon.",
      body: "Un cours s’adresse à tous, mais chaque apprenant comprend différemment. PrepSkul aide les écoles à identifier ceux qui prennent du retard, à les remettre sur la bonne voie et à leur faire découvrir des compétences pratiques qui peuvent changer leur avenir.",
      primary: "Discuter d’un partenariat",
      secondary: "Explorer les modèles",
      alt: "Des facilitateurs PrepSkul accompagnent des apprenants",
    },
    need: {
      label: "Notre valeur ajoutée",
      title: "Un enseignement partagé. Une compréhension personnelle.",
      body: "PrepSkul prolonge le travail déjà réalisé à l’école. Nous nous concentrons sur les apprenants qui ont besoin de plus de temps, d’une autre explication ou d’un accompagnement plus proche, avec des résultats académiques et pratiques clairs.",
      points: ["Identifier les apprenants qui prennent du retard", "Comprendre la difficulté précise", "Apporter le bon accompagnement personnel", "Suivre les progrès vers le rattrapage"],
    },
    models: {
      label: "Le forfait de partenariat scolaire",
      title: "Un soutien concret que l’école peut apporter à chaque apprenant.",
      included: "Inclus dans le forfait de partenariat scolaire",
      items: [
        { number: "01", title: "Rattrapage PTA individuel", body: "Le programme PTA individuel aide l’école à identifier les apprenants qui prennent du retard, à comprendre leurs difficultés et à leur apporter l’accompagnement personnel nécessaire pour rattraper leur niveau." },
        { number: "02", title: "Préparation aux examens", body: "Révisions ciblées qui apportent structure, pratique guidée et confiance dans les périodes de pression." },
        { number: "03", title: "Compétences qui changent la vie", body: "Technologie, entrepreneuriat, communication et projets pratiques pour révéler de nouvelles forces et développer des capacités utiles." },
        { number: "04", title: "Pilotes technologiques responsables", body: "Pilotes SkulMate ou d’apprentissage guidé avec consentement, confidentialité, soutien et évaluation définis." },
      ],
    },
    process: {
      label: "Comment fonctionne le partenariat",
      title: "Clair dès la première conversation.",
      steps: [
        { number: "01", title: "Identifier", body: "Travailler avec l’école pour repérer les apprenants en retard et les matières ou notions qui les bloquent." },
        { number: "02", title: "Comprendre", body: "Définir l’écart, le niveau actuel, le besoin d’accompagnement et un objectif clair de rattrapage." },
        { number: "03", title: "Accompagner", body: "Fournir le suivi PTA individuel ainsi que les révisions, compétences ou technologies convenues." },
        { number: "04", title: "Suivre", body: "Évaluer les progrès, documenter les améliorations et ajuster l’accompagnement si nécessaire." },
      ],
    },
    trust: {
      label: "La protection avant l’échelle",
      title: "Le soutien doit être sûr, responsable et compréhensible.",
      body: "Chaque engagement définit qui interagit avec les apprenants, comment les préoccupations sont traitées, quelles informations sont collectées et qui assure le suivi.",
      link: "Lire notre approche de protection",
    },
    audiences: {
      label: "Qui peut collaborer avec PrepSkul",
      title: "Des institutions face à un vrai besoin apprenant.",
      items: ["Écoles primaires et secondaires", "Universités et centres de formation", "ONG et organisations communautaires", "Églises et réseaux de jeunes", "Sponsors et fondations d’entreprise", "Initiatives publiques d’éducation"],
    },
    final: { title: "Présentez-nous le défi apprenant.", body: "Dites-nous qui a besoin de soutien, ce qui bloque et à quoi ressemblerait un résultat utile. Nous construirons la conversation autour de cela.", primary: "Commencer une conversation" },
  },
} as const

export default function SchoolsPage() {
  const { locale } = useLocale()
  const t = copy[locale]

  return (
    <div className="min-h-screen bg-[#fbfcff] text-[#14213d]">
      <Header />
      <main>
        <section className="glass-page-section overflow-hidden">
          <div className="mx-auto grid max-w-[1340px] gap-10 px-5 py-10 sm:px-8 lg:min-h-[650px] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-12">
            <div className="relative z-10 flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-12 xl:px-20">
              <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[0.96] tracking-[-0.06em] sm:text-6xl lg:text-[4.65rem]">{t.hero.title}</h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-[#596176]">{t.hero.body}</p>
              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <Link href={`/${locale}/contact?interest=school-partnership`} className="primary-button">{t.hero.primary}<ArrowRight className="h-4 w-4" /></Link>
                <Link href="#models" className="text-link">{t.hero.secondary}<ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="relative min-h-[440px] overflow-hidden rounded-[30px] border border-white/80 bg-[#f8fafc] shadow-[0_20px_55px_rgba(42,66,110,.14)] lg:min-h-[560px]">
              <Image src="/group-class-prepskul.png" alt={t.hero.alt} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            </div>
          </div>
        </section>

        <section className="bg-[#fbfcff] py-20 sm:py-28">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20 lg:px-12 xl:px-20">
            <div>
              <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-6xl">{t.need.title}</h2>
            </div>
            <div className="self-end">
              <p className="text-base leading-8 text-[#596176] sm:text-lg">{t.need.body}</p>
              <ul className="mt-8 border-t border-[#17213a]/20">
                {t.need.points.map((point) => <li key={point} className="flex items-center gap-3 border-b border-[#14213d]/15 py-4 text-sm font-bold"><Check className="h-4 w-4 text-[#2859c5]" />{point}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section id="models" className="glass-page-section scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-20">
            <h2 className="max-w-4xl text-4xl font-extrabold tracking-[-0.055em] sm:text-6xl">{t.models.title}</h2>
            <div className="glass-content-card mt-12 overflow-hidden border-t border-[#14213d]/15">
              {t.models.items.map((item, index) => (
                <article key={item.number} className={`grid gap-5 border-b border-[#14213d]/15 py-8 sm:grid-cols-[80px_0.85fr_1.15fr] sm:items-start ${index === 0 ? "bg-white px-5 sm:px-8" : ""}`}>
                  <span className="text-sm font-bold text-[#2859c5]">{item.number}</span>
                  <h3 className="text-2xl font-extrabold tracking-[-0.035em]">{item.title}{index === 0 && <span className="mt-3 block text-xs font-bold text-[#2859c5]">{t.models.included}</span>}</h3>
                  <p className="max-w-xl text-sm leading-7 text-[#5f6b82]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#fbfcff] py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-20">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-6xl">{t.process.title}</h2>
              </div>
              <ol className="border-t border-[#17213a]/20">
                {t.process.steps.map((step) => (
                  <li key={step.number} className="grid gap-3 border-b border-[#14213d]/15 py-6 sm:grid-cols-[55px_180px_1fr] sm:items-start">
                    <span className="text-xs font-extrabold text-[#2859c5]">{step.number}</span>
                    <h3 className="text-lg font-extrabold">{step.title}</h3>
                    <p className="text-sm leading-7 text-[#596176]">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-y border-[#14213d]/10 bg-[#14213d] py-20 text-white sm:py-24">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-20 lg:px-12 xl:px-20">
            <ShieldCheck className="h-20 w-20 text-[#f5bd4f]" strokeWidth={1.25} />
            <div>
              <h2 className="max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-6xl">{t.trust.title}</h2>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#c5cedf]">{t.trust.body}</p>
              <Link href={`/${locale}/safeguarding`} className="mt-7 inline-flex items-center gap-2 border-b border-[#8fb1ff] pb-1 text-sm font-extrabold text-white">{t.trust.link}<ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        <section className="bg-[#fbfcff] py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-20">
            <h2 className="max-w-4xl text-4xl font-extrabold tracking-[-0.055em] sm:text-6xl">{t.audiences.title}</h2>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-5 border-t border-[#14213d]/15 pt-7">
              {t.audiences.items.map((item) => <p key={item} className="text-lg font-bold">{item}</p>)}
            </div>
          </div>
        </section>

        <section className="border-t border-[#14213d]/10 bg-[#2859c5] py-20 text-white sm:py-24">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12 xl:px-20">
            <div>
              <h2 className="max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-6xl">{t.final.title}</h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#e4ecff]">{t.final.body}</p>
            </div>
            <Link href={`/${locale}/contact?interest=school-partnership`} className="inline-flex h-13 shrink-0 items-center justify-center gap-3 bg-white px-7 text-sm font-extrabold text-[#14213d]">{t.final.primary}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
