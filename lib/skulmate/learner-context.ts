/**
 * Background learner context for SkulMate generation.
 * Curriculum/profile hints adjust tone and difficulty only — never block open topics.
 */

export type LearnerContextInput = {
  enrichmentMode?: string
  language?: string
  preferred_language?: string
  language_preference?: string
  student_grade?: string
  class_level?: string
  curriculum?: string
  exam?: string
  exam_type?: string
  target_exam?: string
  subjects?: string | string[]
  subject_preferences?: string | string[]
  learning_goals?: string
  learning_style?: string
  learning_styles?: string | string[]
  student_age_group?: string
  childId?: string
}

export type CurriculumAlignment = {
  mode: 'open' | 'school_soft' | 'school_matched'
  confidence: number
  frameworkId?: string
  matchedTopicIds?: string[]
}

export function buildBackgroundLearnerPromptSection(
  ctx?: LearnerContextInput | null
): string {
  if (!ctx || Object.keys(ctx).length === 0) return ''

  const lang =
    ctx.language ||
    ctx.preferred_language ||
    ctx.language_preference ||
    'en'

  const level = ctx.class_level || ctx.student_grade
  const subjects = ctx.subjects || ctx.subject_preferences
  const subjectLine = subjects
    ? Array.isArray(subjects)
      ? subjects.join(', ')
      : String(subjects)
    : null

  let section =
    '\n\nBACKGROUND LEARNER CONTEXT (silent — never mention syllabus/exams in titles or copy):\n'
  section +=
    '- The uploaded source is ALWAYS primary. Generate fully from it even if off-syllabus (e.g. machine learning, YouTube tutorials, hobbies, career skills).\n'
  section +=
    '- Never refuse, downgrade, or redirect because content is not in a school curriculum.\n'
  section +=
    '- Do not use labels like "exam prep", "syllabus aligned", or "GCE" in game titles.\n'

  if (level) {
    section += `- Optional difficulty calibration for learner level: ${level} (subtle only).\n`
  }
  if (subjectLine) {
    section += `- Profile subject interests (soft hint only, do not override source topic): ${subjectLine}\n`
  }
  if (lang) {
    section += `- Prefer learner-facing language: ${lang}\n`
  }

  return section
}

export { resolveBackgroundCurriculumAlignment } from './curriculum-matcher'
export {
  buildExplanationStylePromptSection,
  buildExplainApiStyleInstruction,
  resolveExplanationStyle,
  type ExplanationStyle,
} from './explanation-style'
