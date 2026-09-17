import { AliveHome } from "@/components/marketing/alive-home"
import { OrganizationSchema, LocalBusinessSchema, FAQSchema } from "@/components/seo-schema"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { listPublicTutors } from "@/lib/tutors/directory"

export const dynamic = "force-dynamic"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const copy = aliveCopy(locale)
  const faqs = copy.faq.map((item) => ({ question: item.q, answer: item.a }))
  const { tutors } = await listPublicTutors(4)

  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema />
      <FAQSchema faqs={faqs} />
      <AliveHome locale={locale} tutors={tutors} />
    </>
  )
}
