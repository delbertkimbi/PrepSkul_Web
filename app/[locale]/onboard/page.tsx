import { LearnerOnboard } from "@/components/onboard/learner-onboard"

export async function generateMetadata() {
  return { title: "Meet Mate" }
}

export default async function OnboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <LearnerOnboard initialLocale={locale} />
}
