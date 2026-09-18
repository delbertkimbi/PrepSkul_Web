import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n"

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const isFrench = locale === "fr"
  return {
    title: isFrench ? "Pour les écoles et partenaires | PrepSkul" : "For Schools and Education Partners | PrepSkul",
    description: isFrench
      ? "Programmes de tutorat, révision, compétences et technologie éducative conçus autour des besoins de vos apprenants."
      : "Tutoring, revision, skills, and responsible learning-technology programs designed around your learners and context.",
    alternates: {
      canonical: `https://prepskul.com/${locale}/schools`,
      languages: { en: "https://prepskul.com/en/schools", fr: "https://prepskul.com/fr/schools" },
    },
    openGraph: {
      title: isFrench ? "PrepSkul pour les écoles" : "PrepSkul for Schools",
      description: isFrench ? "Relier l’enseignement en classe à la compréhension individuelle pour chaque apprenant." : "Bridging classroom teaching and individual understanding for every learner.",
      images: [{ url: "https://prepskul.com/group-class-prepskul.png", width: 1536, height: 1024, alt: "PrepSkul guided learning for schools" }],
    },
  }
}

export default function SchoolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
