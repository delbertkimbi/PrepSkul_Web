import { FindDirectory } from "@/components/marketing/find-directory"
import { listPublicTutors } from "@/lib/tutors/directory"
import { marketingMetadata } from "@/lib/marketing/seo-metadata"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return marketingMetadata(locale, "find")
}

export default async function FindPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { tutors, unavailable } = await listPublicTutors(24)
  return <FindDirectory locale={locale} tutors={tutors} unavailable={unavailable} />
}
