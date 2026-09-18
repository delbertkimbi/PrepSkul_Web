/** Closed catalogue of Mate onboard lines. Keep in sync with learner-onboard copy. */

export const MATE_VOICE_LINES = {
  en: {
    welcome: "Hi there! I'm Mate.",
    welcome_note:
      "We start with your school. I listen out loud. A human tutor is someone you find or request.",
    language: "What language should I use with you?",
    who: "Who is learning here?",
    name: "What should I call you?",
    country: "Where is your school?",
    system: "Francophone or anglophone?",
    level: "What class are you in?",
    subject: "What do you need the most help with right now?",
    ready: "I tutor you out loud. For a person, scroll recommended tutors or request one, online or at the table.",
    paywall: "Try Super. Seven days free, then two thousand five hundred CFA a month.",
  },
  fr: {
    welcome: "Salut ! Moi c’est Mate.",
    welcome_note:
      "On commence par ton école. Je t’écoute à voix haute. Un tuteur humain, tu le trouves ou tu le demandes.",
    language: "On se parle en quelle langue ?",
    who: "Qui apprend ici ?",
    name: "Comment je t’appelle ?",
    country: "Où est ton école ?",
    system: "Francophone ou anglophone ?",
    level: "Tu es en quelle classe ?",
    subject: "De quoi tu as le plus besoin maintenant ?",
    ready:
      "Je te coach à voix haute. Pour une personne, tu fais défiler les tuteurs ou tu en demandes un, en ligne ou sur place.",
    paywall: "Essaie Super. Sept jours offerts, puis deux mille cinq cents francs CFA par mois.",
  },
} as const

export type MateVoiceLocale = keyof typeof MATE_VOICE_LINES
export type MateVoicePhrase = keyof typeof MATE_VOICE_LINES.en

export function mateVoiceText(phrase: string, locale: string) {
  const pack = locale.startsWith("fr") ? MATE_VOICE_LINES.fr : MATE_VOICE_LINES.en
  return pack[phrase as MateVoicePhrase]
}
