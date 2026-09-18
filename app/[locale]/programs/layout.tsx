import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n"

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const isFrench = locale === "fr"

  return {
    title: isFrench ? "Programmes guidés | PrepSkul" : "Guided Learning Programs | PrepSkul",
    description: isFrench
      ? "Découvrez les programmes PrepSkul pour les examens, la technologie, l’entrepreneuriat, les écoles et les communautés."
      : "Explore PrepSkul programs for exam preparation, technology, entrepreneurship, schools, and communities.",
    alternates: {
      canonical: `https://prepskul.com/${locale}/programs`,
      languages: {
        en: "https://prepskul.com/en/programs",
        fr: "https://prepskul.com/fr/programs",
      },
    },
    openGraph: {
      title: isFrench ? "Programmes guidés PrepSkul" : "PrepSkul Guided Programs",
      description: isFrench ? "Des expériences guidées avec un défi précis et un résultat visible." : "Guided experiences built around a defined learner challenge and a visible outcome.",
      images: [{ url: "https://prepskul.com/sbc-og.png", width: 1200, height: 630, alt: "PrepSkul guided learning programs" }],
    },
  }
}

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return children
}
