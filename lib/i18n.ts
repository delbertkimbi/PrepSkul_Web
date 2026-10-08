export const locales = ['en', 'fr'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'en'

export const localeNames = {
  en: 'English',
  fr: 'Français'
} as const

export const localeFlags = {
  en: '🇬🇧',
  fr: '🇫🇷'
} as const

// Language-specific metadata
export const localeMetadata = {
  en: {
    title: "PrepSkul | Learn at your level. Grow with confidence.",
    description: "Ask SkulMate questions by voice or text, get clear explanations, and practice at your pace. Find a tutor when you want one-to-one help.",
    keywords: [
      "online tutor Cameroon",
      "home tutor Cameroon", 
      "GCE preparation",
      "Concours preparation",
      "Common Entrance preparation",
      "BEPC tutoring",
      "math tutor Cameroon",
      "English tutor Cameroon",
      "science tutor Cameroon",
      "academic tutoring",
      "skill development",
      "exam preparation",
      "home tutoring",
      "online tutoring",
      "tutoring services",
      "Educational consultant",
      "tutoring Douala",
      "tutoring Yaoundé",
      "tutoring Buea",
      "tutoring Bamenda",
      "tutoring Garoua",
      "tutoring Maroua",
      "tutoring Limbe",
      "tutoring Cameroon",
      "teaching online in Cameroon",
      "teaching home in Cameroon",
      "teaching in Cameroon"
    ],
    openGraph: {
      type: "website",
      locale: "en_CM",
      siteName: "PrepSkul",
      images: [
        {
          url: "https://prepskul.com/logo.jpg",
          width: 1024,
          height: 1024,
          alt: "PrepSkul - Expert Tutoring in Cameroon"
        }
      ] as any
    },
    twitter: {
      card: "summary_large_image",
      site: "@prepskul",
      creator: "@prepskul"
    }
  },
  fr: {
    title: "PrepSkul | Apprends à ton niveau. Avance avec confiance.",
    description: "Pose tes questions à SkulMate à voix haute ou par écrit, reçois des explications claires et entraîne-toi à ton rythme. Trouve un tuteur si tu veux un accompagnement individuel.",
    keywords: [
      "tuteur en ligne Cameroun",
      "cours particuliers Cameroun",
      "préparation GCE",
      "préparation Concours",
      "préparation Common Entrance",
      "cours BEPC",
      "tuteur mathématiques Cameroun",
      "tuteur anglais Cameroun",
      "tuteur sciences Cameroun",
      "cours particuliers",
      "développement de compétences",
      "préparation examens",
      "cours à domicile",
      "cours en ligne",
      "services de tutorat",
      "consultant éducatif",
      "cours Douala",
      "cours Yaoundé",
      "cours Buea",
      "cours Bamenda",
      "cours Garoua",
      "cours Maroua",
      "cours Limbe",
      "cours Cameroun",
      "enseignement en ligne Cameroun",
      "enseignement à domicile Cameroun",
      "enseignement Cameroun"
    ],
    openGraph: {
      type: "website",
      locale: "fr_CM",
      siteName: "PrepSkul",
      images: [
        {
          url: "https://prepskul.com/logo.jpg",
          width: 1024,
          height: 1024,
          alt: "PrepSkul - Cours Particuliers au Cameroun"
        }
      ] as any
    },
    twitter: {
      card: "summary_large_image",
      site: "@prepskul",
      creator: "@prepskul"
    }
  }
} as const
