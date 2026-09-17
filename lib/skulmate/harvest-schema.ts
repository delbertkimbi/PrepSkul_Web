/**
 * Shape for curriculum packs harvested outside the app (ChatGPT, teachers, MINEDUB notes).
 * Drop JSON files in data/curriculum/harvest/ and they merge into RAG.
 * The tutor never hears "you only teach Cameroon". Packs calibrate examples.
 */

export type HarvestLanguage = 'en' | 'fr' | 'both'

export type HarvestUnit = {
  id: string
  /** Region pack id, e.g. cm, ng, gh. Never a gate on what the learner may ask. */
  regionId: string
  systemId: string
  levelIds: string[]
  subjectId: string
  topic: string
  language: HarvestLanguage
  /** What learners actually mix up. */
  misconceptions: string[]
  /** Focusing order: one idea per beat. */
  sequence: string[]
  /** Local examples (FCFA, Yaoundé rain, plantain, BEPC wording). */
  examples: string[]
  examHooks: string[]
  transfer: string[]
  /** Long teaching text that gets chunked into RAG. */
  corpus: string
}

export type HarvestPack = {
  version: 1
  source: string
  regionId: string
  systemId?: string
  notes: string
  units: HarvestUnit[]
}

export function isHarvestPack(value: unknown): value is HarvestPack {
  if (!value || typeof value !== 'object') return false
  const pack = value as HarvestPack
  return pack.version === 1 && Array.isArray(pack.units) && typeof pack.regionId === 'string'
}

export function flattenHarvestCorpus(pack: HarvestPack): string[] {
  return pack.units
    .map((unit) => {
      const bits = [
        unit.topic,
        unit.corpus,
        ...unit.misconceptions.map((item) => `Misconception: ${item}`),
        ...unit.sequence.map((item, i) => `Step ${i + 1}: ${item}`),
        ...unit.examples.map((item) => `Example: ${item}`),
      ]
      return bits.filter(Boolean).join('\n')
    })
    .filter((text) => text.trim().length > 40)
}
