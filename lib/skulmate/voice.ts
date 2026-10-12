export type SpeechVoiceLike = {
  name: string
  lang: string
  localService?: boolean
}

/** Prefer a neural / natural voice in the student language. */
export function pickNaturalVoice(
  voices: SpeechVoiceLike[],
  language = 'en'
): SpeechVoiceLike | null {
  if (!voices.length) return null
  const want = language.toLowerCase().startsWith('fr') ? 'fr' : 'en'
  const inLang = voices.filter((v) => v.lang.toLowerCase().startsWith(want))
  const pool = inLang.length ? inLang : voices
  const neural = pool.find((v) =>
    /natural|neural|google|premium|enhanced|samantha|daniel|amelie|thomas|aria|jenny/i.test(
      v.name
    )
  )
  if (neural) return neural
  return pool.find((v) => v.localService) || pool[0] || null
}

export function sttLangTag(language = 'en'): string {
  return language.toLowerCase().startsWith('fr') ? 'fr-FR' : 'en-GB'
}
