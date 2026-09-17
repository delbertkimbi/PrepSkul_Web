import { FindDirectory } from "@/components/marketing/find-directory"
import { listPublicTutors } from "@/lib/tutors/directory"

export const dynamic = "force-dynamic"

export default async function FindPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { tutors, unavailable } = await listPublicTutors(24)
  return <FindDirectory locale={locale} tutors={tutors} unavailable={unavailable} />
}
