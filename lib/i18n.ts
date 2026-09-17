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
    title: "PrepSkul: Find Trusted Home and Online Tutors in Cameroon",
    description: "Find the best online and home tutors in Cameroon. Expert tutoring for GCE, BEPC, Baccalauréat, Math, English, Science. 11,280+ sessions tutored, 4.8 average rating. Start learning today!",
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
          url: "https://prepskul.com/logo.jpg",
          width: 1200,
          height: 630,
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
    title: "PrepSkul - #1 Cours Particuliers & En Ligne au Cameroun | Tuteurs Experts",
    description: "Trouvez les meilleurs tuteurs en ligne et à domicile au Cameroun. Cours particuliers pour GCE, BEPC, Baccalauréat, Mathématiques, Anglais, Sciences. 3 000+ apprenants guidés, 50+ tuteurs experts, 35 villes couvertes. Commencez à apprendre dès aujourd'hui !",
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
          url: "https://prepskul.com/logo.jpg",
          width: 1200,
          height: 630,
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
