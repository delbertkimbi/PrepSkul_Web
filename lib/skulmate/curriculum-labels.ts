/**
 * Bilingual curriculum labels for admin/ops surfaces only — not learner UI.
 */

import seedData from '@/data/curriculum/seed-nodes.json'
import type { CurriculumNodeSeed } from './curriculum-matcher'

export type CurriculumLocale = 'en' | 'fr'

const FRAMEWORK_LABELS: Record<
  string,
  { label_en: string; label_fr: string }
> = {
  open_learning: { label_en: 'Open learning', label_fr: 'Apprentissage libre' },
  cm_gce_ol: { label_en: 'GCE Ordinary Level', label_fr: 'GCE niveau O' },
  cm_gce_al: { label_en: 'GCE Advanced Level', label_fr: 'GCE niveau A' },
  cm_francophone: {
    label_en: 'Francophone secondary',
    label_fr: 'Secondaire francophone',
  },
  waec: { label_en: 'WAEC', label_fr: 'WAEC' },
  steam: { label_en: 'STEAM', label_fr: 'STEAM' },
}

const NODES: CurriculumNodeSeed[] = (seedData as { nodes: CurriculumNodeSeed[] })
  .nodes

export function getFrameworkLabel(
  frameworkId: string,
  locale: CurriculumLocale = 'en'
): string {
  const row = FRAMEWORK_LABELS[frameworkId]
  if (!row) return frameworkId
  return locale === 'fr' ? row.label_fr : row.label_en
}

export function getTopicTitle(
  topicId: string,
  locale: CurriculumLocale = 'en'
): string | null {
  const node = NODES.find((n) => n.topic_id === topicId)
  if (!node) return null
  return locale === 'fr' ? node.title_fr : node.title_en
}

export function formatMatchedTopicsForOps(
  topicIds: string[],
  locale: CurriculumLocale = 'en'
): string[] {
  return topicIds
    .map((id) => getTopicTitle(id, locale) ?? id)
    .filter(Boolean)
}
