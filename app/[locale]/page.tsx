import { AliveHome } from "@/components/marketing/alive-home"
import { OrganizationSchema, LocalBusinessSchema, FAQSchema } from "@/components/seo-schema"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { listPublicTutors } from "@/lib/tutors/directory"
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
  const { tutors } = await homeTutors()

  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema />
      <FAQSchema faqs={faqs} />
      <AliveHome locale={locale} tutors={tutors} />
    </>
  )
}
