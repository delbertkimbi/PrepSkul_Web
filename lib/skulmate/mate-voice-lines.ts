/** Closed catalogue of Mate onboard lines. Keep in sync with learner-onboard copy. */

export const MATE_VOICE_LINES = {
  en: {
    welcome: "Hi. I'm Mate.",
    welcome_note:
      "I'm your SkulMate. I stay on the hard bit until it is yours. Need a person? I bring one in.",
    language: "What language should I use with you?",
    who: "Who is learning here?",
    name: "What should I call you?",
    country: "Where is your school?",
    system: "Francophone or anglophone?",
    level: "What class are you in?",
    subject: "What do you need the most help with right now?",
    ready: "I tutor you out loud. Need a person? I bring a tutor in, live or at the table.",
    paywall: "Try Super. Seven days free, then two thousand five hundred CFA a month.",
  },
  fr: {
    welcome: "Salut. Moi c’est Mate.",
    welcome_note:
      "Je suis ton SkulMate. Je reste sur le point qui bloque jusqu’à ce que ce soit à toi. Une personne? Je la fais venir.",
    language: "On se parle en quelle langue ?",
    who: "Qui apprend ici ?",
    name: "Comment je t’appelle ?",
    country: "Où est ton école ?",
    system: "Francophone ou anglophone ?",
    level: "Tu es en quelle classe ?",
    subject: "De quoi tu as le plus besoin maintenant ?",
    ready:
      "Je te coach à voix haute. Une personne? J’en fais venir une, en direct ou à table.",
    paywall: "Essaie Super. Sept jours offerts, puis deux mille cinq cents francs CFA par mois.",
  },
} as const

export type MateVoiceLocale = keyof typeof MATE_VOICE_LINES
export type MateVoicePhrase = keyof typeof MATE_VOICE_LINES.en

export function mateVoiceText(phrase: string, locale: string) {
  const pack = locale.startsWith("fr") ? MATE_VOICE_LINES.fr : MATE_VOICE_LINES.en
  return pack[phrase as MateVoicePhrase]
}
