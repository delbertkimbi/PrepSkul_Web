/**
 * Learner path context — gate exam/framework labels to the learner's actual level.
 * Never show WAEC/GCE/SAT/IELTS to someone not on that exam track.
 */

export type LearnerPathProfile = {
  educationLevel?: string | null
  classLevel?: string | null
  examType?: string | null
  specificExam?: string | null
  learningPath?: string | null
}

export type CurriculumLocale = 'en' | 'fr'

function norm(value?: string | null): string {
  return (value ?? '').toLowerCase().trim()
}

const NON_EXAM_VALUES = new Set([
  '',
  'none',
  'n/a',
  'na',
  'not applicable',
  'no exam',
  'pas d\'examen',
  'general',
  'skills',
  'hobby',
  'university',
])

/** True when profile indicates exam prep (GCE, WAEC, BEPC, SAT, etc.). */
export function isExamTrackLearner(profile?: LearnerPathProfile | null): boolean {
  if (!profile) return false

  const path = norm(profile.learningPath)
  if (path.includes('skill') || path.includes('hobby') || path.includes('university')) {
    return false
  }

  const examBlob = [profile.examType, profile.specificExam]
    .map(norm)
    .filter(Boolean)
    .join(' ')

  if (examBlob && !NON_EXAM_VALUES.has(examBlob)) {
    if (
      /gce|waec|bepc|probatoire|bac|sat|ielts|toefl|o.?level|a.?level|jamb|neco/.test(
        examBlob
      )
    ) {
      return true
    }
  }

  const level = norm(profile.classLevel || profile.educationLevel)
  if (!level) return false

  return (
    /form\s*[4-7]|upper\s*six|lower\s*six|u6|l6|terminale|première|premiere|seconde/.test(
      level
    ) || /exam|examen|bac|gce|waec/.test(level)
  )
}

const FRAMEWORK_EXAM_PATTERNS: Record<string, RegExp[]> = {
  cm_gce_ol: [/gce.*o|ordinary|o level|o-level|form\s*5/],
  cm_gce_al: [/gce.*a|advanced|a level|a-level|upper six|lower six|u6|l6/],
  waec: [/waec|neco|jamb/],
  cm_francophone: [/bepc|probatoire|francophone|bac|seconde|première|premiere/],
  steam: [/steam|skill|coding|tech/],
}

export function frameworkMatchesLearnerProfile(
  frameworkId: string,
  profile?: LearnerPathProfile | null
): boolean {
  if (!isExamTrackLearner(profile)) return false
  if (frameworkId === 'open_learning') return false

  const examBlob = [
    profile?.examType,
    profile?.specificExam,
    profile?.classLevel,
    profile?.educationLevel,
  ]
    .map(norm)
    .filter(Boolean)
    .join(' ')

  const patterns = FRAMEWORK_EXAM_PATTERNS[frameworkId]
  if (!patterns) return true
  if (!examBlob) return true
  return patterns.some((p) => p.test(examBlob))
}

/** Parent-safe context line — class/level, not random exam board. */
export function learnerContextLine(
  profile?: LearnerPathProfile | null,
  locale: CurriculumLocale = 'en'
): string | null {
  if (!profile) return null

  const classLevel = profile.classLevel?.trim()
  const education = profile.educationLevel?.trim()

  if (classLevel) {
    return locale === 'fr' ? `Niveau : ${classLevel}` : `Level: ${classLevel}`
  }
  if (education) {
    return locale === 'fr'
      ? `Parcours : ${education}`
      : `Path: ${education}`
  }
  if (norm(profile.learningPath).includes('skill')) {
    return locale === 'fr' ? 'Apprentissage libre' : 'Skills learning'
  }
  return null
}

export function readinessTitle(
  profile?: LearnerPathProfile | null,
  locale: CurriculumLocale = 'en'
): string {
  if (isExamTrackLearner(profile)) {
    return locale === 'fr'
      ? 'Préparation (estimation)'
      : 'Exam readiness (estimate)'
  }
  return locale === 'fr'
    ? 'Progression d\'apprentissage'
    : 'Learning progress'
}

export function readinessDisclaimer(
  profile?: LearnerPathProfile | null,
  locale: CurriculumLocale = 'en'
): string {
  if (isExamTrackLearner(profile)) {
    return locale === 'fr'
      ? 'Basé sur SkulMate — pas un score officiel d\'examen.'
      : 'Based on SkulMate games — not an official exam score.'
  }
  return locale === 'fr'
    ? 'Basé sur les jeux SkulMate de votre enfant.'
    : 'Based on your child\'s SkulMate revision games.'
}

export function parentFrameworkLabel(params: {
  frameworkId?: string | null
  profile?: LearnerPathProfile | null
  locale?: CurriculumLocale
  getFrameworkLabel: (id: string, locale: CurriculumLocale) => string
}): string | null {
  const { frameworkId, profile, getFrameworkLabel } = params
  const locale = params.locale ?? 'en'

  if (!frameworkId || frameworkId === 'open_learning') return null
  if (!frameworkMatchesLearnerProfile(frameworkId, profile)) return null

  return getFrameworkLabel(frameworkId, locale)
}

export function profileFromParentLearnerRow(
  row?: Record<string, unknown> | null
): LearnerPathProfile | null {
  if (!row) return null
  return {
    educationLevel: row.education_level as string | undefined,
    classLevel: row.class_level as string | undefined,
    examType: row.exam_type as string | undefined,
    specificExam: row.specific_exam as string | undefined,
    learningPath: row.learning_path as string | undefined,
  }
}
