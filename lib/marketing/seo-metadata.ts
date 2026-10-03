import type { Metadata } from "next"

const pages = {
  home: {
    en: {
      title: "PrepSkul | Learn with Mate, your AI tutor",
      description: "Ask SkulMate questions by voice or text, get clear explanations, and practice at your pace. Find a tutor when you want one-to-one help.",
    },
    fr: {
      title: "PrepSkul | Apprends avec Mate, ton tuteur IA",
      description: "Pose tes questions à SkulMate à voix haute ou par écrit, reçois des explications claires et entraîne-toi à ton rythme. Trouve un tuteur si tu veux un accompagnement individuel.",
    },
  },
  about: {
    en: {
      title: "About PrepSkul | Learning with Mate",
      description: "Meet PrepSkul and SkulMate, the AI tutor in the app. Learn how Mate explains lessons, guides practice, and connects learners with a tutor when wanted.",
    },
    fr: {
      title: "À propos de PrepSkul | Apprendre avec Mate",
      description: "Découvre PrepSkul et SkulMate, le tuteur IA de l’application. Mate explique les leçons, accompagne les exercices et aide à trouver un tuteur si besoin.",
    },
  },
  programs: {
    en: {
      title: "PrepSkul Programs | Summer Build Camp and Exam Accelerator",
      description: "Explore Summer Build Camp for hands-on STEM, AI, and innovation, plus PrepSkul Exam Accelerator for focused exam revision.",
    },
    fr: {
      title: "Programmes PrepSkul | Summer Build Camp et Exam Accelerator",
      description: "Découvre le Summer Build Camp et ses activités pratiques en STEM, IA et innovation, ainsi que PrepSkul Exam Accelerator et ses révisions ciblées.",
    },
  },
  mate: {
    en: {
      title: "SkulMate | AI tutor in the PrepSkul app",
      description: "Meet Mate, your AI tutor in the PrepSkul app. Ask questions, get step-by-step explanations, and practice whenever you need help.",
    },
    fr: {
      title: "SkulMate | Tuteur IA dans l’application PrepSkul",
      description: "Rencontre Mate, ton tuteur IA dans l’application PrepSkul. Pose tes questions, suis des explications étape par étape et entraîne-toi quand tu en as besoin.",
    },
  },
  find: {
    en: {
      title: "Find a tutor | PrepSkul",
      description: "Find a verified online or home tutor in Cameroon for your subject, school system, and learning goals.",
    },
    fr: {
      title: "Trouver un tuteur | PrepSkul",
      description: "Trouve un tuteur vérifié en ligne ou à domicile au Cameroun, selon ta matière, ton système scolaire et tes objectifs.",
    },
  },
  contact: {
    en: {
      title: "Contact PrepSkul",
      description: "Contact the PrepSkul team for help with Mate, tutoring, programs, or learning support in Cameroon.",
    },
    fr: {
      title: "Contacter PrepSkul",
      description: "Contacte l’équipe PrepSkul pour obtenir de l’aide avec Mate, le tutorat, les programmes ou l’accompagnement scolaire au Cameroun.",
    },
  },
  tutors: {
    en: {
      title: "Teach with PrepSkul | Tutor opportunities",
      description: "Learn about tutoring with PrepSkul and supporting learners online or at home in Cameroon.",
    },
    fr: {
      title: "Enseigner avec PrepSkul | Devenir tuteur",
      description: "Découvre les possibilités d’enseignement avec PrepSkul pour accompagner les apprenants en ligne ou à domicile au Cameroun.",
    },
  },
  testimonials: {
    en: {
      title: "Learner stories | PrepSkul",
      description: "Read how PrepSkul learners build understanding, prepare for exams, and make progress with Mate and tutors.",
    },
    fr: {
      title: "Témoignages d’apprenants | PrepSkul",
      description: "Découvre comment les apprenants PrepSkul comprennent leurs cours, préparent leurs examens et progressent avec Mate et les tuteurs.",
    },
  },
  howItWorks: {
    en: {
      title: "How PrepSkul works | Learn with Mate",
      description: "See how learners use Mate for explanations and practice, then find a tutor or join a PrepSkul program when they need more support.",
    },
    fr: {
      title: "Comment fonctionne PrepSkul | Apprendre avec Mate",
      description: "Découvre comment apprendre avec Mate, t’entraîner, trouver un tuteur ou rejoindre un programme PrepSkul.",
    },
  },
} as const

export type MarketingSeoPage = keyof typeof pages

export function marketingMetadata(locale: string, page: MarketingSeoPage): Metadata {
  const language = locale === "fr" ? "fr" : "en"
  const path = page === "home" ? "" : page === "find" ? "find" : page === "howItWorks" ? "how-it-works" : page
  const canonical = `/${language}${path ? `/${path}` : ""}`
  const copy = pages[page][language]

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        en: `/en${path ? `/${path}` : ""}`,
        fr: `/fr${path ? `/${path}` : ""}`,
      },
    },
    openGraph: {
      type: "website",
      title: copy.title,
      description: copy.description,
      url: canonical,
      siteName: "PrepSkul",
      locale: language === "fr" ? "fr_CM" : "en_CM",
      images: [{ url: "/logo.jpg", width: 1024, height: 1024, alt: "PrepSkul" }],
    },
    twitter: { card: "summary_large_image", title: copy.title, description: copy.description },
  }
}
