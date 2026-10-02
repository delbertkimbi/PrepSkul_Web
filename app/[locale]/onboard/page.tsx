import { LearnerOnboard } from "@/components/onboard/learner-onboard"

export async function generateMetadata() {
  return { title: "Meet Mate", robots: { index: false, follow: false } }
}

export default async function OnboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <LearnerOnboard initialLocale={locale} />
}
