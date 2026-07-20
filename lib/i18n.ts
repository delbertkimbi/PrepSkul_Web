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
    title: "PrepSkul | From Teaching to Understanding",
    description: "PrepSkul bridges classroom teaching and individual understanding through trusted tutors, practical learning programs, and SkulMate.",
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
      url: "https://prepskul.com",
      siteName: "PrepSkul",
      images: [
        {
          url: "https://prepskul.com/images/hero-tutoring.png",
          width: 1200,
          height: 630,
          alt: "A PrepSkul tutor guiding a learner from teaching to understanding"
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
    title: "PrepSkul | De l’enseignement à la compréhension",
    description: "PrepSkul relie l’enseignement en classe à la compréhension individuelle grâce aux tuteurs, aux programmes pratiques et à SkulMate.",
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
      url: "https://prepskul.com",
      siteName: "PrepSkul",
      images: [
        {
          url: "https://prepskul.com/images/hero-tutoring.png",
          width: 1200,
          height: 630,
          alt: "Un tuteur PrepSkul guide un apprenant vers la compréhension"
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
