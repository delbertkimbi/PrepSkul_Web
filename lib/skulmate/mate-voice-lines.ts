/** Closed catalogue of Mate onboard lines. Keep in sync with learner-onboard copy. */

export const MATE_VOICE_LINES = {
  en: {
    welcome: "Hi. I'm Mate.",
    welcome_note:
      "I'm your SkulMate. I'll help you understand your lessons. Need a tutor? I can help you find one.",
    language: "What language should I use with you?",
    who: "Who is learning here?",
    name: "What should I call you?",
    country: "Where is your school located?",
    system: "Which system of education do you follow?",
    level: "What class are you in?",
    subject: "What do you need the most help with right now?",
    goal: "What kind of help would feel useful?",
    exam: "Which exam are you working toward?",
    mode: "How would you like to learn?",
    city: "Which town should I look in?",
    ready: "I’ve got a good picture of what will help you.",
    paywall: "Try Super. Seven days free, then two thousand five hundred CFA a month.",
  },
  fr: {
    welcome: "Salut. Moi c’est Mate.",
    welcome_note:
      "Je suis ton SkulMate. Je t’aide à comprendre tes leçons. Besoin d’un tuteur ? Je peux t’en trouver un.",
    language: "On se parle en quelle langue ?",
    who: "Qui apprend ici ?",
    name: "Comment je t’appelle ?",
    country: "Où se trouve ton école ?",
    system: "Quel système éducatif suis-tu ?",
    level: "Tu es en quelle classe ?",
    subject: "De quoi tu as le plus besoin maintenant ?",
    goal: "Quel type d’aide te serait utile ?",
    exam: "Quel examen prépares-tu ?",
    mode: "Comment préfères-tu apprendre ?",
    city: "Dans quelle ville dois-je chercher ?",
    ready: "J’ai une bonne idée de ce qui t’aidera.",
    paywall: "Essaie Super. Sept jours offerts, puis deux mille cinq cents francs CFA par mois.",
  },
} as const

export type MateVoiceLocale = keyof typeof MATE_VOICE_LINES
export type MateVoicePhrase = keyof typeof MATE_VOICE_LINES.en

export function mateVoiceText(phrase: string, locale: string) {
  const pack = locale.startsWith("fr") ? MATE_VOICE_LINES.fr : MATE_VOICE_LINES.en
  return pack[phrase as MateVoicePhrase]
}
