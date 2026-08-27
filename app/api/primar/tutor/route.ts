import { NextRequest, NextResponse } from 'next/server'
import {
  categoryForSkill,
  searchCurriculum,
  type CurriculumCategory,
} from '@/lib/primar/curriculum-pack'

/**
 * One contextual tutor line for Primar/SkulMate.
 *
 * Staged like Nkwa Growth Agent: retrieve curriculum grounding → generate →
 * validate. The Flutter client caches successful responses and falls back to
 * local TutorFeedback when offline — sessions never depend on this route.
 */

export const runtime = 'nodejs'

const TEXT_MODEL = process.env.PRIMAR_TEXT_MODEL || 'z-ai/glm-5.2'

const MOMENTS = new Set([
  'home_next',
  'correct',
  'miss',
  'retry',
  'speak',
  'reteach',
  'waiting',
])

const STYLE = [
  'You write ONE spoken line for a childrens learning app in Cameroon.',
  'The listener is aged 6 to 10 and often cannot read — the line is heard aloud.',
  '',
  'Rules, all absolute:',
  '- One or two short sentences. Maximum 20 words total.',
  '- Name the specific word, letter, number, or picture when context gives one.',
  '- If Curriculum grounding is present, stay consistent with it — do not invent new skills.',
  '- If Recent mistake patterns are listed and Misconception matches one, name that pattern gently (mirrors, counting one-by-one, echoed number) — do not invent new diagnoses.',
  '- If Often struggles with lists the current skill, acknowledge they are still practising it without saying struggle, weak, or behind.',
  '- For speak moments: if Speech heard differs from the target, say "I heard X. The word is Y" (or French equivalent). Never mark speech as wrong.',
  '- Never vague praise like good job or try again without naming the thing.',
  '- Never say wrong, mistake, failed, bad, stupid, or compare to other children.',
  '- Warm, patient, direct — like a good teacher beside them.',
  '- Match the requested language exactly (English or French).',
  '- No emoji, markdown, or quotation marks around the whole line.',
  '- Refuse medical, political, or adult topics — reply with a gentle redirect to the lesson.',
].join('\n')

const BANNED = [
  'wrong', 'incorrect', 'mistake', 'error', 'fail', 'bad', 'stupid', 'silly',
  'try harder', 'concentrate', 'pay attention', 'should know', 'easy',
  'slow', 'behind', 'struggl', 'poor', 'weak',
  'faux', 'erreur', 'mauvais', 'bête', 'nul', 'facile', 'lent',
  'four short questions', 'take you through', 'next 4 steps',
]

type TutorBody = {
  moment?: string
  locale?: string
  childName?: string
  skillId?: string
  skillLabel?: string
  subject?: string
  frontierSkillId?: string
  atelierHook?: string
  itemPrompt?: string
  itemAnswer?: string
  chosen?: string
  heard?: string
  misconception?: string
  retryCount?: number
  streak?: number
  strugglingSkills?: string[]
  recentMissTags?: string[]
}

export async function POST(request: NextRequest) {
  let body: TutorBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const moment = body.moment ?? ''
  if (!MOMENTS.has(moment)) {
    return NextResponse.json(
      { error: 'Unknown moment', known: [...MOMENTS] },
      { status: 400 },
    )
  }

  const locale = body.locale === 'fr' ? 'fr' : 'en'
  const language = locale === 'fr' ? 'French' : 'English'

  const apiKey = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  // Nkwa-style stage: retrieve filtered curriculum before generation.
  const skillId = body.skillId ?? body.frontierSkillId
  const subjectCat = subjectCategory(body.subject) ?? categoryForSkill(skillId)
  const grounding = searchCurriculum({
    query: [body.skillLabel, body.atelierHook, body.itemPrompt, body.misconception]
      .filter(Boolean)
      .join(' '),
    skillId,
    categories: subjectCat ? [subjectCat] : undefined,
    missTags: body.recentMissTags,
    locale,
    limit: 2,
  })

  const contextLines = [
    `Moment: ${moment}`,
    body.childName ? `Child first name: ${body.childName}` : null,
    body.skillLabel ? `Skill: ${body.skillLabel}` : body.skillId ? `Skill id: ${body.skillId}` : null,
    body.frontierSkillId ? `Mastery frontier skill: ${body.frontierSkillId}` : null,
    body.atelierHook ? `Atelier hook: ${body.atelierHook}` : null,
    body.itemPrompt ? `Question/prompt: ${body.itemPrompt}` : null,
    body.itemAnswer ? `Correct answer: ${body.itemAnswer}` : null,
    body.chosen ? `Child chose: ${body.chosen}` : null,
    body.heard ? `Speech heard: ${body.heard}` : null,
    body.misconception ? `Misconception: ${body.misconception}` : null,
    body.retryCount != null ? `Attempt number: ${body.retryCount + 1}` : null,
    body.streak != null && body.streak > 0 ? `Correct streak: ${body.streak}` : null,
    body.strugglingSkills?.length
      ? `Often struggles with: ${body.strugglingSkills.join(', ')}`
      : null,
    body.recentMissTags?.length
      ? `Recent mistake patterns: ${body.recentMissTags.join(', ')}`
      : null,
    grounding.length
      ? `Curriculum grounding: ${grounding.map((g) => `${g.title} — ${g.snippet}`).join(' | ')}`
      : null,
  ].filter(Boolean)

  const momentHint = switchMomentHint(moment, locale)

  const prompt = [
    STYLE,
    '',
    `Write ONE tutor line in ${language}.`,
    momentHint,
    '',
    'Learner context:',
    ...contextLines,
    '',
    'Return ONLY a JSON object: {"line":"..."} with no other text.',
  ].join('\n')

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '')
      console.error('[primar/tutor] upstream', upstream.status, detail.slice(0, 200))
      return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
    }

    const json = await upstream.json()
    const raw: string = json?.choices?.[0]?.message?.content ?? ''
    const line = parseLine(raw)

    if (!line || !isSafeForAChild(line)) {
      return NextResponse.json({ error: 'Nothing usable produced' }, { status: 502 })
    }

    return NextResponse.json(
      {
        line,
        source: 'ai',
        grounding: grounding.map((g) => g.id),
      },
      { headers: { 'Cache-Control': 'private, max-age=300' } },
    )
  } catch (error) {
    console.error('[primar/tutor]', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
  }
}

function subjectCategory(subject?: string): CurriculumCategory | null {
  if (!subject) return null
  if (subject === 'numeracy') return 'numeracy'
  if (subject === 'shapes') return 'shapes'
  if (subject === 'reading') return 'reading'
  return null
}

function switchMomentHint(moment: string, locale: string): string {
  const fr = locale === 'fr'
  switch (moment) {
    case 'home_next':
      return fr
        ? 'The child is on the HOME screen choosing the next game. Tell them what to play and to tap Start. Never mention onboarding or steps through a lesson.'
        : 'The child is on the HOME screen picking the next activity. Tell them what to play and to tap Start. Never mention onboarding or walking through steps.'
    case 'correct':
      return fr
        ? 'They answered correctly. Name what they got right.'
        : 'They answered correctly. Name the word, letter, or number they got right.'
    case 'miss':
      return fr
        ? 'They chose wrong. Name what they picked and what was needed — gently. If a recurring mistake pattern is listed, fold that cue into the line.'
        : 'They chose wrong. Name what they tapped and what was needed — gently. If a recurring mistake pattern is listed, fold that cue into the line.'
    case 'retry':
      return fr
        ? 'After teaching, hand the same question back. Tell them to find the answer.'
        : 'After teaching, hand the same question back. Tell them to find the answer.'
    case 'speak':
      return fr
        ? 'Speaking practice. If Speech heard is set and differs from the answer, name heard then the correct word. If it matches, celebrate naming what they said. Never treat speech as a scored miss.'
        : 'Speaking practice. If Speech heard is set and differs from the answer, name heard then the correct word. If it matches, celebrate naming what they said. Never treat speech as a scored miss.'
    case 'reteach':
      return fr
        ? 'Opening a reteach card — name the letter or pattern a different way. Use Recent mistake patterns when they match.'
        : 'Opening a reteach card — name the letter or pattern a different way. Use Recent mistake patterns when they match.'
    case 'waiting':
      return fr
        ? 'They are thinking. Encourage patience — never hurry or hint the answer.'
        : 'They are thinking. Encourage patience — never hurry or hint the answer.'
    default:
      return ''
  }
}

function parseLine(raw: string): string | null {
  const objMatch = raw.match(/\{[\s\S]*\}/)
  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0])
      if (typeof parsed?.line === 'string') return parsed.line.trim()
    } catch {
      /* fall through */
    }
  }
  const trimmed = raw.replace(/^["']|["']$/g, '').trim()
  return trimmed.length > 0 ? trimmed : null
}

function isSafeForAChild(line: string): boolean {
  const l = line.toLowerCase()
  if (line.length < 4 || line.length > 160) return false
  if (line.split(/\s+/).length > 24) return false
  if (/[{}<>[\]|`]/.test(line)) return false
  return !BANNED.some((w) => l.includes(w))
}
