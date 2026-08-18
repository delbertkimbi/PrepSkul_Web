import { NextRequest, NextResponse } from 'next/server'

/**
 * Alternative explanations, authored by a model.
 *
 * ## Why the model runs here and not on the phone
 *
 * When a child misses the same concept three times, repeating the same words a
 * fourth time is not teaching — it is insistence. What they need is the idea
 * put a different way. Producing that variety by hand across every concept,
 * every misconception and two languages is weeks of writing; a model does it in
 * seconds.
 *
 * But a child in Buea during an internet shutdown cannot wait on an inference
 * call, and a lesson that stalls is worse than a plain one. So the model is used
 * the way Cursor uses one: it *authors*, and the authored artifact runs on its
 * own afterwards. Explanations are generated once, cached on the device, and
 * replayed forever with no network involved.
 *
 * The runtime path never depends on this endpoint. If it is unreachable, the
 * built-in teaching lines are used and the child notices nothing.
 */

export const runtime = 'nodejs'

const MODEL = process.env.PRIMAR_EXPLAIN_MODEL || 'google/gemini-3.1-flash-lite-image'
const TEXT_MODEL = process.env.PRIMAR_TEXT_MODEL || 'z-ai/glm-5.2'

/** Concepts an explanation can be requested for. A closed set, like everything
 *  else here — an open prompt parameter would let anyone spend the budget and
 *  put unreviewed words in front of a child. */
const CONCEPTS: Record<string, string> = {
  'letter-reversal': 'telling apart letters that are mirror images of each other, such as b and d',
  'letter-shape': 'telling apart letters that look similar, such as m and n',
  'letter-sound': 'linking a letter to the sound it makes',
  'off-by-one': 'counting a group and finishing one away from the right number',
  'operand-echo': 'answering an addition with one of the numbers from the question',
  'wrong-operation': 'adding when the question asked to take away, or the reverse',
  'counting-unstable': 'guessing how many are in a group instead of counting them',
  'shape-composition': 'seeing how parts join together to make a whole shape',
}

/**
 * The house voice. Every constraint here exists because of who is listening:
 * a six-to-ten-year-old in Cameroon who cannot read, hearing this aloud,
 * possibly in their second language, after already deciding school is a place
 * they fail.
 */
const STYLE = [
  'You write single spoken lines for a childrens learning app.',
  'The listener is a child aged 6 to 10 in Cameroon who cannot yet read.',
  'Every line is heard aloud, never read, and often in the child second language.',
  '',
  'Rules, all of them absolute:',
  '- Maximum 12 words per line. Short sentences. One idea each.',
  '- Never say wrong, no, incorrect, mistake, failed, bad, or try harder.',
  '- Never mention the child ability, speed, or how they compare to anyone.',
  '- Use only concrete words a 6 year old knows.',
  '- Use objects from daily life in Cameroon: mangoes, plantains, stones, beans,',
  '  cups, chickens. Never snow, apples, squirrels, or dollars.',
  '- Address the child directly and warmly, as a patient teacher would.',
  '- No emoji, no formatting, no quotation marks.',
].join('\n')

export async function POST(request: NextRequest) {
  let body: { concept?: string; locale?: string; count?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const concept = body.concept ?? ''
  const locale = body.locale === 'fr' ? 'fr' : 'en'
  const count = Math.min(Math.max(body.count ?? 4, 1), 6)
  const description = CONCEPTS[concept]

  if (!description) {
    return NextResponse.json(
      { error: 'Unknown concept', known: Object.keys(CONCEPTS) },
      { status: 400 },
    )
  }

  const apiKey = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const language = locale === 'fr' ? 'French' : 'English'
  const prompt = [
    STYLE,
    '',
    `A child keeps having difficulty with: ${description}.`,
    `Write ${count} DIFFERENT ways to explain this to them, in ${language}.`,
    'Each one must take a genuinely different angle — a comparison, a physical',
    'action they can do, something they already know, a tiny story. Do not',
    'reword the same explanation.',
    '',
    'Return ONLY a JSON array of strings. No prose around it.',
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
        temperature: 0.9,
      }),
    })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '')
      console.error('[primar/explain] upstream', upstream.status, detail.slice(0, 200))
      return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
    }

    const json = await upstream.json()
    const raw: string = json?.choices?.[0]?.message?.content ?? ''

    const lines = parseLines(raw).filter(isSafeForAChild).slice(0, count)

    if (lines.length === 0) {
      // Better to send nothing than to send something unchecked. The client
      // falls back to its built-in teaching.
      return NextResponse.json({ error: 'Nothing usable produced' }, { status: 502 })
    }

    return NextResponse.json(
      { concept, locale, lines },
      { headers: { 'Cache-Control': 'public, max-age=86400' } },
    )
  } catch (error) {
    console.error('[primar/explain]', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
  }
}

function parseLines(raw: string): string[] {
  const jsonMatch = raw.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string')
    } catch {
      /* fall through to line splitting */
    }
  }
  return raw
    .split('\n')
    .map((l) => l.replace(/^\s*[-*\d.)\]]+\s*/, '').replace(/^["']|["']$/g, '').trim())
    .filter((l) => l.length > 0)
}

/**
 * The model is not trusted to have followed the rules.
 *
 * Anything reaching a child is checked here, because a single line telling a
 * six-year-old they were wrong undoes the thing this product exists to do — and
 * "the prompt said not to" is not a safeguard.
 */
const BANNED = [
  'wrong', 'incorrect', 'mistake', 'error', 'fail', 'bad', 'stupid', 'silly',
  'try harder', 'concentrate', 'pay attention', 'should know', 'easy',
  'slow', 'behind', 'struggl', 'poor', 'weak',
  'faux', 'erreur', 'mauvais', 'bête', 'nul', 'facile', 'lent',
]

function isSafeForAChild(line: string): boolean {
  const l = line.toLowerCase()
  if (line.length < 4 || line.length > 120) return false
  if (line.split(/\s+/).length > 16) return false
  if (/[{}<>[\]|`]/.test(line)) return false
  return !BANNED.some((w) => l.includes(w))
}
