import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n"

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const isFrench = locale === "fr"

  return {
    title: isFrench ? "PEAP 2026 | Archive du programme PrepSkul" : "PEAP 2026 | PrepSkul Program Archive",
    description: isFrench
      ? "Découvrez l’édition 2026 du Programme d’accélération aux examens PrepSkul, son public, son format et ses archives."
      : "Explore the 2026 PrepSkul Exam Accelerator Program, including its audience, format, purpose, and program artifacts.",
    alternates: {
      canonical: `https://prepskul.com/${locale}/programs/peap`,
      languages: {
        en: "https://prepskul.com/en/programs/peap",
        fr: "https://prepskul.com/fr/programs/peap",
      },
    },
    openGraph: {
      title: isFrench ? "PEAP 2026 | PrepSkul" : "Exam Accelerator Program 2026 | PrepSkul",
      description: isFrench
        ? "Une initiative de révision guidée pour les candidats au GCE."
        : "A focused guided-revision initiative for GCE candidates.",
      images: [{ url: "https://prepskul.com/program1.jpg", width: 1080, height: 1350, alt: "PrepSkul Exam Accelerator Program 2026" }],
    },
  }
}

export default function PeapLayout({ children }: { children: React.ReactNode }) {
  return children
}
