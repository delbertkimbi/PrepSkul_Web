import { Suspense } from "react"
import { AliveHome, TutorMiniCard } from "@/components/marketing/alive-home"
import { OrganizationSchema, LocalBusinessSchema, FAQSchema } from "@/components/seo-schema"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { listPublicTutors, previewPublicTutors } from "@/lib/tutors/directory"
import { marketingMetadata } from "@/lib/marketing/seo-metadata"
import { unstable_cache } from "next/cache"

const homeTutors = unstable_cache(() => listPublicTutors(4), ["home-public-tutors"], { revalidate: 300 })

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return marketingMetadata(locale, "home")
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const copy = aliveCopy(locale)
  const faqs = copy.faq.map((item) => ({ question: item.q, answer: item.a }))

  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema />
      <FAQSchema faqs={faqs} />
      <AliveHome locale={locale} tutorCards={
        <Suspense fallback={<TutorCardsLoading locale={locale} />}>
          <HomeTutorCards locale={locale} />
        </Suspense>
      } />
    </>
  )
}

// The hero and Mate must not wait for a below-the-fold database request.
async function HomeTutorCards({ locale }: { locale: string }) {
  const { tutors } = await homeTutors()
  return <>{previewPublicTutors(tutors, 4).map(tutor => (
    <TutorMiniCard key={tutor.id} tutor={tutor} locale={locale} />
  ))}</>
}

function TutorCardsLoading({ locale }: { locale: string }) {
  return <>
    <span className="sr-only" role="status">{locale.startsWith("fr") ? "Chargement des tuteurs…" : "Loading tutors…"}</span>
    {[0, 1, 2, 3].map(index => <div key={index} aria-hidden className="h-[74px] rounded-[24px] border border-[#1B2C4F]/10 bg-[#fffdf7]" />)}
  </>
}
